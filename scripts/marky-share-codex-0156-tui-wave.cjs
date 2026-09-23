#!/usr/bin/env node
// Share Codex 0.156 wave (TUI, voice, worktrees, GPT-6 Sol/Luna) via MyMarky (X + LinkedIn)
const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const KEY = 'mk_live_2HrW1PDCF5i4rMu809NIDtvxtu0-rdnZOGURht6RWmE';
const API = 'https://api.mymarky.ai/api/businesses/' + BIZ_ID + '/posts';
const HEADERS = { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' };
const ARTICLE = 'https://terminalblog.com/blog/codex-0-156-tui-voice-worktrees-gpt6/';

const POSTS = [
  {
    // X/Twitter: key takeaways + link
    caption:
'Codex 0.156 just dropped a fullscreen TUI, voice by default, and GPT-6 Sol — all in one week 🎯\n\n' +
'Two releases (0.156.0 Sept 22, 0.156.1 Sept 23). The highlights:\n\n' +
'🖥️ Fullscreen TUI with transcript search, mouse selection, right-click copy\n' +
'🎤 Voice conversations ON by default — F8 toggle, bundled audio runtimes\n' +
'📊 /usage analytics dashboard — token totals, top chats, plugin activity\n' +
'🌳 Worktrees enabled by default — isolated checkouts for scary refactors\n' +
'🎨 6 new themes + Mermaid diagrams + display math rendering\n' +
'⚙️ /daemon menu + --no-daemon flag for background server control\n' +
'🤖 GPT-6 Sol & Luna added in 0.156.1 hotfix\n\n' +
'Full breakdown: ' + ARTICLE + '\n\n' +
'#CodingAgents #OpenAI #Codex #GPT6 #TUI #Voice #DeveloperTools',
    link: ARTICLE,
    metadata: { format: 'release-update', tool: 'codex', version: '0.156' },
  },
  {
    // LinkedIn: personal take, no links in body
    caption:
'The terminal agent that finally feels like a terminal app.\n\n' +
'OpenAI shipped Codex 0.156.0 and 0.156.1 this week. No launch event, no hype tweet. Just a changelog that keeps getting better.\n\n' +
'What stands out is not any single feature — it\'s that the UX gaps are closing one by one:\n\n' +
'The transcript is now searchable and selectable with a mouse. You can right-click copy output. Voice works out of the box with bundled runtimes — no pip install, no config. The analytics dashboard tells you what a session cost without leaving the terminal. Worktrees mean your "what if I break everything" experiments happen in an isolated checkout.\n\n' +
'These are not headline features. They are the thousand paper cuts that made terminal agents feel like toys instead of tools. OpenAI is quietly sanding them down.\n\n' +
'And the trust work continues: streamed answers survive turn failures. Clipboard forwarding works in tmux and SSH. Plan mode restores on resume. Login recovers through proxies. Sandbox gaps closed on Windows, Linux, macOS.\n\n' +
'The quiet release train is how infrastructure matures. Codex is becoming something you build on, not something you announce.\n\n' +
'#CodingAgents #OpenAI #Codex #GPT6 #AIEngineering #DeveloperTools #TerminalUX',
    metadata: { format: 'personal-take', platform: 'linkedin', tool: 'codex', version: '0.156' },
  },
];

(async () => {
  const now = Date.now();
  const results = [];
  for (let i = 0; i < POSTS.length; i++) {
    const p = POSTS[i];
    const scheduled = new Date(now + (30 + i * 60) * 60000).toISOString();
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