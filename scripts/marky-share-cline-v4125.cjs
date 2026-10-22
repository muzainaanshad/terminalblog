#!/usr/bin/env node
// Share the Cline v4.1.25 article via MyMarky (X + LinkedIn).
// Usage: node scripts/marky-share-cline-v4125.cjs
const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const KEY = 'mk_live_2HrW1PDCF5i4rMu809NIDtvxtu0-rdnZOGURht6RWmE';
const API = `https://api.mymarky.ai/api/businesses/${BIZ_ID}/posts`;
const HEADERS = { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' };
const ARTICLE = 'https://terminalblog.com/blog/cline-v4-1-25-cloud-sessions-github-remote/';

const POSTS = [
  {
    // X/Twitter: key takeaways + link
    caption:
`Cline v4.1.25 just let your agent run on GitHub repos while you sleep ☁️💤

Cloud Sessions (gradual rollout):
• Pick any GitHub repo + branch
• Agent runs in hosted sandbox
• Keeps running after you close editor
• Notifies when done
• Full history in Recent/History panel

Plus: Gemini 4 Argon new default, local model 5-min timeout FIXED, OpenAI-compatible URLs no longer get /v1 silently added.

Full breakdown: ${ARTICLE}
#Cline #AICodingAgents #Cloud #GitHub #RemoteAgents`,
    link: ARTICLE,
    metadata: { format: 'release-guide', tool: 'cline', version: 'v4.1.25' },
  },
  {
    // LinkedIn: personal take, no links in body
    caption:
`Cline v4.1.25 introduces Cloud Sessions — and it changes where your agent runs.

Pick a GitHub repo and branch. Cline spins up a hosted sandbox. Your agent runs the task there. You get notified when it's done. The session persists after you close VS Code, JetBrains, or the desktop app.

This is "GitHub Actions for your coding agent" — but you don't write YAML. You just say "fix the auth bug on the login-refactor branch" and Cline Cloud does it.

Also in this release: Gemini 4 Argon becomes the default model (free upgrade if you use Cline's built-in provider), local models (Ollama/LM Studio) no longer timeout after 5 minutes on large contexts, and OpenAI-compatible base URLs are used exactly as entered.

The model catalog refreshed to 7,041 models with new providers (Boundless, Standard Compute).

Beginner-friendly breakdown on terminalblog.

#Cline #AICodingAgents #CloudComputing #GitHub #DevTools #RemoteDevelopment`,
    metadata: { format: 'personal-take', platform: 'linkedin', tool: 'cline', version: 'v4.1.25' },
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
      console.log(`Post ${i + 1}: HTTP ${r.status} | id=${results[i].id} | sched=${scheduled}`);
    } catch (e) {
      results.push({ i: i + 1, http: 0, id: 'ERROR', error: String(e) });
      console.log(`Post ${i + 1}: ERROR ${e}`);
    }
  }
  console.log('SUMMARY:', JSON.stringify(results, null, 1));
})().catch((e) => { console.error('Fatal:', e); process.exit(1); });