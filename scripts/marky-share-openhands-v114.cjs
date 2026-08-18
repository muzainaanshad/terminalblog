#!/usr/bin/env node
// Share the OpenHands v1.14 release via MyMarky (X + LinkedIn)
const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const KEY = 'mk_live_2HrW1PDCF5i4rMu809NIDtvxtu0-rdnZOGURht6RWmE';
const API = 'https://api.mymarky.ai/api/businesses/' + BIZ_ID + '/posts';
const HEADERS = { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' };
const ARTICLE = 'https://terminalblog.com/blog/openhands-1-14-git-sync-free-kimi-breakthrough/';

const POSTS = [
  {
    // X/Twitter: key takeaways + link
    caption:
'OpenHands 1.14 just dropped the Git Sync button we\'ve all been begging for — AND made Kimi K3 free by default in Canvas. 🎯\n\n' +
'🔄 Git Sync page in Automations — diff review, branch switch, commit+push without leaving the agent\n' +
'🆓 Kimi K3 (Moonshot\'s top reasoning model) now DEFAULT in Canvas — FREE, no API key, no credit card\n' +
'✈️ LLM pre-flight validation — catches auth/endpoint/capability errors BEFORE they burn a session\n' +
'📋 Structured error cards — tells you WHAT failed, if it\'s recoverable, and token cost impact\n' +
'🔗 Deep-links preserve backend scope — share exact session turns across cloud backends\n' +
'📁 Full workspace tree in Files tab — no more 100-entry truncation on cloud\n\n' +
'84k stars, MIT licensed, runs anywhere. Full breakdown + quick-starts: ' + ARTICLE + '\n\n' +
'#OpenHands #AICodingAgent #OpenSource #GitSync #FreeModels #DeveloperTools #KimiK3',
    link: ARTICLE,
    metadata: { format: 'release-update', tool: 'openhands', version: '1.14' },
  },
  {
    // LinkedIn: personal take, no links in body
    caption:
'I\'ve been tracking OpenHands since it passed 80k stars. v1.14 (released August 17) fixes the two biggest friction points in agent workflows: Git context-switching and model access barriers.\n\n' +
'The Git Sync page sounds simple — diff, commit, push, branch switch from the Automations tab. But anyone who\'s used an agent daily knows the pain: finish a task, alt-tab to terminal, git status, git add, git commit -m "fix auth", git push, gh pr create. Every switch breaks flow.\n\n' +
'Now the agent stages, shows you the diff, you approve, it pushes. You stay in the conversation. The PR description writes itself from session context. For teams, every sync is auditable — which session, which user, what changed.\n\n' +
'The quieter revolution: Canvas now defaults to Kimi K3, tagged FREE. That\'s a 1M-context reasoning model (Moonshot\'s latest) with zero inference cost on OpenHands Cloud. No BYOK. No billing surprise. A student starts today, builds a real feature, pays nothing.\n\n' +
'On top of v1.13\'s context meter, artifact previews, and conversation archive — v1.14 adds:\n\n' +
'**Pre-flight validation** — saves an LLM profile, it probes auth, tool calling, context window. 2 seconds. Green = go. Red = exact fix needed. No more 45-minute runs dying at minute 3 from a bad key.\n\n' +
'**Structured errors** — not stack traces. Cards showing error type (auth/rate-limit/context-overflow), recoverable yes/no, suggested action, tokens consumed. You decide: retry or fix.\n\n' +
'**Full file tree on cloud** — the 100-entry truncation is gone. Monorepo users, rejoice.\n\n' +
'OpenHands is the only major agent where you start free, with production models, and graduate to BYOK/self-hosted without switching tools. v1.14 makes that journey frictionless.\n\n' +
'Full article with Docker and Cloud quick-starts on terminalblog.\n\n' +
'#OpenHands #AICodingAgent #OpenSource #GitSync #FreeModels #AIEngineering #KimiK3 #DeveloperTools',
    metadata: { format: 'personal-take', platform: 'linkedin', tool: 'openhands', version: '1.14' },
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