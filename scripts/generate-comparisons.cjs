#!/usr/bin/env node
// Batch generator for all remaining agent comparison articles
const fs = require('fs');
const path = require('path');

const agents = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'agents.json'), 'utf8'));

// Read existing files to skip
const blogDir = path.join(__dirname, '..', 'src', 'content', 'blog');
const existingFiles = fs.readdirSync(blogDir).filter(f => f.includes('vs'));
const existingPairs = new Set();
existingFiles.forEach(f => {
  const name = f.replace('.mdx', '');
  existingPairs.add(name);
});

// Identify pairs already covered by reading frontmatter
function normalize(id) { return id.replace(/-/g, '').toLowerCase(); }

const agentMap = {};
agents.forEach(a => { agentMap[a.id] = a; });

const templates = [
  {
    angle: 'Pricing',
    desc: 'pricing models, free tiers, and what you actually pay at scale',
    verdict: (a1, a2) => `${a1.pricing.startsWith('Free') ? a1.name + ' is free — ' + a2.name : a2.pricing.startsWith('Free') ? a2.name + ' is free — ' + a1.name : a1.name + ' starts at ' + a1.pricing.split('/')[0] + ' while ' + a2.name + ' starts at ' + a2.pricing.split('/')[0]}`,
    opener: (a1, a2) => `${a1.name} costs ${a1.pricing}. ${a2.name} costs ${a2.pricing}. The difference goes beyond the price tag.`
  },
  {
    angle: 'Feature Comparison',
    desc: 'features, integrations, and workflow fit',
    verdict: (a1, a2) => `${a1.features.subagents ? a1.name + ' has subagents' : a1.name + ' lacks subagents'}. ${a2.features.cron ? a2.name + ' has cron' : a2.name + ' lacks cron'}. Your workflow decides the winner.`,
    opener: (a1, a2) => `Feature lists matter less than which features you actually use. Let's break down what ${a1.name} and ${a2.name} actually bring to your terminal.`
  },
  {
    angle: 'Workflow Fit',
    desc: 'daily workflow, integration depth, and ecosystem lock-in',
    verdict: (a1, a2) => a1.openSource !== a2.openSource
      ? `${a1.openSource ? a1.name + ' is open source' : a1.name + ' is proprietary'} vs ${a2.openSource ? a2.name + ' is open source' : a2.name + ' is proprietary'} — this is the deciding factor for most teams.`
      : `${a1.bestFor.split(',')[0]} vs ${a2.bestFor.split(',')[0]} — they serve different workflows.`,
    opener: (a1, a2) => `The right agent depends on your workflow. ${a1.name} excels at ${a1.bestFor.toLowerCase()}. ${a2.name} is built for ${a2.bestFor.toLowerCase()}.`
  },
  {
    angle: 'Open Source vs Commercial',
    desc: 'licensing, community, and long-term viability',
    verdict: (a1, a2) => a1.openSource && a2.openSource
      ? `Both are open source — community support, auditability, and no vendor lock-in.`
      : !a1.openSource && !a2.openSource
        ? `Both are commercial — polished UX, paid support, but vendor dependency.`
        : `${a1.openSource ? a1.name + ' gives you full control' : a1.name + ' gives you polished support'} — the classic OSS vs commercial trade-off.`,
    opener: (a1, a2) => `The open source vs commercial debate matters more for coding agents than most tools because your agent has access to everything.`
  },
  {
    angle: 'Performance & Benchmarks',
    desc: 'SWE-bench scores, speed, and real-world task performance',
    verdict: (a1, a2) => {
      const s1 = parseFloat(a1.sweBench) || 0;
      const s2 = parseFloat(a2.sweBench) || 0;
      if (s1 > 0 || s2 > 0) return s1 > s2 ? `${a1.name} leads on SWE-bench (${a1.sweBench} vs ${a2.sweBench})` : s2 > s1 ? `${a2.name} leads on SWE-bench (${a2.sweBench} vs ${a1.sweBench})` : 'No SWE-bench data available for either agent.';
      return 'Neither agent has public SWE-bench scores — real-world testing is your best bet.';
    },
    opener: (a1, a2) => {
      const s1 = parseFloat(a1.sweBench) || 0;
      const s2 = parseFloat(a2.sweBench) || 0;
      if (s1 > 0 || s2 > 0) return `${a1.name} scores ${a1.sweBench} and ${a2.name} scores ${a2.sweBench} on SWE-bench. Here's what that actually means for daily use.`;
      return 'Benchmarks help, but without SWE-bench data for these two, we focus on real-world capability instead.';
    }
  }
];

