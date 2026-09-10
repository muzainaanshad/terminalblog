#!/usr/bin/env node
// Share Gemini CLI v0.58-v0.60 security-wave update (Sept 2026) via MyMarky (X + LinkedIn)
const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const KEY = 'mk_live_2HrW1PDCF5i4rMu809NIDtvxtu0-rdnZOGURht6RWmE';
const API = 'https://api.mymarky.ai/api/businesses/' + BIZ_ID + '/posts';
const HEADERS = { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' };
const ARTICLE = 'https://terminalblog.com/blog/google-antigravity-killed-gemini-cli-terminal-ai-war/';

const POSTS = [
  {
    // X/Twitter: key takeaways + link
    caption:
'Google "killed" Gemini CLI — then quietly spent September making it one of the most hardened agents around 🔒\\\\n\\\\n' +
'v0.58→v0.60 shipped a security wave most people missed:\\\\n' +
'🛡️ Docker/container sockets isolated in the sandbox\\\\n' +
'🔑 MCP OAuth now enforces RFC 9207 issuer checks\\\\n' +
'🔗 Symlink + path-boundary hardening (incl. NTFS 8.3 tricks)\\\\n' +
'🧹 A hardcoded CrUX API key scrubbed from tooling\\\\n\\\\n' +
'Even a "dead" product is fixing the same boundaries every agent gets attacked on. Worth reading for ANY agent user: ' + ARTICLE + '\\\\n\\\\n' +
'#GeminiCLI #AISecurity #CodingAgents #MCP #TerminalAI #DevSecOps #OpenSource',
    link: ARTICLE,
    metadata: { format: 'release-update', tool: 'gemini-cli', version: 'v0.60.0-preview.0', topic: 'security-hardening' },
  },
  {
    // LinkedIn: personal take, no links in body
    caption:
'Google killed Gemini CLI for individuals on June 18. Then their team spent September quietly doing some of the most serious agent-security hardening we have seen this quarter — and almost nobody noticed.\\\\n\\\\n' +
'v0.58 through v0.60 shipped fixes that read like a checklist of the attack classes being found across every AI coding agent:\\\\n' +
'• Docker and container-runtime sockets/bins isolated inside the macOS sandbox (the classic "sandbox escape to host root" path)\\\\n' +
'• MCP OAuth now verifies the token issuer per RFC 9207 — closing the malicious-MCP-server token hijack class\\\\n' +
'• Symlink-aware path boundaries, strict permission checks on system-wide config paths, and an NTFS 8.3 short-name mitigation for Windows\\\\n' +
'• Provenance handling for untrusted tool output, and a consent prompt for env changes — the same "agent treats attacker output as instructions" family as the CI secret-theft attacks we covered earlier\\\\n' +
'• A hardcoded CrUX API key scrubbed from chrome-devtools-mcp\\\\n\\\\n' +
'My take: this is the roadmap every agent vendor is walking. Sandbox boundaries, OAuth issuer verification, path-canonicization, and output-provenance are becoming table stakes. If your agent tooling has not touched any of these yet, it is behind.\\\\n\\\\n' +
'Expanded the piece on terminalblog with PR links and what to check in your own stack.\\\\n\\\\n' +
'#AISecurity #CodingAgents #GeminiCLI #MCP #DevSecOps #AIEngineering #Sandboxing #OpenSource',
    metadata: { format: 'personal-take', platform: 'linkedin', tool: 'gemini-cli', version: 'v0.60.0-preview.0', topic: 'security-hardening' },
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
      console.log('Post ' + (i + 1) + ': HTTP ' + r.status + ' | id=' + results[i].id + ' | sched=' + scheduled);
    } catch (e) {
      results.push({ i: i + 1, http: 0, id: 'ERROR', error: String(e) });
      console.log('Post ' + (i + 1) + ': ERROR ' + e);
    }
  }
  console.log('SUMMARY:', JSON.stringify(results, null, 1));
})().catch((e) => { console.error('Fatal:', e); process.exit(1); });