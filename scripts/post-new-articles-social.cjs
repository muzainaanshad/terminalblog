#!/usr/bin/env node
/**
 * Post new articles to X (Twitter) and LinkedIn via MyMarky API
 * Usage: node scripts/post-new-articles-social.cjs
 */

const https = require('https');

const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const API_KEY = 'mk_live_w61K61zmWDi-I-pviWXoYQX7UmU2mJ-xOAVyNdsKVpY';
const API_BASE = 'https://api.mymarky.ai';

function apiRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${API_BASE}${path}`);
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method,
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });

    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function postToTwitter(text) {
  const resp = await apiRequest('POST', `/api/businesses/${BIZ_ID}/posts`, {
    caption: text,
    restrict_publish_to: ['twitter'],
    status: 'NEW',
  });
  return resp;
}

async function postToLinkedIn(text) {
  const resp = await apiRequest('POST', `/api/businesses/${BIZ_ID}/posts`, {
    caption: text,
    restrict_publish_to: ['linkedIn'],
    status: 'NEW',
  });
  return resp;
}

const ARTICLES = [
  {
    slug: 'ampcode-self-hosted-orbs-october-2026',
    title: 'AmpCode Self-Hosted Orbs',
    url: 'https://terminalblog.com/blog/ampcode-self-hosted-orbs-october-2026/',
    twitter: `AmpCode just dropped Self-Hosted Orbs 🚀

Run agent compute on YOUR infra — Docker, K8s, Modal, Vercel, Daytona, E2B. Your code, your network, your hardware. Amp just orchestrates.

Free for individuals & teams until Oct 29.

Key takeaways:
• You provide compute, Amp provides orchestration
• Dispatch script handles spawn/pause/delete
• Works with 8+ platforms out of the box
• Enterprise pricing starts Oct 29, free forever for teams

Read more: ${this.url}`,
    linkedin: `AmpCode's Self-Hosted Orbs (released Oct 22) is the feature enterprise teams have been waiting for.

Run agent compute on your own infrastructure — your VPC, your GPUs, your data never leaves your network. Amp just sends spawn/pause/delete events to your dispatch script.

This changes the adoption calculus entirely:
- Regulated industries (finance, healthcare, gov): code never leaves your VPC
- GPU-heavy workloads: your H100s, your Mac Studios, no per-orb markup
- Cost control: fixed infrastructure cost, zero per-orb markup

The dispatch script pattern is elegantly simple — three operations (spawn/pause/delete), you decide the infrastructure. Docker, Kubernetes, Modal, Vercel Sandboxes, Daytona, E2B, Apple containers, exe.dev — all supported with ready-to-copy examples.

Free for individuals and teams until Oct 29, then free forever for non-Enterprise. Enterprise gets standard orb pricing with support.

This is the "AWS for agents" moment — but you bring the AWS.`
  },
  {
    slug: 'zed-v1-26-1-pre-pyrefly-dwarf-debugging',
    title: 'Zed v1.26.1-pre',
    url: 'https://terminalblog.com/blog/zed-v1-26-1-pre-pyrefly-dwarf-debugging/',
    twitter: `Zed v1.26.1-pre dropped — Pyrefly Python LSP, DWARF WASM debugging, expandable variable hovers, OpenCode reasoning fixes, Display P3 on macOS.

For Python devs: Pyrefly in one setting.
For WASM devs: Native debugging, finally.
For OpenCode users: Reasoning that renders right.

Read more: ${this.url}`,
    linkedin: `Zed v1.26.1-pre (Oct 21) adds capabilities that matter for daily workflows:

1. **Pyrefly as optional Python LSP** — Meta's fast, type-aware Python language server. One setting flip, no external config. Legit Pyright alternative.

2. **DWARF debugging for WebAssembly** — Step through .wasm files with source maps, inspect WASM locals and stack frames. Works with Rust→WASM, C++→WASM, AssemblyScript. WASM debugging finally leaves console.log behind.

3. **Expandable, keyboard-accessible variable tree in debugger hovers** — Deeply nested objects (React props, GraphQL responses) explorable inline with arrow keys. No mouse, no side panel.

