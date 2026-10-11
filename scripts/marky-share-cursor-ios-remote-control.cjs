#!/usr/bin/env node
// Share Cursor iOS Remote Control via MyMarky (X + LinkedIn)
const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const KEY = 'mk_live_2HrW1PDCF5i4rMu809NIDtvxtu0-rdnZOGURht6RWmE';
const API = 'https://api.mymarky.ai/api/businesses/' + BIZ_ID + '/posts';
const HEADERS = { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' };
const ARTICLE = 'https://terminalblog.com/blog/cursor-ios-remote-control-local-agents/';

const POSTS = [
  {
    // X/Twitter: key takeaways + link
    caption:
'Cursor just let you control your coding agents from your phone 📱\n\n' +
'Oct 6 update: Remote Control for local agents via iOS app.\n\n' +
'✅ See running agents & live transcripts\n' +
'✅ Send messages, approve diffs, answer questions\n' +
'✅ Code NEVER leaves your machine — no cloud upload\n' +
'✅ No new billing — uses your existing Cursor plan\n' +
'✅ Your laptop just needs to stay on + online\n\n' +
'This is "agent supervision" without the privacy trade-offs of cloud compute.\n\n' +
'Full breakdown: ' + ARTICLE + '\n\n' +
'#Cursor #AIAgents #CodingAgents #RemoteWork #DevTools #SoftwareEngineering',
    link: ARTICLE,
    metadata: { format: 'release-update', tool: 'cursor', version: 'ios-remote-control' },
  },
  {
    // LinkedIn: personal take, no links in body
    caption:
"Cursor's October 6 update quietly shipped something I've been waiting for: remote control of LOCAL agents from your phone.\n\n" +
'Not cloud agents. Not "upload your codebase to our servers." Your agents run on YOUR laptop. Your code never leaves. You just get a window into them from anywhere.\n\n' +
'Why this matters more than cloud agents:\n\n' +
'🔒 **Privacy**: Code, secrets, env vars stay on your hardware\n' +
'💰 **Cost**: Your electricity bill, not per-minute cloud billing\n' +
'⚡ **Latency**: Local execution, remote UI only\n' +
'🛠 **Real environment**: Tests run on YOUR machine with YOUR configs\n' +
'🌙 **Offline-friendly**: Agent keeps running; you reconnect later\n\n' +
'Real workflows this unlocks:\n' +
'• Start a 3-hour refactor before leaving → check progress from the train → reply to "which API version?" from your phone → come home to a finished PR\n' +
'• Kick off overnight test generation → wake up, review diff on mobile, approve merge\n' +
'• Debug production issues while walking the dog — agent has your local tunnel open\n\n' +
'The honest constraints: computer must stay awake (setting helps), iOS only for now, Enterprise default OFF, no file browsing on mobile (transcript only).\n\n' +
'But the bigger picture: this is the mobile client for Cursor\'s orchestration layer — the same layer powering Projects, Rollouts, Security Review, and Self-Hosted Machines. The IDE is just one client; the control plane follows you.\n\n' +
'For solo devs: free agent supervision. For teams: personal oversight without shared cloud quota fights. For privacy-conscious: the ONLY mobile agent control that keeps code on your hardware.\n\n' +
'The agent wars aren\'t about who has the biggest cloud. They\'re about who lets you use the compute you already own, from wherever you are.\n\n' +
'#AI #CodingAgents #Cursor #SoftwareEngineering #RemoteWork #DevTools #Privacy #DeveloperExperience',
    metadata: { format: 'personal-take', platform: 'linkedin', tool: 'cursor', version: 'ios-remote-control' },
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