#!/usr/bin/env node
// Share Cursor September 2026 wave via MyMarky (X + LinkedIn)
const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const KEY = 'mk_live_2HrW1PDCF5i4rMu809NIDtvxtu0-rdnZOGURht6RWmE';
const API = 'https://api.mymarky.ai/api/businesses/' + BIZ_ID + '/posts';
const HEADERS = { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' };
const ARTICLE = 'https://terminalblog.com/blog/cursor-projects-rollouts-security-review-september-2026/';

const POSTS = [
  {
    // X/Twitter: key takeaways + link
    caption:
'Cursor just became an agent fleet manager 🚀\\n\\n' +
'September 2026 wave drops FOUR major features:\\n\\n' +
'1. PROJECTS — Coordinator agents that plan work, delegate to 1000s of subagents, maintain shared context across months. Runs while laptop closed.\\n\\n' +
'2. ROLLOUTS — Deployment monitoring that watches every PR through deploy, detects regressions, OPENS REVERT PRS automatically.\\n\\n' +
'3. SECURITY REVIEW — Scans every PR for exploitable bugs (injection, auth bypass, secrets, SSRF, unsafe deserialization). Enforces team security rules as code.\\n\\n' +
'4. SELF-HOSTED MACHINES — Run agents on YOUR infra (AWS Lambda, Vercel, Modal, your VMs). Code/secrets never leave your network.\\n\\n' +
'Plus: "Start from scratch" — cloud agents without GitHub, live preview, one-click Vercel publish.\\n\\n' +
'The IDE is now just one client. The real product is the orchestration layer.\\n\\n' +
'Full breakdown: ' + ARTICLE + '\\n\\n' +
'#Cursor #AIAgents #CodingAgents #DevTools #SoftwareEngineering',
    link: ARTICLE,
    metadata: { format: 'release-update', tool: 'cursor', version: 'sep-2026-wave' },
  },
  {
    // LinkedIn: personal take, no links in body
    caption:
'Cursor\'s September 2026 wave isn\'t a feature update — it\'s a role change. The editor that started as "VS Code with better autocomplete" just shipped an agent orchestration platform.\\n\\n' +
'Four features that redefine what Cursor is:\\n\\n' +
'🎯 PROJECTS — A coordinator agent that plans work, spawns thousands of subagents in parallel, and maintains shared context that grows across months. You define the goal; the fleet handles the how.\\n\\n' +
'🛡️ ROLLOUTS — Deployment monitoring that actually watches your changes through production. Writes a monitoring plan on PR open, runs it on every deploy, detects regressions per environment, and opens revert PRs for review. No more "who\'s watching prod?"\\n\\n' +
'🔒 SECURITY REVIEW — Automated exploit detection on every PR. Not style. Not quality. Exploits: SQL/command/template injection, auth bypasses, committed secrets, SSRF, unsafe deserialization, vulnerable dependency updates. Each finding includes attack path + proposed fix. Team rules enforce your security policy as code.\\n\\n' +
'🏠 SELF-HOSTED MACHINES — Your code, builds, and secrets stay on your infrastructure. Run agents on AWS Lambda, Vercel, Modal, Daytona, your own VMs. Computer use (click, type, screenshot, browser) on Linux/Mac self-hosted workers.\\n\\n' +
'The architecture bet is clear: unified orchestration layer across plan → delegate → deploy → monitor → secure. The IDE is just one client.\\n\\n' +
'This is the same convergence Google Antigravity and OpenHands are betting on. The category isn\'t "AI editor" anymore — it\'s "agent orchestration platform."\\n\\n' +
'If you\'re on Teams/Enterprise, enable Rollouts and Security Review today (free credits for 10 days). Try Projects on a real migration.\\n\\n' +
'#AI #CodingAgents #Cursor #SoftwareEngineering #DevTools #Security #DevOps #PlatformEngineering',
    metadata: { format: 'personal-take', platform: 'linkedin', tool: 'cursor', version: 'sep-2026-wave' },
  },
];

(async () => {
  const now = Date.now();
  const results = [];
  for (let i = 0; i < POSTS.length; i++) {
    const p = POSTS[i];
    const scheduled = new Date(now + (5 + i * 60) * 60000).toISOString();
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