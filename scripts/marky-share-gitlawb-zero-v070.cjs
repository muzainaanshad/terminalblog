#!/usr/bin/env node
// Share the Gitlawb Zero v0.7.0 article via MyMarky (X + LinkedIn).
// Usage: node scripts/marky-share-gitlawb-zero-v070.cjs
const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const KEY = 'mk_live_2HrW1PDCF5i4rMu809NIDtvxtu0-rdnZOGURht6RWmE';
const API = `https://api.mymarky.ai/api/businesses/${BIZ_ID}/posts`;
const HEADERS = { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' };
const ARTICLE = 'https://terminalblog.com/blog/gitlawb-zero-v0-7-0-vision-readonly-plan-mode/';

const POSTS = [
  {
    // X/Twitter: key takeaways + link
    caption:
`Your coding agent could take screenshots — and never look at them. 🤦

Gitlawb Zero v0.7.0 fixes that: tool results now carry images + a view_image tool. Also: a read-only plan mode, and sandboxing that blocks agents from reading their own credential stores.

Beginner breakdown: ${ARTICLE}
#CodingAgents #DevTools`,
    link: ARTICLE,
    metadata: { format: 'release-guide', tool: 'gitlawb-zero', version: 'v0.7.0' },
  },
  {
    // LinkedIn: personal take, no links in body
    caption:
`Your coding agent has been pretending it can see.

Until this week, terminal agents could screenshot your app, save the file, and report "artifact captured" — without ever being able to inspect the image. The capture existed. The agent just had no eyes.

Gitlawb Zero v0.7.0 closes that gap: tool results get an image channel and a view_image tool, so an agent can genuinely review the screenshots it takes. The same release adds a read-only planning mode (explore the codebase before touching anything) and sandbox hardening that stops the agent from reading its own credential stores.

The pattern is what I find interesting: vision plus read-only planning are exactly the two features that make agents safer to hand real work. Seeing the UI, planning first, and being unable to exfiltrate keys — that is trust being engineered rather than marketed.

Full beginner-friendly breakdown is up on terminalblog (search "Gitlawb Zero v0.7.0").

#CodingAgents #AI #DevTools #Security #GitlawbZero`,
    metadata: { format: 'personal-take', platform: 'linkedin', tool: 'gitlawb-zero', version: 'v0.7.0' },
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