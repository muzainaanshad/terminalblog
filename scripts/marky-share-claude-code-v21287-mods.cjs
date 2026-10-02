#!/usr/bin/env node
// Share Claude Code v2.1.287 Mods via MyMarky (X + LinkedIn)
const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const KEY = 'mk_live_2HrW1PDCF5i4rMu809NIDtvxtu0-rdnZOGURht6RWmE';
const API = 'https://api.mymarky.ai/api/businesses/' + BIZ_ID + '/posts';
const HEADERS = { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' };
const ARTICLE = 'https://terminalblog.com/blog/claude-code-v2-1-287-mods-plugin-system-watchdog/';

const POSTS = [
  {
    // X/Twitter: key takeaways + link
    caption:
'Claude Code v2.1.287 just dropped \u2014 Plugins can now MODIFY AGENT BEHAVIOR \uD83E\uDD2F\n\n' +
'New "Claude Mods" architecture lets extensions hook into the decision loop:\n' +
'\u2022 Intercept/modify tool calls before execution\n' +
'\u2022 Inject context the agent wouldn\u2019t see\n' +
'\u2022 Run parallel "watchdog" agents reviewing work in real-time\n\n' +
'Built-in "You Should Know" mod = a side agent that flags things YOU miss:\n' +
'\u2022 Security issues (secrets, unsafe patterns)\n' +
'\u2022 Architecture drift (you said "don\u2019t touch auth")\n' +
'\u2022 Missed context from 3 turns ago\n' +
'\u2022 Token waste on rabbit holes\n\n' +
'Plus: `n:<text>` filter finds sessions by name/task, `prompt_text:` searches your actual prompts.\n\n' +
'Full: ' + ARTICLE + '\n\n' +
'#CodingAgents #ClaudeCode #Mods #PluginSystem #DevTools #AI',
    link: ARTICLE,
    metadata: { format: 'release-update', tool: 'claude-code', version: 'v2.1.287' },
  },
  {
    // LinkedIn: personal take, no links in body
    caption:
'Claude Code v2.1.287 shipped something that changes the category: **Claude Mods** \u2014 a plugin system that doesn\u2019t just add commands, it changes how the agent thinks.\n\n' +
'Mods hook into the decision loop. They can intercept tool calls, inject missing context, run parallel watchdog agents. This is "platform" not "tool."\n\n' +
'The built-in proof: "You Should Know" \u2014 a silent side agent that watches your session and flags:\n' +
'\u2022 Hardcoded secrets you missed\n' +
'\u2022 When the agent drifts from your stated constraints\n' +
'\u2022 Context you gave three turns ago that the agent forgot\n' +
'\u2022 Rabbit holes about to burn 50k tokens\n\n' +
'It surfaces these as gentle notifications. You decide. No interruption unless you want it.\n\n' +
'For beginners: this is like having a senior dev watching over your shoulder \u2014 always there, never tired, trained on millions of sessions.\n\n' +
'Also new: `n:<text>` filter finds sessions by name OR task description. `prompt_text:` searches inside your actual prompts. Finally.\n\n' +
'This is the release where Claude Code extensibility becomes real.\n\n' +
'#AI #CodingAgents #ClaudeCode #Mods #PluginArchitecture #DeveloperTools #Productivity #SoftwareEngineering',
    metadata: { format: 'personal-take', platform: 'linkedin', tool: 'claude-code', version: 'v2.1.287' },
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