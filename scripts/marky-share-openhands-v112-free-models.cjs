#!/usr/bin/env node
// Share the OpenHands v1.12.0 free models article via MyMarky (X + LinkedIn).
// Usage: node scripts/marky-share-openhands-v112-free-models.cjs
const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const KEY = 'mk_live_2HrW1PDCF5i4rMu809NIDtvxtu0-rdnZOGURht6RWmE';
const API = `https://api.mymarky.ai/api/businesses/${BIZ_ID}/posts`;
const HEADERS = { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' };
const ARTICLE = 'https://terminalblog.com/blog/openhands-v1-12-free-models-clarified-beginner-guide/';

const POSTS = [
  {
    // X/Twitter: key takeaways + link
    caption:
`OpenHands v1.12.0 just made its best models FREE and finally told you which ones 🎁

Three models, zero API keys, orange "Free" badges in the UI:
• openhands/glm-5.2 — general coding & reasoning
• openhands/deepseek-v4-flash — fast iteration & tests
• openhands/minimax-m2.7 — 1M+ context for big refactors

Pick one, the badge sticks. No credit card. Ever.

Full beginner guide: ${ARTICLE}
#OpenHands #AICodingAgents #FreeModels #DevTools`,
    link: ARTICLE,
    metadata: { format: 'release-guide', tool: 'openhands', version: 'v1.12.0' },
  },
  {
    // LinkedIn: personal take, no links in body
    caption:
`OpenHands v1.12.0 is the release that finally removes the "but first, add your API key" barrier for beginners.

Three production-grade models are now free forever on OpenHands Cloud. The model picker shows orange "Free" badges. Select one, and the badge stays pinned next to the model name in your settings. No trial, no quota surprises, no credit card.

Why this matters: most beginners quit AI coding agents when the first invoice arrives. With free models locked in, you spend your first weeks learning how to prompt, how to steer, how to review diffs — not debugging rate limits.

And when you outgrow the free tier? You add your own keys in the same UI. Same agent, same history, same workflow. No tool switch.

OpenHands is the only major agent where you can start today, free, with strong models, and graduate to BYOK/self-hosted without changing tools.

Beginner-friendly breakdown is up on terminalblog.

#OpenHands #AI #CodingAgents #DevTools #FreeTier`,
    metadata: { format: 'personal-take', platform: 'linkedin', tool: 'openhands', version: 'v1.12.0' },
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