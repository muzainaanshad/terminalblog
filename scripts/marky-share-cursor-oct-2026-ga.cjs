#!/usr/bin/env node
// Share Cursor October 6 update (Projects GA + 2 new enterprise bots) via MyMarky (X + LinkedIn)
const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const KEY = 'mk_live_2HrW1PDCF5i4rMu809NIDtvxtu0-rdnZOGURht6RWmE';
const API = 'https://api.mymarky.ai/api/businesses/' + BIZ_ID + '/posts';
const HEADERS = { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' };
const ARTICLE = 'https://terminalblog.com/blog/cursor-projects-rollouts-security-review-september-2026/';

const POSTS = [
  {
    // X/Twitter: key takeaways + link
    caption:
      'Cursor just went GA with Projects + launched 2 new enterprise bots 🚀\n\n' +
      'October 6 update adds:\n\n' +
      '1. PROJECTS GA — Coordinator agents now fully released to all users. No more beta waitlist. Define goal → fleet handles the how.\n\n' +
      '2. ROLLOUT BOT — Automates canary analysis, feature flag coordination, staged rollout management. Extends Rollouts.\n\n' +
      '3. SECURITY REVIEW BOT — Auto-remediates common exploit findings, enforces custom rules, generates compliance reports. Extends Security Review.\n\n' +
      '4. BOT DEVELOPMENT KIT — Build your own agents that integrate natively with Cursor\'s orchestration layer. Same kit powering Firetiger Change Monitors.\n\n' +
      'The IDE is now just one client. The real product: orchestration platform you can extend.\n\n' +
      'Full breakdown: ' + ARTICLE + '\n\n' +
      '#Cursor #AIAgents #CodingAgents #DevTools #SoftwareEngineering #PlatformEngineering',
    link: ARTICLE,
    metadata: { format: 'release-update', tool: 'cursor', version: 'oct-2026-ga' },
  },
  {
    // LinkedIn: personal take, no links in body
    caption:
      "Cursor's October 6 update isn't just features — it's the platform opening up.\n\n" +
      "Projects graduated to GA. Coordinator agents that plan, delegate to thousands of subagents, and maintain shared context across months — now available to all Teams/Enterprise users (rolling to Pro).\n\n" +
      "But the bigger signal: two new enterprise bots built on the Bot Development Kit:\n\n" +
      "🎯 ROLLOUT BOT — Takes Rollouts to the next level: automated canary analysis, feature flag coordination, staged rollout management. The \"last mile of shipping code\" just got an agent.\n\n" +
      "🔒 SECURITY REVIEW BOT — Doesn't just find exploits (injection, auth bypass, secrets, SSRF, unsafe deserialization). It auto-remediates common patterns, enforces your custom rules as code, generates compliance reports.\n\n" +
      "🛠️ BOT DEVELOPMENT KIT — This is the platform play. The same framework powering Firetiger Change Monitors is now available for teams to build custom agents that plug into the orchestration layer natively.\n\n" +
      "The architecture convergence is complete: plan → delegate → deploy → monitor → secure → EXTEND. The IDE is one client. The orchestration layer is the product. And now teams can build their own agents on it.\n\n" +
      "If you're on Teams/Enterprise: enable Rollouts + Security Review (10 days free credits), try Projects on a real migration, explore the Bot Dev Kit.\n\n" +
      "#AI #CodingAgents #Cursor #SoftwareEngineering #DevTools #Security #DevOps #PlatformEngineering #AgentOrchestration",
    metadata: { format: 'personal-take', platform: 'linkedin', tool: 'cursor', version: 'oct-2026-ga' },
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