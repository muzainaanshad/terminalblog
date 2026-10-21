#!/usr/bin/env node
// Share the OpenHands v1.29 release via MyMarky (X + LinkedIn)
const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const KEY = 'mk_live_2HrW1PDCF5i4rMu809NIDtvxtu0-rdnZOGURht6RWmE';
const API = 'https://api.mymarky.ai/api/businesses/' + BIZ_ID + '/posts';
const HEADERS = { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' };
const ARTICLE = 'https://terminalblog.com/blog/openhands-v1-29-agent-profiles-finally-own-their-settings/';

const POSTS = [
  {
    // X/Twitter: key takeaways + link in reply
    caption:
`OpenHands v1.29 just made Agent Profiles SOVEREIGN. Each profile now owns its ENTIRE stack: skills, condenser, verification, Model Router. 🎯

🛠️ Skills per profile from server catalog — coding profile gets git-automation, review gets security-audit
🧠 Condenser + verification per profile — aggressive compaction for coding, full history for audit
🤖 Model Router per profile — premium router for architecture, cost-optimized for research
🔗 Launch "default" by ID — scripts survive renames
🔐 v1.28 bonus: agent-requested secrets inline in chat, reading-pace streaming, Bahasa Indonesia locale

Zero breaking changes. 20+ fixes. Full breakdown: ${ARTICLE}

#OpenHands #AICodingAgent #AgentProfiles #OpenSource #DeveloperTools #AIEngineering`,
    link: ARTICLE,
    metadata: { format: 'release-update', tool: 'openhands', version: '1.29' },
  },
  {
    // LinkedIn: personal take, no links in body
    caption:
`I've been tracking OpenHands since v1.24 dropped the Agent Canvas architecture. v1.29 (released Oct 20) is the release that finally delivers on the promise: **profiles as independent workspaces.**

Before: you created "coding," "review," "research" profiles. They had different names and avatars. But they SHARED the same skills, same model router, same condenser. Switching profiles changed the label — not the behavior.

Now: each profile owns its stack.

Your "coding-agent" profile:
├── Skills: OpenHands, verify-openhands, git-automation
├── Model Router: "coding-premium" (Opus 5.5 + GPT-6)
├── Condenser: Aggressive (compact every 8 turns)
└── Verification: Daily pass

Your "security-review" profile:
├── Skills: verify-openhands, security-audit, sbom-generator
├── Model Router: "reasoning-heavy" (o3 + Sonnet 5.5)
├── Condenser: Minimal (keep 50 turns)
└── Verification: Pre-deploy scan

Your "research-assistant" profile:
├── Skills: pi-acp, web-search, deep-research
├── Model Router: "cost-optimized" (Nemotron 3 Ultra + Qwen3-Coder)
├── Condenser: Balanced
└── Verification: Weekly

You configure ONCE. Switch profiles. Behavior follows. This is what "control plane for all agents" actually looks like.

Bonus from v1.28 (released 24 hours earlier):
• Agent-requested secrets — agent asks mid-chat, card appears, you approve, secret attaches to THAT conversation only (value never in chat)
• Reading-pace streaming — long answers arrive at ~250 wpm with word fade-in, no more wall-of-text overwhelm
• Bahasa Indonesia locale — full UI translation, not Google Translate artifacts
• Azure DevOps: repos from ALL orgs, not just the first
• Missing runtime = archived cleanly

OpenHands isn't building an agent. It's building the control plane where every agent, every model, every skill, and every workflow has a home. v1.29 makes profiles sovereign.

Full article with setup steps on terminalblog.

#OpenHands #AICodingAgent #AgentProfiles #OpenSource #AIEngineering #DeveloperTools #ControlPlane`,
    metadata: { format: 'personal-take', platform: 'linkedin', tool: 'openhands', version: '1.29' },
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
      console.log('Post ' + (i + 1) + ': HTTP ' + r.status + ' | id=' + results[i].id + ' | sched=' + scheduled);
    } catch (e) {
      results.push({ i: i + 1, http: 0, id: 'ERROR', error: String(e) });
      console.log('Post ' + (i + 1) + ': ERROR ' + e);
    }
  }
  console.log('SUMMARY:', JSON.stringify(results, null, 1));
})().catch((e) => { console.error('Fatal:', e); process.exit(1); });