#!/usr/bin/env node
/**
 * Inventory + priority queue for agent comparison pages.
 * Usage:
 *   node scripts/comparison-inventory.cjs
 *   node scripts/comparison-inventory.cjs --json path/to/out.json
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const BLOG = path.join(ROOT, 'src', 'content', 'blog');
const AGENTS = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'src', 'data', 'agents.json'), 'utf8')
);
const agentById = Object.fromEntries(AGENTS.map((a) => [a.id, a]));

// Adoption snapshot (latest)
const snapDir = path.join(ROOT, 'src', 'data', 'adoption', 'snapshots');
let adoption = {};
if (fs.existsSync(snapDir)) {
  const files = fs.readdirSync(snapDir).filter((f) => f.endsWith('.json')).sort();
  if (files.length) {
    const snap = JSON.parse(fs.readFileSync(path.join(snapDir, files[files.length - 1]), 'utf8'));
    for (const a of snap.agents || []) adoption[a.id] = a;
    // alias mimo
    if (adoption['mimo-code'] && !adoption.mimo) adoption.mimo = adoption['mimo-code'];
  }
}

const EVERGREEN_FLOOR = 1000;
const OUT_JSON =
  process.argv.includes('--json')
    ? process.argv[process.argv.indexOf('--json') + 1]
    : path.join(ROOT, 'tmp', 'comparison-inventory.json');
const OUT_QUEUE = path.join(ROOT, 'tmp', 'comparison-queue.md');

function isComparisonFile(name) {
  if (!name.endsWith('.mdx')) return false;
  if (name.startsWith('_')) return false;
  // Require real pair separator "-vs-" (bare "vs-" also matches inside "devs-")
  if (name.includes('-vs-')) return true;
  if (/comparison/i.test(name)) return true;
  if (/^open-source-vs-/.test(name)) return true;
  // what-devs-say-* only when it is an explicit vs post
  if (/^what-devs-say-.+-vs-/.test(name)) return true;
  return false;
}

function parseAgentsFromSlug(slug) {
  // strip suffixes
  let s = slug
    .replace(/-20\d{2}.*$/, '')
    .replace(/-comparison.*$/, '')
    .replace(/-pricing-battle.*$/, '')
    .replace(/-terminal-battle.*$/, '')
    .replace(/-github-battle.*$/, '')
    .replace(/-showdown.*$/, '')
    .replace(/-faceoff.*$/, '')
    .replace(/-deep-dive.*$/, '')
    .replace(/-unconstrained.*$/, '')
    .replace(/-token-overhead.*$/, '')
    .replace(/-free-agent.*$/, '')
    .replace(/-open-source-rival.*$/, '')
    .replace(/-ide-speed.*$/, '')
    .replace(/-ide-vs-terminal.*$/, '')
    .replace(/-parallel-vs-extensible.*$/, '')
    .replace(/-extensibility.*$/, '')
    .replace(/-difference.*$/, '')
    .replace(/-free-terminal-vs-paid-ide.*$/, '');

  // what-devs-say-X-vs-Y
  s = s.replace(/^what-devs-say-/, '');

  const ids = Object.keys(agentById).sort((a, b) => b.length - a.length);
  const found = [];
  let rest = s;
  // try pair split on -vs-
  const parts = rest.split(/-vs-/);
  if (parts.length >= 2) {
    for (const part of parts.slice(0, 2)) {
      let matched = null;
      for (const id of ids) {
        if (part === id || part.startsWith(id + '-') || part.endsWith('-' + id) || part.includes(id)) {
          // prefer exact-ish
          if (part === id || part.startsWith(id)) {
            matched = id;
            break;
          }
          if (!matched) matched = id;
        }
      }
      // alias map
      const aliases = {
        'pi-dot-dev': 'pi-dot-dev',
        pi: 'pi-dot-dev',
        'claude-code': 'claude-code',
        claude: 'claude-code',
        copilot: 'copilot-cli',
        'copilot-cli': 'copilot-cli',
        'openai-codex': 'codex',
        codex: 'codex',
        cursor: 'cursor',
        hermes: 'hermes',
        opencode: 'opencode',
        openclaw: 'openclaw',
        goose: 'goose',
        kilo: 'kilo',
        mimo: 'mimo',
        ampcode: 'ampcode',
        codebuff: 'codebuff',
        'gitlawb-zero': 'gitlawb-zero',
        'oh-my-pi': 'oh-my-pi',
        'oh-my-pi': 'oh-my-pi',
      };
      if (!matched) {
        for (const [k, v] of Object.entries(aliases)) {
          if (part === k || part.startsWith(k)) {
            matched = v;
            break;
          }
        }
      }
      if (matched) found.push(matched);
    }
  }
  return [...new Set(found)].slice(0, 2);
}

function bodyWords(raw) {
  const body = raw.replace(/^---[\s\S]*?---/, '');
  return body.split(/\s+/).filter(Boolean).length;
}

function detectAngle(a1, a2, slug, title) {
  const t = `${slug} ${title}`.toLowerCase();
  if (!a1 || !a2) {
    if (/open.?source|commercial/.test(t)) return 'open-source-vs-commercial-operator-fit';
    if (/pricing|cost/.test(t)) return 'cost-at-scale-billing';
    if (/windows|terminal/.test(t)) return 'windows-terminal-ops';
    if (/security|sandbox/.test(t)) return 'sandbox-security-blast-radius';
    if (/subagent|parallel/.test(t)) return 'subagents-parallel-worktrees';
    return 'workflow-fit-decision';
  }
  const f1 = a1.features || {};
  const f2 = a2.features || {};
  if (a1.openSource !== a2.openSource) return 'open-source-vs-commercial-operator-fit';
  if ((a1.type || '').includes('IDE') || (a2.type || '').includes('IDE'))
    return 'ide-vs-terminal-daily-driver';
  if (f1.cron !== f2.cron) return 'cron-automation-unattended-agents';
  if (f1.subagents !== f2.subagents) return 'subagents-parallel-worktrees';
  if (f1.vision !== f2.vision) return 'vision-ui-browser-workflows';
  if (f1.localFirst !== f2.localFirst) return 'local-first-privacy-airgap';
  if (f1.multiProvider !== f2.multiProvider) return 'provider-lock-in-vs-routing';
  if (
    String(a1.pricing).startsWith('Free') !== String(a2.pricing).startsWith('Free')
  )
    return 'cost-at-scale-billing';
  if (/security|sandbox|permission/.test(t)) return 'sandbox-security-blast-radius';
  if (/windows/.test(t)) return 'windows-terminal-ops';
  // long-tail: unpopular pair = higher opportunity
  return 'under-covered-pair-workflow-fit';
}

function popularity(id) {
  const a = adoption[id] || adoption[id === 'mimo' ? 'mimo-code' : id];
  if (!a) return 10;
  // invert rank: rank 1 => high
  return Math.max(1, 30 - (a.rank || 15));
}

function scoreRow(row) {
  // Higher = do first: thinness + under-served angle + mid popularity (not only head terms)
  let score = 0;
  score += Math.max(0, EVERGREEN_FLOOR - row.words) * 2; // thinness
  const rareAngles = {
    'cron-automation-unattended-agents': 40,
    'sandbox-security-blast-radius': 38,
    'windows-terminal-ops': 36,
    'subagents-parallel-worktrees': 35,
    'local-first-privacy-airgap': 34,
    'vision-ui-browser-workflows': 32,
    'provider-lock-in-vs-routing': 30,
    'cost-at-scale-billing': 28,
    'open-source-vs-commercial-operator-fit': 26,
    'ide-vs-terminal-daily-driver': 24,
    'under-covered-pair-workflow-fit': 45, // niche pairs
    'workflow-fit-decision': 20,
  };
  score += rareAngles[row.angle] || 15;
  // Prefer mid-tail: not both top-3 mega-head
  const p1 = popularity(row.agentIds[0] || '');
  const p2 = popularity(row.agentIds[1] || '');
  if (p1 + p2 > 50) score -= 15; // head-term saturated
  else if (p1 + p2 < 25) score += 20; // long-tail pair
  else score += 10;
  if (row.words < 300) score += 25;
  return score;
}

function main() {
  const files = fs.readdirSync(BLOG).filter(isComparisonFile);
  const rows = [];
  for (const f of files) {
    const raw = fs.readFileSync(path.join(BLOG, f), 'utf8');
    const slug = f.replace(/\.mdx$/, '');
    const titleM = raw.match(/^title:\s*["']?(.+?)["']?\s*$/m);
    const title = titleM ? titleM[1].replace(/^["']|["']$/g, '') : slug;
    const words = bodyWords(raw);
    const agentIds = parseAgentsFromSlug(slug);
    const a1 = agentById[agentIds[0]];
    const a2 = agentById[agentIds[1]];
    const angle = detectAngle(a1, a2, slug, title);
    const row = {
      file: f,
      path: `src/content/blog/${f}`,
      slug,
      title,
      words,
      thin: words < EVERGREEN_FLOOR,
      agentIds,
      angle,
      hasTable: /\|.+\|/.test(raw),
      hasVerdict: /verdict|when to (choose|pick)/i.test(raw),
      updatedDate: (raw.match(/^updatedDate:\s*["']?(.+?)["']?\s*$/m) || [])[1] || null,
    };
    row.priority = scoreRow(row);
    rows.push(row);
  }
  rows.sort((a, b) => b.priority - a.priority);

  fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true });
  fs.writeFileSync(
    OUT_JSON,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        evergreenFloor: EVERGREEN_FLOOR,
        total: rows.length,
        thin: rows.filter((r) => r.thin).length,
        ok: rows.filter((r) => !r.thin).length,
        rows,
      },
      null,
      2
    )
  );

  const md = [
    `# Comparison upgrade queue`,
    ``,
    `Generated: ${new Date().toISOString()}`,
    `Total: **${rows.length}** · Thin (<${EVERGREEN_FLOOR}w): **${rows.filter((r) => r.thin).length}** · OK: **${rows.filter((r) => !r.thin).length}**`,
    ``,
    `| # | Priority | Words | Angle | File |`,
    `|---|----------|-------|-------|------|`,
    ...rows.map(
      (r, i) =>
        `| ${i + 1} | ${r.priority} | ${r.words} | ${r.angle} | \`${r.file}\` |`
    ),
    ``,
  ].join('\n');
  fs.writeFileSync(OUT_QUEUE, md);

  console.log(
    JSON.stringify(
      {
        total: rows.length,
        thin: rows.filter((r) => r.thin).length,
        ok: rows.filter((r) => !r.thin).length,
        out: OUT_JSON,
        queue: OUT_QUEUE,
        head: rows.slice(0, 8).map((r) => ({ f: r.file, w: r.words, a: r.angle, p: r.priority })),
      },
      null,
      2
    )
  );
}

main();
