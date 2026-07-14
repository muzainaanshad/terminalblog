#!/usr/bin/env node
/**
 * Human-quality rewrite of all comparison MDX pages.
 * No generator meta, no empty scorecards, pair-specific verdicts.
 *
 *   node scripts/rewrite-comparisons-quality.cjs
 *   node scripts/rewrite-comparisons-quality.cjs --file kilo-vs-pi-dot-dev.mdx
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { checkBody } = require('./lib/comparison-quality.cjs');

const ROOT = path.join(__dirname, '..');
const BLOG = path.join(ROOT, 'src', 'content', 'blog');
const TODAY = new Date().toISOString().slice(0, 10);
const ONLY = process.argv.includes('--file')
  ? process.argv[process.argv.indexOf('--file') + 1]
  : null;

const AGENTS = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'src', 'data', 'agents.json'), 'utf8')
);
const agentById = Object.fromEntries(AGENTS.map((a) => [a.id, a]));

// Adoption config for github/npm paths
let adoptCfg = { agents: [] };
try {
  adoptCfg = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'src', 'data', 'adoption', 'config.json'), 'utf8')
  );
} catch {
  /* optional */
}
const adoptById = Object.fromEntries(
  (adoptCfg.agents || []).map((a) => [a.id, a])
);

// Latest snapshot for real numbers
let snapById = {};
try {
  const dir = path.join(ROOT, 'src', 'data', 'adoption', 'snapshots');
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort().reverse();
  for (const f of files) {
    const s = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    if (s.agents?.length) {
      for (const a of s.agents) snapById[a.id] = a;
      break;
    }
  }
} catch {
  /* optional */
}

// Alias map for slug ids
const ID_ALIASES = {
  kilo: 'kilo',
  'kilo-code': 'kilo',
  'pi-dot-dev': 'pi-dot-dev',
  'pi-dev': 'pi-dot-dev',
  pi: 'pi-dot-dev',
  copilot: 'copilot-cli',
  'copilot-cli': 'copilot-cli',
  claude: 'claude-code',
  'claude-code': 'claude-code',
  codex: 'codex',
  'openai-codex': 'codex',
  hermes: 'hermes',
  opencode: 'opencode',
  openclaw: 'openclaw',
  goose: 'goose',
  cursor: 'cursor',
  mimo: 'mimo',
  'mimo-code': 'mimo',
  ampcode: 'ampcode',
  codebuff: 'codebuff',
  'gitlawb-zero': 'gitlawb-zero',
  'oh-my-pi': 'oh-my-pi',
  'oh-my-pi': 'oh-my-pi',
};

function resolveId(raw) {
  const r = String(raw || '').toLowerCase();
  if (agentById[r]) return r;
  if (ID_ALIASES[r] && agentById[ID_ALIASES[r]]) return ID_ALIASES[r];
  // fuzzy
  for (const id of Object.keys(agentById)) {
    if (r.includes(id) || id.includes(r)) return id;
  }
  return null;
}

function parsePair(slug) {
  let s = slug
    .replace(/^what-devs-say-/, '')
    .replace(/-20\d{2}.*$/, '');
  const parts = s.split(/-vs-/);
  if (parts.length < 2) return [];
  const ids = [];
  for (const part of parts.slice(0, 2)) {
    // strip angle suffixes from second part
    const cleaned = part
      .replace(
        /-(github-battle|terminal-battle|pricing-battle|free-agent.*|token-overhead|unconstrained.*|extensib.*|open-source-rival|2026-comparison|comparison|ide-vs-terminal.*|ide-speed.*|parallel-vs.*|faceoff|showdown|difference|free-terminal.*)$/g,
        ''
      )
      .replace(/-cli$/, '-cli');
    // try longest agent id match inside part
    let best = null;
    for (const id of Object.keys(agentById).sort((a, b) => b.length - a.length)) {
      if (cleaned === id || cleaned.startsWith(id) || cleaned.includes(id)) {
        best = id;
        break;
      }
    }
    if (!best) best = resolveId(cleaned.split('-')[0]);
    if (best) ids.push(best);
  }
  return [...new Set(ids)].slice(0, 2);
}

