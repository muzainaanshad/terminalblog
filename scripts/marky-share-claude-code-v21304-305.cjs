#!/usr/bin/env node
// Share Claude Code v2.1.304 + v2.1.305 stability wave via MyMarky (X + LinkedIn)
const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const KEY = 'mk_live_2HrW1PDCF5i4rMu809NIDtvxtu0-rdnZOGURht6RWmE';
const API = 'https://api.mymarky.ai/api/businesses/' + BIZ_ID + '/posts';
const HEADERS = { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' };
const ARTICLE = 'https://terminalblog.com/blog/claude-code-v2-1-304-305-stability-wave/';

const POSTS = [
  {
    // X/Twitter: key takeaways + link
    caption:
      'Claude Code v2.1.304 + v2.1.305: 200+ fixes in 48 hours 🔧\n\n' +
      'Two releases, 48 hours, pure stability:\n\n' +
      '1. WORKTREE ISOLATION + GIT 2.56 — reftable format fixed, stops repo corruption\n\n' +
      '2. WINDOWS exFAT/FAT32 — every write was refused, now works on external drives\n\n' +
      '3. /AUTO-MODE-SETUP — guided setup teaches auto mode your project (Bedrock, Vertex, Foundry, gateway)\n\n' +
      '4. CLOUD SESSIONS — cost/usage persists, routines don\'t duplicate, messages sync across devices\n\n' +
      '5. MCP 2026-07-28 — servers omitting optional fields now work\n\n' +
      '6. PLUGIN STARTUP — far fewer fs calls, especially Windows\n\n' +
      '7. REMOTE CONTROL — shows "disconnected" instead of spinning offline\n\n' +
      '8. USAGE WARNING — warns before resume if it\'ll burn your 5h limit\n\n' +
      'No new features. Just 200+ fixes that make daily work work.\n\n' +
      'Full breakdown: ' + ARTICLE + '\n\n' +
      '#ClaudeCode #Anthropic #CodingAgents #DevTools #BugFixes #Git #Windows #MCP #Stability',
    link: ARTICLE,
    metadata: { format: 'release-update', tool: 'claude-code', version: 'v2.1.304-v2.1.305' },
  },
  {
    // LinkedIn: personal take, no links in body
    caption:
      "Claude Code just shipped 200+ fixes in 48 hours across v2.1.304 and v2.1.305.\n\n" +
      "This is what a mature tooling release cycle looks like — no new features, pure stability across the pain points that bite daily:\n\n" +
      "🔧 WORKTREE ISOLATION + GIT 2.56 — Reftable format support means worktrees (the safest way to run parallel agents) no longer corrupt repos. If you use worktrees, upgrade today.\n\n" +
      "🪟 WINDOWS exFAT/FAT32 — Every file write on external drives was refused or prompted. Fixed. Claude Code is now usable on external storage.\n\n" +
      "⚙️ /AUTO-MODE-SETUP — Guided setup that reads your project and recent sessions to teach auto mode your environment. Now works on Bedrock, Vertex, Foundry, Claude apps gateway, and telemetry-disabled sessions. Auto mode finally learns your codebase.\n\n" +
      "⚡ PLUGIN STARTUP PERFORMANCE — Far fewer filesystem calls. 20+ plugins? You'll notice the difference immediately, especially on Windows.\n\n" +
      "☁️ CLOUD SESSION RELIABILITY — Cost/usage persists across process resume. Routine runs don't duplicate (no more double-posted reports). Messages from other devices appear without reload. Rewind works on all messages.\n\n" +
      "🔌 MCP 2026-07-28 PROTOCOL — Servers negotiating new protocol but omitting optional fields (resultType, ttlMs, cacheScope) now work correctly.\n\n" +
      "📱 REMOTE CONTROL OFFLINE — Subagent pane now shows \"Remote Control disconnected\" instead of spinning forever when your computer goes offline.\n\n" +
      "📊 USAGE LIMIT WARNING — On Pro/Max plans, warns before resuming an inactive conversation that would burn a noticeable share of your 5-hour limit. Resume anyway or start fresh.\n\n" +
      "Plus: Compaction summary now shows tool names, org policy refreshes immediately after API key approval, plugin hook transparency in transcripts.\n\n" +
      "Since late September: v2.1.294 → v2.1.295 → v2.1.296 → v2.1.299 → v2.1.300 → v2.1.302 → v2.1.303 → v2.1.304 → v2.1.305. A relentless stability sprint.\n\n" +
      "If you're on cloud sessions, worktrees, Windows, many plugins, or want auto mode to actually understand your project — update now.\n\n" +
      "#AI #CodingAgents #ClaudeCode #Anthropic #SoftwareEngineering #DevTools #Git #Windows #MCP #Stability",
    metadata: { format: 'personal-take', platform: 'linkedin', tool: 'claude-code', version: 'v2.1.304-v2.1.305' },
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