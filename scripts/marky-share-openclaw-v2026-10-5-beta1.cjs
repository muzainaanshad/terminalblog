#!/usr/bin/env node
// Share the OpenClaw 2026.10.5-beta.1 release via MyMarky (X + LinkedIn)
const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const KEY = 'mk_live_2HrW1PDCF5i4rMu809NIDtvxtu0-rdnZOGURht6RWmE';
const API = 'https://api.mymarky.ai/api/businesses/' + BIZ_ID + '/posts';
const HEADERS = { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' };
const ARTICLE = 'https://terminalblog.com/blog/openclaw-v2026-10-5-beta1-safer-updates-restart-safe-conversations/';

const POSTS = [
  {
    // X/Twitter: key takeaways + link
    caption:
'OpenClaw 2026.10.5-beta.1 just solved the update nightmare. 🛠️\n\n' +
'✅ Updates survive interrupted activations, Windows elevation prompts, laptop sleep — recover instead of strand\n' +
'✅ Conversations survive Gateway restarts — interrupted turns resume, user input preserved, deferred tasks wake up\n' +
'✅ Gateway reads move to worker threads — busy Gateways stay responsive under load\n' +
'✅ Subagent turns recover from stalled streams, expired websockets — results persist through follow-ups/restarts\n' +
'✅ X/Twitter channel plugin — answer mentions via Activity API streaming, guest mode, enforced cost limits\n' +
'✅ Voice calls upgraded — per-call briefs, reports, live steering, callbacks, voicemail detection\n' +
'✅ Smarter model pickers — provider-recommended models first, new models auto-appear without OpenClaw release\n' +
'✅ ClawHub in Gateway — browse/install plugins & skills without leaving the UI\n\n' +
'200+ contributors. This beta makes the *entire platform* reliable. Full breakdown: ' + ARTICLE + '\n\n' +
'#OpenClaw #AICodingAgent #OpenSource #Beta #Reliability #DeveloperTools #MCP #VoiceAI',
    link: ARTICLE,
    metadata: { format: 'release-update', tool: 'openclaw', version: '2026.10.5-beta.1' },
  },
  {
    // LinkedIn: personal take, no links in body
    caption:
'I\'ve watched OpenClaw evolve from a promising gateway to production infrastructure. 2026.10.5-beta.1 (released Oct 11) is the release that finally makes it trustworthy for real workloads.\n\n' +
'The headline isn\'t a feature — it\'s the elimination of operational nightmares:\n\n' +
'**Updates that don\'t strand you.** Everyone who\'s managed infrastructure knows the pain: update starts, something interrupts (elevation prompt, network, sleep), and you\'re left with a broken install that blocks future updates. This beta fixes that — updates recover from interrupted activations, stale leases, filesystem chaos.\n\n' +
'**Conversations that survive restarts.** Gateway restarts (crash, update, maintenance) used to mean lost in-flight turns, vanished user messages, abandoned background tasks. Now everything resumes — the turn continues, the message delivers, the task wakes up.\n\n' +
'**Gateway that scales with you.** Session/transcript/history reads move to worker threads with far less SQLite work per turn. Startup maintenance runs after readiness. Your Gateway stays responsive even under real load.\n\n' +
'**Subagents that don\'t lose results.** Stalled streams, reused tool-call IDs, expired websockets — turns recover. Results persist through follow-ups, restarts, expired delivery windows. For teams running multi-agent workflows, this is the difference between "works in demo" and "works in production."\n\n' +
'The quieter wins compound daily:\n\n' +
'**X/Twitter channel.** Stream mentions directly into OpenClaw. Guest mode for repo questions with hidden helpers. Verified writers only. Hard API cost limits.\n\n' +
'**Voice calls as first-class collaboration.** Per-call briefs, full reports with action items, live steering, callbacks, voicemail detection. Voice becomes a channel, not a side conversation.\n\n' +
'**Model pickers that think.** Provider-recommended models first. New Claude/ChatGPT/Ollama models appear automatically — no OpenClaw release wait.\n\n' +
'**ClawHub in Gateway.** Browse, search, install plugins & skills. Auto-picks newest compatible release. No browser tabs, no version matching.\n\n' +
'OpenClaw has always had the architecture: local-first, cross-platform, plugin-extensible. 2026.10.5-beta.1 adds the operational maturity to match. If you run agents in production — test this beta in staging.\n\n' +
'Full article with verification steps on terminalblog.\n\n' +
'#OpenClaw #AICodingAgent #OpenSource #DeveloperTools #AIEngineering #MCP #Reliability #VoiceAI',
    metadata: { format: 'personal-take', platform: 'linkedin', tool: 'openclaw', version: '2026.10.5-beta.1' },
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