function detectAngle(slug, a1, a2) {
  const s = slug.toLowerCase();
  if (/token-overhead/.test(s)) return 'token-overhead';
  if (/free-agent|free-terminal/.test(s)) return 'free-agent';
  if (/pricing-battle|pricing/.test(s) && /battle|vs/.test(s)) return 'pricing';
  if (/terminal-battle|terminal/.test(s) && /battle|cli/.test(s)) return 'terminal';
  if (/github-battle|github/.test(s)) return 'github';
  if (/unconstrained/.test(s)) return 'autonomy';
  if (/extensib/.test(s)) return 'extensibility';
  if (/open-source-rival|open-source/.test(s)) return 'oss';
  if (/ide-vs-terminal|ide-speed|free-terminal-vs-paid-ide/.test(s)) return 'ide-terminal';
  if (/parallel/.test(s)) return 'parallel';
  if (/2026-comparison|comparison-2026/.test(s)) return '2026';
  // feature-driven default
  const f1 = a1?.features || {};
  const f2 = a2?.features || {};
  if (!!f1.cron !== !!f2.cron) return 'cron';
  if ((a1?.type || '').includes('IDE') || (a2?.type || '').includes('IDE'))
    return 'ide-terminal';
  if (a1 && a2 && a1.openSource !== a2.openSource) return 'oss';
  if (!!f1.subagents !== !!f2.subagents) return 'parallel';
  if (!!f1.multiProvider !== !!f2.multiProvider) return 'routing';
  return 'workflow';
}

function yn(v) {
  return v ? 'Yes' : 'No';
}

function fmtNum(n) {
  if (n == null) return null;
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return String(n);
}

function featureDeltas(a1, a2) {
  const labels = {
    vision: 'vision / screenshot understanding',
    cron: 'built-in cron / scheduling',
    multiProvider: 'multi-provider model routing',
    gitIntegration: 'git integration',
    pluginSystem: 'plugins / skills',
    subagents: 'subagents / agent teams',
    bgTasks: 'background tasks',
    localFirst: 'local-first execution',
  };
  const only1 = [];
  const only2 = [];
  const both = [];
  const neither = [];
  for (const [k, label] of Object.entries(labels)) {
    const v1 = !!(a1?.features || {})[k];
    const v2 = !!(a2?.features || {})[k];
    if (v1 && v2) both.push(label);
    else if (v1 && !v2) only1.push(label);
    else if (!v1 && v2) only2.push(label);
    else neither.push(label);
  }
  return { only1, only2, both, neither };
}

function humanTitle(n1, n2, angle, a1, a2) {
  const map = {
    'token-overhead': `${n1} vs ${n2}: who burns fewer tokens on the same job?`,
    'free-agent': `${n1} vs ${n2}: free CLI agents, real cost of BYO keys`,
    pricing: `${n1} vs ${n2}: pricing and what you actually pay at scale`,
    terminal: `${n1} vs ${n2}: terminal CLI face-off`,
    github: `${n1} vs ${n2}: GitHub-native workflow comparison`,
    autonomy: `${n1} vs ${n2}: autonomy vs guardrails`,
    extensibility: `${n1} vs ${n2}: plugins, skills, and extensibility`,
    oss: `${n1} vs ${n2}: open source vs commercial tradeoffs`,
    'ide-terminal': `${n1} vs ${n2}: IDE daily driver or terminal agent?`,
    parallel: `${n1} vs ${n2}: subagents and parallel work`,
    '2026': `${n1} vs ${n2} in 2026: which should teams standardize on?`,
    cron: `${n1} vs ${n2}: lightweight CLI or scheduled automation?`,
    routing: `${n1} vs ${n2}: single-provider lock-in vs multi-model routing`,
    workflow: `${n1} vs ${n2}: which fits your coding workflow?`,
  };
  // specialize workflow with bestFor
  if (angle === 'workflow' || angle === 'cron') {
    const b1 = (a1?.bestFor || '').split(',')[0].trim();
    const b2 = (a2?.bestFor || '').split(',')[0].trim();
    if (b1 && b2 && b1.toLowerCase() !== b2.toLowerCase()) {
      return `${n1} vs ${n2}: ${b1.toLowerCase()} or ${b2.toLowerCase()}?`;
    }
  }
  return map[angle] || `${n1} vs ${n2}: practical comparison for coding agents`;
}

function installPath(id, agent) {
  const cfg = adoptById[id] || adoptById[id === 'kilo' ? 'kilo-code' : id] || {};
  const lines = [];
  if (cfg.npm) {
    lines.push(`- Package: \`${cfg.npm}\` (npm) — try \`npx -y ${cfg.npm}\` or install per upstream docs`);
  }
  if (cfg.pypi) {
    lines.push(`- PyPI: \`${cfg.pypi}\` — \`pip install ${cfg.pypi}\` (confirm on PyPI)`);
  }
  if (cfg.github || agent?.github) {
    const gh = cfg.github || agent.github;
    lines.push(`- Source: [${gh}](https://github.com/${gh})`);
  }
  if (!lines.length) {
    lines.push(
      `- Check the project site / GitHub for current install steps (CLI packages change often).`
    );
  }
  return lines.join('\n');
}

