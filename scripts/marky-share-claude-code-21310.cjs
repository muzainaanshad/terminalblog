#!/usr/bin/env node
// Share the Claude Code 2.1.310 article via MyMarky (X + LinkedIn).
// Usage: node scripts/marky-share-claude-code-21310.cjs
const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const KEY = 'mk_live_2HrW1PDCF5i4rMu809NIDtvxtu0-rdnZOGURht6RWmE';
const API = `https://api.mymarky.ai/api/businesses/${BIZ_ID}/posts`;
const HEADERS = { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' };
const ARTICLE = 'https://terminalblog.com/blog/claude-code-v2-1-310-monitor-tool-cloud-sessions/';

const POSTS = [
  {
    // X/Twitter: key takeaways + link
    caption:
`Claude Code 2.1.310 just closed the observability gap 📊

Monitor tool lands with native plugins for:
• Bedrock
• Vertex
• Foundry

Run: claude --monitor-plugin bedrock "analyze this"
→ Structured events: model calls, tokens, tools, latency. Zero config.

Plus: Cloud Sessions get RBAC, gateway retries fixed, 30+ sandbox/compaction/hook/Windows bugs patched.

Full breakdown: ${ARTICLE}
#ClaudeCode #AICodingAgents #Observability #CloudSessions #Bedrock #Vertex #Foundry`,
    link: ARTICLE,
    metadata: { format: 'release-guide', tool: 'claude-code', version: '2.1.310' },
  },
  {
    // LinkedIn: personal take, no links in body
    caption:
`Claude Code 2.1.310 shipped the feature I've been waiting for: a built-in Monitor tool with native Bedrock, Vertex, and Foundry plugins.

Before this, you had two choices: fly blind, or wire up custom OpenTelemetry. Now you run one flag and get structured events — model calls, token usage, tool invocations, latency percentiles — in your terminal, your logs, your dashboard.

This release also brings:
• Cloud Sessions with Remote Control permissions in Enterprise RBAC
• Gateway request retries (finally works behind corporate proxies)
• 30+ fixes across sandbox, compaction, hooks, Windows

The terminal agent is becoming an enterprise platform. Beginner-friendly breakdown on terminalblog.

#ClaudeCode #AICodingAgents #Observability #CloudComputing #DevTools #EnterpriseAI #Bedrock #Vertex #Foundry`,
    metadata: { format: 'personal-take', platform: 'linkedin', tool: 'claude-code', version: '2.1.310' },
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