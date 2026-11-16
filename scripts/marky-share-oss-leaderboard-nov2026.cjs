#!/usr/bin/env node
// Share OSS Coding Agent Leaderboard November 2026 via MyMarky (X + LinkedIn)
const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const KEY = 'mk_live_2HrW1PDCF5i4rMu809NIDtvxtu0-rdnZOGURht6RWmE';
const API = 'https://api.mymarky.ai/api/businesses/' + BIZ_ID + '/posts';
const HEADERS = { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' };
const ARTICLE = 'https://terminalblog.com/blog/oss-coding-agent-leaderboard-november-2026/';

const POSTS = [
  {
    // X/Twitter: key takeaways + link
    caption:
'The OSS coding agent leaderboard just flipped 📊\\n\\n' +
'Codex #1 on adoption (57.8) but OpenClaw & Hermes CRUSH it on value (57.3 & 53.6 vs 28.9)\\n\\n' +
'Why? Free tools with real community signals > paid tools with download hype\\n\\n' +
'The rankings:\\n' +
'1️⃣ Codex — 26.5M npm/wk, 135K stars (mid tier)\\n' +
'2️⃣ OpenClaw — 395K stars, 3M npm/wk, FREE → 2x value\\n' +
'3️⃣ Hermes — 264K stars, 81K PyPI/wk, FREE → 2x value\\n' +
'4️⃣ OpenCode — 40M npm/wk but only 14K stars (hype > habit)\\n\\n' +
'Full data + methodology: ' + ARTICLE + '\\n\\n' +
'#CodingAgents #OpenSource #DevTools #AI #Leaderboard #Hermes #OpenClaw #Codex',
    link: ARTICLE,
    metadata: { format: 'release-update', tool: 'leaderboard', version: '2026-11-15' },
  },
  {
    // LinkedIn: personal take, no links in body
    caption:
'The November 2026 OSS coding agent leaderboard is live, and the story isn\'t who\'s #1 — it\'s who wins on VALUE.\n\n' +
'Codex CLI sits at #1 on raw adoption (57.8). But OpenClaw and Hermes tie on adoption (~57 and ~54) while delivering 2x the value score because they\'re completely free with no paid tiers.\n\n' +
'OpenCode pulls 40M npm downloads/week but ranks #4 because GitHub stars (14K) and commit velocity don\'t match the hype. That\'s the "hype ahead of habit" pattern — developers install, try, but don\'t star, fork, or contribute.\n\n' +
'This is the first leaderboard using v3 multi-signal methodology: npm/PyPI downloads, GitHub stars/forks, 30-day commits, 30-day issues, Reddit/X signals, and data coverage — weighted for real adoption, not marketing.\n\n' +
'Closed-source tools (Cursor, Claude Code, AmpCode, Copilot CLI) are explicitly excluded. Sparse-data tools (Goose, Gitlawb Zero) are dropped.\n\n' +
'The three bets:\n' +
'• OpenClaw = value king (395K stars, vision, cron, browser automation, free)\n' +
'• Hermes = quiet platform winner (264K stars, cron, webapp, memory, plugins, free)\n' +
'• OpenCode = daily-driver terminal UX (but community signal collapsing)\n\n' +
'If you\'re picking an OSS agent to build on, bet on where the community is CONTRIBUTING (stars, forks, issues, commits) — not just CONSUMING (npm downloads).\n\n' +
'#AI #CodingAgents #OpenSource #DeveloperTools #SoftwareEngineering #DevOps #OpenClaw #Hermes #Codex #Leadership #Strategy',
    metadata: { format: 'personal-take', platform: 'linkedin', tool: 'leaderboard', version: '2026-11-15' },
  },
];

(async () => {
  const now = Date.now();
  const results = [];
  for (let i = 0; i < POSTS.length; i++) {
    const p = POSTS[i];
    const scheduled = new Date(now + (5 + i * 60) * 60000).toISOString();
    const payload = {
      caption: p.caption,
      link: p.link || undefined,
      status: 'SCHEDULED',
      scheduled_publish_time: scheduled,
      metadata: p.metadata,
    };
    try {
      const r = await fetch(API, { method: 'POST', headers: HEADERS, body: JSON.stringify(payload) });
      const data = await r.json();
      results.push({ i: i + 1, http: r.status, id: data.id || (data.data && data.data.id) || 'FAILED', error: data.error || null });
      console.log('Post ' + (i + 1) + ': HTTP ' + r.status + ' | id=' + results[i].id + ' | sched=' + scheduled);
    } catch (e) {
      results.push({ i: i + 1, http: 0, id: 'ERROR', error: String(e) });
      console.log('Post ' + (i + 1) + ': ERROR ' + e);
    }
  }
  console.log('SUMMARY:', JSON.stringify(results, null, 1));
})().catch((e) => { console.error('Fatal:', e); process.exit(1); });