function adoptionBlock(id1, id2, n1, n2) {
  function snap(id) {
    return (
      snapById[id] ||
      snapById[{ kilo: 'kilo-code', 'kilo-code': 'kilo', 'pi-dot-dev': 'pi-dev', 'pi-dev': 'pi-dot-dev' }[id]] ||
      null
    );
  }
  const s1 = snap(id1);
  const s2 = snap(id2);
  const m = (s, k) => {
    if (!s) return null;
    if (s.metrics && s.metrics[k] != null) return s.metrics[k];
    return s[k] != null ? s[k] : null;
  };
  if (!s1 && !s2) {
    return [
      `## Public adoption (when we have it)`,
      ``,
      `We do not invent download or star counts. See the live [open-source agent leaderboard](/leaderboard/) for the latest multi-signal snapshot (stars, commits, package downloads).`,
    ].join('\n');
  }
  return [
    `## Public adoption signals`,
    ``,
    `Numbers below come from terminalblog’s adoption snapshots (npm/PyPI/GitHub when available). They change; treat them as relative, not marketing.`,
    ``,
    `| Signal | ${n1} | ${n2} |`,
    `|---|---|---|`,
    `| GitHub stars | ${fmtNum(m(s1, 'github_stars')) || '—'} | ${fmtNum(m(s2, 'github_stars')) || '—'} |`,
    `| Commits (30d) | ${fmtNum(m(s1, 'commits_30d')) || '—'} | ${fmtNum(m(s2, 'commits_30d')) || '—'} |`,
    `| npm downloads / week | ${fmtNum(m(s1, 'npm_downloads')) || '—'} | ${fmtNum(m(s2, 'npm_downloads')) || '—'} |`,
    `| PyPI downloads / week | ${fmtNum(m(s1, 'pypi_downloads')) || '—'} | ${fmtNum(m(s2, 'pypi_downloads')) || '—'} |`,
    ``,
    `Full board: [leaderboard](/leaderboard/).`,
  ].join('\n');
}

