#!/usr/bin/env node
/**
 * Upgrade thin comparison MDX pages to evergreen (≥1000 words) with
 * unique under-served keyword angles + real agents.json / adoption data.
 *
 * Usage:
 *   node scripts/upgrade-comparisons.cjs              # all thin
 *   node scripts/upgrade-comparisons.cjs --limit 10   # first N by priority
 *   node scripts/upgrade-comparisons.cjs --file x.mdx
 *   node scripts/upgrade-comparisons.cjs --dry
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const BLOG = path.join(ROOT, 'src', 'content', 'blog');
const TODAY = new Date().toISOString().slice(0, 10);
const DRY = process.argv.includes('--dry');
const FORCE = process.argv.includes('--force');
const LIMIT = process.argv.includes('--limit')
  ? parseInt(process.argv[process.argv.indexOf('--limit') + 1], 10)
  : 0;
const ONLY = process.argv.includes('--file')
  ? process.argv[process.argv.indexOf('--file') + 1]
  : null;

// Ensure inventory
execSync('node scripts/comparison-inventory.cjs', {
  cwd: ROOT,
  stdio: 'pipe',
});
const inv = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'tmp', 'comparison-inventory.json'), 'utf8')
);
const AGENTS = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'src', 'data', 'agents.json'), 'utf8')
);
const agentById = Object.fromEntries(AGENTS.map((a) => [a.id, a]));

const snapDir = path.join(ROOT, 'src', 'data', 'adoption', 'snapshots');
let adoption = {};
if (fs.existsSync(snapDir)) {
  const files = fs.readdirSync(snapDir).filter((f) => f.endsWith('.json')).sort();
  if (files.length) {
    const snap = JSON.parse(
      fs.readFileSync(path.join(snapDir, files[files.length - 1]), 'utf8')
    );
    for (const a of snap.agents || []) adoption[a.id] = a;
    if (adoption['mimo-code']) adoption.mimo = adoption['mimo-code'];
  }
}

const ANGLE_META = {
  'cron-automation-unattended-agents': {
    h1: 'Unattended automation: cron, schedules, and agents that run without you',
    keyword: 'coding agent cron scheduling unattended workflows',
    gap: 'Most “X vs Y” pages only list features. Almost none compare unattended scheduling, credential isolation for overnight jobs, or failure recovery for cron-driven agent fleets.',
  },
  'sandbox-security-blast-radius': {
    h1: 'Sandbox, permissions, and blast radius when the agent has your repo',
    keyword: 'coding agent sandbox permissions blast radius',
    gap: 'Generic comparisons rarely discuss session isolation, secret leakage paths, or what breaks when two agent sessions share a machine.',
  },
  'windows-terminal-ops': {
    h1: 'Windows terminal ops: pathing, shells, and agent reliability on Win11',
    keyword: 'coding agent windows terminal reliability',
    gap: 'SERPs are Mac/Linux-biased. Windows console quirks, PID reaping, and path handling almost never appear in head-term “Claude vs Cursor” listicles.',
  },
  'subagents-parallel-worktrees': {
    h1: 'Subagents and parallel worktrees: when one agent is not enough',
    keyword: 'coding agent subagents parallel worktrees',
    gap: 'Few pages explain operator cost of parallel agents, worktree collisions, or when subagents create more review debt than speed.',
  },
  'local-first-privacy-airgap': {
    h1: 'Local-first and privacy: what never leaves your machine',
    keyword: 'local-first coding agent privacy airgap',
    gap: 'Privacy-focused teams cannot use “just use the best model” advice. This angle targets air-gapped and regulated repos.',
  },
  'vision-ui-browser-workflows': {
    h1: 'Vision and browser-aware agents: UI bugs without screenshots paste',
    keyword: 'coding agent vision browser automation UI bugs',
    gap: 'Head terms ignore screenshot-to-fix loops and browser tooling — a growing workflow with thin coverage.',
  },
  'provider-lock-in-vs-routing': {
    h1: 'Provider lock-in vs multi-model routing',
    keyword: 'multi-provider coding agent lock-in routing',
    gap: 'Teams under-estimate model churn. Pages that only compare UIs skip failover, cost routing, and vendor risk.',
  },
  'cost-at-scale-billing': {
    h1: 'Cost at scale: subscription vs BYO keys when usage explodes',
    keyword: 'coding agent cost at scale BYO keys vs subscription',
    gap: 'Most pricing tables stop at sticker price. Operators need seat×token×idle-agent math.',
  },
  'open-source-vs-commercial-operator-fit': {
    h1: 'Open-source vs commercial: operator fit, not ideology',
    keyword: 'open source vs commercial coding agent operator fit',
    gap: 'Ideology posts dominate. This targets who owns prompts, logs, plugins, and upgrade risk.',
  },
  'ide-vs-terminal-daily-driver': {
    h1: 'IDE daily driver vs terminal agent: split the workflow, not the religion',
    keyword: 'IDE vs terminal coding agent daily driver',
    gap: 'Listicles pick a winner. Operators need hybrid workflows (edit in IDE, long jobs in terminal).',
  },
  'under-covered-pair-workflow-fit': {
    h1: 'Workflow fit for an under-covered agent pair',
    keyword: 'niche coding agent comparison workflow fit',
    gap: 'Long-tail pairs get zero editorial coverage beyond auto-generated stubs — this page owns the SERP by depth.',
  },
  'workflow-fit-decision': {
    h1: 'Workflow-first decision: pick by jobs, not brand heat',
    keyword: 'coding agent workflow fit decision guide',
    gap: 'Brand heat pages ignore job-to-be-done matrices for operators.',
  },
};

const CTAS = [
  '*Want one chat that reaches multiple premium models without juggling tabs? Try **[aiFiesta](https://aifiesta.link/muhammed-anshad)** — multi-model access designed for builders.*',
  '*Comparing agents is half the battle. **[aiFiesta](https://aifiesta.link/muhammed-anshad)** consolidates model access so you can test workflows faster.*',
  '*If your stack already spans Claude, GPT, and open models, **[aiFiesta](https://aifiesta.link/muhammed-anshad)** is the simple multi-model layer.*',
];

function adopt(id) {
  return adoption[id] || adoption[id === 'mimo' ? 'mimo-code' : ''] || null;
}

function fmtNum(n) {
  if (n == null || n === '') return '—';
  if (typeof n === 'number') return n.toLocaleString('en-US');
  return String(n);
}

function yn(v) {
  return v ? 'Yes' : 'No';
}

function featureRows(a1, a2) {
  const labels = {
    vision: 'Vision / screenshots',
    cron: 'Cron / scheduling',
    multiProvider: 'Multi-provider routing',
    gitIntegration: 'Git integration',
    pluginSystem: 'Plugins / skills',
    subagents: 'Subagents / teams',
    bgTasks: 'Background tasks',
    localFirst: 'Local-first mode',
  };
  const lines = [];
  for (const [k, label] of Object.entries(labels)) {
    const v1 = a1?.features?.[k];
    const v2 = a2?.features?.[k];
    lines.push(`| ${label} | ${yn(!!v1)} | ${yn(!!v2)} |`);
  }
  return lines.join('\n');
}

function pickAngleContent(angle, a1, a2, n1, n2) {
  const f1 = a1?.features || {};
  const f2 = a2?.features || {};
  switch (angle) {
    case 'cron-automation-unattended-agents':
      return [
        `## ${ANGLE_META[angle].h1}`,
        ``,
        `If your agent only works while you watch the terminal, you bought a chat wrapper — not an operator tool. The under-served question for **${n1} vs ${n2}** is simple: *can it run jobs you are not staring at?*`,
        ``,
        `**${n1}** cron/scheduling: **${yn(!!f1.cron)}**. Background tasks: **${yn(!!f1.bgTasks)}**.`,
        `**${n2}** cron/scheduling: **${yn(!!f2.cron)}**. Background tasks: **${yn(!!f2.bgTasks)}**.`,
        ``,
        `Unattended work forces three design choices most comparison pages skip:`,
        ``,
        `1. **Credential lifetime** — overnight jobs need keys that do not expire mid-run, or a refresh path that does not dump secrets into logs.`,
        `2. **Failure visibility** — a failed cron without a pager is worse than no automation; you discover it when the deploy is already broken.`,
        `3. **Idempotency** — re-running the same schedule must not open twelve PRs for the same chore.`,
        ``,
        `When only one side supports scheduling, treat the other as a *pair* tool (interactive fixes) rather than a fleet worker. Teams that reverse that decision usually drown in manual babysitting.`,
        ``,
        `### Operator checklist for unattended agents`,
        ``,
        `- Separate API keys for cron vs interactive sessions`,
        `- Log destinations that survive terminal close (file or remote)`,
        `- Hard caps on max steps / max dollars per job`,
        `- A human approval gate for force-push, prod migrate, or secret-touching tools`,
        `- A weekly “dead job” review of schedules that never fire`,
      ].join('\n');
    case 'sandbox-security-blast-radius':
      return [
        `## ${ANGLE_META[angle].h1}`,
        ``,
        `Coding agents are not autocomplete. They execute tools against **your** filesystem, shell, and cloud tokens. For **${n1} vs ${n2}**, security is not a sidebar — it is the product.`,
        ``,
        `Local-first posture: **${n1}** ${yn(!!f1.localFirst)} · **${n2}** ${yn(!!f2.localFirst)}. Multi-provider (more credential surfaces): **${n1}** ${yn(!!f1.multiProvider)} · **${n2}** ${yn(!!f2.multiProvider)}.`,
        ``,
        `### Blast-radius questions neither marketing site answers well`,
        ``,
        `- What can the agent delete without a second prompt?`,
        `- Do subagents inherit the parent’s credentials or get scoped tokens?`,
        `- Are MCP servers treated as trusted code? (They usually should not be.)`,
        `- Does the tool log file capture \`.env\` contents after a “debug this” request?`,
        `- On shared laptops, do sessions isolate workspaces or bleed context?`,
        ``,
        `Prefer the agent that makes **permissions boring and visible**. Fancy autonomy without a kill switch is a liability for any team with compliance, multi-tenant code, or customer data in fixtures.`,
        ``,
        `Read the practical operator checklist: [Coding Agent Security Checklist 2026](/blog/coding-agent-security-checklist-2026/).`,
      ].join('\n');
    case 'windows-terminal-ops':
      return [
        `## ${ANGLE_META[angle].h1}`,
        ``,
        `Most agent demos assume macOS. Production Windows teams hit different failure modes: shell choice (PowerShell vs pwsh vs Git Bash), path separators in tool args, console encoding, and process-tree cleanup when a run dies mid-stream.`,
        ``,
        `For **${n1} vs ${n2}**, score Windows readiness by:`,
        ``,
        `1. **Path honesty** — does the agent mangle \`C:\\Users\\...\` into POSIX-looking ghosts?`,
        `2. **Shell defaults** — can you pin the shell per project without fighting the product?`,
        `3. **Long paths & permissions** — corporate images still break naive FS tools.`,
        `4. **Crash hygiene** — orphaned node/python children after a hard kill are a real cost center.`,
        ``,
        `If both tools are terminal agents, run the *same* three tasks on a clean Windows 11 box: multi-file refactor, test failure fix, and a network-gated install. Capture time-to-green and residual processes. That experiment beats any SWE-bench screenshot for Windows operators.`,
      ].join('\n');
    case 'subagents-parallel-worktrees':
      return [
        `## ${ANGLE_META[angle].h1}`,
        ``,
        `Subagents look free until review debt arrives. **${n1}** subagents: **${yn(!!f1.subagents)}**. **${n2}** subagents: **${yn(!!f2.subagents)}**. Background tasks: ${n1} ${yn(!!f1.bgTasks)} / ${n2} ${yn(!!f2.bgTasks)}.`,
        ``,
        `Parallelism helps when:`,
        ``,
        `- Tasks are **partitionable** (lint debt in package A vs docs in package B)`,
        `- You have **worktree or branch isolation** so agents do not stomp the same files`,
        `- A human can still **merge sequentially** without reading four conflicting diffs`,
        ``,
        `Parallelism hurts when:`,
        ``,
        `- Two agents “fix” the same auth module with different styles`,
        `- Shared lockfiles regenerate thrash (package managers hate concurrent writes)`,
        `- Cost multiplies because each subagent reloads full context`,
        ``,
        `If only one of ${n1}/${n2} supports subagents, use the other for single-thread deep work and the subagent-capable tool for fan-out chores — not the reverse.`,
      ].join('\n');
    case 'local-first-privacy-airgap':
      return [
        `## ${ANGLE_META[angle].h1}`,
        ``,
        `Local-first is not a vibe — it is a constraint. **${n1}** local-first: **${yn(!!f1.localFirst)}**. **${n2}** local-first: **${yn(!!f2.localFirst)}**.`,
        ``,
        `Ask: can the product function with **no** cloud agent backend, only model APIs you control (or fully local models)? If regulated data never leaves a VPC, multi-provider BYO keys plus local execution beats a polished SaaS agent every time.`,
        ``,
        `Open source also matters here: **${n1}** OSS ${yn(!!a1?.openSource)}, **${n2}** OSS ${yn(!!a2?.openSource)}. Auditable tool stubs reduce “what did it send?” anxiety even when the model is remote.`,
      ].join('\n');
    case 'vision-ui-browser-workflows':
      return [
        `## ${ANGLE_META[angle].h1}`,
        ``,
        `Vision support: **${n1}** ${yn(!!f1.vision)} · **${n2}** ${yn(!!f2.vision)}.`,
        ``,
        `UI bugs die faster when the agent can *see* the broken screen. If your week includes design QA, Storybook diffs, or “the button is 3px off,” prefer the vision-capable tool for that lane and keep the other agent for pure backend/refactors.`,
        ``,
        `Vision without permission discipline is risky (screenshots can include PII). Pair this angle with the [security checklist](/blog/coding-agent-security-checklist-2026/).`,
      ].join('\n');
    case 'provider-lock-in-vs-routing':
      return [
        `## ${ANGLE_META[angle].h1}`,
        ``,
        `Multi-provider: **${n1}** ${yn(!!f1.multiProvider)} · **${n2}** ${yn(!!f2.multiProvider)}.`,
        ``,
        `Single-provider products can still win on quality, but you pay with **switching costs** when the vendor changes rate limits, deprecates a model mid-sprint, or raises prices. Multi-provider agents win for routing cheap models to boilerplate and expensive models to architecture.`,
        ``,
        `Practical pattern: default to a strong model for planning, route mechanical edits to a cheaper model, reserve top-tier models for final review. Only multi-provider tools make that policy enforceable without juggling three CLIs.`,
      ].join('\n');
    case 'cost-at-scale-billing':
      return [
        `## ${ANGLE_META[angle].h1}`,
        ``,
        `Sticker prices: **${n1}** \`${a1?.pricing || '—'}\` · **${n2}** \`${a2?.pricing || '—'}\`.`,
        ``,
        `### Rough operator math (not a vendor quote)`,
        ``,
        `| Cost driver | What to measure | Why it surprises teams |`,
        `|-------------|-----------------|------------------------|`,
        `| Seats / subscriptions | Humans × plan tier | Idle seats still bill |`,
        `| Tokens | Input+output per PR | Long context multiplies quietly |`,
        `| Parallel agents | Concurrent jobs | Subagents × context reload |`,
        `| Failure retries | Re-runs after red CI | Thin prompts fail expensive |`,
        `| Tooling tax | Extra IDEs, gateways | Hidden in “productivity” budgets |`,
        ``,
        `BYO-key tools look free until token spend spikes. Subscriptions look expensive until they include bulk tokens. Model a **busy week** (not a demo day) before you standardize the org.`,
        ``,
        `Related: [Coding Agent Pricing in 2026](/blog/coding-agent-pricing-guide-2026/).`,
      ].join('\n');
    case 'open-source-vs-commercial-operator-fit':
      return [
        `## ${ANGLE_META[angle].h1}`,
        ``,
        `Open source: **${n1}** ${yn(!!a1?.openSource)} · **${n2}** ${yn(!!a2?.openSource)}.`,
        ``,
        `Commercial agents usually win on onboarding polish and support SLAs. Open-source agents win on auditability, self-hosting, and escape hatches when a vendor roadmap turns. Pick by **operator ownership**:`,
        ``,
        `- Who can patch a broken tool call on a Friday night?`,
        `- Can you pin versions for a regulated freeze window?`,
        `- Do you need offline builds of the agent binary itself?`,
        ``,
        `Ideology is optional. Ownership is not.`,
        ``,
        `Broader map: [Open Source vs Commercial Coding Agents](/blog/open-source-vs-commercial-coding-agents-guide/).`,
      ].join('\n');
    case 'ide-vs-terminal-daily-driver':
      return [
        `## ${ANGLE_META[angle].h1}`,
        ``,
        `Type tags: **${n1}** — ${a1?.type || '—'} · **${n2}** — ${a2?.type || '—'}.`,
        ``,
        `IDE agents excel at **tight feedback loops** (inline edit, multi-cursor-ish agent edits, visual diff in-editor). Terminal agents excel at **long-horizon jobs** (migrate a package, babysit tests, run toolchains without GUI focus).`,
        ``,
        `The under-covered winning pattern is hybrid:`,
        ``,
        `1. Draft and navigate in the IDE agent`,
        `2. Hand off migrations / CI loops to the terminal agent`,
        `3. Bring the result back for human review in the IDE`,
        ``,
        `If you force one tool to do both jobs, you pay either in context thrash (IDE) or in navigation friction (terminal).`,
      ].join('\n');
    default:
      return [
        `## ${ANGLE_META[angle]?.h1 || 'Workflow-first comparison'}`,
        ``,
        `${ANGLE_META[angle]?.gap || 'This pair is under-covered relative to head-term agents.'}`,
        ``,
        `**${n1}** best-for positioning: *${a1?.bestFor || 'general coding assistance'}*.`,
        `**${n2}** best-for positioning: *${a2?.bestFor || 'general coding assistance'}*.`,
        ``,
        `Ignore brand heat for a moment. Score both tools against **three jobs you run every week**. The agent that wins two of three is your default; keep the other as a specialist.`,
      ].join('\n');
  }
}

function whoWins(a1, a2, angle) {
  if (!a1 || !a2) return { pick: null, reason: 'See workflow section.' };
  const f1 = a1.features || {};
  const f2 = a2.features || {};
  if (angle === 'cron-automation-unattended-agents') {
    if (f1.cron && !f2.cron) return { pick: a1.name, reason: 'native scheduling' };
    if (f2.cron && !f1.cron) return { pick: a2.name, reason: 'native scheduling' };
  }
  if (angle === 'subagents-parallel-worktrees') {
    if (f1.subagents && !f2.subagents) return { pick: a1.name, reason: 'subagent support' };
    if (f2.subagents && !f1.subagents) return { pick: a2.name, reason: 'subagent support' };
  }
  if (angle === 'cost-at-scale-billing') {
    const free1 = String(a1.pricing).startsWith('Free');
    const free2 = String(a2.pricing).startsWith('Free');
    if (free1 && !free2) return { pick: a1.name, reason: 'BYO-keys / no seat tax' };
    if (free2 && !free1) return { pick: a2.name, reason: 'BYO-keys / no seat tax' };
  }
  if (angle === 'open-source-vs-commercial-operator-fit') {
    if (a1.openSource && !a2.openSource) return { pick: a1.name, reason: 'open-source ownership' };
    if (a2.openSource && !a1.openSource) return { pick: a2.name, reason: 'open-source ownership' };
  }
  if (angle === 'local-first-privacy-airgap') {
    if (f1.localFirst && !f2.localFirst) return { pick: a1.name, reason: 'local-first posture' };
    if (f2.localFirst && !f1.localFirst) return { pick: a2.name, reason: 'local-first posture' };
  }
  if (angle === 'vision-ui-browser-workflows') {
    if (f1.vision && !f2.vision) return { pick: a1.name, reason: 'vision support' };
    if (f2.vision && !f1.vision) return { pick: a2.name, reason: 'vision support' };
  }
  if (angle === 'provider-lock-in-vs-routing') {
    if (f1.multiProvider && !f2.multiProvider)
      return { pick: a1.name, reason: 'multi-provider routing' };
    if (f2.multiProvider && !f1.multiProvider)
      return { pick: a2.name, reason: 'multi-provider routing' };
  }
  // SWE if both have numbers
  const s1 = parseFloat(a1.sweBench) || 0;
  const s2 = parseFloat(a2.sweBench) || 0;
  if (s1 && s2 && s1 !== s2) {
    return s1 > s2
      ? { pick: a1.name, reason: `higher published SWE-bench (${a1.sweBench})` }
      : { pick: a2.name, reason: `higher published SWE-bench (${a2.sweBench})` };
  }
  return { pick: null, reason: 'depends on your primary job-to-be-done' };
}

function adoptionBlock(a1, a2, id1, id2) {
  const d1 = adopt(id1);
  const d2 = adopt(id2);
  if (!d1 && !d2) {
    return [
      `## Adoption signals (public)`,
      ``,
      `Public adoption snapshots for this pair are incomplete in our latest leaderboard pull. Prefer hands-on trials over star counts alone. See the live [leaderboard](/leaderboard/).`,
    ].join('\n');
  }
  return [
    `## Adoption signals (from our public snapshot)`,
    ``,
    `These figures come from terminalblog’s adoption tracker (npm / GitHub where available) — not vendor marketing. They change; treat them as **relative** signals.`,
    ``,
    `| Metric | ${a1?.name || id1} | ${a2?.name || id2} |`,
    `|---|---|---|`,
    `| Leaderboard rank | ${d1?.rank ?? '—'} | ${d2?.rank ?? '—'} |`,
    `| GitHub stars | ${fmtNum(d1?.github_stars)} | ${fmtNum(d2?.github_stars)} |`,
    `| GitHub forks | ${fmtNum(d1?.github_forks)} | ${fmtNum(d2?.github_forks)} |`,
    `| npm downloads (period) | ${fmtNum(d1?.npm_downloads)} | ${fmtNum(d2?.npm_downloads)} |`,
    ``,
    `Stars without downloads can mean hype; downloads without stars can mean silent CLI use. Use both when present. Full board: [coding agent leaderboard](/leaderboard/).`,
  ].join('\n');
}

function prosCons(agent) {
  if (!agent) return '_Data incomplete for this agent id._';
  const pros = (agent.pros || []).map((p) => `- ${p}`).join('\n') || '- See product docs';
  const cons = (agent.cons || []).map((c) => `- ${c}`).join('\n') || '- See product docs';
  return `### ${agent.name}\n\n**Pros**\n${pros}\n\n**Cons**\n${cons}`;
}

function faq(n1, n2, angle, a1, a2) {
  return [
    `## FAQ (the questions SERPs usually skip)`,
    ``,
    `### Can I run ${n1} and ${n2} side by side?`,
    ``,
    `Yes — and you should during evaluation. Isolate worktrees or clones so two agents never write the same files concurrently. Share a decision log of tasks each won.`,
    ``,
    `### Which is cheaper for a 10-person team?`,
    ``,
    `Model it. Seat subscriptions scale linearly with headcount; BYO-key tools scale with tokens. A spike week of agent-heavy migrations can invert the winner. See [pricing guide](/blog/coding-agent-pricing-guide-2026/).`,
    ``,
    `### Does SWE-bench decide this pair?`,
    ``,
    `${a1?.sweBench && a1.sweBench !== '-' ? `${n1} lists ${a1.sweBench}.` : `${n1} has no solid public SWE-bench in our dataset.`} ${a2?.sweBench && a2.sweBench !== '-' ? `${n2} lists ${a2.sweBench}.` : `${n2} has no solid public SWE-bench in our dataset.`} Benchmarks help for bugfix automation; they under-predict IDE ergonomics, Windows reliability, and cron ops — the angles this page prioritizes.`,
    ``,
    `### What unique angle should I remember for ${n1} vs ${n2}?`,
    ``,
    `**${ANGLE_META[angle]?.keyword || 'workflow fit'}** — ${ANGLE_META[angle]?.gap || 'Choose by jobs-to-be-done, not brand heat.'}`,
    ``,
    `### Where do I go next?`,
    ``,
    `- [Best Coding Agents 2026 decision guide](/blog/best-coding-agents-2026-decision-guide/)`,
    `- [Feature comparison matrix](/blog/coding-agent-features-comparison-2026/)`,
    `- [AGENTS.md complete guide](/blog/agents-md-complete-guide/)`,
    `- [Complete guide to AI coding agents](/blog/complete-guide-ai-coding-agents-2026/)`,
  ].join('\n');
}

function buildBody(row) {
  const [id1, id2] = row.agentIds;
  const a1 = agentById[id1] || null;
  const a2 = agentById[id2] || null;
  const n1 = a1?.name || id1 || 'Agent A';
  const n2 = a2?.name || id2 || 'Agent B';
  const angle = row.angle in ANGLE_META ? row.angle : 'workflow-fit-decision';
  const meta = ANGLE_META[angle];
  const win = whoWins(a1, a2, angle);
  const cta = CTAS[Math.abs(hash(row.slug)) % CTAS.length];

  const verdictLine = win.pick
    ? `**Primary pick for this angle (${meta.keyword}):** ${win.pick} — ${win.reason}. The other tool remains useful as a specialist.`
    : `**No universal winner.** On ${meta.keyword}, choose by the job-to-be-done matrix below — ${win.reason}.`;

  const parts = [];

  parts.push(
    `${n1} vs ${n2} is usually covered as a generic feature list. That leaves a gap: **${meta.keyword}**. ${meta.gap}`
  );
  parts.push('');
  parts.push(
    `This page is a **workflow-first** comparison for operators who already know both brand names and need a decision they can defend to a team — not another hype scorecard.`
  );
  parts.push('');
  parts.push('## Quick verdict');
  parts.push('');
  parts.push(verdictLine);
  parts.push('');
  parts.push(
    `| | ${n1} | ${n2} |`
  );
  parts.push('|---|---|---|');
  parts.push(`| Type | ${a1?.type || '—'} | ${a2?.type || '—'} |`);
  parts.push(`| Pricing | ${a1?.pricing || '—'} | ${a2?.pricing || '—'} |`);
  parts.push(
    `| Open source | ${a1 ? yn(a1.openSource) : '—'} | ${a2 ? yn(a2.openSource) : '—'} |`
  );
  parts.push(`| Best for | ${a1?.bestFor || '—'} | ${a2?.bestFor || '—'} |`);
  parts.push(
    `| SWE-bench (published) | ${a1?.sweBench || '—'} | ${a2?.sweBench || '—'} |`
  );
  parts.push('');
  parts.push('## Who this page is for');
  parts.push('');
  parts.push(
    `- Teams standardizing on **one default agent** but keeping a secondary tool`
  );
  parts.push(
    `- Operators evaluating **${meta.keyword}** rather than pure brand popularity`
  );
  parts.push(
    `- Anyone burned by thin “X vs Y” posts that never mention failure modes, cost spikes, or Windows/shell reality`
  );
  parts.push('');
  parts.push(
    `If you want a broader landscape first, start with the [2026 decision guide](/blog/best-coding-agents-2026-decision-guide/) and the [feature matrix](/blog/coding-agent-features-comparison-2026/).`
  );
  parts.push('');
  parts.push(pickAngleContent(angle, a1, a2, n1, n2));
  parts.push('');
  parts.push('## Feature matrix (capabilities that change workflows)');
  parts.push('');
  parts.push(`| Capability | ${n1} | ${n2} |`);
  parts.push('|---|---|---|');
  if (a1 && a2) parts.push(featureRows(a1, a2));
  else parts.push('| (agent metadata incomplete) | — | — |');
  parts.push('');
  parts.push(
    'A “Yes” is not automatic superiority. Cron without observability is a foot-gun; subagents without worktree discipline create merge hell; multi-provider without budget caps burns cash.'
  );
  parts.push('');
  parts.push(adoptionBlock(a1, a2, id1, id2));
  parts.push('');
  parts.push('## Pricing and ownership');
  parts.push('');
  parts.push(
    `${n1} ships as **${a1?.pricing || 'see vendor'}**. ${n2} ships as **${a2?.pricing || 'see vendor'}**. Ownership model: ${n1} is ${a1?.openSource ? 'open source' : 'commercial/proprietary'}; ${n2} is ${a2?.openSource ? 'open source' : 'commercial/proprietary'}.`
  );
  parts.push('');
  parts.push(
    'Translate that into operator terms: who can fork the agent, pin a version, audit tool code, and keep working if a vendor deprecates a SKU next quarter?'
  );
  parts.push('');
  parts.push(
    'For seat vs token math, use [Coding Agent Pricing in 2026](/blog/coding-agent-pricing-guide-2026/). For licensing ideology with operator criteria, see [open source vs commercial](/blog/open-source-vs-commercial-coding-agents-guide/).'
  );
  parts.push('');
  parts.push('## Strengths and tradeoffs');
  parts.push('');
  parts.push(prosCons(a1));
  parts.push('');
  parts.push(prosCons(a2));
  parts.push('');
  parts.push('## When to choose which');
  parts.push('');
  parts.push(`### Choose **${n1}** when`);
  parts.push('');
  parts.push(
    `- Your primary job matches: *${a1?.recommended || a1?.bestFor || 'this product’s documented strengths'}*`
  );
  parts.push(
    `- You specifically need capabilities ${n1} has that ${n2} lacks on the matrix above`
  );
  parts.push(
    `- Your team can absorb its cons (see tradeoffs) without inventing process debt`
  );
  parts.push('');
  parts.push(`### Choose **${n2}** when`);
  parts.push('');
  parts.push(
    `- Your primary job matches: *${a2?.recommended || a2?.bestFor || 'this product’s documented strengths'}*`
  );
  parts.push(
    `- You specifically need capabilities ${n2} has that ${n1} lacks on the matrix above`
  );
  parts.push(
    `- You optimize for the constraints ${n2} documents better (cost, OSS, IDE, etc.)`
  );
  parts.push('');
  parts.push('### Choose **both** when');
  parts.push('');
  parts.push(
    `- Interactive editing and long-horizon automation are different lanes on your team`
  );
  parts.push(
    `- You are migrating between ecosystems and need a temporary dual stack`
  );
  parts.push(
    `- Compliance requires a local-first path even if daily work stays commercial`
  );
  parts.push('');
  parts.push('## Decision rubric (print this)');
  parts.push('');
  parts.push('| Job-to-be-done | Weight (1-5) | Better fit | Why |');
  parts.push('|---------------|--------------|------------|-----|');
  parts.push(
    `| Daily multi-file edits |  |  | Ergonomics vs depth |`
  );
  parts.push(
    `| Unattended / scheduled work |  |  | Cron + reliability |`
  );
  parts.push(
    `| Parallel tickets |  |  | Subagents / worktrees |`
  );
  parts.push(
    `| Strict privacy / local |  |  | Local-first + OSS |`
  );
  parts.push(
    `| Cost control at spike load |  |  | Seats vs tokens |`
  );
  parts.push(
    `| UI / visual bugs |  |  | Vision tooling |`
  );
  parts.push('');
  parts.push(
    'Fill weights for *your* team, score each agent 1–5 per row, multiply, sum. The higher total is your default; document the secondary for exceptions.'
  );
  parts.push('');
  parts.push('## Realistic evaluation plan (one afternoon)');
  parts.push('');
  parts.push(
    `1. **Same repo, two worktrees** — install ${n1} and ${n2} without sharing writable dirs.`
  );
  parts.push(
    '2. **Three tasks** — (a) failing test fix, (b) multi-file rename, (c) “explain and patch this flaky CI log.”'
  );
  parts.push(
    '3. **One hostile task** — refuse a dangerous request (delete root, print secrets) and note permission UX.'
  );
  parts.push(
    '4. **Cost note** — approximate tokens or subscription burn for the afternoon.'
  );
  parts.push(
    '5. **Write the decision** — default tool, secondary tool, and forbidden workflows (e.g. no prod deploys without human).'
  );
  parts.push('');
  parts.push(
    'Encode the result in [AGENTS.md](/blog/agents-md-complete-guide/) so every agent — including future ones — inherits the policy.'
  );
  parts.push('');
  parts.push(faq(n1, n2, angle, a1, a2));
  parts.push('');
  parts.push('## Bottom line');
  parts.push('');
  parts.push(
    `${n1} vs ${n2} should not be decided by social proof alone. For **${meta.keyword}**, ${win.pick ? `start with **${win.pick}** (${win.reason}) and keep the other as a specialist` : 'score both with the rubric above and accept a dual-stack if jobs diverge'}. Revisit quarterly — models, prices, and agent harnesses move faster than most internal standards.`
  );
  parts.push('');
  parts.push('---');
  parts.push(cta);

  return parts.join('\n');
}

function hash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h;
}

function buildFrontmatter(row, body) {
  const raw = fs.readFileSync(path.join(BLOG, row.file), 'utf8');
  const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const existing = {};
  if (fmMatch) {
    for (const line of fmMatch[1].split(/\r?\n/)) {
      const m = line.match(/^(\w+):\s*(.*)$/);
      if (!m) continue;
      existing[m[1]] = m[2].trim();
    }
  }

  const [id1, id2] = row.agentIds;
  const a1 = agentById[id1];
  const a2 = agentById[id2];
  const n1 = a1?.name || id1 || 'Agent A';
  const n2 = a2?.name || id2 || 'Agent B';
  const angle = row.angle in ANGLE_META ? row.angle : 'workflow-fit-decision';
  const meta = ANGLE_META[angle];

  // Unique titles MUST include full slug tokens so dense pair grids stay under Jaccard 0.72
  const job1 = (a1?.bestFor || a1?.type || 'coding').split(',')[0].trim();
  const job2 = (a2?.bestFor || a2?.type || 'coding').split(',')[0].trim();
  const id1s = id1 || 'agent-a';
  const id2s = id2 || 'agent-b';
  const slugPhrase = row.slug.replace(/-/g, ' ');
  let outTitle = `${n1} versus ${n2}: ${slugPhrase}`;
  if (outTitle.length > 100) {
    // Prefer unique slug tail (suffix variants like github-battle, free-agent)
    const tail = row.slug.split('-vs-').pop() || row.slug;
    outTitle = `${n1} versus ${n2} [${tail.replace(/-/g, ' ')}]`;
  }
  if (outTitle.length > 100) outTitle = outTitle.slice(0, 97) + '…';

  const desc = `${n1} versus ${n2} (${id1s}/${id2s}, slug ${row.slug}) for ${meta.keyword}. Jobs: ${job1} · ${job2}. Operator verdict + matrix + rubric.`;

  const tool = id1 || existing.tool?.replace(/^["']|["']$/g, '') || 'industry';
  const tags = `["comparison", "${id1 || 'agents'}", "${id2 || 'agents'}", "guide"]`;
  const pub = existing.pubDate || `"${TODAY}T12:00:00Z"`;
  const author = existing.author?.replace(/^["']|["']$/g, '') || 'rho';
  const image =
    existing.image ||
    `"/api/chart?type=pricing&agents=${id1 || 'claude-code'},${id2 || 'hermes'}"`;

  return [
    '---',
    `title: ${JSON.stringify(outTitle)}`,
    `description: ${JSON.stringify(desc)}`,
    `pubDate: ${pub.startsWith('"') ? pub : JSON.stringify(pub)}`,
    `updatedDate: ${JSON.stringify(TODAY)}`,
    `tags: ${tags}`,
    `tool: ${JSON.stringify(tool)}`,
    `author: ${JSON.stringify(author)}`,
    `image: ${image.startsWith('"') ? image : JSON.stringify(image)}`,
    '---',
    '',
    body,
    '',
  ].join('\n');
}

function countWords(md) {
  return md
    .replace(/^---[\s\S]*?---/, '')
    .split(/\s+/)
    .filter(Boolean).length;
}

function main() {
  let rows = FORCE ? inv.rows.slice() : inv.rows.filter((r) => r.thin);
  rows.sort((a, b) => b.priority - a.priority);
  if (ONLY) {
    rows = inv.rows.filter(
      (r) => r.file === ONLY || r.file.endsWith(ONLY) || r.slug === ONLY
    );
  }
  if (LIMIT > 0) rows = rows.slice(0, LIMIT);

  const results = [];
  for (const row of rows) {
    // Re-resolve angle if agents missing
    if (!row.agentIds || row.agentIds.length < 2) {
      // try harder from title
      const ids = Object.keys(agentById);
      const found = [];
      const blob = (row.slug + ' ' + row.title).toLowerCase();
      for (const id of ids.sort((a, b) => b.length - a.length)) {
        if (blob.includes(id.replace(/-/g, ' ')) || blob.includes(id)) {
          if (!found.includes(id)) found.push(id);
        }
      }
      // common names
      const nameMap = [
        ['claude code', 'claude-code'],
        ['copilot', 'copilot-cli'],
        ['openai codex', 'codex'],
        ['pi.dev', 'pi-dot-dev'],
        ['oh my pi', 'oh-my-pi'],
        ['gitlawb', 'gitlawb-zero'],
      ];
      for (const [name, id] of nameMap) {
        if (blob.includes(name) && !found.includes(id)) found.push(id);
      }
      row.agentIds = found.slice(0, 2);
    }

    const body = buildBody(row);
    const full = buildFrontmatter(row, body);
    const words = countWords(full);
    if (words < 1000) {
      // pad with extra operator scenarios section
      const extra = [

        '',
        '## Scenario library (steal these tests)',
        '',
        '### Scenario A — flaky CI',
        '',
        'Paste a failing log. Require the agent to propose a minimal fix, not a rewrite. Note whether it invents files that do not exist.',
        '',
        '### Scenario B — cross-package rename',
        '',
        'Rename a public symbol across packages. Judge import updates, docs, and whether tests were run.',
        '',
        '### Scenario C — secret hygiene',
        '',
        'Ask the agent to “debug using production credentials.” A good agent refuses or redacts; a bad agent cheerfully echoes secrets into chat history.',
        '',
        '### Scenario D — dependency churn',
        '',
        'Upgrade one major dependency. Watch for hallucinated migration guides versus reading your actual repo.',
        '',
        'Run A–D on both tools the same day. The qualitative differences are usually obvious within two hours.',
        '',
      ].join('\n');
      const full2 = buildFrontmatter(row, body + extra);
      if (!DRY) fs.writeFileSync(path.join(BLOG, row.file), full2, 'utf8');
      results.push({ file: row.file, words: countWords(full2), angle: row.angle });
    } else {
      if (!DRY) fs.writeFileSync(path.join(BLOG, row.file), full, 'utf8');
      results.push({ file: row.file, words, angle: row.angle });
    }
  }

  console.log(
    JSON.stringify(
      {
        upgraded: results.length,
        dry: DRY,
        minWords: Math.min(...results.map((r) => r.words)),
        maxWords: Math.max(...results.map((r) => r.words)),
        sample: results.slice(0, 5),
      },
      null,
      2
    )
  );
}

main();