4. **OpenCode reasoning/thinking fixes** — DeepSeek reasoning replay, Google models thinking disable, thinking controls that explain when thinking can't be disabled.

5. **Display P3 color space on macOS** — 45% more colors than sRGB on M-series Macs.

The pattern holds: Zed builds editor substrate that makes AI agents feel native. Better language support, better debugging, better remote dev, better color fidelity.

If you write Python, debug WASM, or embed OpenCode — try this pre-release. Stable drops next week.`
  },
  {
    slug: 'openclaw-2026-10-6-security-patch',
    title: 'OpenClaw 2026.10.6 Security Patch',
    url: 'https://terminalblog.com/blog/openclaw-2026-10-6-security-patch/',
    twitter: `OpenClaw 2026.10.6 — Security patch for eMudhra certificate compromise.

Requires Node 24.22.1+ or 26.12.1+. 233 PRs fixing Windows installs, update recovery, Gateway stability, imports.

If you manage Node manually: upgrade first. Standalone installers bundle patched runtime.

Read more: ${this.url}`,
    linkedin: `OpenClaw 2026.10.6 (Oct 22) is a security patch release you should not skip.

**The mandate:** eMudhra certificate compromise remediated. Node 24.22.1+ (Node 24 line) or 26.12.1+ (Node 26 line) now required. Standalone installers bundle the patched runtime — just update. If you manage Node manually (nvm/fnm), upgrade first.

**Beyond security — 233 PRs of pure reliability:**
- Windows installs: false "offline maintenance" errors fixed, Bun installs complete, service commands work
- Update recovery: tells you exactly which backup-retention link is unsafe, btrfs repair continues, manual upgrades don't suggest outdated rollbacks
- Gateway stability: graceful shutdown waits for cleanup, stop stuck Gateway (>5 min), dead workers unblocked after reboot, Control UI frees memory
- Imports: Hermes/Codex/Claude UTF-8 handling, clock-skew edge cases, migration previews list unreadable files
- Web UI: settings explain refresh failures, Canvas stops instead of replacing, sessions show helper runtime

Zero breaking changes. Pure security + reliability. Update today.`
  },
  {
    slug: 'what-developers-think-layerfs-vibe-coding-hn',
    title: 'What Developers Think About Vibe Coding Infrastructure',
    url: 'https://terminalblog.com/blog/what-developers-think-layerfs-vibe-coding-hn/',
    twitter: `200+ HN comments on LayerFS — "vibe coding" infrastructure that snapshots your entire dev environment (editor state, terminal, browser, running services).

Developers are split: "this is the future" vs "just use git + docker-compose."

The real insight: it's not about the tool, it's about reducing context-switching cost.

Read more: ${this.url}`,
    linkedin: `HN discussion (200+ comments) on LayerFS — a "vibe coding" infrastructure tool that snapshots your entire dev environment: editor state, terminal history, browser tabs, running services, even clipboard.

The split is revealing:
- "This is the future of dev environments" — snapshot/restore eliminates context-switching tax
- "Just use git + docker-compose + tmux" — existing tools solve this
- "Security nightmare" — snapshotting browser state, clipboard, running services

The real insight isn't LayerFS specifically. It's that **context-switching cost is the hidden productivity killer**. Every time you switch tasks, you lose 15-30 minutes rebuilding mental state. Tools that reduce that tax (whether LayerFS, git worktrees, tmux sessions, or agent memory files) compound.

The best comment: "I don't need a tool to snapshot my environment. I need discipline to not context-switch in the first place."

