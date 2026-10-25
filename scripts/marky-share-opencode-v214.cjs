#!/usr/bin/env node
// Share OpenCode v2.1.4 via MyMarky (X + LinkedIn)
const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const KEY = 'mk_live_2HrW1PDCF5i4rMu809NIDtvxtu0-rdnZOGURht6RWmE';
const API = 'https://api.mymarky.ai/api/businesses/' + BIZ_ID + '/posts';
const HEADERS = { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' };
const ARTICLE = 'https://terminalblog.com/blog/opencode-v2-1-4-mcp-forms-background-compaction/';

const POSTS = [
  {
    // X/Twitter: key takeaways + link
    caption:
'OpenCode v2.1.4 just made MCP actually usable. 🎯\n\n' +
'✅ MCP forms NOW appear — no more silent timeouts when servers need input\n' +
'✅ Background compaction — session never freezes, summaries prep in background\n' +
'✅ Bun 1.4.4 security — TLS, HTTP/3, WebSocket, Brotli, fetch all patched\n' +
'✅ Pierre Highlights — code blocks render faster, use less memory\n' +
'✅ Voice models discoverable — client.voice.models() finds experimental models\n' +
'✅ Hide free models — OPENCODE_DISABLE_FREE_MODELS=1 removes zero-cost models\n' +
'✅ Fresh installs just work — creates shell config, adds to PATH automatically\n\n' +
'The MCP form fix alone is worth the update. Full breakdown: ' + ARTICLE + '\n\n' +
'#OpenCode #MCP #AICodingAgent #Security #DeveloperTools #OpenSource #Bun #TypeScript',
    link: ARTICLE,
    metadata: { format: 'release-update', tool: 'opencode', version: '2.1.4' },
  },
  {
    // LinkedIn: personal take, no links in body
    caption:
'OpenCode v2.1.4 shipped October 23, and the feature that changes daily workflow isn\'t the security patches (though those matter) — it\'s that MCP finally works.\n\n' +
'For months, the Model Context Protocol in OpenCode had a fatal flaw: when an MCP server needed your input — a confirmation, a choice, a URL — the tool call would just hang. No form. No prompt. Silent timeout. You had no idea what it wanted.\n\n' +
'v2.1.4 fixes this completely. Text, number, choice, multiselect, boolean, URL — the forms appear instantly in Desktop, Web, and TUI.\n\n' +
'The other features compound the platform story:\n' +
'• Background compaction = long sessions don\'t freeze mid-thought\n' +
'• Bun 1.4.4 = entire network stack patched (your agent makes hundreds of calls/session)\n' +
'• Pierre Highlights = large file diffs render fast\n' +
'• Voice model discovery = groundwork for voice-driven coding\n' +
'• Installer creates ~/.zshrc, adds to PATH, tells you to exec $SHELL\n\n' +
'OpenCode is provider-neutral — Anthropic, OpenAI, OpenRouter, Google, xAI, local models — and now the MCP layer that connects them all actually works.\n\n' +
'Full release breakdown on terminalblog.\n\n' +
'#OpenCode #MCP #AICodingAgent #DeveloperTools #OpenSource #TypeScript #Bun #AIEngineering',
    metadata: { format: 'personal-take', platform: 'linkedin', tool: 'opencode', version: '2.1.4' },
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