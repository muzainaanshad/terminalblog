#!/usr/bin/env node
// Share GitHub Copilot CLI 1.0.97 - Agent hooks, sandbox, auth overhaul via MyMarky (X + LinkedIn)
const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const KEY = 'mk_live_2HrW1PDCF5i4rMu809NIDtvxtu0-rdnZOGURht6RWmE';
const API = 'https://api.mymarky.ai/api/businesses/' + BIZ_ID + '/posts';
const HEADERS = { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' };
const ARTICLE = 'https://terminalblog.com/blog/github-copilot-cli-1-0-97-agent-hooks-sandbox-auth-overhaul/';

const POSTS = [
  {
    // X/Twitter: key takeaways + link
    caption:
'GitHub Copilot CLI 1.0.97 just dropped and it\'s the release that fixes the daily papercuts \\u{1F680}\\n\\n' +
'What 1.0.97 brings:\\n' +
'\\u{1F504} Agent-scoped declarative hooks (custom agents get their own guardrails)\\n' +
'\\u{26A1} Interactive sandbox config with secret masking (no more JSON guesswork)\\n' +
'\\u{1F6E1}\\u{FE0F} Entra broker auth on macOS (finally works with Azure AD)\\n' +
'\\u{1F4CB} Timeline shows WHO approved each permission (You / AI / Policy / Fallback)\\n' +
'\\u{1F501} Case-insensitive model IDs + inline images on by default\\n' +
'\\u{1F4A1} 30+ QoL fixes: memory crash mitigation, plugin fixes, MCP improvements\\n\\n' +
'Full breakdown: ' + ARTICLE + '\\n\\n' +
'#CodingAgents #GitHubCopilot #DeveloperTools #Terminal #OpenSource',
    link: ARTICLE,
    metadata: { format: 'release-update', tool: 'copilot-cli', version: '1.0.97' },
  },
  {
    // LinkedIn: personal take, no links in body
    caption:
'The most important feature in Copilot CLI 1.0.97 isn\'t flashy -- it\'s the removal of friction you\'ve been tolerating for months.\\n\\n' +
'For a terminal agent, friction isn\'t annoyance -- it\'s lost flow state. Every time you edit sandbox JSON and leak a secret, every time Entra auth forces browser fallback on Mac, every time you type `/model GPT-6.1-SOL` and it fails because of case -- that\'s a context switch. A broken rhythm.\\n\\n' +
'1.0.97 doesn\'t add a flagship feature. It removes the death-by-papercuts:\\n\\n' +
'1. **Agent-scoped hooks** -- Your security auditor blocks `rm -rf`. Your test writer auto-runs tests. They don\'t step on each other. Global hooks were a blunt instrument; this is surgical.\\n\\n' +
'2. **Interactive sandbox** -- `copilot sandbox` detects your API keys, prompts to mask them, saves config. No more "oops I committed a token" moments.\\n\\n' +
'3. **Entra broker on Mac** -- If your org uses Azure AD, it just works. Native broker. Graceful fallback. No more "why is this opening Safari again?"\\n\\n' +
'4. **Timeline permission attribution** -- "Unattended Fallback" on a 2 AM deploy? Now you know exactly why that command ran. Debugging permission issues goes from guesswork to one `copilot timeline` command.\\n\\n' +
'5. **Case-insensitive models** -- `/model gpt-6.1-sol` works. `/model GPT-6.1-SOL` works. The canonical ID saves automatically. Muscle memory preserved.\\n\\n' +
'Plus 30+ fixes: emergency memory relief bypasses cooldown (long sessions survive OOM), remote plugin marketplace retries with your token, custom agents discovered beyond 100 files, Windows taskbar icons stay grouped...\\n\\n' +
'This is what a mature CLI release looks like. Not "here\'s a new capability" -- "here\'s your workflow without the parts that made you swear."\\n\\n' +
'#CodingAgents #GitHubCopilot #DeveloperExperience #Terminal #AIEngineering #OpenSource',
    metadata: { format: 'personal-take', platform: 'linkedin', tool: 'copilot-cli', version: '1.0.97' },
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