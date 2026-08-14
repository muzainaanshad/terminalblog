#!/usr/bin/env node
// Share the Kilo Code v7.4.22 update via MyMarky (X + LinkedIn)
const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const KEY = 'mk_live_2HrW1PDCF5i4rMu809NIDtvxtu0-rdnZOGURht6RWmE';
const API = `https://api.mymarky.ai/api/businesses/${BIZ_ID}/posts`;
const HEADERS = { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' };
const ARTICLE = 'https://terminalblog.com/blog/kilo-code-v7-4-21-agent-manager-model-search-worktree-upgrade/';

const POSTS = [
  {
    // X/Twitter: key takeaways + link
    caption:
`Kilo Code v7.4.22 just dropped 3 hours ago \u2014 and it's the kind of update that changes daily workflow.

\u2728 Clickable file refs in agent responses (finally!)
\u2728 PR review actions in Agent Manager sidebar
\u2728 Model reasoning variants surfaced in chat
\u2728 AWS/GCP creds for Bedrock/Vertex AI
\u2728 Subagent permission fixes
\u2728 Git changes persist across tab switches
\u2728 13 upstream OpenCode releases synced (v1.17.13 \u2192 v1.18.13)

GPT-5.6, xAI caching, Meta Muse Spark, MCP fixes \u2014 all in one patch.

Open-source Cursor alternative just got sharper. \uD83D\uDD25

Full breakdown: ${ARTICLE}

#KiloCode #OpenCode #AICodingAgent #VSCode #OpenSource`,
    link: ARTICLE,
    metadata: { format: 'release-update', tool: 'kilo', version: '7.4.22' },
  },
  {
    // LinkedIn: personal take, no links in body
    caption:
`I've been tracking Kilo Code since it was a Roo Code fork. The v7.4.22 release (dropped 3 hours ago) is the first time I've seen an open-source agent update that feels like *product craft* rather than just feature stacking.

The headline: **clickable file references in agent responses.**

When the agent mentions \`src/utils/helpers.ts:42\`, it's now a live link. Click it \u2192 opens at that line. Dead paths warn you. This turns agent output from "read and remember" into "navigate and verify." It's the kind of UX detail that separates demos from daily drivers.

But the quiet win is the upstream sync: **13 OpenCode releases in one shot** (v1.17.13 through v1.18.13). That brings:
\u2022 GPT-5.6 via Azure AI
\u2022 xAI prompt cache routing
\u2022 Meta Muse Spark 1.1 system prompts
\u2022 MCP reliability fixes (paginated catalogs, schema validation)
\u2022 GitHub Copilot model routing fixes
\u2022 TUI spinner/CLI env improvements

Plus: PR comment actions in the sidebar (resolve threads, jump to comments), reasoning variant picker in chat, AWS/GCP structured credentials for Bedrock/Vertex, and subagent permission fixes that stop read-only agents from ceilinging writable delegates.

v7.4.21 made Kilo feel finished. v7.4.22 makes it feel sharp.

If you've been waiting for an open-source Cursor alternative that doesn't lock you to one model provider \u2014 this is the version to install.

Full article with verification steps on terminalblog.

#KiloCode #OpenCode #AICodingAgent #VSCode #OpenSource #DeveloperTools`,
    metadata: { format: 'personal-take', platform: 'linkedin', tool: 'kilo', version: '7.4.22' },
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