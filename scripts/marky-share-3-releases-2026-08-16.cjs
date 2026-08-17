#!/usr/bin/env node
// Share the 3 new release articles via MyMarky (X + LinkedIn)
const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const KEY = 'mk_live_2HrW1PDCF5i4rMu809NIDtvxtu0-rdnZOGURht6RWmE';
const API = 'https://api.mymarky.ai/api/businesses/' + BIZ_ID + '/posts';
const HEADERS = { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' };

const ARTICLES = [
  {
    slug: 'openclaw-v2026-8-1-beta2-secret-egress-gpt5-macos-profiles',
    tool: 'openclaw',
    version: '2026.8.1-beta.2',
  },
  {
    slug: 'pi-v0-84-2-fullscreen-transcript-search-configurable-tools',
    tool: 'pi-dot-dev',
    version: '0.84.2',
  },
  {
    slug: 'hermes-agent-v0-20-1-patch-release-656-fixes',
    tool: 'hermes',
    version: '0.20.1',
  },
];

const BASE_URL = 'https://terminalblog.com/blog/';

const POSTS = [];

// OpenClaw v2026.8.1-beta.2
POSTS.push({
  caption:
'OpenClaw 2026.8.1-beta.2 just dropped secret egress host binding — credentials CANNOT leak to wrong hosts anymore. 🛡️\n\n' +
'🔐 Secret egress host binding: default-deny for credential egress\n' +
'🤖 GPT-5.6 Ultra/Terra/Luna support with atomic runtime switching\n' +
'👥 macOS app profiles: true multi-tenancy on one machine\n' +
'💾 SQLite snapshots: verified backups with fresh-target-only restore\n' +
'⚠️ Plugin provenance warnings: no blind installs\n' +
'🔄 Control UI reload fix: updates just work\n' +
'🌐 Browser CDP compat: Puppeteer without prompts\n' +
'🎤 Fish Audio speech: streaming voice synthesis\n' +
'💬 Discord/Slack native login\n' +
'📊 MCP dashboard widgets: live app views\n\n' +
'Full breakdown: ' + BASE_URL + 'openclaw-v2026-8-1-beta2-secret-egress-gpt5-macos-profiles/\n\n' +
'#OpenClaw #AICodingAgent #Security #GPT5 #macOS #OpenSource #DeveloperTools',
  link: BASE_URL + 'openclaw-v2026-8-1-beta2-secret-egress-gpt5-macos-profiles/',
  metadata: { format: 'release-update', tool: 'openclaw', version: '2026.8.1-beta.2' },
}, {
  caption:
'OpenClaw 2026.8.1-beta.2 (released Aug 15) is the rare beta that solves problems you have TODAY.\n\n' +
'The headline is **secret egress host binding** — every secret in the shared store is now bound to exact HTTPS destination hosts. CLI, Gateway RPC, Control UI all enforce it. If a secret isn\'t explicitly bound to the host it\'s being sent to, substitution fails CLOSED. Plaintext never leaves your machine.\n\n' +
'This is default-deny architecture for credential egress. A compromised plugin or misconfigured tool simply cannot exfiltrate your API keys to arbitrary endpoints.\n\n' +
'But the features that change daily work are just as big:\n\n' +
'**GPT-5.6 Ultra, Terra, Luna support** with atomic `/model` switching — model, runtime, and thinking selection stay in sync. Live matrix coverage for both OpenClaw and Codex harnesses.\n\n' +
'**macOS app profiles** — finally, true instance isolation on one Mac. Separate state, preferences, Keychain, Gateway services, duplicate-instance detection. Host-global login stays shared; everything else is per-profile. First coding agent platform to ship this without containers.\n\n' +
'**SQLite snapshots** — `openclaw backup sqlite create|list|verify|restore`. Compact, verified artifacts. Fresh-target-only restore prevents accidental overwrites.\n\n' +
'**Plugin install provenance** — arbitrary executable plugins require explicit `--force`. Trusted flows (ClawHub, bundled, catalog, tracked updates) stay frictionless.\n\n' +
'**15+ other features**: Control UI reload recovery, Browser CDP compat for Puppeteer, Fish Audio speech, Discord/Slack native login, user profiles, channel plugin monitors, MCP dashboard widgets, local model setup in UI, trusted-proxy pairing.\n\n' +
'Full article on terminalblog.\n\n' +
'#OpenClaw #AICodingAgent #Security #GPT5 #macOS #OpenSource #DeveloperTools #AIEngineering',
  metadata: { format: 'personal-take', platform: 'linkedin', tool: 'openclaw', version: '2026.8.1-beta.2' },
});

// Pi v0.84.2
POSTS.push({
  caption:
'Pi v0.84.2 just added fullscreen transcript search (Ctrl+Shift+F) — and it changes how you find things. 🔍\n\n' +
'🔍 Fullscreen search: incremental matches, themed highlights, Enter/Shift+Enter nav\n' +
'🎯 Configurable default tools: choose startup tools globally or per project\n' +
'🎨 Per-run themes: `--use-theme dracula` without touching saved settings\n' +
'🛡️ Strict JSON-schema tool sampling (experimental): malformed tool calls impossible\n' +
'📄 Fullscreen exit output choice: transcript or resume hint\n' +
'☁️ Cloudflare Workers AI binding: zero-token Gateway access\n' +
'🐛 25 bug fixes: SSH Alt+Enter, Copilot rate limits, subagent inheritance, selection copy, idle repaint...\n\n' +
'Full breakdown: ' + BASE_URL + 'pi-v0-84-2-fullscreen-transcript-search-configurable-tools/\n\n' +
'#Pi #AICodingAgent #TUI #Fullscreen #DeveloperTools #Terminal #OpenSource',
  link: BASE_URL + 'pi-v0-84-2-fullscreen-transcript-search-configurable-tools/',
  metadata: { format: 'release-update', tool: 'pi-dot-dev', version: '0.84.2' },
}, {
  caption:
'Pi v0.84.2 (released Aug 14) doesn\'t add flashy capabilities — it makes the existing experience feel FINISHED.\n\n' +
'The feature you\'ll use every session: **Fullscreen transcript search** (`Ctrl+Shift+F`). Incremental match highlighting. Configurable search match theme colors. `Enter`/`Ctrl+G` for next, `Shift+Enter`/`Ctrl+Shift+G` for previous. Finding "that thing from three hours ago" is now instant, not endless scrolling.\n\n' +
'**Configurable default tools** — declare which built-in tools load at startup, globally or per project:\n' +
'```json\n{ "defaultTools": ["read", "write", "edit", "bash", "grep", "task"] }\n```\n' +
'No more `web_search` on every project. No `bash` in read-only sessions. Intent declared once, respected always.\n\n' +
'**Per-run themes** — `pi --use-theme dracula` or `pi --use-theme "dracula/nord"` for light/dark pairs. Try themes without committing.\n\n' +
'**Experimental strict JSON-schema tool sampling** (`PI_EXPERIMENTAL=1`) — the default `read`, `bash`, `edit`, `write` tools now enforce structure at generation time. The model *cannot* emit malformed tool calls. This eliminates the #1 cause of "agent went off the rails" moments.\n\n' +
'**Fullscreen exit output choice** — print full transcript or just session resume hint. Your call.\n\n' +
'**Cloudflare AI Gateway without API tokens** — inherited `createGatewayBindingFetch()` routes through Workers AI binding.\n\n' +
'**25 bug fixes** that fix daily annoyances: SSH `Alt+Enter` split input, Copilot login rate limits, subagent model/thinking/tools inheritance, selection copy using host clipboard, idle sessions repainting/clearing selection, LaTeX control spaces, fullscreen mouse drag/OSC 8 links, focused overlays receiving scroll keys...\n\n' +
'Full article on terminalblog.\n\n' +
'#Pi #AICodingAgent #TUI #Fullscreen #DeveloperTools #Terminal #OpenSource #AIEngineering',
  metadata: { format: 'personal-take', platform: 'linkedin', tool: 'pi-dot-dev', version: '0.84.2' },
});

// Hermes v0.20.1
POSTS.push({
  caption:
'Hermes Agent v0.20.1 just dropped — 656 PRs, 1,444 commits, 10 days of stabilization. 🛠️\n\n' +
'🖥️ Desktop app: bootstrap/repin fixes, tooltip UX, auto-scrolling tool window, CDP browser automation\n' +
'🌐 Gateway: parent runtime session scope, readiness/context budgets, routing parity, 15+ LLMs\n' +
'🔧 Tools: skill system overhaul, plugins, hub marketplace, Git PR automation\n' +
'🤖 Providers: catalog updates, routing fixes, provider isolation\n' +
'🧠 Memory: persistent context (mem0), sessions search, cross-session reliability\n' +
'📦 Installers: Windows self-heal venv, write file silent failure fix, desktop bootstrap\n' +
'🔐 Security: credential guards, env file guard, cron secret scope, browser private page guard, Windows secret leakage\n\n' +
'Full breakdown: ' + BASE_URL + 'hermes-agent-v0-20-1-patch-release-656-fixes/\n\n' +
'#Hermes #AICodingAgent #OpenSource #Stability #PatchRelease #DeveloperTools',
  link: BASE_URL + 'hermes-agent-v0-20-1-patch-release-656-fixes/',
  metadata: { format: 'release-update', tool: 'hermes', version: '0.20.1' },
}, {
  caption:
'Hermes Agent v0.20.1 (released Aug 13) is the "sleep better tonight" release.\n\n' +
'656 PRs. 1,444 commits. 2,172 files. 481 issues closed. 10 days since v0.20.0 "Herald".\n\n' +
'This is what open-source velocity looks like when a team treats STABILIZATION as a feature. The v0.20.0 flagship features (voice interruption, A2A agent chat, webhooks) are now backed by 10 days of real-world hardening.\n\n' +
'What actually improved for daily users:\n\n' +
'**Desktop app** — bootstrap/repin fixes (stale state on update gone), tooltip UX (no more flicker/stick), auto-scrolling tool window (output follows execution), CDP browser automation (Chrome DevTools Protocol stabilized).\n\n' +
'**Gateway & runtime** — session isolation hardened, "gateway not ready" false positives eliminated, routing parity across profiles, 15+ LLM routing stabilized, durable background completions (tasks survive laptop close).\n\n' +
'**Tool system** — skill loading rewritten for reliability, plugin/skill marketplace discovery/install fixed, Git PR automation reliability.\n\n' +
'**Memory & persistence** — mem0 cross-session memory reliable, sessions search works, "where did my context go?" moments reduced.\n\n' +
'**Installers** — Windows venv self-heal on update, "success but file empty" bug squashed, desktop bootstrap smoothed.\n\n' +
'**Security** — credential guards with provider isolation, env file guard (case-insensitive), cron job secret scope, browser private page guard, Windows-specific credential leaks patched.\n\n' +
'The team is explicit: v0.21.0 will ship full curated notes for everything v0.20.0 onward. But you don\'t wait — update today.\n\n' +
'`hermes update` takes 30 seconds. The stability pays off every session after.\n\n' +
'Full article on terminalblog.\n\n' +
'#Hermes #AICodingAgent #OpenSource #Stability #PatchRelease #DeveloperTools #AIEngineering',
  metadata: { format: 'personal-take', platform: 'linkedin', tool: 'hermes', version: '0.20.1' },
});

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