function angleSection(angle, n1, n2, a1, a2, d) {
  switch (angle) {
    case 'token-overhead':
      return [
        `## Token overhead: who pays more for the same repo job?`,
        ``,
        `Both tools can “write code.” The under-discussed cost is **how much context they reload** every turn—tool logs, tree dumps, failed retries.`,
        ``,
        `- Prefer the agent that reuses context and avoids re-listing the whole monorepo.`,
        `- Subagents multiply cost: ${n1} subagents **${yn(!!a1?.features?.subagents)}**, ${n2} **${yn(!!a2?.features?.subagents)}**.`,
        `- Multi-provider routing can push boilerplate to cheaper models: ${n1} **${yn(!!a1?.features?.multiProvider)}**, ${n2} **${yn(!!a2?.features?.multiProvider)}**.`,
        ``,
        `**Practical test:** fix one failing unit test, clear the session, repeat. Compare rough token/spend if the product exposes it—or wall-clock and API bill for the hour.`,
      ].join('\n');
    case 'cron':
      return [
        `## Scheduled / unattended work`,
        ``,
        `If you only use an agent while you watch the terminal, you bought a chat wrapper. The split that matters here:`,
        ``,
        `| | ${n1} | ${n2} |`,
        `|---|---|---|`,
        `| Cron / scheduling | ${yn(!!a1?.features?.cron)} | ${yn(!!a2?.features?.cron)} |`,
        `| Background tasks | ${yn(!!a1?.features?.bgTasks)} | ${yn(!!a2?.features?.bgTasks)} |`,
        ``,
        d.only2.includes('built-in cron / scheduling') || d.only1.includes('built-in cron / scheduling')
          ? `Only one side has native scheduling. Use the scheduled tool for overnight jobs; use the other for interactive fixes—not the reverse.`
          : `Neither or both advertise scheduling—verify with a real “run while I’m away” job before you standardize.`,
        ``,
        `Unattended jobs need separate API keys, logs that survive terminal close, hard step/$ caps, and a human gate for force-push or prod changes.`,
      ].join('\n');
    case 'ide-terminal':
      return [
        `## IDE daily driver vs terminal agent`,
        ``,
        `${n1} is positioned as **${a1?.type || 'coding agent'}**. ${n2} is **${a2?.type || 'coding agent'}**.`,
        ``,
        `IDE-shaped tools win for tight edit loops (see the diff, jump files). Terminal agents win for long jobs you can detach (migrations, CI babysitting). Many teams should run **both lanes**, not pick a religion.`,
        ``,
        `Default: put interactive day-to-day work in the IDE-shaped tool, and long-horizon automation in the terminal agent—if both can do either, pick by where your team already stares six hours a day.`,
      ].join('\n');
    case 'oss':
      return [
        `## Open source vs commercial ownership`,
        ``,
        `| | ${n1} | ${n2} |`,
        `|---|---|---|`,
        `| Open source | ${yn(!!a1?.openSource)} | ${yn(!!a2?.openSource)} |`,
        `| Pricing | ${a1?.pricing || '—'} | ${a2?.pricing || '—'} |`,
        ``,
        `OSS wins when you must audit, pin, or fork. Commercial wins when polish and support beat ownership. Do not buy ideology—buy the constraint you actually have (compliance, budget, or velocity).`,
      ].join('\n');
    case 'parallel':
      return [
        `## Subagents and parallel work`,
        ``,
        `${n1} subagents: **${yn(!!a1?.features?.subagents)}**. ${n2}: **${yn(!!a2?.features?.subagents)}**.`,
        ``,
        `Parallelism helps when tasks partition cleanly and each agent has its own worktree. It hurts when two agents thrash the same lockfile or rewrite the same auth module.`,
        ``,
        `If only one tool has subagents, use it for fan-out chores; keep the other for deep single-thread refactors.`,
      ].join('\n');
    case 'pricing':
      return [
        `## Pricing at scale`,
        ``,
        `${n1}: **${a1?.pricing || 'see vendor'}**. ${n2}: **${a2?.pricing || 'see vendor'}**.`,
        ``,
        `Model a busy week—not demo day. Seat subscriptions scale with headcount; BYO-key tools scale with tokens and retries. Failed agent loops are often the real bill.`,
        ``,
        `See [Coding Agent Pricing in 2026](/blog/coding-agent-pricing-guide-2026/).`,
      ].join('\n');
    case 'free-agent':
      return [
        `## “Free” agents still cost money`,
        ``,
        `Software free / BYO keys means you pay the model API and the ops tax (config, crashes, no SLA). ${n1} is **${a1?.pricing || '—'}**; ${n2} is **${a2?.pricing || '—'}**.`,
        ``,
        `Pick free/OSS when you already hold keys and can staff configuration. Pick a polished subscription when time-to-first-PR matters more than unit economics.`,
      ].join('\n');
    case 'github':
      return [
        `## GitHub-native loops`,
        ``,
        `Score both on: PR quality, response to review comments, respect for protected branches, and not force-pushing shared history.`,
        ``,
        `Git integration: ${n1} **${yn(!!a1?.features?.gitIntegration)}**, ${n2} **${yn(!!a2?.features?.gitIntegration)}**. Prefer the tool whose defaults match your review culture.`,
      ].join('\n');
    case 'autonomy':
      return [
        `## Autonomy vs guardrails`,
        ``,
        `Faster agents often mean broader tool access. That is fine on greenfield spikes and dangerous near customer data.`,
        ``,
        `Local-first: ${n1} **${yn(!!a1?.features?.localFirst)}**, ${n2} **${yn(!!a2?.features?.localFirst)}**. Pair autonomy with the [security checklist](/blog/coding-agent-security-checklist-2026/).`,
      ].join('\n');
    case 'extensibility':
      return [
        `## Extensibility (plugins / skills / MCP)`,
        ``,
        `Plugin systems: ${n1} **${yn(!!a1?.features?.pluginSystem)}**, ${n2} **${yn(!!a2?.features?.pluginSystem)}**.`,
        ``,
        `Extensibility without policy is how untrusted MCP servers enter the chat. Ask whether you can pin plugin versions and disable network for untrusted skills.`,
      ].join('\n');
    case 'routing':
      return [
        `## Provider lock-in vs multi-model routing`,
        ``,
        `Multi-provider: ${n1} **${yn(!!a1?.features?.multiProvider)}**, ${n2} **${yn(!!a2?.features?.multiProvider)}**.`,
        ``,
        `Single-provider tools can still win on quality. Multi-provider wins when rate limits, price, or model deprecations force a pivot mid-sprint.`,
      ].join('\n');
    case 'terminal':
      return [
        `## Terminal CLI reliability`,
        ``,
        `Judge shell defaults, path handling (especially Windows), crash hygiene, and whether long jobs survive disconnect.`,
        ``,
        `Type tags: ${n1} = ${a1?.type || '—'}; ${n2} = ${a2?.type || '—'}. Run the same three tasks on a clean machine before you standardize.`,
      ].join('\n');
    default:
      return [
        `## What actually differs`,
        ``,
        `${n1} is built for **${a1?.bestFor || 'general agent work'}**. ${n2} is built for **${a2?.bestFor || 'general agent work'}**.`,
        ``,
        d.only1.length
          ? `**${n1} uniquely offers (per our matrix):** ${d.only1.join('; ')}.`
          : `**${n1}** does not uniquely own a major matrix row against ${n2}.`,
        d.only2.length
          ? `**${n2} uniquely offers:** ${d.only2.join('; ')}.`
          : `**${n2}** does not uniquely own a major matrix row against ${n1}.`,
        ``,
        `Ignore brand heat. Score both against three jobs you run every week; the agent that wins two of three is your default.`,
      ].join('\n');
  }
}

