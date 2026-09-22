#!/usr/bin/env node
// Combined data fetcher for terminalblog cron
// All sources use 3h window (except YouTube which uses 24h)
// Runs all fetchers and outputs unified context for article generation
//
// POLICY: After generating drafts, always run:
//   node scripts/content-gate.cjs --strict
// Caps: ≤3 just-shipped/day, no near-duplicate titles/slugs, batch roundups.
// See docs/content-policy.md

import { execSync } from 'child_process';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function run(script) {
  try {
    return execSync(`node ${__dirname}/${script}`, {
      encoding: 'utf8', timeout: 45000,
      env: { ...process.env }
    });
  } catch (e) {
    return JSON.stringify({ error: e.message?.slice(0, 200) });
  }
}

// --- STEP 0: fast-forward to origin/master before reading any signal ---------
// GitHub Actions commits data to origin/master daily (adoption snapshots,
// weekly digest). Without this, Hermes drafts on a stale base and local/origin
// silently drift apart. Non-fatal on purpose: a sync failure must never stop
// signal collection (offline runs, dirty tree, divergence).
console.log('=== SYNC WITH ORIGIN (BEFORE DRAFTING) ===');
try {
  console.log(execSync(`node ${__dirname}/git-sync.cjs`, {
    encoding: 'utf8', timeout: 60000, env: { ...process.env },
  }).trim());
} catch (e) {
  const detail = (e.stdout || e.stderr || e.message || String(e)).toString().trim();
  console.log(`[git-sync] could not sync — continuing anyway: ${detail.slice(0, 300)}`);
}
console.log('');

const [commits, discussions, issues, blogs, youtube] = await Promise.all([
  Promise.resolve(run('fetch-commits.js')),
  Promise.resolve(run('fetch-discussions.js')),
  Promise.resolve(run('fetch-issues.js')),
  Promise.resolve(run('fetch-blogs.js')),
  Promise.resolve(run('fetch-youtube.js')),
]);

console.log('=== CONTENT POLICY (READ BEFORE GENERATING) ===');
console.log(JSON.stringify({
  maxJustShippedPerDay: 3,
  maxPostsPerDaySoft: 8,
  minJustShippedWords: 400,
  oneStoryOneUrl: true,
  preferDigestsOverPerRepoPosts: true,
  offNicheMustUseToolIndustry: true,
  gateCommand: 'node scripts/content-gate.cjs --strict',
  policyDoc: 'docs/content-policy.md',
}, null, 2));

console.log('\n=== SIGNAL STREAM 1/5 ===');
console.log(commits);
console.log('\n=== SIGNAL STREAM 2/5 ===');
console.log(discussions);
console.log('\n=== SIGNAL STREAM 3/5 ===');
console.log(issues);
console.log('\n=== SIGNAL STREAM 4/5 ===');
console.log(blogs);
console.log('\n=== SIGNAL STREAM 5/5 ===');
console.log(youtube);

console.log('\n=== AFTER DRAFTS ===');
console.log('Run: node scripts/content-gate.cjs --strict');
console.log('Reject any draft that fails. Do not publish near-duplicates.');
console.log('Then commit and push, so origin never drifts behind this clone:');
console.log('  git add src/content/blog && git commit -m "content: ..." && git push origin master');
