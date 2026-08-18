#!/usr/bin/env node
// Share Cursor Origin launch via MyMarky (X + LinkedIn)
const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const KEY = 'mk_live_2HrW1PDCF5i4rMu809NIDtvxtu0-rdnZOGURht6RWmE';
const API = 'https://api.mymarky.ai/api/businesses/' + BIZ_ID + '/posts';
const HEADERS = { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' };
const ARTICLE = 'https://terminalblog.com/blog/cursor-origin-code-hosting-agents-every-repo/';

const POSTS = [
  {
    // X/Twitter: key takeaways + link
    caption:
'Cursor just became a code host 🤯\n\n' +
'Origin launches in beta: hosted repos, PRs, GitHub sync, and agents that LIVE in every repo.\n\n' +
'No more context copying. Agents know your codebase, update PRs, push branches — all from inside the repo.\n\n' +
'Vercel, Depot, Buildkite integrations day one.\n\n' +
'Full breakdown: ' + ARTICLE + '\n\n' +
'#Cursor #AI #CodingAgents #Origin #DeveloperTools',
    link: ARTICLE,
    metadata: { format: 'release-update', tool: 'cursor', version: 'origin-beta' },
  },
  {
    // LinkedIn: personal take, no links in body
    caption:
'Cursor just launched Origin — their own code hosting platform with agents built into every repo.\n\n' +
'This isn\'t a plugin. It\'s a full Git host (repos, PRs, code browsing, GitHub sync) where agents are native citizens.\n\n' +
'Key shifts:\n' +
'• Agents live in the repo permanently — they know the codebase\n' +
'• GitHub stays source of truth; Origin syncs both ways\n' +
'• Vercel/Depot/Buildkite integrations at launch\n' +
'• Built for agent scale from day one\n\n' +
'Cursor has been building toward this: Cloud Agents → Builds → Mobile → Plugins → Origin (the foundation).\n\n' +
'The agent-native Git platform the market has been missing.\n\n' +
'#AI #CodingAgents #Cursor #DeveloperTools #GitHub #Productivity',
    metadata: { format: 'personal-take', platform: 'linkedin', tool: 'cursor', version: 'origin-beta' },
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