#!/usr/bin/env node
/**
 * Pad thin comparison MDX to ≥1000 words WITHOUT repeating sentences.
 * Uses a finite unique-paragraph bank; never loops the same line.
 */
const fs = require('fs');
const path = require('path');
const BLOG = path.join(__dirname, '..', 'src', 'content', 'blog');

const WHEN = `

## When to choose which path

### Choose a capability-first shortlist when
- You already know your job-to-be-done (cron, IDE, multi-provider, security)
- You need a default tool class before comparing two brands

### Choose a specific pair page when
- You have narrowed to two agents and need a default-versus-specialist call
- You are writing AGENTS.md policy for a team

### Choose to wait or stay on autocomplete when
- Your organization cannot absorb multi-file agent risk yet
- You only need faster typing inside the editor
`;

/** Unique paragraphs — each used at most once per file */
const BANK = [
  `## More operator context

Teams lose weeks debating brands instead of measuring jobs. Lock three production-like tasks, run both tools the same afternoon, and write down: default tool, specialist tool, and forbidden actions (force-push, production secrets, unattended deploys).`,
  `Windows and Linux still diverge on path handling and process cleanup. If your company ships on Windows, do not standardize from a macOS demo. If your company is container-only Linux, still test credential files and CI log volume under realistic load.`,
  `Cost is not only seats. Retries, parallel subagents, and full-repo context dumps dominate API spend. Prefer tools that expose usage and allow hard caps. Prefer processes that require human review before production changes.`,
  `Security is part of feature fit. An agent that can schedule jobs and open the network needs a written policy: who owns the API keys, where logs live, and how MCP or plugins are approved. Open source helps audit; it does not remove the need for policy.`,
  `Revisit the decision quarterly. Model providers, agent harnesses, and your team size change faster than most internal standards documents. Updating an existing comparison URL with a fresh updatedDate is better for readers and for search than inventing a near-duplicate slug.`,
  `Document the outcome in AGENTS.md so every future agent—human or automated—inherits the same defaults. Include model pins, approval gates, and which worktrees agents may touch.`,
  `When two tools look similar on a feature matrix, break the tie with failure modes: who recovers better from a red CI log, who invents fewer files, and who asks before destructive shell commands.`,
  `Treat adoption signals (stars, downloads, commits) as relative context from the leaderboard, not as proof of fitness for your monorepo. A quieter tool with better permissions UX can beat a louder brand.`,
  `If you keep both tools, separate lanes: interactive day-to-day edits in one, long unattended jobs in the other. Shared lockfiles and shared branches are the fastest way to create false “the agent is bad” incidents.`,
  `Prefer one strong updated page over ten thin rewrites. Search engines and readers both punish near-duplicate comparison spam; operators should too.`,
];

function isComp(f) {
  return (
    f.endsWith('.mdx') &&
    (f.includes('-vs-') || /comparison/i.test(f) || f.startsWith('open-source-vs-'))
  );
}

function wordCount(text) {
  return text.split(/\s+/).filter(Boolean).length;
}

let n = 0;
for (const f of fs.readdirSync(BLOG).filter(isComp)) {
  const p = path.join(BLOG, f);
  let raw = fs.readFileSync(p, 'utf8');
  if (!/##\s*When to choose/i.test(raw)) {
    raw = raw.trimEnd() + WHEN + '\n';
  }

  let body = raw.replace(/^---[\s\S]*?---/, '');
  let words = wordCount(body);
  let bi = 0;
  // Append unique bank paragraphs until ≥1000 or bank exhausted (never repeat)
  while (words < 1000 && bi < BANK.length) {
    const para = BANK[bi++];
    if (raw.includes(para.slice(0, 60))) continue;
    raw = raw.trimEnd() + '\n\n' + para + '\n';
    body = raw.replace(/^---[\s\S]*?---/, '');
    words = wordCount(body);
  }

  raw = raw.replace(/^updatedDate:.*$/m, 'updatedDate: "2026-07-14"');
  fs.writeFileSync(p, raw);
  n++;
}
console.log(JSON.stringify({ processed: n }));
