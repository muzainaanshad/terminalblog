#!/usr/bin/env node
// Share Qwen Code v1.0.0-preview via MyMarky (X + LinkedIn)
const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const KEY = 'mk_live_2HrW1PDCF5i4rMu809NIDtvxtu0-rdnZOGURht6RWmE';
const API = 'https://api.mymarky.ai/api/businesses/' + BIZ_ID + '/posts';
const HEADERS = { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' };
const ARTICLE = 'https://terminalblog.com/blog/qwen-code-v1-0-preview-native-multi-provider-agent-platform/';

const POSTS = [
  {
    // X/Twitter: key takeaways + link
    caption:
'Qwen Code just hit 1.0 Preview 🚀\n\n' +
'📦 Native binaries: macOS/Linux/Windows — NO Node.js required\n' +
'🔌 Multi-provider: Qwen, Qoder, OR any OpenAI-compatible endpoint (Ollama, OpenRouter, local)\n' +
'🔄 Session resumption: --resume flag survives reboots, crashes, CI timeouts\n' +
'⚡ Non-interactive mode: scriptable agents for CI/CD, automation, nightly scans\n' +
'✅ Zero breaking changes from v0.27.x — all managed agent features intact\n\n' +
'Full breakdown with install commands: ' + ARTICLE + '\n\n' +
'#QwenCode #AICodingAgent #OpenSource #DeveloperTools #NativeBinary #MultiProvider #Automation #AIEngineering',
    link: ARTICLE,
    metadata: { format: 'release-update', tool: 'qwen-code', version: '1.0.0-preview' },
  },
  {
    // LinkedIn: personal take, no links in body
    caption:
"I've been tracking Qwen Code since v0.20. v1.0.0-preview (Nov 11, 2026) is the milestone that turns this from 'great CLI agent' into 'platform you can ship in production.'\n\n" +
"Twenty-seven patches since v0.26.0 (Oct 21). Every patch: production hardening. Zero breaking changes.\n\n" +
"**The distribution breakthrough:**\n\n" +
"**Native binaries = zero dependency friction.** No Node, no npm, no version conflicts, no global prefix wars. `curl | sh` and you're running. For teams onboarding juniors, for CI pipelines, for air-gapped environments — this changes the adoption curve from 'configure your dev environment' to 'download and run.'\n\n" +
"**Multi-provider = no vendor lock-in.** Qwen models, Qoder models, OR any OpenAI-compatible endpoint (Ollama, LM Studio, vLLM, OpenRouter, custom proxy). Enterprise runs fully on-prem. Cost optimizers route to cheapest provider per task. Privacy teams keep data local.\n\n" +
"**Session resumption = agents that survive reality.** Long refactors, overnight CI, flaky networks — `--resume <session-id>` picks up exactly where it left off. Full history, tool results, pending questions, subagent state. Non-interactive mode means your build pipeline invokes Qwen Code as a first-class CLI citizen.\n\n" +
"**Everything from v0.27 works unchanged:** Managed agents with multi-child approval chains. Web Shell with Q&A heatmap + WeChat/QQ/Email channels. Mods plugin system with `$.model.complete`, `ui.render`, `$.store`. GitHub channel repo allowlists/blocklists. Daemon PR watch. Skill import. 240-min autofix budget. CRLF/Unicode-safe shell. Credential sanitization. Team-scale runtime performance.\n\n" +
"The v0.26→v1.0 trajectory is unique:\n" +
"v0.20-0.23 → Single-agent CLI, great at coding\n" +
"v0.24.6 → Managed runtime (durable sessions, failover, advisor)\n" +
"v0.25.0 → Platform (workspace agents, Mem0, A2A, private MCP, cold restore, broker auth)\n" +
"v0.26.0 → Operable platform (desktop, SSH workspaces, --check preflight, systemd units)\n" +
"v0.26.1-9 → Production hardening (9 patches, 500+ fixes, subscription auth, TUI, WebShell, skill infrastructure, TS SDK)\n" +
"v0.27.0-2 → Multi-question agents, visual oversight, repo governance, team-scale concurrency\n" +
"v1.0.0-preview → **Distribution milestone** (native binaries, multi-provider, resumable, scriptable)\n\n" +
"No rewrites. No \"v2 coming soon.\" Just steady compounding.\n\n" +
"Now: a local-first multi-agent platform that installs like `curl | sh`, runs like a native binary, connects to any model provider, survives reboots, and slots into your automation pipeline.\n\n" +
"The question isn't \"which agent should I use?\" It's \"why would I pay for a cloud agent platform when this runs locally, free, with my data on my machine, with an SDK to embed in my products, with the approval infrastructure to operate at enterprise scale, and now with zero-dependency distribution?\"\n\n" +
"Full article with install commands on terminalblog.\n\n" +
"#QwenCode #AICodingAgent #OpenSource #DeveloperTools #NativeBinary #MultiProvider #Automation #AIEngineering #Platform #LocalFirst",
    metadata: { format: 'personal-take', platform: 'linkedin', tool: 'qwen-code', version: '1.0.0-preview' },
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