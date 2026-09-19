#!/usr/bin/env node
/**
 * git-sync.cjs — safely fast-forward the local clone to origin/master.
 *
 * WHY: GitHub Actions commits data to origin daily (adoption snapshots,
 * weekly digest). Local Hermes work never auto-fetches, so the clone silently
 * falls behind and new content lands on a stale base — which is how local and
 * GitHub drift apart. Run this FIRST before any content or ops job.
 *
 * SAFE BY DESIGN: fetch + merge --ff-only only. It never rebases, never
 * force-pushes and never discards local work — on divergence it aborts with a
 * clear message for you to resolve by hand.
 *
 * Usage: node scripts/git-sync.cjs   |   npm run sync
 */
const { execFileSync } = require('child_process');

function git(args, { allowFail = false } = {}) {
  try {
    return execFileSync('git', args, { encoding: 'utf8' }).trim();
  } catch (e) {
    if (allowFail) return null;
    const msg = (e.stderr || e.stdout || e.message || '').toString().trim();
    throw new Error(msg || `git ${args.join(' ')} failed`);
  }
}

let branch;
try {
  branch = git(['rev-parse', '--abbrev-ref', 'HEAD']);
} catch (e) {
  console.error(`[git-sync] not a git repo or git missing: ${e.message}`);
  process.exit(2);
}

if (branch !== 'master') {
  console.log(`[git-sync] on branch "${branch}" (not master) — nothing to do.`);
  process.exit(0);
}

console.log('[git-sync] fetching origin…');
git(['fetch', 'origin', 'master']);

const behind = git(['rev-list', '--count', 'HEAD..origin/master'], { allowFail: true }) ?? '?';
const ahead = git(['rev-list', '--count', 'origin/master..HEAD'], { allowFail: true }) ?? '?';
const dirty = (git(['status', '--porcelain'], { allowFail: true }) || '').trim();

if (behind === '0') {
  console.log(`[git-sync] already up to date with origin/master (ahead ${ahead}).`);
  if (dirty) console.log('[git-sync] note: working tree has uncommitted changes.');
  process.exit(0);
}

console.log(`[git-sync] behind ${behind}, ahead ${ahead}. Fast-forwarding…`);
try {
  const out = git(['merge', '--ff-only', 'origin/master']);
  console.log(out || '[git-sync] fast-forwarded to origin/master.');
  if (dirty) console.log('[git-sync] note: working tree still has uncommitted changes.');
} catch (e) {
  console.error('[git-sync] cannot fast-forward — local and origin have diverged,');
  console.error('           or uncommitted changes would be overwritten.');
  console.error('           Resolve by hand: commit/stash local work, then merge origin/master.');
  if (e.message) console.error(`           git said: ${e.message}`);
  process.exit(1);
}
