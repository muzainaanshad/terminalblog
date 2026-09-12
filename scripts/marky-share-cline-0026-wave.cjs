#!/usr/bin/env node
// Share Cline Desktop v0.0.24->v0.0.26 wave update via MyMarky (X + LinkedIn)
const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const KEY = 'mk_live_2HrW1PDCF5i4rMu809NIDtvxtu0-rdnZOGURht6RWmE';
const API = 'https://api.mymarky.ai/api/businesses/' + BIZ_ID + '/posts';
const HEADERS = { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' };
const ARTICLE = 'https://terminalblog.com/blog/cline-desktop-free-coding-models-zero-api-keys/';

const POSTS = [
  {
    // X/Twitter: key takeaways + link
    caption:
'Cline Desktop just made the PR review loop undeniably faster \u{1F680}\n\n' +
'v0.0.24\u2192v0.0.26:\n' +
'\u{1F4CB} Live PR card in the composer \u2014 number, merge status, CI checks, refresh every 30s\n' +
'\u{1F5A8}\uFE0F Windows updates finally work (sidecar daemon was holding code-sidecar.exe)\n' +
'\u{1F4DD} Failed sends no longer eat your prompt\n' +
'\u{1F511} Auth errors now point at the right CLI (Claude Code / Codex / OpenCode)\n' +
'\u{1F6A8} Signing out of ChatGPT actually sticks now\n\n' +
'Full wave: ' + ARTICLE + '\n\n' +
'#CodingAgents #Cline #OpenSource #DeveloperTools #Windows',
    link: ARTICLE,
    metadata: { format: 'release-update', tool: 'cline-desktop', version: 'v0.0.24-v0.0.26' },
  },
  {
    // LinkedIn: personal take, no links in body
    caption:
'The most underrated coding-agent release this week is a desktop app fixing the boring stuff. \n\n' +
'Cline shipped two versions in under 48 hours. The headline is a live pull-request card in the composer \u2014 number, merge status, CI checks, all refreshing every 30 seconds without switching windows. Nice, but the real story is what they fixed underneath. \n\n' +
'Windows updates that silently failed because a background sidecar still held the installer file. Prompts that vanished when a send failed before the turn started. Sessions that came back "running" when they were actually idle forever. And the one that matters for trust: signing out of ChatGPT (Codex) now actually signs you out, instead of the app quietly re-importing your stored credentials on the next action. \n\n' +
'None of these are features you can screenshot for a launch post. They are exactly the kind of paper cuts that decide whether a tool becomes a daily driver or gets uninstalled by Thursday. \n\n' +
'Also worth a look for anyone running many providers: model defaults changed for 36 providers in v0.0.25 \u2014 several moved off Claude Fable 5.1 to GPT-6 Astra \u2014 so check what you are pinned to before your next session. \n\n' +
'#CodingAgents #Cline #OpenSource #AIEngineering #DeveloperTools',
    metadata: { format: 'personal-take', platform: 'linkedin', tool: 'cline-desktop', version: 'v0.0.24-v0.0.26' },
  },
];

(async () => {
  const now = Date.now();
  const results = [];
  for (let i = 0; i < POSTS.length; i++) {
    const p = POSTS[i];
    const scheduled = new Date(now + (20 + i * 60) * 60000).toISOString();
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