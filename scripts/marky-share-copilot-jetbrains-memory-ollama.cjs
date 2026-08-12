#!/usr/bin/env node
// Share Copilot JetBrains memory + Ollama article via MyMarky (X + LinkedIn).
// Usage: node scripts/marky-share-copilot-jetbrains-memory-ollama.cjs
const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const KEY = 'mk_live_2HrW1PDCF5i4rMu809NIDtvxtu0-rdnZOGURht6RWmE';
const API = `https://api.mymarky.ai/api/businesses/${BIZ_ID}/posts`;
const HEADERS = { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' };
const ARTICLE = 'https://terminalblog.com/blog/copilot-jetbrains-memory-ollama-local-models/';

const POSTS = [
  {
    // X/Twitter: key takeaways + link
    caption:
`GitHub Copilot for JetBrains just shipped two features every dev wanted. 🧠

1. Memory across chat sessions — your agent remembers your preferences between conversations. No more re-explaining your project conventions every time.

2. Ollama BYOK — run free local models (Llama, Qwen, DeepSeek) directly inside Copilot. Zero API cost, full privacy, works offline.

Also: enterprise managed settings, expanded Codex workflows, auto CLI install.

Full breakdown: ${ARTICLE}
#GitHubCopilot #JetBrains #Ollama #CodingAgents`,
    link: ARTICLE,
    metadata: { format: 'release-guide', tool: 'copilot', version: 'august-2026' },
  },
  {
    // LinkedIn: personal take, no links in body
    caption:
`GitHub Copilot for JetBrains just got two features that change the developer experience.

First: persistent memory across chat sessions. Copilot now remembers your project conventions, your preferences, your past instructions — and recalls them automatically in future conversations. No more re-explaining your setup every time you start a new chat. Claude Code has had this for a while, but Copilot bringing it to JetBrains (IntelliJ, PyCharm, WebStorm, GoLand) means millions more developers get the benefit.

Second: Ollama as a BYOK provider. You can now run free local models inside Copilot — Llama, Qwen, DeepSeek, anything Ollama supports. Zero API cost. Your code never leaves your machine. Works offline. For teams handling sensitive codebases or working in regulated industries, this is the feature that makes Copilot viable where cloud-only tools were not.

The enterprise story is equally strong: admins can now control plugin availability, MCP server access, permission bypass behavior, and OpenTelemetry settings at the organization level.

What I find interesting is the timing. Claude Code, Codex, and Hermes all shipped memory features in the past quarter. Copilot adding it to JetBrains feels less like innovation and more like catching up — but for the JetBrains ecosystem, catching up is exactly what matters.

#GitHubCopilot #AI #JetBrains #CodingAgents #Ollama #DevTools`,
    metadata: { format: 'personal-take', platform: 'linkedin', tool: 'copilot', version: 'august-2026' },
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
