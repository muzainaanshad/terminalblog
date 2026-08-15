#!/usr/bin/env node
// Share the Goose v1.46 release via MyMarky (X + LinkedIn)
const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const KEY = 'mk_live_2HrW1PDCF5i4rMu809NIDtvxtu0-rdnZOGURht6RWmE';
const API = 'https://api.mymarky.ai/api/businesses/' + BIZ_ID + '/posts';
const HEADERS = { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' };
const ARTICLE = 'https://terminalblog.com/blog/goose-v1-46-unrolled-agent-loop-hooks-cost-tracking/';

const POSTS = [
  {
    // X/Twitter: key takeaways + link
    caption:
'Goose v1.46 just dropped the biggest feature wave since v1.40. ������\n\n' +
'���� Unrolled agent loop — flat iterative turns, lower latency, less memory\n' +
'���� Hooks with PreToolUse denial — block `rm -rf /` before it runs\n' +
'���� Streaming shell output — watch `npm test` scroll live\n' +
'���� Per-message cost tracking — every token has a price tag\n' +
'���� Slash commands: /goal (self-eval), /status, /model (mid-session switch)\n' +
'���� TUI diff viewer — approve edits hunk-by-hunk\n' +
'���� 20+ NEW providers: Celeris, Friendli, Azure AI Foundry, OllamaCloud, Sakana, iFlytek, Fireworks, Together, Perplexity, Qwen/DashScope, Databricks, xAI SuperGrok...\n\n' +
'The model-agnostic moat just widened. Full breakdown: ' + ARTICLE + '\n\n' +
'#Goose #AICodingAgent #Rust #OpenSource #DeveloperTools #Hooks #CostTracking',
    link: ARTICLE,
    metadata: { format: 'release-update', tool: 'goose', version: '1.46' },
  },
  {
    // LinkedIn: personal take, no links in body
    caption:
'I\'ve been tracking Goose since it hit 50k stars. v1.46 (released Aug 12) is the release that moves it from "fast Rust agent" to "production-grade agent platform."\n\n' +
'The headline feature is the **unrolled agent loop** — they rewrote the recursive state machine into a flat iterative loop. Lower latency per turn, less memory on long sessions, easier to extend. You feel it as snappier multi-tool chains.\n\n' +
'But the features that change daily work are quieter:\n\n' +
'**Hooks with PreToolUse denial.** You can now register a script that runs BEFORE any tool executes. Block `rm -rf /`, require approval for writes outside the project, log every shell command to audit. This is governance you can script, not a hardcoded deny list.\n\n' +
'**Per-message cost tracking.** Every message shows input/output/cache tokens, USD cost, TTFT, tok/sec. Session totals in the sidebar. No more monthly bill surprises — you see the $2 refactor as it happens.\n\n' +
'**Slash commands that matter:** `/goal` makes the agent self-evaluate before finishing (catches "I think I\'m done" hallucinations). `/status` shows model, cost, context, git status in one glance. `/model` switches mid-session — Opus for planning, Haiku for boilerplate, local for secrets — no restart, no context loss.\n\n' +
'**TUI diff viewer.** Side-by-side syntax-highlighted diffs. Approve per hunk. No more YOLO-approving unreadable patches.\n\n' +
'**20 new providers in one drop.** Celeris, Friendli, Azure AI Foundry, OllamaCloud (dynamic model discovery!), Sakana AI, iFlytek, Fireworks, Together, Perplexity, Qwen/DashScope, Databricks, Scaleway, NEAR AI, xAI SuperGrok... If a model exists, Goose probably has a provider.\n\n' +
'Claude Code ties you to Anthropic. Codex ties you to OpenAI. Goose lets you choose — and now with hooks, cost visibility, and slash commands, it\'s a serious contender for teams that need governance.\n\n' +
'Full article with verification steps on terminalblog.\n\n' +
'#Goose #AICodingAgent #Rust #OpenSource #DeveloperTools #AIEngineering #Hooks #CostTracking',
    metadata: { format: 'personal-take', platform: 'linkedin', tool: 'goose', version: '1.46' },
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