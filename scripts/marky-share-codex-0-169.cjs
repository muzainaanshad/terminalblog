#!/usr/bin/env node
// Share Codex 0.169 release article via MyMarky (X + LinkedIn)
const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const KEY = 'mk_live_2HrW1PDCF5i4rMu809NIDtvxtu0-rdnZOGURht6RWmE';
const API = 'https://api.mymarky.ai/api/businesses/' + BIZ_ID + '/posts';
const HEADERS = { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' };

const ARTICLE = {
  slug: 'codex-0-169-agent-command-center-side-chats',
  tool: 'codex',
  version: '0.169.0',
};

const BASE_URL = 'https://terminalblog.com/blog/';

const POSTS = [];

// Codex 0.169 - X/Twitter (with link)
POSTS.push({
  caption:
'Codex 0.169 just dropped — and your terminal workspace now has MULTIPLE SIDE CHATS. 🎯\n\n' +
'🗂️ Multiple side-chat tabs: switch with keyboard/mouse, persist across restarts\n' +
'🔍 Search tasks from command center: by name, prompt preview, or directory\n' +
'📄 Collapsible turn details: fold completed activity, keep answers visible\n' +
'💾 Saved chats survive model switch + Ctrl+L clears display without losing history\n\n' +
'Full breakdown: ' + BASE_URL + 'codex-0-169-agent-command-center-side-chats/\n\n' +
'#Codex #OpenAI #AICodingAgent #Terminal #DeveloperTools #MultiContext',
  link: BASE_URL + 'codex-0-169-agent-command-center-side-chats/',
  metadata: { format: 'release-update', tool: 'codex', version: '0.169.0' },
}, {
  // Codex 0.169 - LinkedIn (personal take, no link)
  caption:
'Codex 0.169 (released Nov 13) doesn\'t add flashy capabilities — it makes the command center a true MULTI-CONTEXT workspace.\n\n' +
'The feature you\'ll use every session: **Multiple side-chat tabs**. Think browser tabs but for AI conversations. Tab 1 = frontend bug fix, Tab 2 = backend refactor. Switch with Ctrl+Tab. Context preserved. Restart Codex — your side chats are still there.\n\n' +
'**Searchable task history** in the command center (`codex agents --no-daemon`). Filter by task name, prompt preview, or working directory. 50 agent runs this month? Type "OAuth" → instant match → resume.\n\n' +
'**Collapsible turn details** in full-screen transcript. Fold the noise, keep the answers visible. Tool output stays searchable. Long sessions finally readable.\n\n' +
'Plus quality-of-life: `Ctrl+L` clears display without losing history. Saved chats survive model switch. Network approvals one-at-a-time. Realtime V3 speech saved to history.\n\n' +
'OpenAI is shipping weekly stable releases now. 0.167 built the command center. 0.169 made it a multi-context workspace. The trajectory is clear: Codex is becoming a full terminal IDE.\n\n' +
'Full article on terminalblog.\n\n' +
'#Codex #OpenAI #AICodingAgent #Terminal #DeveloperTools #MultiContext #AIEngineering',
  metadata: { format: 'personal-take', platform: 'linkedin', tool: 'codex', version: '0.169.0' },
});

(async () => {
  const now = Date.now();
  const results = [];
  for (let i = 0; i < POSTS.length; i++) {
    const p = POSTS[i];
    const scheduled = new Date(now + (30 + i * 45) * 60000).toISOString();
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