#!/usr/bin/env node
// Share Qwen Code v0.26.9 via MyMarky (X + LinkedIn)
const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const KEY = 'mk_live_2HrW1PDCF5i4rMu809NIDtvxtu0-rdnZOGURht6RWmE';
const API = 'https://api.mymarky.ai/api/businesses/' + BIZ_ID + '/posts';
const HEADERS = { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' };
const ARTICLE = 'https://terminalblog.com/blog/qwen-code-v0-26-9-skills-daemon-api-typescript-sdk/';

const POSTS = [
  {
    // X/Twitter: key takeaways + link
    caption:
'Qwen Code v0.26.9 just made Skills industrial-grade. 8th patch in 16 days. 🚀\n\n' +
'📦 Bulk skill activation: 1-100 skills in ONE API call (PUT /skills/activation)\n' +
'🔌 Daemon APIs: Large ZIP uploads with receipts — install fails? Query receipt, resume\n' +
'📝 TypeScript SDK: Programmatic installs from File, Blob, bytes, or host path\n' +
'🌐 WebShell upload: Drag-drop skill ZIPs, see daemon limits, check uncertain results\n' +
'❓ Durable questions: Managed agents pause for structured human input, survive restarts\n' +
'⚡ Automation ON by default: CI/CD managed runs work out of the box\n' +
'🚀 Perf: Activation renewals faster, tenant locks removed, history cached = team-scale speed\n' +
'✅ Zero breaking changes. v0.26 platform = production-hardened.\n\n' +
'Full breakdown with upgrade steps: ' + ARTICLE + '\n\n' +
'#QwenCode #AICodingAgent #OpenSource #DeveloperTools #TypeScript #Automation #AIEngineering #Skills',
    link: ARTICLE,
    metadata: { format: 'release-update', tool: 'qwen-code', version: '0.26.9' },
  },
  {
    // LinkedIn: personal take, no links in body
    caption:
"I've been tracking Qwen Code since v0.20. v0.26.9 (Nov 6, 2026) is the release that proves this isn't just an agent — it's a platform you can build on.\n\n" +
"Nine patches in sixteen days since v0.26.0 (Oct 21). Every patch: production hardening. Zero breaking changes.\n\n" +
"**The compound effect:**\n\n" +
"**Skills are now infrastructure.** PUT /skills/activation handles 1-100 skills in one call. New dev joins? One API call provisions their full skill set. CI/CD pipeline? `qwen-code skill activate --config team-skills.json`. Environment parity? Version-controlled skill configs applied identically across dev/staging/prod. Rollback? Disable 50 skills in one call.\n\n" +
"**Daemon APIs with receipts.** Large skills (ML models, heavy binaries) no longer hit upload limits. Disk-based ZIP handling with recovery-backup protection. Install fails? Query the receipt — know exactly what succeeded, what didn't, resume from there.\n\n" +
"**TypeScript SDK — the integration layer.** First-class support for installing Skill ZIPs from File, Blob, bytes, or host path. Full TypeScript types. Same SDK works browser (File/Blob) and Node (fs paths). Build internal platforms, IDE extensions, CLI wrappers. This is the API that lets Qwen Code become a platform, not just a tool.\n\n" +
"**WebShell skill upload.** Non-technical team members drag-drop ZIPs. Daemon size limits displayed. Installation progress shown. Uncertain results? \"Check Result\" button queries the receipt.\n\n" +
"**Durable structured questions.** Managed agents pause, present structured questions (choices, text, files), persist them, resume when answered — even across restarts. Human-in-the-loop at scale: \"Deploy to prod? [yes/no/dry-run]\" survives agent restart. Full audit trail. Multi-step approval chains.\n\n" +
"**Automation enabled by default.** `qwen-code run --managed \"nightly refactor\"` just works. Zero config. Cron, GitHub Actions, GitLab CI all trigger managed runs without extra setup.\n\n" +
"**Performance at team scale.** Activation renewals faster. Tenant guard locks removed from journal snapshots = throughput up, contention down. Session history message bodies cached per process = hosted turns faster. 20+ concurrent workspaces feel snappy.\n\n" +
"The v0.26 trajectory is unique:\n" +
"v0.20-0.23 → Single-agent CLI, great at coding\n" +
"v0.24.6 → Managed runtime (durable sessions, failover, advisor)\n" +
"v0.25.0 → Platform (workspace agents, Mem0, A2A, private MCP, cold restore, broker auth, models.dev catalog)\n" +
"v0.26.0 → Operable platform (desktop, SSH workspaces, --check preflight, systemd units)\n" +
"v0.26.1-9 → Production hardening (9 patches, 500+ fixes, subscription auth, TUI shared loop, WebShell, skill infrastructure, TS SDK)\n\n" +
"No rewrites. No \"v2 coming soon.\" Just steady compounding.\n\n" +
"Now: a local-first multi-agent platform with industrial-grade skill management, TypeScript SDK for embedders, traceable WebShell, team-scale concurrency, and unified subscription auth.\n\n" +
"The question isn't \"which agent should I use?\" It's \"why would I pay for a cloud agent platform when Qwen Code runs the same patterns locally, free, with my data on my machine, with an SDK to embed it in my own products, and now with the skill infrastructure to operate it at enterprise scale?\"\n\n" +
"Full article with upgrade steps on terminalblog.\n\n" +
"#QwenCode #AICodingAgent #OpenSource #DeveloperTools #TypeScript #Automation #AIEngineering #Skills #Platform",
    metadata: { format: 'personal-take', platform: 'linkedin', tool: 'qwen-code', version: '0.26.9' },
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