// Helper to format feature table
function featureRow(label, a1, a2, feature) {
  const v1 = a1.features[feature] ? '✅' : '❌';
  const v2 = a2.features[feature] ? '✅' : '❌';
  const labels = { vision: 'Vision', cron: 'Cron/Schedule', multiProvider: 'Multi-provider', gitIntegration: 'Git integration', pluginSystem: 'Plugins', subagents: 'Subagents', bgTasks: 'BG tasks', localFirst: 'Local-first' };
  return `| ${labels[feature] || feature} | ${v1} | ${v2} |`;
}

function generateArticle(id1, id2) {
  const a1 = agentMap[id1];
  const a2 = agentMap[id2];
  if (!a1 || !a2) return null;

  const slug = `${id1}-vs-${id2}`;
  if (existingPairs.has(slug + '.mdx')) return null;

  // Also check reverse slug
  const revSlug = `${id2}-vs-${id1}`;
  if (existingPairs.has(revSlug + '.mdx')) return null;

  // Pick template by round-robin on pair index
  const pairIdx = Object.keys(agentMap).indexOf(id1) * agents.length + Object.keys(agentMap).indexOf(id2);
  const tmpl = templates[pairIdx % templates.length];

  const features = ['vision', 'cron', 'multiProvider', 'gitIntegration', 'pluginSystem', 'subagents', 'bgTasks', 'localFirst'];
  const featureRows = features.map(f => featureRow(f, a1, a2)).join('\n');

  const pros1 = a1.pros.slice(0, 3).map(p => `- ${p}`).join('\n');
  const pros2 = a2.pros.slice(0, 3).map(p => `- ${p}`).join('\n');
  const cons1 = a1.cons.slice(0, 2).map(p => `- ${p}`).join('\n');
  const cons2 = a2.cons.slice(0, 2).map(p => `- ${p}`).join('\n');

const chartTypes = { Pricing: 'pricing', 'Feature Comparison': 'features', 'Performance & Benchmarks': 'swe-bench', 'Workflow Fit': 'features', 'Open Source vs Commercial': 'features' };
const chartType = chartTypes[tmpl.angle] || 'features';

  const content = `---
title: "${a1.name} vs ${a2.name}: ${tmpl.angle} Comparison"
description: "${tmpl.desc} — a detailed look at these two coding agents."
pubDate: "${new Date().toISOString().replace(/T.*/, 'T10:00:00Z')}"
tags: ["comparison", "${id1}", "${id2}", "deep-dive"]
tool: "${id1}"
image: "/api/chart?type=${chartType}&agents=${id1},${id2}"
---

## Quick Verdict

${tmpl.verdict(a1, a2)}

## Pricing

| | ${a1.name} | ${a2.name} |
|---|---|---|
| Price | ${a1.pricing} | ${a2.pricing} |
| Open source | ${a1.openSource ? 'Yes ✅' : 'No ❌'} | ${a2.openSource ? 'Yes ✅' : 'No ❌'} |
| Best for | ${a1.bestFor} | ${a2.bestFor} |

## ${tmpl.angle}

${tmpl.opener(a1, a2)}

**${a1.name}** is built for ${a1.bestFor.toLowerCase()}. It's ${a1.openSource ? 'open source' : 'a commercial product'} with ${a1.pricing} pricing. ${a1.sweBench !== '-' ? 'SWE-bench: ' + a1.sweBench : ''}

**${a2.name}** is built for ${a2.bestFor.toLowerCase()}. It's ${a2.openSource ? 'open source' : 'a commercial product'} with ${a2.pricing} pricing. ${a2.sweBench !== '-' ? 'SWE-bench: ' + a2.sweBench : ''}

## Feature Comparison

| Feature | ${a1.name} | ${a2.name} |
|---|---|---|
${featureRows}

## Pros & Cons

### ${a1.name}
**Pros:**
${pros1}

**Cons:**
${cons1}

### ${a2.name}
**Pros:**
${pros2}

**Cons:**
${cons2}

## Verdict

${tmpl.verdict(a1, a2)}

${a1.name} is recommended for: *${a1.recommended}*
${a2.name} is recommended for: *${a2.recommended}*

For a full overview of all 15 agents, see the [Complete Guide to AI Coding Agents](/blog/complete-guide-ai-coding-agents-2026/).
`;

  return { slug, content };
}

// Generate all pairs
const ids = agents.map(a => a.id);
let generated = 0;
let skipped = 0;

for (let i = 0; i < ids.length; i++) {
  for (let j = i + 1; j < ids.length; j++) {
    const result = generateArticle(ids[i], ids[j]);
    if (result) {
      const filePath = path.join(blogDir, result.slug + '.mdx');
      fs.writeFileSync(filePath, result.content);
      generated++;
      if (generated % 10 === 0) console.log(`Generated ${generated}...`);
    } else {
      skipped++;
    }
  }
}

console.log(`\nDone! Generated: ${generated} articles`);
console.log(`Skipped (already exist): ${skipped}`);
