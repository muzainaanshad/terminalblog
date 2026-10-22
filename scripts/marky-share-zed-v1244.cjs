#!/usr/bin/env node
// Share the Zed v1.24.4 article via MyMarky (X + LinkedIn).
// Usage: node scripts/marky-share-zed-v1244.cjs
const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const KEY = 'mk_live_2HrW1PDCF5i4rMu809NIDtvxtu0-rdnZOGURht6RWmE';
const API = `https://api.mymarky.ai/api/businesses/${BIZ_ID}/posts`;
const HEADERS = { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' };
const ARTICLE = 'https://terminalblog.com/blog/zed-v1-24-4-stable-smaller-binaries-pyrefly-debugger/';

const POSTS = [
  {
    // X/Twitter: key takeaways + link
    caption:
`Zed v1.24.4 just shrunk itself 33% on Mac (and 28% on Windows) — while adding Pyrefly, debugger hover trees, and WASM DWARF debugging 🚀

Binary size breakthrough:
• macOS ARM64: 258MB → 172MB (-33%)
• Windows x64: 359MB → 256MB (-28%)  
• Linux x64: 317MB → 295MB (-7%)

Plus: Pyrefly (Facebook's Rust Python LSP) optional built-in, nested variable inspection in debugger hovers, DWARF debugging for WebAssembly.

Full breakdown: ${ARTICLE}
#ZedEditor #Rust #Python #Debugging #WebAssembly`,
    link: ARTICLE,
    metadata: { format: 'release-guide', tool: 'zed', version: 'v1.24.4' },
  },
  {
    // LinkedIn: personal take, no links in body
    caption:
`Zed's v1.24.4 release is the rare one where the headline feature is what *disappeared* — 33% of the binary on Mac, 28% on Windows.

While other editors add Electron bloat, Zed's Rust team spent a cycle optimizing workspace crates and hiding exports. The result: faster downloads, less disk, faster cold starts — zero speed regression.

They also added Pyrefly (Facebook's Python type checker) as an optional LSP, debugger hovers that show nested objects inline, and DWARF debugging for WebAssembly so you can step through .rs/.cpp/.go source while debugging WASM output.

This is what "native editor" actually means: smaller, faster, more capable — not just "runs on Mac."

Beginner-friendly breakdown on terminalblog.

#ZedEditor #Rust #Python #Debugging #DevTools #NativeApps`,
    metadata: { format: 'personal-take', platform: 'linkedin', tool: 'zed', version: 'v1.24.4' },
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