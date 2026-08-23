#!/usr/bin/env node
// Share the OpenAI GPT-5.6 pricing crash article via MyMarky (X + LinkedIn).
const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const KEY = 'mk_live_2HrW1PDCF5i4rMu809NIDtvxtu0-rdnZOGURht6RWmE';
const API = `https://api.mymarky.ai/api/businesses/${BIZ_ID}/posts`;
const HEADERS = { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' };
const ARTICLE = 'https://terminalblog.com/blog/openai-gpt-5-6-pricing-crash-changes-agent-economics/';

const POSTS = [
  {
    // X/Twitter: key takeaways + link
    caption:
`OpenAI just made AI coding agents 80% cheaper overnight 🤯

GPT-5.6 Luna: $0.20/$1.20 per 1M tokens (-80%)
GPT-5.6 Terra: $2/$12 per 1M tokens (-20%)
GPT-5.6 Sol Fast: 2.5x speed at 2x price

A 10-person team running 5K agent calls/day now spends ~$18/day on model costs. That's $540/month total — less than one senior dev's daily rate.

The bottleneck isn't pricing anymore. It's context efficiency, prompt quality, and agent loop design.

Full routing guide + cost math: ${ARTICLE}

#GPT56 #OpenAI #AICoding #Codex #Cursor #DevTools`,
    link: ARTICLE,
    metadata: { format: 'release-guide', tool: 'openai', feature: 'gpt-5.6-pricing' },
  },
  {
    // LinkedIn: personal take, no links in body
    caption:
`The economics of running AI coding agents just fundamentally shifted.

OpenAI dropped GPT-5.6 Luna pricing by 80% (to $0.20/$1.20 per 1M tokens) and Terra by 20% (to $2/$12). Sol got a 2.5x faster "Fast mode" at 2x price.

What this means in practice:

A team running agents at scale used to budget $5-15K/month on model costs alone. At Luna pricing, that same workload drops to ~$500-1,500/month. The "agent tax" that made teams hesitate on automation is effectively gone.

The new decision framework isn't "which model is best" — it's "which tier clears my quality bar?"

Default to Luna (84.7% Terminal-Bench). Escalate to Terra (87.4%) when quality dips. Reserve Sol/Sol Fast for fire drills and security reviews. Keep Claude Fable 5 for the 5% of tasks needing long-context or safety-critical code.

This isn't a sale. It's the new baseline.

The teams that win won't be the ones with the biggest AI budgets. They'll be the ones who master context efficiency, prompt engineering, and agent loop design — because those are now the only levers that matter.

Breakdown with routing YAML config on terminalblog.

#OpenAI #GPT56 #AICoding #Codex #Cursor #DevTools #AIEngineering #Productivity`,
    metadata: { format: 'personal-take', platform: 'linkedin', tool: 'openai', feature: 'gpt-5.6-pricing' },
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