#!/usr/bin/env node
// Share the Hermes Agent v0.22.4 article via MyMarky (X + LinkedIn).
// Usage: node scripts/marky-share-hermes-v0224.cjs
const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const KEY = 'mk_live_2HrW1PDCF5i4rMu809NIDtvxtu0-rdnZOGURht6RWmE';
const API = `https://api.mymarky.ai/api/businesses/${BIZ_ID}/posts`;
const HEADERS = { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' };
const ARTICLE = 'https://terminalblog.com/blog/hermes-agent-v0-22-4-patch-removes-suggestion-pills/';

const POSTS = [
  {
    // X/Twitter: key takeaways + link
    caption:
`Hermes Agent v0.22.4 just killed the suggestion pills that annoyed everyone 💊💀

Removed: Desktop pills above composer nudging MCP setup "for no clear reason"
Fixed: Empty plugin consent prompts, WhatsApp re-pairing, approval-mode chip follows profile
New: mcp-serve plugin (Hermes as MCP server), Cursor importer, bubblewrap/Singularity

Net result: 14 commits, 82 files, -1,547 lines removed. Patch that deletes friction.

Full breakdown: ${ARTICLE}
#HermesAgent #OpenSource #AIAgents #UX`,
    link: ARTICLE,
    metadata: { format: 'release-guide', tool: 'hermes', version: 'v0.22.4' },
  },
  {
    // LinkedIn: personal take, no links in body
    caption:
`Hermes Agent v0.22.4 is a patch release that does something rare: removes a feature users hated.

The "suggestion pills" that appeared above the desktop composer every session — "Set up MCP servers!" "Try skills!" — are gone. The release notes literally say they "appeared for no clear reason."

Also fixed: plugins with zero dependencies no longer show empty consent prompts, WhatsApp re-pairing after logout works cleanly, the approval-mode chip finally follows your active profile.

New in the plugin catalog: mcp-serve (run Hermes as an MCP server), agent-importers now supports Cursor, bubblewrap (bwrap terminal backend), Singularity/Apptainer.

14 commits, 82 files changed, net -1,547 lines. This is the "threshold" philosophy: grow by shedding what doesn't serve the operator.

Beginner-friendly breakdown on terminalblog.

#HermesAgent #OpenSource #AIAgents #UX #DevTools`,
    metadata: { format: 'personal-take', platform: 'linkedin', tool: 'hermes', version: 'v0.22.4' },
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