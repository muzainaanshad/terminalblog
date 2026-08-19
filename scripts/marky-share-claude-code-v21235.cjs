#!/usr/bin/env node
// Share Claude Code v2.1.235 via MyMarky (X + LinkedIn)
const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const KEY = 'mk_live_2HrW1PDCF5i4rMu809NIDtvxtu0-rdnZOGURht6RWmE';
const API = 'https://api.mymarky.ai/api/businesses/' + BIZ_ID + '/posts';
const HEADERS = { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' };
const ARTICLE = 'https://terminalblog.com/blog/claude-code-v2-1-235-spellcheck-performance-fixes/';

const POSTS = [
  {
    // X/Twitter: key takeaways + link
    caption:
'Claude Code v2.1.235 just dropped with real-time spellcheck 📝\n\n' +
'Typos in prompts no longer hallucinate their way into your codebase. Uses your local aspell/hunspell/ispell.\n\n' +
'Also fixed:\n' +
'• Memory usage in cloud sessions (no more RAM creep)\n' +
'• Nested markdown list alignment\n' +
'• 15 paper-cut bugs\n\n' +
'Full changelog: ' + ARTICLE + '\n\n' +
'#CodingAgents #ClaudeCode #DevTools',
    link: ARTICLE,
    metadata: { format: 'release-update', tool: 'claude-code', version: 'v2.1.235' },
  },
  {
    // LinkedIn: personal take, no links in body
    caption:
'Claude Code v2.1.235 just added real-time spellcheck in the prompt input.\n\n' +
'Finally. No more sending typos to the model and watching it confidently hallucinate a solution around them.\n\n' +
'The release also cuts memory usage in long-running cloud sessions like /ultrareview and fixes 15 paper-cut bugs including:\n\n' +
'• Nested markdown lists finally align right at depth 3+\n' +
'• Vim mode preserves NORMAL state on transcript toggle\n' +
'• Pathological grep patterns fail fast instead of hanging forever\n\n' +
'If you use Claude Code daily, this is the quality-of-life polish that makes the security fixes from v2.1.234 feel complete.\n\n' +
'#AI #CodingAgents #ClaudeCode #DeveloperTools #Productivity',
    metadata: { format: 'personal-take', platform: 'linkedin', tool: 'claude-code', version: 'v2.1.235' },
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
