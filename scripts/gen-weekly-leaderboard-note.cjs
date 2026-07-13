#!/usr/bin/env node
/**
 * Emit a weekly leaderboard social/newsletter blurb + optional MDX draft.
 * Usage: node scripts/gen-weekly-leaderboard-note.cjs [--write-mdx]
 */
const fs = require('fs');
const path = require('path');

const snapDir = path.join(__dirname, '..', 'src', 'data', 'adoption', 'snapshots');
const files = fs.existsSync(snapDir)
  ? fs.readdirSync(snapDir).filter((f) => f.endsWith('.json')).sort().reverse()
  : [];

if (!files.length) {
  console.error('No adoption snapshots. Run: node scripts/fetch-adoption-data.cjs');
  process.exit(1);
}

const latest = JSON.parse(fs.readFileSync(path.join(snapDir, files[0]), 'utf8'));
const prev = files[1]
  ? JSON.parse(fs.readFileSync(path.join(snapDir, files[1]), 'utf8'))
  : null;

function metric(a, k) {
  if (a.metrics && a.metrics[k] != null) return a.metrics[k];
  return a[k] ?? 0;
}

const agents = [...(latest.agents || [])];
const maxNpm = Math.max(...agents.map((a) => metric(a, 'npm_downloads') || 0), 1);
const maxStars = Math.max(...agents.map((a) => metric(a, 'github_stars') || 0), 1);
const maxForks = Math.max(...agents.map((a) => metric(a, 'github_forks') || 0), 1);

agents.forEach((a) => {
  const npm = metric(a, 'npm_downloads') || 0;
  const stars = metric(a, 'github_stars') || 0;
  const forks = metric(a, 'github_forks') || 0;
  a.score = Math.round((npm / maxNpm) * 50 + (stars / maxStars) * 30 + (forks / maxForks) * 20);
  const p = prev?.agents?.find((x) => x.id === a.id);
  a.npmDelta = p ? npm - (metric(p, 'npm_downloads') || 0) : null;
});

agents.sort((a, b) => b.score - a.score);
const top5 = agents.slice(0, 5);
const date = latest.date || new Date().toISOString().slice(0, 10);

const lines = [
  `AI coding agent leaderboard — ${date}`,
  '',
  ...top5.map((a, i) => {
    const d =
      a.npmDelta == null
        ? ''
        : a.npmDelta === 0
          ? ' (npm flat)'
          : a.npmDelta > 0
            ? ` (npm +${a.npmDelta})`
            : ` (npm ${a.npmDelta})`;
    return `${i + 1}. ${a.name || a.id} — score ${a.score}${d}`;
  }),
  '',
  'Full table: https://terminalblog.com/leaderboard/',
  'Embed: https://terminalblog.com/embed/leaderboard/',
];

console.log(lines.join('\n'));

if (process.argv.includes('--write-mdx')) {
  const slug = `leaderboard-week-${date}`;
  const out = path.join(__dirname, '..', 'src', 'content', 'blog', `${slug}.mdx`);
  if (fs.existsSync(out)) {
    console.error('Already exists:', out);
    process.exit(0);
  }
  const table = top5
    .map(
      (a, i) =>
        `| ${i + 1} | [${a.name || a.id}](/tool/${a.id}/) | ${a.score} | ${metric(a, 'npm_downloads') || '—'} | ${metric(a, 'github_stars') || '—'} |`
    )
    .join('\n');
  const mdx = `---
title: "AI Coding Agent Leaderboard Week of ${date}"
description: "Weekly adoption snapshot — npm downloads, GitHub stars, and composite scores for top coding agents."
pubDate: ${date}
tags: ["leaderboard", "benchmarks", "pillar", "coding-agents"]
tool: "industry"
author: "rho"
---

Weekly adoption snapshot from the [live leaderboard](/leaderboard/). Embed this chart on your site via [\`/embed/leaderboard/\`](/embed/leaderboard/).

| # | Agent | Score | npm/wk | Stars |
|---|-------|------:|-------:|------:|
${table}

**Method:** score = 50% npm downloads + 30% GitHub stars + 20% forks (normalized).

**Also read:** [Best coding agents decision guide](/blog/best-coding-agents-2026-decision-guide/) · [Pricing guide](/blog/coding-agent-pricing-guide-2026/)
`;
  fs.writeFileSync(out, mdx);
  console.log('\nWrote', out);
  console.log('Run: node scripts/content-gate.cjs', out, '--strict');
}
