#!/usr/bin/env node
// Share Claude Code v2.1.318 stability release via MyMarky (X + LinkedIn)
const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const KEY = 'mk_live_2HrW1PDCF5i4rMu809NIDtvxtu0-rdnZOGURht6RWmE';
const API = 'https://api.mymarky.ai/api/businesses/' + BIZ_ID + '/posts';
const HEADERS = { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' };
const ARTICLE = 'https://terminalblog.com/blog/claude-code-v2-1-318-stability-release-50-fixes/';

const POSTS = [
  {
    // X/Twitter: key takeaways + link
    caption:
'Claude Code v2.1.318 just dropped — 57 bug fixes, 19 improvements, ZERO new features 🔥\\n\\n' +
'The "we heard you screaming" release:\\n' +
'✅ Permission prompt race condition FIXED (ghost keystrokes answering prompts)\\n' +
'✅ Network home directory corruption FIXED (NFS/OneDrive/SMB config survival)\\n' +
'✅ Idle compaction eating conversations FIXED (only accepts real summaries now)\\n' +
'✅ --continue regression from v2.1.314 FIXED\\n' +
'✅ macOS memory growth with many Bash commands FIXED\\n\\n' +
'Finally: credential expiration visibility (10-day warning in `claude -p`) + mod effort control + AWS assume_role for gateway\\n\\n' +
'Full breakdown: ' + ARTICLE + '\\n\\n' +
'#CodingAgents #ClaudeCode #DevTools #AI #Stability #BugFixes',
    link: ARTICLE,
    metadata: { format: 'release-update', tool: 'claude-code', version: 'v2.1.318' },
  },
  {
    // LinkedIn: personal take, no links in body
    caption:
'Claude Code v2.1.318 landed today. No new features. Fifty-seven bug fixes. Nineteen improvements.\\n\\n' +
'This is the release that restores trust.\\n\\n' +
'The permission prompt race condition was the most reported UX bug of the last month: you type, a prompt appears slowly, your keystrokes answer it before you see it. Fixed.\\n\\n' +
'Network home directories (NFS, corporate OneDrive, SMB) have been a minefield — config files briefly emptied, stored logins replaced by near-empty copies, MCP servers vanishing at startup. Dramatically improved.\\n\\n' +
'Idle compaction replacing your conversation with a random model output instead of a summary. Fixed — compaction now only accepts actual summaries.\\n\\n' +
'The --continue regression from v2.1.314 that lost earlier conversations after malformed tool calls. Restored.\\n\\n' +
'macOS sessions stalling while memory ballooned with heavy Bash usage. Patched.\\n\\n' +
'Plus: credential expiration now visible in `claude auth status` and `claude -p` JSON, with a 10-day stderr warning. Mod side jobs can run at `low` effort regardless of session setting. AWS `assume_role` support in the gateway for per-developer cost attribution.\\n\\n' +
'This is not a feature release. It is the consolidation release — Anthropic stopped adding, started fixing.\\n\\n' +
'If you run agents where reliability matters, update today.\\n\\n' +
'#AI #CodingAgents #ClaudeCode #DeveloperTools #SoftwareEngineering #Stability #Production #DevOps #Trust',
    metadata: { format: 'personal-take', platform: 'linkedin', tool: 'claude-code', version: 'v2.1.318' },
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