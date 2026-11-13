#!/usr/bin/env node
// Share the Gitlawb Zero v0.13.0 article via MyMarky (X + LinkedIn).
// Usage: node scripts/marky-share-gitlawb-zero-v0130.cjs
const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const KEY = 'mk_live_2HrW1PDCF5i4rMu809NIDtvxtu0-rdnZOGURht6RWmE';
const API = `https://api.mymarky.ai/api/businesses/${BIZ_ID}/posts`;
const HEADERS = { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' };
const ARTICLE = 'https://terminalblog.com/blog/gitlawb-zero-v0-13-0-ai-ml-api-opt-in/';

const POSTS = [
  {
    // X/Twitter: key takeaways + link
    caption:
`Your coding agent just got 200+ models through ONE key. 🔑

Gitlawb Zero v0.13.0 adds AI/ML API as an opt-in provider — GPT-4o, Claude 3.5, Llama 405B, DeepSeek R1, Mistral Large, Qwen 2.5, and 190+ more. One API key. One endpoint. Zero config per model.

Beginner breakdown: ${ARTICLE}
#CodingAgents #DevTools #AI`,
    link: ARTICLE,
    metadata: { format: 'release-guide', tool: 'gitlawb-zero', version: 'v0.13.0' },
  },
  {
    // LinkedIn: personal take, no links in body
    caption:
`The model fragmentation problem just got a practical solution.

For months I've watched developers juggle OpenAI keys, Anthropic keys, Together keys, Fireworks keys, Groq keys — each with separate billing, rate limits, and config. It's the "password manager" problem but for model access.

Gitlawb Zero v0.13.0 integrates AI/ML API as a built-in provider. One key. 200+ models. GPT-4o, Claude 3.5 Sonnet, Llama 3.1 405B, DeepSeek R1, Mistral Large 2, Qwen 2.5, Nemotron 3 Ultra — all through a single endpoint. Opt-in, zero breaking changes.

The same release adds custom keyboard shortcuts (finally, muscle memory that matches your editor), subdirectory Git branch detection for monorepos, context preservation when you interrupt and redirect the agent, and four security fixes including stale-lock DoS prevention and Windows taskkill hijack protection.

What I appreciate: this isn't a feature parade. It's friction removal. Model freedom without config debt. Security hardening without ceremony. A terminal agent that treats "you own it" as a design constraint, not a tagline.

Full beginner-friendly breakdown is up on terminalblog (search "Gitlawb Zero v0.13.0").

#CodingAgents #AI #DevTools #Security #GitlawbZero`,
    metadata: { format: 'personal-take', platform: 'linkedin', tool: 'gitlawb-zero', version: 'v0.13.0' },
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