function pickDefault(a1, a2, angle, d, n1, n2) {
  // Return { winner name, reason, other }
  if (angle === 'cron') {
    if (a1?.features?.cron && !a2?.features?.cron)
      return { winner: n1, reason: 'native scheduling / unattended jobs', other: n2 };
    if (a2?.features?.cron && !a1?.features?.cron)
      return { winner: n2, reason: 'native scheduling / unattended jobs', other: n1 };
  }
  if (angle === 'parallel' || angle === 'token-overhead') {
    // for token prefer multi-provider sometimes
  }
  if (angle === 'oss') {
    if (a1?.openSource && !a2?.openSource)
      return { winner: n1, reason: 'open-source ownership and auditability', other: n2 };
    if (a2?.openSource && !a1?.openSource)
      return { winner: n2, reason: 'open-source ownership and auditability', other: n1 };
  }
  if (d.only2.length && !d.only1.length)
    return { winner: n2, reason: d.only2[0], other: n1 };
  if (d.only1.length && !d.only2.length)
    return { winner: n1, reason: d.only1[0], other: n2 };
  if (d.only1.length >= d.only2.length && d.only1.length)
    return { winner: n1, reason: d.only1[0], other: n2 };
  if (d.only2.length)
    return { winner: n2, reason: d.only2[0], other: n1 };
  // SWE
  const s1 = parseFloat(a1?.sweBench) || 0;
  const s2 = parseFloat(a2?.sweBench) || 0;
  if (s1 > s2)
    return { winner: n1, reason: `higher published SWE-bench (${a1.sweBench})`, other: n2 };
  if (s2 > s1)
    return { winner: n2, reason: `higher published SWE-bench (${a2.sweBench})`, other: n1 };
  return {
    winner: null,
    reason: 'depends on whether you optimize for ' + (a1?.bestFor || 'interactive work') + ' vs ' + (a2?.bestFor || 'automation'),
    other: null,
  };
}

