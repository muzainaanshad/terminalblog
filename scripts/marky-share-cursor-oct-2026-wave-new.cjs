#!/usr/bin/env node
// Share Cursor October 2026 wave via MyMarky (X + LinkedIn)
const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const KEY = 'mk_live_2HrW1PDCF5i4rMu809NIDtvxtu0-rdnZOGURht6RWmE';
const API = 'https://api.mymarky.ai/api/businesses/' + BIZ_ID + '/posts';
const HEADERS = { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' };
const ARTICLE = 'https://terminalblog.com/blog/cursor-october-2026-wave/';

const POSTS = [
  {
    // X/Twitter: key takeaways + link
    caption:
      'Cursor October wave: Projects GA + Cloud Agents + Origin Marketplace + iOS Remote Control + 2 enterprise bots 🚀\n\n' +
      'In 3 weeks, 5 major releases:\n\n' +
      '1. PROJECTS GA — Coordinator agents plan, delegate to 1000s of subagents, maintain shared context across months. No more onboarding agents per task.\n\n' +
      '2. CLOUD AGENTS + CANVASES — Interactive artifacts (dashboards, diagrams, test reports) not just code diffs. Environments API beta. 300 repos, 5x faster.\n\n' +
      '3. ORIGIN APP MARKETPLACE — 20+ integrations (Vercel, Cloudflare, Linear, Sentry, Semgrep, CodeRabbit...). Open to public submissions.\n\n' +
      '4. iOS REMOTE CONTROL — See/reply to local agents from phone. Computer stays on, app connects. No cloud agents required.\n\n' +
      '5. ROLLOUTS + SECURITY REVIEW BOTS — Deployment monitoring with auto-revert PRs. Security review catches exploits (injection, auth bypass, secrets, SSRF) with auto-remediation.\n\n' +
      'The IDE is just one client. The platform is orchestration.\n\n' +
      'Full breakdown: ' + ARTICLE + '\n\n' +
      '#Cursor #AIAgents #CodingAgents #DevTools #SoftwareEngineering #PlatformEngineering',
    link: ARTICLE,
    metadata: { format: 'release-update', tool: 'cursor', version: 'oct-2026-wave' },
  },
  {
    // LinkedIn: personal take, no links in body
    caption:
      "Cursor's October 2026 wave completes the platform transformation.\n\n" +
      "Five releases in three weeks — each one a platform primitive:\n\n" +
      "🎯 PROJECTS GA — Coordinator agents that plan, delegate to thousands of subagents, maintain shared context that compounds across months. You define the outcome; the fleet handles the how.\n\n" +
      "☁️ CLOUD AGENTS + CANVASES — Agents build interactive artifacts: live dashboards, architecture diagrams, API explorers. Not text. Artifacts you share via link. Environments support 300 repos, load 5x faster.\n\n" +
      "🔌 ORIGIN APP MARKETPLACE — 20+ integrations across deploy, CI, review, security, monitoring. Vercel, Cloudflare, Linear, Sentry, Semgrep, CodeRabbit... Open submissions mean the ecosystem builds itself.\n\n" +
      "📱 iOS REMOTE CONTROL — Your local agents, in your pocket. Approve, steer, message from iOS. Computer stays awake, agents keep running. No cloud dependency.\n\n" +
      "🤖 ROLLOUTS + SECURITY REVIEW — Two bots for the last mile of shipping. Rollouts: monitoring plans on PR open, deploy tracking per environment, auto-revert PRs. Security Review: exploit detection (injection, auth bypass, secrets, SSRF, unsafe deserialization, vulnerable deps) with attack paths + fixes + team rules as code.\n\n" +
      "The convergence is done: plan → delegate → build → deploy → monitor → secure → EXTEND (Bot Dev Kit). The IDE is one client. The orchestration layer is the product.\n\n" +
      "If you're on Teams/Enterprise: enable Rollouts + Security Review (10 days free credits), run a real migration in Projects, explore the Marketplace.\n\n" +
      "#AI #CodingAgents #Cursor #SoftwareEngineering #DevTools #Security #DevOps #PlatformEngineering #AgentOrchestration",
    metadata: { format: 'personal-take', platform: 'linkedin', tool: 'cursor', version: 'oct-2026-wave' },
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