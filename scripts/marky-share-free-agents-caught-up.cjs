#!/usr/bin/env node
// Share "Free AI Coding Agents Just Caught Up to Paid Tools" via MyMarky (X + LinkedIn)
const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const KEY = 'mk_live_2HrW1PDCF5i4rMu809NIDtvxtu0-rdnZOGURht6RWmE';
const API = `https://api.mymarky.ai/api/businesses/${BIZ_ID}/posts`;
const HEADERS = { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' };
const ARTICLE = 'https://terminalblog.com/blog/free-ai-coding-agents-caught-up-paid-november-2026/';

const POSTS = [
  {
    // X/Twitter: key takeaways + link in reply
    caption:
`Free AI coding agents just caught up to paid tools in November 2026 🚀

OpenCode: persistent terminals, worktree shortcuts, % compaction
Hermes: 1,050+ plugins, Group Chats, Plugin OAuth, MCP spend limits
Qwen Code: local dir grants (no stored creds), Feishu webhooks, guardrails
OpenClaw: vision + browser + cron, 90 contributors/release

All $0. Full breakdown: ${ARTICLE}

#AICoding #FreeTools #OpenSource #DevTools`,
    link: ARTICLE,
    metadata: { format: 'release-guide', tool: 'comparison', feature: 'free-agents-nov2026' },
  },
  {
    // LinkedIn: personal take, no links in body
    caption:
`The "you get what you pay for" argument for coding agents just got a lot harder to make.

In one month (November 2026), four free tools shipped features that used to require $20-200/mo subscriptions:

**OpenCode v2.2.6** — persistent terminals that survive restarts with scrollback, worktree shortcuts (Ctrl+Alt+O/B/X), percentage compaction that works for every model from 32K to 1M context. Best terminal UX in the market, paid or free.

**Hermes v0.23.1** — 1,050+ plugins (270 added in ONE night), Group Chats with multiple agents, Plugin OAuth (plugins sign you in, never see tokens), MCP tool costs with spend limits (hard guardrails even in YOLO), skill locking (immutable deploy skills), multi-profile gateway, remote config for fleets.

**Qwen Code v0.27.4** — managed agents with temporary local directory grants (no stored credentials), Feishu/WeCom webhooks for untruncated replies, Auto Mode guardrails that ask before destructive actions, multi-workspace Goals, persistent /memory CLI, HTTP fallback for restricted networks.

**OpenClaw v2026.11.4** — 220 commits, 125 PRs, 90 contributors in one release. Vision, browser automation, cron, private subagent results, reliable child-task handoffs, Telegram widgets (beta), paged history for 1000+ message threads.

The honest take: free tools still cost you setup time, model API bills, and security responsibility. But the feature gap just closed.

Full comparison with decision matrix on terminalblog.

#AICodingAgents #OpenSource #FreeTools #DeveloperTools #Productivity #SoftwareEngineering`,
    metadata: { format: 'personal-take', platform: 'linkedin', tool: 'comparison', feature: 'free-agents-nov2026' },
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
      console.log(`Post ${i + 1}: HTTP ${r.status} | id=${results[i].id} | sched=${scheduled}`);
    } catch (e) {
      results.push({ i: i + 1, http: 0, id: 'ERROR', error: String(e) });
      console.log(`Post ${i + 1}: ERROR ${e}`);
    }
  }
  console.log('SUMMARY:', JSON.stringify(results, null, 1));
})().catch((e) => { console.error('Fatal:', e); process.exit(1); });