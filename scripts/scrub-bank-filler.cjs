#!/usr/bin/env node
/**
 * Remove known pad-bank / trailing filler paragraphs from comparison MDX.
 * Does not invent content — only deletes sludge after real article body.
 */
const fs = require('fs');
const path = require('path');
const BLOG = path.join(__dirname, '..', 'src', 'content', 'blog');

/** Exact / unique-start bank paragraphs to delete anywhere they appear as blocks */
const BANK_STARTS = [
  'Teams lose weeks debating brands instead of measuring jobs.',
  'Windows and Linux still diverge on path handling and process cleanup. If your company ships on Windows',
  'Cost is not only seats. Retries, parallel subagents, and full-repo context dumps dominate API spend.',
  'Security is part of feature fit. An agent that can schedule jobs and open the network needs a written policy',
  'Revisit the decision quarterly. Model providers, agent harnesses, and your team size change faster',
  'Document the outcome in AGENTS.md so every future agent—human or automated—inherits the same defaults.',
  'When two tools look similar on a feature matrix, break the tie with failure modes',
  'Treat adoption signals (stars, downloads, commits) as relative context from the leaderboard',
  'If you keep both tools, separate lanes: interactive day-to-day edits in one',
  'Prefer one strong updated page over ten thin rewrites.',
  'Document the rollout: default tool, specialist tool, worktree policy',
  'If the two tools still look equal after three real tickets',
  'Keep human merge gates for production. Agents accelerate drafts',
  'Adoption signals from the leaderboard are relative context. A quieter tool with better permissions can beat',
  'Teams that win with agents treat the harness as infrastructure',
  'That is the whole method.',
  'For the full capability matrix and default-versus-specialist call, read the main Claude Code versus Cursor comparison',
];

function isComp(f) {
  return (
    f.endsWith('.mdx') &&
    (f.includes('-vs-') || /comparison/i.test(f) || f.startsWith('open-source-vs-') || f.startsWith('what-devs-say-'))
  );
}

function scrubBody(raw) {
  let out = raw;
  // Drop everything after aifiesta affiliate block if more content follows (post-footer bank dump)
  out = out.replace(
    /(\*Evaluating models[\s\S]*?aifiesta\.link[\s\S]*?\*|`?\*Testing multiple models[\s\S]*?aifiesta\.link[\s\S]*?\*|`?\*Building multi-model[\s\S]*?aifiesta\.link[\s\S]*?\*)\s*\n+[\s\S]*$/i,
    '$1\n'
  );
  // Also generic: any *...aifiesta...*\n then more ## or paragraphs
  out = out.replace(
    /(\*[^*\n]*aifiesta\.link[^*\n]*\*)\s*\n+(?=## |\n[A-Z])/i,
    '$1\n'
  );

  const paras = out.split(/\n\n+/);
  const kept = [];
  for (const p of paras) {
    const t = p.trim();
    if (!t) continue;
    const isBank = BANK_STARTS.some((s) => t.startsWith(s) || t.includes(s.slice(0, 50)));
    // Drop duplicate "## More operator context" blocks that only restate bank
    if (/^## More operator context/i.test(t) && t.length < 800 && /AGENTS\.md|Revisit quarterly/i.test(t)) {
      continue;
    }
    if (isBank) continue;
    kept.push(p);
  }
  return kept.join('\n\n').replace(/\n{3,}/g, '\n\n').trimEnd() + '\n';
}

let n = 0;
const touched = [];
for (const f of fs.readdirSync(BLOG).filter(isComp)) {
  const p = path.join(BLOG, f);
  const before = fs.readFileSync(p, 'utf8');
  const after = scrubBody(before);
  if (after !== before) {
    fs.writeFileSync(p, after);
    n++;
    touched.push(f);
  }
}
console.log(JSON.stringify({ scrubbed: n, files: touched }, null, 2));
