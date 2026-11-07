#!/usr/bin/env node
// Share the GitHub Copilot CLI v1.0.108 article via MyMarky (X + LinkedIn).
// Usage: node scripts/marky-share-copilot-cli-108.cjs
const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const KEY = 'mk_live_2HrW1PDCF5i4rMu809NIDtvxtu0-rdnZOGURht6RWmE';
const API = `https://api.mymarky.ai/api/businesses/${BIZ_ID}/posts`;
const HEADERS = { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' };
const ARTICLE = 'https://terminalblog.com/blog/github-copilot-cli-1-0-108-pre-release-indexing/';

const POSTS = [
  {
    // X/Twitter: key takeaways + link
    caption:
`GitHub Copilot CLI v1.0.108 just gave your agent a search index 🔍

Managed shared tgrep indexing is now DEFAULT-ON for eligible repos.

/index status → shows coverage, health, last updated
/index build → force rebuild
/index watch → live tail of indexing

Agent finds "JWT validation" by SEMANTICS not grep.
10-100x faster on large codebases.

Plus: Windows enumerate-only directory grants, 50+ fixes.

Full breakdown: ${ARTICLE}
#GitHubCopilot #AICodingAgents #CodeSearch #tgrep #DeveloperTools #PreRelease`,
    link: ARTICLE,
    metadata: { format: 'release-guide', tool: 'copilot-cli', version: '1.0.108' },
  },
  {
    // LinkedIn: personal take, no links in body
    caption:
`GitHub Copilot CLI 1.0.108 shipped the feature that changes how agents work on real codebases: managed tgrep indexing enabled by default.

Before: agent greps 50,000 files every search. Slow. Misses context.
After: agent queries a pre-built semantic index. Finds "the auth middleware" by what it DOES, not filename. Cross-file references work. 10-100x faster.

This isn't a "nice to have." It's the difference between "agent searches your code" and "agent KNOWS your codebase."

Also in this pre-release:
• Windows enumerate-only directory grants (list structure without content access)
• /index commands: status, build, watch, pause, resume
• 50+ fixes across Autopilot, resume, search, MCP, accessibility
• Headless resume conflict protection

The team shipped Assisted Permissions as default (1.0.104), fixed Fusion tiers (1.0.105), sanded every paper cut (1.0.106), and now ships the search infrastructure that makes agents actually useful on production codebases.

Making it default-on means every user gets it without knowing it exists. That's the feature.

Beginner-friendly breakdown on terminalblog.

#GitHubCopilot #AICodingAgents #CodeSearch #SemanticSearch #DeveloperTools #PreRelease #DevOps #SoftwareEngineering`,
    metadata: { format: 'personal-take', platform: 'linkedin', tool: 'copilot-cli', version: '1.0.108' },
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