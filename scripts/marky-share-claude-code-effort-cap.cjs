#!/usr/bin/env node
// Share Claude Code effort-cap / Fable 5.1 cost-control article via MyMarky (X + LinkedIn)
const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const KEY = 'mk_live_2HrW1PDCF5i4rMu809NIDtvxtu0-rdnZOGURht6RWmE';
const API = 'https://api.mymarky.ai/api/businesses/' + BIZ_ID + '/posts';
const HEADERS = { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' };
const ARTICLE = 'https://terminalblog.com/blog/claude-code-effort-cap-fable-5-1-cost-control/';

const POSTS = [
  {
    // X/Twitter: key takeaways + link
    caption:
'Claude Code just gave you the ONE setting that stops surprise AI bills 💸\\n\\n' +
'v2.1.267 adds maxEffortLevel — a hard cap on how hard the model tries, on EVERY provider (Bedrock, Vertex, Foundry).\\n\\n' +
'🧠 Cap effort → predictable spend\\n' +
'📚 Fable 5.1 default: 1M context, $0.25/Mtok cache reads\\n' +
'🔍 /cost now tells you WHY you missed the prompt cache\\n' +
'✂️ /skill-doctor shows unused skills eating context\\n\\n' +
'A month of token-efficiency fixes, one article: ' + ARTICLE + '\\n\\n' +
'#CodingAgents #ClaudeCode #AI #DeveloperTools #CostOptimization',
    link: ARTICLE,
    metadata: { format: 'release-update', tool: 'claude-code', version: 'v2.1.267' },
  },
  {
    // LinkedIn: personal take, no links in body
    caption:
'The most important Claude Code release of the month is not a feature — it is a cap.\\n\\n' +
'Between v2.1.235 and v2.1.267, Anthropic shipped 30 versions in four weeks. The headline fix for anyone running agents in anger is maxEffortLevel: a hard ceiling on how hard the model tries, enforced on every provider including Bedrock, Vertex, and Foundry.\\n\\n' +
'Why that matters: the classic "why is my bill $40" story is a model silently running at max effort on one-line tasks. A cap makes spend predictable — and predictability is what turns an agent from an experiment into infrastructure.\\n\\n' +
'The same release train made Fable 5.1 the default: 1M context at $10/$50 per Mtok with $0.25/Mtok cache reads, plus a month of prompt-cache fixes. /cost now tells you why you missed the cache; /skill-doctor lists skills eating context that never get used.\\n\\n' +
'The direction is unmistakable: cost control is now a product feature, not an afterthought. The agents that win are the ones that make their bills boring.\\n\\n' +
'#CodingAgents #ClaudeCode #AI #CostOptimization #DeveloperTools #AIEngineering',
    metadata: { format: 'personal-take', platform: 'linkedin', tool: 'claude-code', version: 'v2.1.267' },
  },
];

(async () => {
  const now = Date.now();
  const results = [];
  for (let i = 0; i < POSTS.length; i++) {
    const p = POSTS[i];
    const scheduled = new Date(now + (30 + i * 60) * 60000).toISOString();
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