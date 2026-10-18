#!/usr/bin/env node
// Share Claude Code v2.1.302 bug fixes via MyMarky (X + LinkedIn)
const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const KEY = 'mk_live_2HrW1PDCF5i4rMu809NIDtvxtu0-rdnZOGURht6RWmE';
const API = 'https://api.mymarky.ai/api/businesses/' + BIZ_ID + '/posts';
const HEADERS = { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' };
const ARTICLE = 'https://terminalblog.com/blog/claude-code-v2-1-302-bug-fixes/';

const POSTS = [
  {
    // X/Twitter: key takeaways + link
    caption:
      'Claude Code v2.1.302: 50+ bug fixes — worktree corruption, Windows exFAT writes, idle compaction, cloud sessions, MCP 2026-07-28 🔧\n\n' +
      'Top fixes:\n\n' +
      '1. WORKTREE ISOLATION for git 2.56+ — stops repo corruption with reftable format\n\n' +
      '2. WINDOWS exFAT/FAT32 — every file write was refused/prompted, now works\n\n' +
      '3. IDLE COMPACTION — finally toggleable in /config with notices explaining how to disable\n\n' +
      '4. PLUGIN PERFORMANCE — far fewer fs calls on startup, especially Windows\n\n' +
      '5. CLOUD SESSIONS — cost/usage persists, routine runs don\'t duplicate, messages sync across devices\n\n' +
      '6. MCP PROTOCOL 2026-07-28 — servers omitting resultType/ttlMs/cacheScope now work\n\n' +
      'Pure stability release. No new features.\n\n' +
      'Full breakdown: ' + ARTICLE + '\n\n' +
      '#ClaudeCode #Anthropic #CodingAgents #DevTools #BugFixes #Git #Windows #MCP',
    link: ARTICLE,
    metadata: { format: 'release-update', tool: 'claude-code', version: 'v2.1.302' },
  },
  {
    // LinkedIn: personal take, no links in body
    caption:
      "Claude Code v2.1.302 is the stability release teams have been waiting for.\n\n" +
      "50+ bug fixes across the pain points that bite daily:\n\n" +
      "🔧 WORKTREE ISOLATION + GIT 2.56 — Reftable format support means worktrees (the safest way to run parallel agents) no longer corrupt repos. If you use worktrees, upgrade today.\n\n" +
      "🪟 WINDOWS exFAT/FAT32 — Every file write on external drives was refused or prompted. Fixed. Claude Code is now usable on external storage.\n\n" +
      "⚙️ IDLE COMPACTION CONTROL — Finally toggleable in `/config`. Notices explain how to disable. Long-running sessions no longer lose context mid-task.\n\n" +
      "⚡ PLUGIN STARTUP PERFORMANCE — Far fewer filesystem calls. 20+ plugins? You'll notice the difference immediately, especially on Windows.\n\n" +
      "☁️ CLOUD SESSION RELIABILITY — Cost/usage persists across process resume. Routine runs don't duplicate (no more double-posted reports). Messages from other devices appear without reload. Rewind works on all messages.\n\n" +
      "🔌 MCP 2026-07-28 PROTOCOL — Servers negotiating new protocol but omitting optional fields (resultType, ttlMs, cacheScope) now work correctly.\n\n" +
      "Plus: Remote Control offline handling, Claude Tag/Slack UX fixes (images, DMs, channel managers, custom connectors), VS Code fixes, Code Review setup resume.\n\n" +
      "No new features. Pure stability. This is what a mature tooling release looks like.\n\n" +
      "If you're on cloud sessions, worktrees, Windows, or many plugins — update now.\n\n" +
      "#AI #CodingAgents #ClaudeCode #Anthropic #SoftwareEngineering #DevTools #Git #Windows #MCP #Stability",
    metadata: { format: 'personal-take', platform: 'linkedin', tool: 'claude-code', version: 'v2.1.302' },
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