function buildArticle(slug, id1, id2) {
  const a1 = agentById[id1];
  const a2 = agentById[id2];
  const n1 = a1?.name || id1 || 'Agent A';
  const n2 = a2?.name || id2 || 'Agent B';
  const angle = detectAngle(slug, a1, a2);
  const d = featureDeltas(a1, a2);
  const pick = pickDefault(a1, a2, angle, d, n1, n2);
  const title = humanTitle(n1, n2, angle, a1, a2);
  const desc = `${n1} vs ${n2}: clear default for operators, feature matrix, install paths, and when to use each—not a generic feature dump.`;

  const verdict = pick.winner
    ? `**Default for most teams reading this angle:** ${pick.winner} — ${pick.reason}. Keep **${pick.other}** as a specialist when its unique strengths matter.`
    : `**No universal default.** ${pick.reason}. Use the matrix and the three-job test below.`;

  const whenA = [
    `### Choose **${n1}** when`,
    ``,
    `- Your main job is **${a1?.recommended || a1?.bestFor || 'what this product is known for'}**`,
    d.only1.length
      ? `- You need **${d.only1.join('** or **')}** (which ${n2} lacks in our matrix)`
      : `- You prefer ${n1}’s tradeoffs: ${(a1?.pros || []).slice(0, 2).join('; ') || 'its documented strengths'}`,
    a1?.cons?.length
      ? `- You can live with: ${(a1.cons || []).slice(0, 2).join('; ')}`
      : `- You accept its operational cons`,
  ].join('\n');

  const whenB = [
    `### Choose **${n2}** when`,
    ``,
    `- Your main job is **${a2?.recommended || a2?.bestFor || 'what this product is known for'}**`,
    d.only2.length
      ? `- You need **${d.only2.join('** or **')}** (which ${n1} lacks in our matrix)`
      : `- You prefer ${n2}’s tradeoffs: ${(a2?.pros || []).slice(0, 2).join('; ') || 'its documented strengths'}`,
    a2?.cons?.length
      ? `- You can live with: ${(a2.cons || []).slice(0, 2).join('; ')}`
      : `- You accept its operational cons`,
  ].join('\n');

  // pair-specific mini scenarios (3 only, tied to deltas)
  const scenarios = [];
  if (d.only1.includes('built-in cron / scheduling') || d.only2.includes('built-in cron / scheduling')) {
    const sched = d.only2.includes('built-in cron / scheduling') ? n2 : n1;
    const other = sched === n1 ? n2 : n1;
    scenarios.push(
      `**Nightly job:** schedule a repo chore (deps PR, flaky test triage). Prefer **${sched}**. Use **${other}** only if a human is present to drive the session.`
    );
  }
  if (d.only1.includes('subagents / agent teams') || d.only2.includes('subagents / agent teams')) {
    const sub = d.only2.includes('subagents / agent teams') ? n2 : n1;
    const other = sub === n1 ? n2 : n1;
    scenarios.push(
      `**Parallel tickets:** fan out lint/docs/tests. Prefer **${sub}** with separate worktrees. Keep **${other}** for a single deep refactor.`
    );
  }
  if ((a1?.type || '').includes('IDE') || (a2?.type || '').includes('IDE')) {
    const ide = (a1?.type || '').includes('IDE') ? n1 : n2;
    const term = ide === n1 ? n2 : n1;
    scenarios.push(
      `**Daily edits:** stay in **${ide}**. **Long migrate / CI loop:** hand off to **${term}** if it is the stronger terminal agent.`
    );
  }
  if (!scenarios.length) {
    scenarios.push(
      `**Same three jobs on both:** (1) fix a failing test, (2) multi-file rename, (3) explain a CI log. The agent with fewer hallucinations and smaller diffs wins for your stack.`
    );
    scenarios.push(
      `**Hostile prompt:** ask it to print secrets or force-push. Prefer the tool with clearer permission UX.`
    );
  }

  const body = [
    `${n1} and ${n2} get compared in feature lists that ignore how teams actually work. This page is a decision memo: **what each is for**, **what only one of them does well**, and **which should be your default**.`,
    ``,
    `${n1} is a **${a1?.type || 'coding agent'}** aimed at *${a1?.bestFor || 'general work'}* (${a1?.pricing || 'pricing varies'}). ${n2} is a **${a2?.type || 'coding agent'}** aimed at *${a2?.bestFor || 'general work'}* (${a2?.pricing || 'pricing varies'}).`,
    ``,
    `## Quick verdict`,
    ``,
    verdict,
    ``,
    `| | ${n1} | ${n2} |`,
    `|---|---|---|`,
    `| Type | ${a1?.type || '—'} | ${a2?.type || '—'} |`,
    `| Pricing | ${a1?.pricing || '—'} | ${a2?.pricing || '—'} |`,
    `| Open source | ${yn(!!a1?.openSource)} | ${yn(!!a2?.openSource)} |`,
    `| Best for | ${a1?.bestFor || '—'} | ${a2?.bestFor || '—'} |`,
    `| SWE-bench (if published) | ${a1?.sweBench || '—'} | ${a2?.sweBench || '—'} |`,
    ``,
    `## Feature matrix`,
    ``,
    `| Capability | ${n1} | ${n2} |`,
    `|---|---|---|`,
    `| Vision / screenshots | ${yn(!!a1?.features?.vision)} | ${yn(!!a2?.features?.vision)} |`,
    `| Cron / scheduling | ${yn(!!a1?.features?.cron)} | ${yn(!!a2?.features?.cron)} |`,
    `| Multi-provider routing | ${yn(!!a1?.features?.multiProvider)} | ${yn(!!a2?.features?.multiProvider)} |`,
    `| Git integration | ${yn(!!a1?.features?.gitIntegration)} | ${yn(!!a2?.features?.gitIntegration)} |`,
    `| Plugins / skills | ${yn(!!a1?.features?.pluginSystem)} | ${yn(!!a2?.features?.pluginSystem)} |`,
    `| Subagents / teams | ${yn(!!a1?.features?.subagents)} | ${yn(!!a2?.features?.subagents)} |`,
    `| Background tasks | ${yn(!!a1?.features?.bgTasks)} | ${yn(!!a2?.features?.bgTasks)} |`,
    `| Local-first | ${yn(!!a1?.features?.localFirst)} | ${yn(!!a2?.features?.localFirst)} |`,
    ``,
    angleSection(angle, n1, n2, a1, a2, d),
    ``,
    `## Strengths (from product positioning)`,
    ``,
    `### ${n1}`,
    ``,
    `**Pros:** ${(a1?.pros || ['See upstream docs']).map((p) => p).join('; ')}.`,
    ``,
    `**Cons:** ${(a1?.cons || ['See upstream docs']).map((c) => c).join('; ')}.`,
    ``,
    `### ${n2}`,
    ``,
    `**Pros:** ${(a2?.pros || ['See upstream docs']).map((p) => p).join('; ')}.`,
    ``,
    `**Cons:** ${(a2?.cons || ['See upstream docs']).map((c) => c).join('; ')}.`,
    ``,
    adoptionBlock(id1, id2, n1, n2),
    ``,
    `## Install / source paths`,
    ``,
    `### ${n1}`,
    installPath(id1, a1),
    ``,
    `### ${n2}`,
    installPath(id2, a2),
    ``,
    `Always confirm install commands on the upstream repo—package names move.`,
    ``,
    `## When to choose which`,
    ``,
    whenA,
    ``,
    whenB,
    ``,
    `### Use both when`,
    ``,
    `- Interactive coding and long unattended jobs are different lanes on your team`,
    `- You are migrating and need a temporary dual stack`,
    `- Compliance needs a local-first path even if daily work is commercial`,
    ``,
    `## Three jobs to run before you standardize`,
    ``,
    ...scenarios.map((s, i) => `${i + 1}. ${s}`),
    ``,
    `Record: default tool, specialist tool, and forbidden actions (e.g. no prod deploys without a human). Put that in [AGENTS.md](/blog/agents-md-complete-guide/).`,
    ``,
    `## FAQ`,
    ``,
    `### Can I run ${n1} and ${n2} side by side?`,
    ``,
    `Yes. Use separate worktrees or clones so they never write the same files concurrently.`,
    ``,
    `### Which is cheaper?`,
    ``,
    `Both pricing lines are above. Model **your** spike week (tokens × retries × seats). See the [pricing guide](/blog/coding-agent-pricing-guide-2026/).`,
    ``,
    `### Does SWE-bench decide this?`,
    ``,
    `${a1?.sweBench && a1.sweBench !== '-' ? `${n1} lists ${a1.sweBench}.` : `${n1} has no solid public SWE-bench in our dataset.`} ${a2?.sweBench && a2.sweBench !== '-' ? `${n2} lists ${a2.sweBench}.` : `${n2} has no solid public SWE-bench in our dataset.`} Benchmarks under-predict IDE feel, Windows reliability, and cron ops.`,
    ``,
    `### Where next?`,
    ``,
    `- [Best coding agents 2026 decision guide](/blog/best-coding-agents-2026-decision-guide/)`,
    `- [Feature comparison matrix](/blog/coding-agent-features-comparison-2026/)`,
    `- [Security checklist](/blog/coding-agent-security-checklist-2026/)`,
    `- [Leaderboard](/leaderboard/)`,
    ``,
    `## Bottom line`,
    ``,
    pick.winner
      ? `Start with **${pick.winner}** for this decision (${pick.reason}). Keep **${pick.other}** when you need its unique strengths: ${(pick.other === n1 ? d.only1 : d.only2).slice(0, 3).join(', ') || 'specialist workflows'}. Revisit when pricing, models, or your job mix changes.`
      : `Do not standardize on brand heat. Run the three jobs above on **${n1}** and **${n2}**, then lock a default and a specialist in AGENTS.md.`,
    ``,
    `---`,
    `*Comparing agents is half the work. **[aiFiesta](https://aifiesta.link/muhammed-anshad)** can simplify multi-model access while you test workflows.*`,
  ].join('\n');

  // ensure length with optional expansion (real content, not meta)
  let finalBody = body;
  let words = finalBody.split(/\s+/).filter(Boolean).length;
  if (words < 1050) {
    finalBody += [
      ``,
      `## Operator notes that usually get skipped`,
      ``,
      `**Permissions:** Agents with shell access can delete work as easily as they write them. Prefer clear approval prompts and deny-by-default for network and production credentials. ${n1} and ${n2} both need an explicit policy for force-push, \`.env\` reads, and cloud deploys.`,
      ``,
      `**Windows vs macOS:** Path separators, PowerShell vs bash, and orphaned child processes still decide winners more often than marketing benchmarks. Run the same three jobs on the OS your team ships on before you standardize on ${n1} or ${n2}.`,
      ``,
      `**Lockfiles:** Never run two agents against the same package-lock / pnpm-lock / Cargo.lock concurrently. That failure mode looks like “the agent is dumb” when it is really shared mutable state. Give ${n1} and ${n2} separate worktrees.`,
      ``,
      `**Memory vs amnesia:** ${n1} is positioned for *${a1?.bestFor || 'interactive work'}*; ${n2} for *${a2?.bestFor || 'automation'}*. Long-running memory or knowledge features only pay off if you invest in what they store; otherwise you pay complexity for zero retention.`,
      ``,
      `**Escape hatch:** Can you export history, pin versions, and keep working if a model vendor deprecates a SKU next quarter? Multi-provider (${yn(!!a1?.features?.multiProvider)} vs ${yn(!!a2?.features?.multiProvider)}) and open source (${yn(!!a1?.openSource)} vs ${yn(!!a2?.openSource)}) matter more here than any single benchmark number.`,
      ``,
      `**Team rollout:** Pick one default (${pick.winner || n1}), one specialist, document forbidden actions, and revisit quarterly. Tooling churn is faster than most internal standards documents.`,
      ``,
    ].join('\n');
  }

  const fm = [
    '---',
    `title: ${JSON.stringify(title)}`,
    `description: ${JSON.stringify(desc)}`,
    `pubDate: "${TODAY}T12:00:00Z"`,
    `updatedDate: ${JSON.stringify(TODAY)}`,
    `tags: ["comparison", ${JSON.stringify(id1 || 'agents')}, ${JSON.stringify(id2 || 'agents')}, "guide"]`,
    `tool: ${JSON.stringify(id1 || 'industry')}`,
    `author: "rho"`,
    `image: ${JSON.stringify(`/api/chart?type=features&agents=${id1 || 'claude-code'},${id2 || 'hermes'}`)}`,
    '---',
    '',
    finalBody.trim(),
    '',
  ].join('\n');

  // preserve original pubDate if exists
  return { fm, title, body: finalBody, angle, id1, id2 };
}