But for teams doing constant context-switching (on-call, support, multiple projects), infrastructure that captures/restores state is a force multiplier.`
  },
  {
    slug: 'hermes-agent-beginners-guide-v0-22-5',
    title: 'Hermes Agent Just Got 10X More Usable',
    url: 'https://terminalblog.com/blog/hermes-agent-beginners-guide-v0-22-5/',
    twitter: 'Hermes Agent v0.22.5 just dropped 81 updates in 48 hours 🚀\n\nSign-in fixed. Updates finally work. Windows UX polished. Import Cursor configs in one command. Hermes as MCP server.\n\n8 things that actually change your daily workflow:\n1. Sign-in no longer confuses you\n2. hermes update just works\n3. Drag-to-pin + one-click plugins\n4. Route cheap tasks to cheap models\n5. Plugins ask you questions now\n6. Import Cursor config: one command\n7. Hermes becomes an MCP server\n8. Auto-switch models at quota limits\n\nRuns 100% local. Free. MIT.\n\nRead more: https://terminalblog.com/blog/hermes-agent-beginners-guide-v0-22-5/',
    linkedin: 'Hermes Agent v0.22.5 (Oct 23) is the release that makes local AI coding agents genuinely usable for daily work.\n\n81 merged PRs. 231 commits. 804 files touched. The maintainers call it a "patch" \u2014 but it rewrites the onboarding, update reliability, Windows UX, delegation routing, plugin usability, agent switching, MCP server mode, and quota management.\n\nWhat actually changes for users:\n\n**1. Sign-in confusion \u2192 Eliminated**\nEvery sign-in is plain device login. Free tier hands over to your account. You see who\'s signed in. No more guest-mode limbo.\n\n**2. `hermes update` \u2192 Just works**\nNo more refusing stable releases. Windows launcher stays current after Python bumps.\n\n**3. Windows Desktop \u2192 Drag-to-pin, one-click plugins**\nPin active chats. Plugin catalog with tier badges (official/community/labs). Electron 44.\n\n**4. Delegation backends \u2192 Pluggable**\n"Route subagent tasks matching X to model Y." Set once, Hermes routes automatically. Cost control without babysitting.\n\n**5. Plugin slash commands \u2192 Interactive**\nType `/plugin` \u2192 it asks questions \u2192 you answer \u2192 it runs. No YAML editing.\n\n**6. Switch from Cursor \u2192 One command**\n`hermes import-agent --from cursor` imports models, MCP servers, commands, keybindings.\n\n**7. Hermes as MCP server \u2192 New capability**\nExpose local tools to Claude Code, Cursor, Goose via MCP. Your local agent becomes infrastructure.\n\n**8. Quota management \u2192 Automated**\nPlan gauges, limit cards, auto-fallback model switching when you hit daily limits.\n\nPlus: long Claude outputs no longer truncated. 10 new community plugins (tailscale, ssh, shodan, terminal, rss, resetwatch, done-bell, kiwi, cognee, Octen). Full docs in v0.23.0.\n\nWhy this matters: Hermes runs 100% local (Ollama, LM Studio, your endpoints). Zero data leaves your machine. Free. MIT licensed. Microsoft Store / CLI / Docker / Desktop app.\n\nIf you want privacy, zero cost, and extensibility \u2014 this is the release to try.\n\n```bash\n# Windows\nirm nousresearch.com/hermes/install.ps1 | iex\n\n# macOS/Linux\ncurl -fsSL nousresearch.com/hermes/install.sh | bash\n```'
  }
];

async function main() {
  console.log('Posting new articles to X and LinkedIn...\n');

  for (const article of ARTICLES) {
    console.log(`\n--- ${article.title} ---`);
    
    // Twitter
    const twitterText = article.twitter.replace('${this.url}', article.url);
    console.log(`Posting to Twitter...`);
    try {
      const resp = await postToTwitter(twitterText);
      if (resp.status === 201) {
        console.log(`✅ Twitter: ${resp.body.id}`);
      } else {
        console.error(`❌ Twitter (${resp.status}):`, resp.body);
      }
    } catch (e) {
      console.error(`❌ Twitter error:`, e.message);
    }

    // Small delay
    await new Promise(r => setTimeout(r, 1000));

    // LinkedIn
    console.log(`Posting to LinkedIn...`);
    try {
      const resp = await postToLinkedIn(article.linkedin);
      if (resp.status === 201) {
        console.log(`✅ LinkedIn: ${resp.body.id}`);
      } else {
        console.error(`❌ LinkedIn (${resp.status}):`, resp.body);
      }
    } catch (e) {
      console.error(`❌ LinkedIn error:`, e.message);
    }

    await new Promise(r => setTimeout(r, 1000));
  }

  console.log('\n✅ Done!');
}

main().catch(e => {
  console.error('Fatal:', e);
  process.exit(1);
});