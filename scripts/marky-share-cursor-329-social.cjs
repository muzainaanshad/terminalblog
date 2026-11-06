#!/usr/bin/env node
// Share Cursor 3.29 stability release via MyMarky (X + LinkedIn)
const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const KEY = 'mk_live_2HrW1PDCF5i4rMu809NIDtvxtu0-rdnZOGURht6RWmE';
const API = 'https://api.mymarky.ai/api/businesses/' + BIZ_ID + '/posts';
const HEADERS = { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' };
const ARTICLE = 'https://terminalblog.com/blog/cursor-3-29-stability-after-platform-launch/';

const POSTS = [
  {
    // X/Twitter: key takeaways + link
    caption:
'Cursor 3.29 just landed — the "it actually works now" release after 3.28\'s platform pivot 🔥\n\n' +
'3.28 shipped 6 major features at once (Projects, Cloud Agents, Origin Marketplace, Remote Control, Rollouts, Grok Bot). 3.29 fixes the rough edges:\n\n' +
'✅ Project context loss on restart → FIXED\n' +
'✅ Cloud Agent disconnections mid-task → IMPROVED\n' +
'✅ Remote Control (iOS) dropping after 10min → FIXED\n' +
'✅ Origin Marketplace installs hanging → FIXED\n' +
'✅ Grok Bot duplicate PRs on @grok mentions → FIXED\n' +
'✅ 2-3x faster Project loads, Cloud Agent startup, Remote Control connect\n\n' +
'No new flagship features. Pure stabilization. This is healthy release cadence.\n\n' +
'Full breakdown: ' + ARTICLE + '\n\n' +
'#CodingAgents #Cursor #AIEditor #DevTools #AI #Stability #Platform',
    link: ARTICLE,
    metadata: { format: 'release-update', tool: 'cursor', version: 'v3.29' },
  },
  {
    // LinkedIn: personal take, no links in body
    caption:
'Cursor 3.29 released today. Two days after 3.28\'s massive platform launch.\n\n' +
'3.28 was the "we built it" moment — Projects, Cloud Agents with Canvases, Origin App Marketplace, Remote Control from iOS, Rollouts, Security Review, Grok Bot for GitHub issues. All graduated from beta to stable at once.\n\n' +
'3.29 is the "we fixed it" moment. No new features. Just reliability.\n\n' +
'The friction points beginners hit hardest in 3.28:\n' +
'• Project context vanishing after a restart → Fixed. Coordinator memory checkpoints more frequently.\n' +
'• Cloud agents dying halfway through large tasks → Improved. Environment startup timeout increased, Canvas rendering streams incrementally.\n' +
'• Remote Control on iOS disconnecting after 10 minutes background → Fixed. Keep-alive adjusted, Windows "keep awake" now works.\n' +
'• Marketplace app installs hanging at "Configuring..." → Fixed. Better errors, retry logic, permissions preview.\n' +
'• Grok Bot creating duplicate PRs on rapid @grok mentions → Fixed. Deduplication window added.\n\n' +
'Performance gains across the board: Project load ~2-3x faster, Cloud Agent startup ~30s (was 45s), Remote Control connect ~4s (was 8s).\n\n' +
'This is the release cadence I want to see: Ship big → stabilize fast → iterate.\n\n' +
'If you\'re on 3.28, update today. If you\'re on 3.27 or earlier, you\'re missing the entire platform — update immediately.\n\n' +
'#AI #CodingAgents #Cursor #DeveloperTools #SoftwareEngineering #AIEditor #Platform #Stability #DevOps #Productivity',
    metadata: { format: 'personal-take', platform: 'linkedin', tool: 'cursor', version: 'v3.29' },
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