#!/usr/bin/env node
// Share Kilo Code v7.8.9 - Drag-drop projects, Shift-click links, theme-matched browser via MyMarky (X + LinkedIn)
const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const KEY = 'mk_live_2HrW1PDCF5i4rMu809NIDtvxtu0-rdnZOGURht6RWmE';
const API = 'https://api.mymarky.ai/api/businesses/' + BIZ_ID + '/posts';
const HEADERS = { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' };
const ARTICLE = 'https://terminalblog.com/blog/kilocode-v7-8-9-drag-drop-projects-agent-manager/';

const POSTS = [
  {
    // X/Twitter: key takeaways + link
    caption:
'Kilo Code v7.8.9 (pre-release) just dropped and it\'s pure daily-driver polish 🎯\\n\\n' +
'What v7.8.9 brings:\\n' +
'🎯 Drag-and-drop project reorder in Agent Manager — order persists restarts\\n' +
'🔗 Shift+click = open in system browser (Integrated Browser default, you choose)\\n' +
'🎨 Unified agent/model/reasoning picker — one split control, three choices\\n' +
'🌙 Theme-matched integrated browser — dark IDE = dark Wikipedia, no flashbang\\n' +
'🔄 Smart connection retries — transient resets retry with backoff, no session stall\\n' +
'🛠️ Subagent permission prompt fix — no more "Failed to update permissions" stuck\\n\\n' +
'Full breakdown: ' + ARTICLE + '\\n\\n' +
'#CodingAgents #KiloCode #OpenSource #VSCode #AgentManager #DeveloperTools',
    link: ARTICLE,
    metadata: { format: 'release-update', tool: 'kilocode', version: 'v7.8.9' },
  },
  {
    // LinkedIn: personal take, no links in body
    caption:
'Kilo Code v7.8.9 is the release that makes you realize: the best features are the ones you stop noticing.\n\n' +
'No headline feature. No marketing splash. Just six papercuts removed in one pre-release:\n\n' +
'1. **Drag-and-drop project reorder.** You have 8 projects. 3 are active today. Drag them to the top. They stay there across restarts. Your mental model = the UI. Muscle memory builds on stable positions.\n\n' +
'2. **Shift-click = your browser.** Integrated browser is great for quick docs. But sometimes you need devtools, extensions, logged-in sessions. Shift+click any link → system browser. No settings toggle. No context menu. You decide per link.\n\n' +
'3. **Unified picker.** Agent, model, reasoning level — one split control in the prompt toolbar. Hover to switch, arrow keys to cycle. Narrow sidebar? Less-used actions collapse into "More actions." Voice and Send always visible. Toolbar always one row.\n\n' +
'4. **Theme-matched browser.** Dark IDE at 11 PM? Click a link → dark Wikipedia, dark GitHub, dark Stack Overflow. No white flashbang. Pages respect `prefers-color-scheme` automatically.\n\n' +
'5. **Smart retries.** `Connection reset by server` used to pause your session. Now it retries with backoff through the normal path. Only genuine network disconnections trigger offline wait. You stay in flow.\n\n' +
'6. **Subagent permission fix.** "Failed to update permissions" getting stuck indefinitely? Gone. Multi-agent workflows just work.\n\n' +
'This is v7.8.x — the Agent Manager polish wave. v7.4: stability. v7.5: PR loop. v7.6: autonomy. v7.8: daily driver. Each wave removes a reason to leave the IDE. v7.8.9 removes six more.\n\n' +
'Kilo isn\'t chasing "most features." It\'s chasing "disappears when you use it." The friction you feel RIGHT NOW — that\'s what the next patch fixes.\n\n' +
'#CodingAgents #OpenSource #KiloCode #VSCode #AgentManager #AIEngineering #DeveloperExperience',
    metadata: { format: 'personal-take', platform: 'linkedin', tool: 'kilocode', version: 'v7.8.9' },
  },
];

(async () => {
  const now = Date.now();
  const results = [];
  for (let i = 0; i < POSTS.length; i++) {
    const p = POSTS[i];
    const scheduled = new Date(now + (20 + i * 60) * 60000).toISOString();
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
      console.log('Post ' + (i + 1) + ': HTTP ' + r.status + ' | id=' + results[results.length - 1].id + ' | sched=' + scheduled);
    } catch (e) {
      results.push({ i: i + 1, http: 0, id: 'ERROR', error: String(e) });
      console.log('Post ' + (i + 1) + ': ERROR ' + e);
    }
  }
  console.log('SUMMARY:', JSON.stringify(results, null, 1));
})().catch((e) => { console.error('Fatal:', e); process.exit(1); });