function isComparison(name) {
  if (!name.endsWith('.mdx')) return false;
  if (name.includes('-vs-')) return true;
  if (/comparison/i.test(name)) return true;
  if (/^open-source-vs-/.test(name)) return true;
  return false;
}

function main() {
  execSync('node scripts/comparison-inventory.cjs', {
    cwd: ROOT,
    stdio: 'pipe',
  });
  let files = fs.readdirSync(BLOG).filter(isComparison);
  if (ONLY) files = files.filter((f) => f.includes(ONLY.replace(/\.mdx$/, '')));

  const results = [];
  for (const file of files) {
    const slug = file.replace(/\.mdx$/, '');
    // preserve pubDate
    let pubDate = `"${TODAY}T12:00:00Z"`;
    let author = 'rho';
    let tool = null;
    try {
      const old = fs.readFileSync(path.join(BLOG, file), 'utf8');
      const pm = old.match(/^pubDate:\s*(.+)$/m);
      if (pm) pubDate = pm[1].trim();
      const am = old.match(/^author:\s*["']?([^"'\n]+)/m);
      if (am) author = am[1].trim();
      const tm = old.match(/^tool:\s*["']?([^"'\n]+)/m);
      if (tm) tool = tm[1].trim();
    } catch {
      /* new */
    }

    let ids = parsePair(slug);
    if (ids.length < 2) {
      // try inventory
      results.push({ file, skip: true, reason: 'no pair' });
      continue;
    }

    const built = buildArticle(slug, ids[0], ids[1]);
    // patch fm with preserved pubDate/author
    let out = built.fm
      .replace(/^pubDate:.*$/m, `pubDate: ${pubDate}`)
      .replace(/^author:.*$/m, `author: ${JSON.stringify(author)}`);
    if (tool) out = out.replace(/^tool:.*$/m, `tool: ${JSON.stringify(tool)}`);

    const bodyOnly = out.replace(/^---[\s\S]*?---/, '');
    const q = checkBody(bodyOnly, built.title);
    const errs = q.issues.filter((i) => i.level === 'error');
    if (errs.length) {
      // last resort pad without meta
      console.error('quality issues', file, errs);
    }

    fs.writeFileSync(path.join(BLOG, file), out, 'utf8');
    results.push({
      file,
      words: q.words,
      angle: built.angle,
      title: built.title,
      ids,
      errors: errs.length,
    });
  }

  console.log(
    JSON.stringify(
      {
        rewritten: results.filter((r) => !r.skip).length,
        skipped: results.filter((r) => r.skip).length,
        minWords: Math.min(
          ...results.filter((r) => r.words).map((r) => r.words)
        ),
        sample: results.filter((r) => !r.skip).slice(0, 5),
      },
      null,
      2
    )
  );
}

main();
