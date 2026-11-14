#!/usr/bin/env node
// Share Claude Code v2.1.323 Code Mode release via MyMarky (X + LinkedIn)
const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const KEY = 'mk_live_2HrW1PDCF5i4rMu809NIDtvxtu0-rdnZOGURht6RWmE';
const API = 'https://api.mymarky.ai/api/businesses/' + BIZ_ID + '/posts';
const HEADERS = { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' };
const ARTICLE = 'https://terminalblog.com/blog/claude-code-just-got-code-mode-and-you-wont-believe-what-else/';

const POSTS = [
  {
    // X/Twitter: key takeaways + link
    caption:
'Claude Code v2.1.323 just dropped — Code Mode + 200+ fixes you\'ll actually feel 🔥\n\n' +
'The headline: CODE MODE (experimental). Claude writes JavaScript to call its OWN tools instead of standard tool calling. Model becomes the orchestrator.\n\n' +
'✅ Plugin type-checking: `claude plugin validate --strict` catches runtime errors before users hit them\n' +
'✅ Plugin version pinning: `engines["claude-code"]` in plugin.json — no more "works on my machine"\n' +
'✅ Auto mode starts in Manual — no more accidentally permissive starts\n' +
'✅ Settings hand-edited during session STAY edited — no more zombie config overwrite\n' +
'✅ Resumed sessions don\'t join new message to old interrupted one — ghost message bug FIXED\n' +
'✅ MCP token rotation stays signed in — concurrent refreshes don\'t log you out\n' +
'✅ Background sessions stop cleanly on sign-in changes — no session hijacking\n' +
'✅ Windows: .cmd/.bat wrappers ignored, runs .exe directly\n' +
'✅ 1M context window default (opt out: CLAUDE_CODE_DISABLE_1M_CONTEXT=1)\n\n' +
'Full breakdown: ' + ARTICLE + '\n\n' +
'#CodingAgents #ClaudeCode #CodeMode #DevTools #AI #Stability #Plugins',
    link: ARTICLE,
    metadata: { format: 'release-update', tool: 'claude-code', version: 'v2.1.323' },
  },
  {
    // LinkedIn: personal take, no links in body
    caption:
'Claude Code v2.1.323 landed today. Two things stand out.\n\n' +
'First: Code Mode. Experimental, opt-in, but the signal is loud — the model writes JavaScript to orchestrate its own tools. Not JSON tool calls. Code. Loops, conditionals, retries, custom compositions — all written by the model at inference time. This is where agent runtimes are heading: the model IS the orchestrator.\n\n' +
'Second: 200+ fixes that compound every session. The permission system finally behaves. Auto mode starts in Manual. Your hand-edited settings.json survives a running session. Resumed sessions don\'t hallucinate ghost messages. MCP servers rotating tokens stay signed in. Background sessions don\'t get hijacked when profiles switch.\n\n' +
'Plugin development just went pro: type-checked hooks, version pinning, $ noun visibility. You can ship with confidence.\n\n' +
'This is not a feature release. It\'s the consolidation release where Anthropic stopped adding and started finishing.\n\n' +
'If you run agents where reliability matters, update today.\n\n' +
'#AI #CodingAgents #ClaudeCode #DeveloperTools #SoftwareEngineering #Stability #Production #DevOps #Trust #CodeMode',
    metadata: { format: 'personal-take', platform: 'linkedin', tool: 'claude-code', version: 'v2.1.323' },
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