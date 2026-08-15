#!/usr/bin/env node
// Share the Cline v4.1.10 web search release via MyMarky (X + LinkedIn)
const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const KEY = 'mk_live_2HrW1PDCF5i4rMu809NIDtvxtu0-rdnZOGURht6RWmE';
const API = 'https://api.mymarky.ai/api/businesses/' + BIZ_ID + '/posts';
const HEADERS = { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' };
const ARTICLE = 'https://terminalblog.com/blog/cline-v4-1-10-web-search-lands/';

const POSTS = [
  {
    // X/Twitter: key takeaways + link
    caption:
'Cline v4.1.10 just taught your AI coder to Google. 🔍\n\n' +
'✨ Provider-executed web search during tasks — off by default, toggle in Feature Settings\n' +
'📋 Search calls & results appear in transcript, persist across reloads\n' +
'🛡️ No more Hub wars — build identity ordering stops multiple Clines killing each other\'s sessions\n' +
'🔌 Idle plugin sandboxes reclaimed — no more orphaned processes eating RAM\n' +
'📦 Model catalog refresh — Crusoe added, defaults updated\n' +
'🧠 Extended thinking budgets fixed on Cline Pass (was silently broken)\n\n' +
'Your agent can now verify its own work against live docs. Full breakdown: ' + ARTICLE + '\n\n' +
'#Cline #AICodingAgent #WebSearch #DeveloperTools #VSCode #AIEngineering',
    link: ARTICLE,
    metadata: { format: 'release-update', tool: 'cline', version: '4.1.10' },
  },
  {
    // LinkedIn: personal take, no links in body
    caption:
'I\'ve been watching Cline evolve from a VS Code extension into a full agent platform. v4.1.10 (released today) adds the feature I\'ve wanted since day one: **web search during tasks.**\n\n' +
'Here\'s why it matters:\n\n' +
'**Grounding over guessing.** Before, if Cline suggested a library you\'d never heard of, you had to stop, browser-search, paste context back. Now it searches, cites, and implements in one flow. The search calls stay in your transcript — reload tomorrow and you still see *why* it chose that API.\n\n' +
'**For beginners, this is trust infrastructure.** The biggest barrier to adopting AI coding agents isn\'t capability — it\'s \"how do I know it\'s not hallucinating?\" Web search doesn\'t eliminate hallucination, but it lets the agent *show its work*. You see the source. You verify. You move on.\n\n' +
'The quiet fix that saves hours: **Hub identity ordering.** If you run Cline in VS Code *and* Cursor, or on two machines, they used to fight over the background Hub daemon. One would kill the other\'s live sessions. Abnormal socket close. Work gone.\n\n' +
'Now builds compare identities through a total order. At most one retires the other. A busy Hub gets attached, not replaced. The swap happens when idle. Your sessions survive.\n\n' +
'Desktop v0.0.13 ships the same fixes plus a font size slider that applies before paint (no launch flash) and the web search toggle in Settings.\n\n' +
'Turn on web search. Give it a task that needs fresh docs. Watch it search, cite, implement.\n\n' +
'That\'s the moment it clicks: this isn\'t autocomplete. This is a researcher that codes.\n\n' +
'#Cline #AICodingAgent #WebSearch #DeveloperTools #AIEngineering #VSCode #Productivity',
    metadata: { format: 'personal-take', platform: 'linkedin', tool: 'cline', version: '4.1.10' },
  },
];

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