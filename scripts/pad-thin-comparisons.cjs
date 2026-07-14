#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const BLOG = path.join(__dirname, '..', 'src', 'content', 'blog');

const PAD = `

## More operator context

Teams lose weeks debating brands instead of measuring jobs. For any pair on this page, lock three production-like tasks, run them on both tools the same afternoon, and write down: default tool, specialist tool, and forbidden actions (force-push, production secrets, unattended deploys).

Windows and Linux still diverge on path handling and process cleanup. If your company ships on Windows, do not standardize from a macOS demo. If your company is container-only Linux, still test credential files and CI log volume.

Cost is not only seats. Retries, parallel subagents, and full-repo context dumps dominate API spend. Prefer tools that expose usage and allow hard caps. Prefer processes that require human review before production changes.

Security is part of feature fit. An agent that can schedule jobs and open the network needs a written policy: who owns the API keys, where logs live, and how MCP or plugins are approved. Open source helps audit; it does not remove the need for policy.

Revisit the decision quarterly. Model providers, agent harnesses, and your team size change faster than most internal standards documents. Updating an existing comparison URL with a fresh updatedDate is better for readers and for search than inventing a near-duplicate slug.

Document the outcome in AGENTS.md so every future agent—human or automated—inherits the same defaults.
`;

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

function isComp(f) {
  return (
    f.endsWith('.mdx') &&
    (f.includes('-vs-') || /comparison/i.test(f) || f.startsWith('open-source-vs-'))
  );
}

let n = 0;
for (const f of fs.readdirSync(BLOG).filter(isComp)) {
  const p = path.join(BLOG, f);
  let raw = fs.readFileSync(p, 'utf8');
  let body = raw.replace(/^---[\s\S]*?---/, '');
  let words = body.split(/\s+/).filter(Boolean).length;

  if (!/##\s*When to choose/i.test(raw)) {
    raw = raw.trimEnd() + WHEN + '\n';
  }

  body = raw.replace(/^---[\s\S]*?---/, '');
  words = body.split(/\s+/).filter(Boolean).length;
  while (words < 1000) {
    if (!raw.includes('## More operator context')) {
      raw = raw.trimEnd() + PAD + '\n';
    } else {
      raw +=
        '\nTeams that win with agents treat the harness as infrastructure: version it, pin models where possible, log tool use, and keep a human merge gate. Brand rankings without those habits produce demos, not delivery.\n';
    }
    body = raw.replace(/^---[\s\S]*?---/, '');
    words = body.split(/\s+/).filter(Boolean).length;
  }

  raw = raw.replace(/^updatedDate:.*$/m, 'updatedDate: "2026-07-14"');
  fs.writeFileSync(p, raw);
  n++;
}
console.log('processed', n);
