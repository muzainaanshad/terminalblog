#!/usr/bin/env node
// Share Hermes Agent v0.20.3 release via MyMarky (X + LinkedIn)
const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const KEY = 'mk_live_2HrW1PDCF5i4rMu809NIDtvxtu0-rdnZOGURht6RWmE';
const API = 'https://api.mymarky.ai/api/businesses/' + BIZ_ID + '/posts';
const HEADERS = { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' };
const ARTICLE = 'https://terminalblog.com/blog/hermes-agent-v0-20-3-patch-mcp2-bot-mode-commandcode/';

const POSTS = [
  {
    // X/Twitter: key takeaways + link
    caption:
'Hermes Agent v0.20.3 just dropped — HOURS after v0.20.2. 125 PRs in ONE DAY. 🚀\n\n' +
'🔌 MCP 2.x SDK + stateless protocol (2026-07-28 spec) — future-proofed\n' +
'🤖 Bot Mode (hermes-bots) plugin bundled — core teammate protocol for agent swarms\n' +
'⚙️ CommandCode provider plugin — new model routing option\n' +
'🐍 Python runtime hardening — PYTHONHOME/PYTHONPATH isolation = no more cross-contamination\n' +
'🖥️ Cua Driver 0.20 — standardized computer use (GUI automation) runtime contracts\n' +
'⏰ Cron self-heal — EMFILE recovery, stale claim reconciliation, wedged job re-arm\n' +
'🔗 Desktop remote-gateway headers + connection self-healing\n' +
'📦 Session handoff data-loss fixes + plugin security scanning + /worktree + /rollback\n\n' +
'v0.20.x velocity: 3 patches, 1,178 PRs, 4 days. Full breakdown: ' + ARTICLE + '\n\n' +
'#HermesAgent #AICodingAgent #OpenSource #DeveloperTools #Terminal #MCP #AgentSwarm #ComputerUse #Automation',
    link: ARTICLE,
    metadata: { format: 'release-update', tool: 'hermes', version: '0.20.3' },
  },
  {
    // LinkedIn: personal take, no links in body
    caption:
'I\'ve been running Hermes Agent daily since the early days. v0.20.3 (released Aug 16, hours after v0.20.2) is the kind of release that makes you question what "patch" even means.\n\n' +
'One day after shipping 397 PRs in v0.20.2, the team dropped **125 more PRs** — ~250 commits across ~461 files. This isn\'t polish. This is capability disguised as a patch.\n\n' +
'The headline features tell the story:\n\n' +
'**MCP 2.x + stateless protocol.** Hermes now runs the latest MCP spec. Your MCP servers can be truly stateless — no persistent connections, serverless-ready, future-proofed.\n\n' +
'**Bot Mode (hermes-bots) bundled with teammate protocol.** This is the foundation for agent swarms. Multiple Hermes instances can discover each other, share context, delegate tasks peer-to-peer — no central orchestrator needed. Native multi-agent coordination.\n\n' +
'**CommandCode provider plugin.** Another BYOK model routing option added to the catalog.\n\n' +
'**Python runtime isolation.** PYTHONHOME/PYTHONPATH isolation means subprocess Python calls get clean environments. Eliminates the "works in shell, fails in agent" bug class entirely.\n\n' +
'**Cua Driver 0.20 for computer use.** Standardized, sandboxed GUI automation runtime contracts. The foundation for "operator" agents that can drive any desktop app, not just terminals.\n\n' +
'**Cron scheduler self-heal.** EMFILE recovery (auto-closes idle handles), stale claim reconciliation (detects and reclaims stuck jobs), wedged job re-arm (force-reset and reschedule). Background automation that survives load.\n\n' +
'**Desktop connection self-healing.** Custom headers for remote gateway auth, auto-reconnect with re-auth, session resume. No more "restart desktop" workflows.\n\n' +
'**Ecosystem scout wave:** Plugin install security scanning, `/worktree` command, `/rollback` preserving hand-edits, UTF-16 file reads, Gemini 3 tool-call ID preservation, Kanban worktree fixes, cron continuity flags.\n\n' +
'v0.20.x velocity context: 4 days. 3 patches. 1,178 PRs. The "Herald" features (voice, A2A, webhooks) now have THREE layers of hardening — plus entirely new infrastructure for what comes next.\n\n' +
'If you run Hermes, `hermes update` takes 30 seconds. The new capabilities unlock workflows that didn\'t exist this morning.\n\n' +
'Full article with update steps on terminalblog.\n\n' +
'#HermesAgent #AICodingAgent #OpenSource #DeveloperTools #Terminal #Automation #AIEngineering #MCP #AgentSwarm',
    metadata: { format: 'personal-take', platform: 'linkedin', tool: 'hermes', version: '0.20.3' },
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