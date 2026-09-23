#!/usr/bin/env node
// Share Claude Code v2.1.280 via MyMarky (X + LinkedIn)
const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const KEY = 'mk_live_2HrW1PDCF5i4rMu809NIDtvxtu0-rdnZOGURht6RWmE';
const API = 'https://api.mymarky.ai/api/businesses/' + BIZ_ID + '/posts';
const HEADERS = { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' };
const ARTICLE = 'https://terminalblog.com/blog/claude-code-v2-1-280-opus-5-5-default-massive-fix-wave/';

const POSTS = [
  {
    // X/Twitter: key takeaways + link
    caption:
'Claude Code v2.1.280 just dropped — Opus 5.5 is now DEFAULT 🚀\\n\\n' +
'1M context, $4/$20 per Mtok, $0.20/M cache reads. Available on Pro, Max, Team, Enterprise.\\n\\n' +
'But the real story: 100+ fixes that clean up months of paper cuts:\\n' +
'• Dialog focus theft FIXED (click to bring window front ≠ click item under cursor)\\n' +
'• Auto-mode retry loops STOPPED (safety declines deny once, back off after 10)\\n' +
'• Windows prompt scrambling GONE (screen repaints, ZWNJ preserved for Arabic/Persian)\\n' +
'• Voice dictation WORKS (Ctrl+C stops mic, Esc cancels, Space no false triggers)\\n' +
'• Subagent hand-offs FIXED (reports no longer lost, LSP works, Ctrl+C = 2 presses)\\n' +
'• Session resume crashes HARDENED (damaged cache rebuilt, malformed history handled)\\n' +
'• Plugin marketplace cred helpers WORK (private repos update properly)\\n' +
'• MCP server status CONSISTENT (⚠ everywhere, re-add reconnects)\\n\\n' +
'Full changelog: ' + ARTICLE + '\\n\\n' +
'#CodingAgents #ClaudeCode #Opus55 #DevTools #AI',
    link: ARTICLE,
    metadata: { format: 'release-update', tool: 'claude-code', version: 'v2.1.280' },
  },
  {
    // LinkedIn: personal take, no links in body
    caption:
'Claude Code v2.1.280 shipped Opus 5.5 as the new default model — 1 million context, pricing that makes it viable for daily coding.\\n\\n' +
'But honestly? The 100+ fixes are what you\'ll actually feel every day.\\n\\n' +
'The dialog focus theft that made you click the wrong thing when bringing the window forward — gone.\\n' +
'The auto-mode retry loops that burned tokens on safety checks with no answer — they now back off and stop.\\n' +
'The Windows prompt scrambling after invisible character cleanup — the screen repaints, and the zero-width non-joiner for Arabic/Persian text is preserved.\\n' +
'Voice dictation that wouldn\'t stop recording on Ctrl+C — fixed.\\n' +
'Background subagents silently losing their reports when the parent compacted — fixed.\\n' +
'Plugin marketplace updates failing on private repos because git credential helpers were ignored — fixed.\\n\\n' +
'This is the release where Claude Code stopped feeling like a beta and started feeling like a tool you can trust in production.\\n\\n' +
'If you use it daily, update. You\'ll notice the quiet.\\n\\n' +
'#AI #CodingAgents #ClaudeCode #Opus55 #DeveloperTools #Productivity #SoftwareEngineering',
    metadata: { format: 'personal-take', platform: 'linkedin', tool: 'claude-code', version: 'v2.1.280' },
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