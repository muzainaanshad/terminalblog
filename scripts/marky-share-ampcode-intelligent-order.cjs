#!/usr/bin/env node
// Share AmpCode intelligent file ordering - PR review acceleration via MyMarky (X + LinkedIn)
const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const KEY = 'mk_live_2HrW1PDCF5i4rMu809NIDtvxtu0-rdnZOGURht6RWmE';
const API = 'https://api.mymarky.ai/api/businesses/' + BIZ_ID + '/posts';
const HEADERS = { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' };
const ARTICLE = 'https://terminalblog.com/blog/ampcode-intelligent-file-ordering-pr-review/';

const POSTS = [
  {
    // X/Twitter: key takeaways + link
    caption:
'AmpCode just made PR reviews 10x faster with intelligent file ordering \\u{1F680}\\n\\n' +
'The Changes pane now automatically surfaces the files that MATTER first:\\n' +
'\\u{2705} Entry points & core logic at the top\\n' +
'\\u{2705} Test files for changed behavior\\n' +
'\\u{2705} Config/schema updates\\n' +
'\\u{2705} Peripheral changes last\\n\\n' +
'No more alphabetical soup. Blue dot = updated order available when new commits push.\\n\\n' +
'Full breakdown: ' + ARTICLE + '\\n\\n' +
'#CodingAgents #AmpCode #CodeReview #PRReview #DeveloperTools #GitHub',
    link: ARTICLE,
    metadata: { format: 'release-update', tool: 'ampcode', version: '2026-10-12' },
  },
  {
    // LinkedIn: personal take, no links in body
    caption:
'The best code review feature isn\'t a feature -- it\'s the removal of the hunt.\\n\\n' +
'You open a 47-file PR. Alphabetical order gives you `a-config.yaml` through `z-util.ts`. The business logic lives in `services/payment/processor.ts` -- buried between adapter files and types. You scroll. You hunt. You guess.\\n\\n' +
'AmpCode\'s October 12 update changes this with one deceptively simple feature: **intelligent file ordering in the Changes pane**.\\n\\n' +
'Amp reads the diff, identifies what\'s essential, and puts it first. Core logic. Entry points. Tests for the changed behavior. Config updates. Peripheral stuff last.\\n\\n' +
'If new commits push, Amp recomputes without rearranging while you\'re reviewing. A blue dot appears -- click to refresh.\\n\\n' +
'This isn\'t a standalone feature. It\'s the **review acceleration layer** in a loop Amp is closing:\\n\\n' +
'1. Agent writes code, opens PR\\n' +
'2. GitHub Webhooks (Oct 12) bring comments/CI into the thread\\n' +
'3. **Intelligent ordering makes those reviews actionable instantly**\\n' +
'4. Agent fixes, pushes\\n' +
'5. CI results in thread, order updates\\n' +
'6. You merge\\n\\n' +
'For beginners: you review like a senior. Seniors review strategically -- find architectural decisions first, verify implementation after. Intelligent ordering gives you those instincts automatically.\\n\\n' +
'No config. No learning curve. On by default. One click back to alphabetical if you\'re into pain.\\n\\n' +
'#CodingAgents #AmpCode #CodeReview #DeveloperExperience #PRWorkflow #AIEngineering',
    metadata: { format: 'personal-take', platform: 'linkedin', tool: 'ampcode', version: '2026-10-12' },
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