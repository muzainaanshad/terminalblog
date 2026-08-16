#!/usr/bin/env node
// Share the Cursor Cloud Agents Builds article via MyMarky (X + LinkedIn).
// Usage: node scripts/marky-share-cursor-builds.cjs
const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const KEY = 'mk_live_2HrW1PDCF5i4rMu809NIDtvxtu0-rdnZOGURht6RWmE';
const API = `https://api.mymarky.ai/api/businesses/${BIZ_ID}/posts`;
const HEADERS = { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' };
const ARTICLE = 'https://terminalblog.com/blog/cursor-cloud-agents-3x-faster-builds/';

const POSTS = [
  {
    // X/Twitter: key takeaways + link
    caption:
`Cursor just killed the #1 reason devs avoid cloud agents: the 3–5 minute cold start 🚀

New "Builds" feature pre-warms your environment in the background. Agents now boot in ~30 seconds instead of minutes — every single time.

Key wins:
✅ 10x faster environment boot
✅ 3x faster time-to-first-token  
✅ Broken build? Agents keep running on last good snapshot
✅ Build logs, commit SHAs, dashboard visibility

No config needed for new envs. One-click enable for existing.

Full breakdown: ${ARTICLE}
#Cursor #CloudAgents #AICoding #DevTools`,
    link: ARTICLE,
    metadata: { format: 'release-guide', tool: 'cursor', feature: 'builds' },
  },
  {
    // LinkedIn: personal take, no links in body
    caption:
`Cloud agents have always had a dirty secret: the cold start.

You click "run agent" and then... wait. Clone repo. Install deps. Run setup. Three to five minutes later, you can finally type a prompt. Every. Single. Session.

Cursor's August 13 release just made that wait obsolete.

"Builds" are pre-warmed environment snapshots. Cursor runs your install command on a schedule, keeps warm copies ready, and agents boot into a ready workspace in ~30 seconds. If a bad commit breaks the build? Agents keep running on the last known-good snapshot while you debug.

This isn't just a speed boost — it's a reliability floor. Background automation (overnight CI babysitting, dependency updates, security scans) no longer dies because someone pushed a broken commit.

The compound effect: you stop asking "is it worth spinning up a cloud agent for this?" You just do it. For a 5-minute fix, a 30-minute refactor, an overnight cleanup — the friction is gone.

Beginner-friendly breakdown is up on terminalblog.

#Cursor #CloudAgents #AI #CodingAgents #DevTools #Productivity`,
    metadata: { format: 'personal-take', platform: 'linkedin', tool: 'cursor', feature: 'builds' },
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