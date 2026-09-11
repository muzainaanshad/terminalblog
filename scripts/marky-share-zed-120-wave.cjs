#!/usr/bin/env node
// Share Zed v1.16->v1.20 release train update via MyMarky (X + LinkedIn)
const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const KEY = 'mk_live_2HrW1PDCF5i4rMu809NIDtvxtu0-rdnZOGURht6RWmE';
const API = 'https://api.mymarky.ai/api/businesses/' + BIZ_ID + '/posts';
const HEADERS = { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' };
const ARTICLE = 'https://terminalblog.com/blog/zed-v1-16-pre-gemini-flash-git-panel-mermaid/';

const POSTS = [
  {
    // X/Twitter: key takeaways + link
    caption:
'Zed shipped stable v1.19.2 and the AI editor war just got a lot more interesting \u{1F525}\n\n' +
'Since August:\n' +
'\u{1F916} Gemini 3.8 Flash + Grok 4.5/4.6 join the lineup\n' +
'\u{1F9E0} Effort-based reasoning lands on OpenRouter models\n' +
'\u{1F4C1} Git Panel multi-select + call hierarchy + permalinks\n' +
'\u{1F4BB} Windows AltGr/diacritic input fix\n' +
'\u{2699}\uFE0F 25% smaller binaries\n\n' +
'The wave that made Zed a real AI-editor contender: ' + ARTICLE + '\n\n' +
'#Zed #AICoding #CodingAgents #GPT6 #Gemini #DeveloperTools',
    link: ARTICLE,
    metadata: { format: 'release-update', tool: 'zed', version: 'v1.16-v1.20' },
  },
  {
    // LinkedIn: personal take, no links in body
    caption:
'The editors people actually bet on for AI-assisted development are the ones adding models faster than most people can keep score. Zed just did it again with a stable v1.19.2. \n\n' +
'Since its v1.16 wave in mid-August, Zed has added Gemini 3.8 Flash, Grok 4.5 and 4.6, and GPT-5.6 with a 1M-token context on Amazon Bedrock. More importantly for day-to-day work, effort-based reasoning now works on OpenRouter models, giving the same cost-control knob that terminal agents like Claude Code have been adding. \n\n' +
'The Git Panel also grew from usable to a genuine power tool: multi-select for staging multiple files, call hierarchy with sensible default keybindings, and one-click file permalinks. Those are the small things that compound into real workflow speed. \n\n' +
'For Windows users, the AltGr/diacritic input fix in the integrated terminal is the kind of patch that quietly removes a daily annoyance. And release binaries are now about 25% smaller. \n\n' +
'Zed is not chasing Cursor feature-for-feature. It is building the substrate where any agent runs natively, and shipping the model parity and Git ergonomics to make that substrate worth living in. \n\n' +
'#Zed #AICoding #AIEngineering #DeveloperTools #CodingAgents',
    metadata: { format: 'personal-take', platform: 'linkedin', tool: 'zed', version: 'v1.16-v1.20' },
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