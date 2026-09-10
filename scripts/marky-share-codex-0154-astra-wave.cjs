#!/usr/bin/env node
// Share Codex 0.148-0.154 wave (GPT-6 Astra default, worktrees, Windows daemon) via MyMarky (X + LinkedIn)
const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const KEY = 'mk_live_2HrW1PDCF5i4rMu809NIDtvxtu0-rdnZOGURht6RWmE';
const API = 'https://api.mymarky.ai/api/businesses/' + BIZ_ID + '/posts';
const HEADERS = { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' };
const ARTICLE = 'https://terminalblog.com/blog/codex-0-154-gpt6-astra-worktrees-windows-daemon/';

const POSTS = [
  {
    // X/Twitter: key takeaways + link
    caption:
'OpenAI just changed Codex\u2019s default model and nobody noticed \U0001F4A5\n\n' +
'Seven stable releases in three weeks (0.148\u21920.154). The good stuff:\n\n' +
'\U0001F9E0 GPT-6 Astra is now the bundled default \u2014 2x Fast tier, Bedrock support\n' +
'\U0001F331 Experimental worktrees: agents experiment in isolated checkouts\n' +
'\U0001F5A5\uFE0F Windows gets a real background daemon \u2014 sessions survive window closes\n' +
'\U0001F4CA \u2018codex agents\u2019 dashboard + \u2018codex queue\u2019 for multi-task workflows\n' +
'\U0001F512 Untrusted AGENTS.md no longer loads; sandbox fails closed\n\n' +
'Full wave breakdown: ' + ARTICLE + '\n\n' +
'#CodingAgents #OpenAI #Codex #GPT6 #Astra #DeveloperTools',
    link: ARTICLE,
    metadata: { format: 'release-update', tool: 'codex', version: '0.148-0.154' },
  },
  {
    // LinkedIn: personal take, no links in body
    caption:
'The most important Codex release of the month is the one that did not make headlines.\n\n' +
'Between August 18 and September 9, OpenAI shipped seven stable Codex releases. The banner items: GPT-6 Astra became the bundled default model, and experimental worktree support finally landed. But read the whole changelog and the interesting pattern appears.\n\n' +
'First, the model default matters because it is the single line that decides what runs when you just type \u201ccodex\u201d. Fast tier at 2x speed, Bedrock catalogs included, is a statement about where OpenAI thinks agent workloads run.\n\n' +
'Second, worktrees are the guardrail pattern we keep coming back to across the whole agent ecosystem: isolate the experiment, review the diff, then touch the real branch. Codex joining that club means the \u201cscary refactor\u201d now has a safe default.\n\n' +
'Third \u2014 and this is the part that deserves attention \u2014 the trust work. Untrusted projects no longer supply project-level AGENTS.md instructions. Sandbox restrictions fail closed on denied paths. Guardian approval history survives conversation compaction. For anyone running agents unattended, those three lines matter more than any feature.\n\n' +
'The quiet release train is how infrastructure matures. OpenAI is treating Codex like something to build on, not something to announce.\n\n' +
'#CodingAgents #OpenAI #Codex #GPT6 #AIEngineering #DeveloperTools',
    metadata: { format: 'personal-take', platform: 'linkedin', tool: 'codex', version: '0.148-0.154' },
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