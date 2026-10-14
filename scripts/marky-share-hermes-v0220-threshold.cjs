#!/usr/bin/env node
// Share Hermes Agent v0.22.0 Threshold Release via MyMarky (X + LinkedIn)
const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const KEY = 'mk_live_2HrW1PDCF5i4rMu809NIDtvxtu0-rdnZOGURht6RWmE';
const API = 'https://api.mymarky.ai/api/businesses/' + BIZ_ID + '/posts';
const HEADERS = { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' };
const ARTICLE = 'https://terminalblog.com/blog/hermes-agent-v0-22-threshold-release-changes-everything/';

const POSTS = [
  {
    // X/Twitter: key takeaways + link
    caption:
'Hermes Agent v0.22.0 "The Threshold Release" just dropped — 24,200 commits, 6,080 PRs, 7,180 issues closed. 🚀\n\n' +
'🎯 Guided first-launch setup chat on FREE trial model (no API key needed)\n' +
'🔗 Connectors: Gmail, Linear, Notion inside your agent — sign in once, use forever\n' +
'💻 Local models in ONE CLICK — llama.cpp auto-installs, rates models to your GPU/RAM\n' +
'📦 Stable release channels by default — no more broken commits from main\n' +
'✅ Signed desktop packages + Microsoft Store + unified package manager (hermes pm)\n' +
'🧩 600 reviewed plugins in catalog — each pinned, scannable, category-browsable\n' +
'🧠 Claude 5.5 / GPT-6 model wave + prior reasoning replays on resume\n' +
'📉 Codebase 1/3 smaller — leaner, faster, easier to contribute\n\n' +
'Full breakdown: ' + ARTICLE + '\n\n' +
'#HermesAgent #AICodingAgent #OpenSource #DeveloperTools #LocalAI #MCP #Connectors #Terminal #Automation',
    link: ARTICLE,
    metadata: { format: 'release-update', tool: 'hermes', version: '0.22.0' },
  },
  {
    // LinkedIn: personal take, no links in body
    caption:
`I've watched Hermes evolve from a promising terminal agent into something that genuinely feels accessible to anyone. v0.22.0 "The Threshold Release" (October 13) is the inflection point.\n\n` +
`The numbers: ~24,200 commits, ~6,080 merged PRs, ~15,600 files changed, ~2.04M insertions, ~1.14M deletions, ~7,180 issues closed, ~2,520 contributors. This cycle is 2.5x the v0.21.0 window — and it rolls up v0.21.1 through v0.21.7.\n\n` +
`What makes this different isn't the volume. It's the INTENTIONALITY:\n\n` +
`**First launch that sets itself up.** Open Desktop on a fresh machine → guided setup chat → you're talking to an agent before you own an API key. Free trial model (nous/welcome, once per OS user). Skip anytime, rerun from Settings.\n\n` +
`**Connectors: Hermes works inside your apps.** Gmail, Linear, Notion through the Nous tool gateway. Ask for an app, sign in once, tools usable in the same turn. No Nous account needed — free connectors-only identity created on first use. Multiple named accounts per app (work/home Gmail). Works in Desktop, TUI, CLI.\n\n` +
`**Local models in one click.** llama.cpp installs with the right engine for your hardware (CPU, CUDA, Metal, Vulkan, ROCm). Rates every catalog model against your GPU/RAM, picks the highest-quality build that fits. Downloads pause/resume, server starts/stops with Hermes. Qwen3.8 27B, Flash Next with MTP head, Qwen3.6 35B-A3B, DeepSeek V4 Flash, any GGUF from HF.\n\n` +
`**Stable release channels.** Source installs now follow TAGGED RELEASES by default (v0.22.0 → v0.22.1 → v0.23.0). Tested SemVer releases passing source CI, Docker, Nix, signed builds, install/upgrade runs on every OS. Firehose? \`hermes update --set-channel main\` or Desktop Settings → About.\n\n` +
`**Signed packages, Microsoft Store, one package manager.** Sealed, signed MSIX (x64/ARM64) on Windows via Store/App Installer. Notarized Apple Silicon on macOS. Unified \`hermes pm\` owns every pinned, hash-checked tool and Python env — updates build new env, switch only on pass. Failed/killed updates can't leave you half-applied.\n\n` +
`**600 reviewed plugins.** Catalog rules prevent internals patching or unscannable binaries. Memory providers with their makers (Honcho, Supermemory, Hindsight, Mem0, OpenViking, Holographic). Home Assistant, Spotify, Langfuse. Existing users auto-migrated.\n\n` +
`**Model wave + reasoning replay.** Claude Fable 5.1, Opus 5.5, Sonnet 5.5, Haiku 5.5. GPT-6 Astra, Sol, Luna, GPT-6.1 Sol. Gemini 4 Argon. Prior reasoning replays by default on resume/branches/compaction. Transient 503/529/timeouts waited out in visible, bounded cycles.\n\n` +
`The thesis: Hermes was the god of thresholds — the doorway, the crossing, the boundary stone. v0.21.0 assembled the pantheon. v0.22.0 gets you through the door.\n\n` +
`If you've hesitated on Hermes because of setup friction, API keys, update anxiety, or cloud dependency — this release removes every reason.\n\n` +
`Run \`hermes update\`. Or install from the Microsoft Store.\n\n` +
`Full article with update steps on terminalblog.\n\n` +
`#HermesAgent #AICodingAgent #OpenSource #DeveloperTools #LocalAI #MCP #Connectors #Terminal #Automation #AIEngineering`,
    metadata: { format: 'personal-take', platform: 'linkedin', tool: 'hermes', version: '0.22.0' },
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
      console.log('Post ' + (i + 1) + ': HTTP ' + r.status + ' | id=' + results[results.length - 1].id + ' | sched=' + scheduled);
    } catch (e) {
      results.push({ i: i + 1, http: 0, id: 'ERROR', error: String(e) });
      console.log('Post ' + (i + 1) + ': ERROR ' + e);
    }
  }
  console.log('SUMMARY:', JSON.stringify(results, null, 1));
})().catch((e) => { console.error('Fatal:', e); process.exit(1); });