#!/usr/bin/env node
// Share the Zed v1.15.1 + v1.16.1-pre patch update via MyMarky (X + LinkedIn)
const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const KEY = 'mk_live_2HrW1PDCF5i4rMu809NIDtvxtu0-rdnZOGURht6RWmE';
const API = 'https://api.mymarky.ai/api/businesses/' + BIZ_ID + '/posts';
const HEADERS = { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' };
const ARTICLE = 'https://terminalblog.com/blog/zed-v1-16-pre-gemini-flash-git-panel-mermaid/';

const POSTS = [
  {
    // X/Twitter: key takeaways + link
    caption:
'Zed v1.15.1 stable + v1.16.1-pre just dropped 3 hours ago — critical patches for daily workflows 🎯\n\n' +
'🔧 Fixed: Cursor ACP agent failing to start (huge for Zed+Cursor users)\n' +
'🔐 Fixed: GPG passphrase modal spamming on every commit (pinentry-mac/keychain users)\n' +
'🔍 Fixed: Project search broken in non-Unicode files\n' +
'📦 Fixed: Array merging regression in extensions\n\n' +
'If you\'re on v1.15.0 or v1.16.0-pre, update now. Small patches, high impact: ' + ARTICLE + '\n\n' +
'#Zed #AICodingAgent #OpenSource #Cursor #DeveloperTools #PatchRelease',
    link: ARTICLE,
    metadata: { format: 'release-update', tool: 'zed', version: '1.15.1/1.16.1-pre' },
  },
  {
    // LinkedIn: personal take, no links in body
    caption:
'Three hours ago, Zed shipped v1.15.1 stable and v1.16.1-pre — patch releases that fix four annoying bugs you\'ve probably hit if you use Zed daily.\n\n' +
'The big one: **Cursor ACP agent failing to start**. If you use Zed with Cursor\'s agent protocol (which a lot of teams do now), the agent just wouldn\'t launch. Fixed.\n\n' +
'The daily-pain one: **GPG passphrase modal on every commit**. If you use pinentry-mac with macOS Keychain, Zed was prompting for your passphrase on *every single commit* even though the keychain already had it. Now it only prompts when gpg actually needs help.\n\n' +
'The silent productivity killer: **Project search broken in non-Unicode files**. If your codebase has any legacy encoding files, search just missed them.\n\n' +
'Plus an array merging regression in extensions that could break custom setups.\n\n' +
'These aren\'t headline features. They\'re the kind of fixes that separate a \"cool editor\" from a \"daily driver.\" Zed\'s weekly cadence means patches like this land fast — v1.15.0 was Aug 12, v1.16.0-pre was Aug 12, and now both get patched 6 days later.\n\n' +
'Full breakdown with update commands on terminalblog.\n\n' +
'#Zed #AICodingAgent #OpenSource #DeveloperExperience #Cursor #AIEngineering #PatchRelease',
    metadata: { format: 'personal-take', platform: 'linkedin', tool: 'zed', version: '1.15.1/1.16.1-pre' },
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