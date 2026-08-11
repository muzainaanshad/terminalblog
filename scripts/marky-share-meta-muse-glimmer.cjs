#!/usr/bin/env node
// Share the Meta Muse Glimmer 30B article via MyMarky (X + LinkedIn).
// Usage: node scripts/marky-share-meta-muse-glimmer.cjs
const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const KEY = 'mk_live_2HrW1PDCF5i4rMu809NIDtvxtu0-rdnZOGURht6RWmE';
const API = `https://api.mymarky.ai/api/businesses/${BIZ_ID}/posts`;
const HEADERS = { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' };
const ARTICLE = 'https://terminalblog.com/blog/meta-muse-glimmer-30b-free-local-coding-agent/';

const POSTS = [
  {
    // X/Twitter: key takeaways + link
    caption:
`Meta just open-sourced a 30B coding agent model — Apache 2.0, runs on your laptop.

Muse Glimmer beats GPT-level models on SWE-Bench Pro (51.2), reads screenshots, and does tool use natively. No API key. No cloud.

Beginner breakdown: ${ARTICLE}
#CodingAgents #OpenSource #MetaAI #LocalAI`,
    link: ARTICLE,
    metadata: { format: 'release-guide', tool: 'meta', version: 'muse-glimmer-30b' },
  },
  {
    // LinkedIn: personal take, no links in body
    caption:
`Meta just released Muse Glimmer — a 30B open-weight model under Apache 2.0 that runs a coding agent on your own hardware. No API subscription, no cloud dependency.

The interesting part is not the benchmark scores (though 51.2 on SWE-Bench Pro at this size is legit). It is that Glimmer was trained around the agent loop from the start — plan, call tools, observe results, retry on failure. It is not a chatbot with tool-calling bolted on. And it can read screenshots, which the other 30B models cannot.

For teams that need to keep code and data on-premise, or for developers tired of paying per-token for coding agents, this is the model to evaluate.

Full beginner-friendly breakdown is up on terminalblog (search "Meta Muse Glimmer").
#CodingAgents #AI #OpenSource #MetaAI #LocalAI`,
    metadata: { format: 'personal-take', platform: 'linkedin', tool: 'meta', version: 'muse-glimmer-30b' },
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
