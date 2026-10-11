#!/usr/bin/env node
// Share OpenCode v1.19.0 - OpenCode 2 upgrade path lands via MyMarky (X + LinkedIn)
const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const KEY = 'mk_live_2HrW1PDCF5i4rMu809NIDtvxtu0-rdnZOGURht6RWmE';
const API = 'https://api.mymarky.ai/api/businesses/' + BIZ_ID + '/posts';
const HEADERS = { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' };
const ARTICLE = 'https://terminalblog.com/blog/opencode-v1-19-opencode-2-upgrade-path-lands/';

const POSTS = [
  {
    // X/Twitter: key takeaways + link
    caption:
'OpenCode v1.19.0 just dropped and the big news: `opencode upgrade --major` is now REAL \u{1F680}\n\n' +
'What v1.19.0 brings:\n' +
'\u{1F504} One-command migration to OpenCode 2\n' +
'\u{26A1} OpenAI ultrafast tier support (2-3x faster responses)\n' +
'\u{1F6E1}\u{FE0F} PTY connection validation \u{2014} kills phantom terminal errors\n' +
'\u{1F4CB} Explicit `/update` command replaces auto-updates\n\n' +
'Full breakdown: ' + ARTICLE + '\n\n' +
'#CodingAgents #OpenCode #OpenSource #OpenCode2 #DeveloperTools',
    link: ARTICLE,
    metadata: { format: 'release-update', tool: 'opencode', version: 'v1.19.0' },
  },
  {
    // LinkedIn: personal take, no links in body
    caption:
'The most important feature in OpenCode v1.19.0 isn\'t a feature at all -- it\'s a migration path.\n\n' +
'For months, OpenCode 2 has been "coming soon." New architecture, rewritten plugin system, revised TUI. But major version upgrades are where open-source projects lose users. Config formats break. Plugin APIs shift. Sessions don\'t restore. The friction is real.\n\n' +
'Today, that friction gets a release-grade solution: `opencode upgrade --major`. One command. Config migration handled. Skills preserved. Sessions restored. Rollback if anything goes wrong.\n\n' +
'Around it, three quiet improvements that compound:\n\n' +
'1. **Explicit updates over auto-updates.** The `/update` command (and `opencode upgrade` CLI) means you decide when the runtime changes -- not your agent in the middle of a debug session.\n\n' +
'2. **OpenAI ultrafast tier.** If you\'re a ChatGPT subscriber with access, responses drop from ~8s to ~2-3s. Latency kills flow; this brings it back.\n\n' +
'3. **PTY validation at the source.** Those random "PTY not found" errors that appeared when terminal state got weird? Fixed by validating connection origins before use. A whole class of spurious errors, gone.\n\n' +
'OpenCode\'s thesis remains: provider-neutral, local-first, skill-driven. v1.19.0 doesn\'t change the thesis -- it removes the friction from the next evolution of it.\n\n' +
'The agent-readable stats API (v1.18.35) + the major upgrade command (v1.19.0) = infrastructure that manages its own evolution.\n\n' +
'#CodingAgents #OpenSource #OpenCode #AIEngineering #DeveloperTools #OpenCode2',
    metadata: { format: 'personal-take', platform: 'linkedin', tool: 'opencode', version: 'v1.19.0' },
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