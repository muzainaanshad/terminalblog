#!/usr/bin/env node
// Share OpenCode v1.18.18->v1.18.30 wave update via MyMarky (X + LinkedIn)
const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const KEY = 'mk_live_2HrW1PDCF5i4rMu809NIDtvxtu0-rdnZOGURht6RWmE';
const API = 'https://api.mymarky.ai/api/businesses/' + BIZ_ID + '/posts';
const HEADERS = { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' };
const ARTICLE = 'https://terminalblog.com/blog/opencode-v1-18-18-reliability-mcp-desktop-overhaul/';

const POSTS = [
  {
    // X/Twitter: key takeaways + link
    caption:
'Opencode just shipped 12 releases in 3 weeks and the best fix is one nobody screenshots \u{1F4A5}\n\n' +
'v1.18.18\u2192v1.18.30:\n' +
'\u{1F9E0} GPT-6 Astra finally shows up for ChatGPT subscribers (integer version bug)\n' +
'\u{23F1}\uFE0F Slow model startups now fail at 5 min instead of spinning forever\n' +
'\U0001F501 Network-error responses get retried instead of killing your session\n' +
'\u{2601}\uFE0F Cloudflare AI Gateway now works for non-Workers models + Anthropic slugs\n' +
'\U0001F504 Subagent failures are resumable via task_id\n\n' +
'Full wave breakdown: ' + ARTICLE + '\n\n' +
'#CodingAgents #OpenCode #OpenSource #GPT6 #Astra #DeveloperTools',
    link: ARTICLE,
    metadata: { format: 'release-update', tool: 'opencode', version: 'v1.18.18-v1.18.30' },
  },
  {
    // LinkedIn: personal take, no links in body
    caption:
'The release that matters most for open-source coding agents this month is the one buried in an unglamorous changelog. \n\n' +
'Opencode shipped 12 versions between August 20 and September 9. The headline: GPT-6 Astra finally appears for ChatGPT subscribers. But the pattern underneath is the real story. \n\n' +
'First, the boring reliability work. Provider header timeouts now default to five minutes, so a slow model startup returns a real error instead of an infinite spinner. Network-error responses get retried instead of silently ending your turn. For anyone who has lost a session to a flaky provider, those two lines are worth more than any feature. \n\n' +
'Second, the gateway story. Cloudflare AI Gateway is now a first-class route, with native OpenAI/Anthropic passthroughs and correct model-ID slugs. Teams running models behind gateways stop fighting their own plumbing. \n\n' +
'Third, the multi-agent angle. Failed subagent tool calls now surface a resumable task_id instead of an empty result. When you run agents that delegate to other agents, silent subagent failures were the scariest failure mode; this closes it. \n\n' +
'The open-source agent ecosystem keeps catching up on the unglamorous stuff, and that is exactly how you know it is getting serious. \n\n' +
'#CodingAgents #OpenSource #OpenCode #AIEngineering #DeveloperTools',
    metadata: { format: 'personal-take', platform: 'linkedin', tool: 'opencode', version: 'v1.18.18-v1.18.30' },
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