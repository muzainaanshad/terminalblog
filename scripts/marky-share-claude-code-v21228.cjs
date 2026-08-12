#!/usr/bin/env node
// Share the Claude Code v2.1.228 update article via MyMarky (X + LinkedIn).
// Usage: node scripts/marky-share-claude-code-v21228.cjs
const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const KEY = 'mk_live_2HrW1PDCF5i4rMu809NIDtvxtu0-rdnZOGURht6RWmE';
const API = `https://api.mymarky.ai/api/businesses/${BIZ_ID}/posts`;
const HEADERS = { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' };
const ARTICLE = 'https://terminalblog.com/blog/claude-code-v2-1-224-self-hosted-runners-cross-session-messaging/';

const POSTS = [
  {
    // X/Twitter: key takeaways + link
    caption:
`Claude Code v2.1.228 quietly fixed a supply-chain gap that most devs never knew existed 🛡️

Skills synced from the claude.ai marketplace could previously shadow your local commands — meaning a marketplace plugin could silently replace your own build/test/deploy scripts.

That door is now closed. Plus: newer models can overwrite files without reading first, Windows Git Bash detection fixed, and session cleanup stops nuking your project memory.

Full breakdown: ${ARTICLE}
#ClaudeCode #AICodingAgents #Security`,
    link: ARTICLE,
    metadata: { format: 'release-guide', tool: 'claude-code', version: 'v2.1.228' },
  },
  {
    // LinkedIn: personal take, no links in body
    caption:
`Claude Code just patched a supply-chain vulnerability that most developers never realized existed.

Here's the problem: when you sync skills from the claude.ai marketplace, those skills could define commands with the same name as your local ones — and silently override them. A marketplace skill named "build" could replace YOUR build script, and your agent would run the marketplace version without warning.

v2.1.228 closes that gap: marketplace skills can no longer shadow local commands or MCP prompts, descriptions are sanitized, and synced skill bodies are blocked from running shell commands or expanding file references on your machine.

This is the kind of security fix that doesn't make headlines but matters enormously. We're handing AI agents real execution power — the least we can do is make sure marketplace plugins can't hijack what the agent runs.

Beginner-friendly breakdown is up on terminalblog.

#ClaudeCode #AI #Security #CodingAgents #DevTools`,
    metadata: { format: 'personal-take', platform: 'linkedin', tool: 'claude-code', version: 'v2.1.228' },
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
