#!/usr/bin/env node
// Share "I Cancelled Cursor Pro and Claude Code Max — 30 Days on Free Models Changed Everything" via MyMarky (X + LinkedIn)
const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const KEY = 'mk_live_2HrW1PDCF5i4rMu809NIDtvxtu0-rdnZOGURht6RWmE';
const API = 'https://api.mymarky.ai/api/businesses/' + BIZ_ID + '/posts';
const HEADERS = { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' };
const ARTICLE = 'https://terminalblog.com/blog/i-cancelled-cursor-claude-30-days-free-models/';

const POSTS = [
  {
    // X/Twitter: key takeaways + link
    caption:
'I cancelled Cursor Pro ($20/mo) + Claude Code Max ($200/mo) — $220/mo gone.\n\n' +
'30 days on FREE models: Nemotron 3 Ultra (OpenRouter), Kimi K3 (OpenHands), Qwen3-Coder (Ollama).\n\n' +
'The bill: $0. The productivity: didn\'t drop. Actually improved.\n\n' +
'What broke: 20+ file architectural migrations (paid wins)\nWhat surprised: Nemotron beats Opus on routine work. Kimi\'s 1M context finds leaks Nemotron misses. Qwen is the only option for air-gapped work.\n\n' +
'The hybrid stack I actually use now:\n' +
'• Tier 1 (80%): Nemotron free → daily coding\n' +
'• Tier 2 (15%): Kimi K3 → big repo analysis\n' +
'• Tier 3 (5%): Qwen local → privacy/offline\n' +
'• Tier 4 (reserved): Claude Opus → heavy artillery\n\n' +
'Full breakdown: ' + ARTICLE + '\n\n' +
'#CodingAgents #FreeModels #Nemotron #Kimi #Qwen #OpenRouter #Ollama #DevTools #AI',

    link: ARTICLE,
    metadata: { format: 'personal-experiment', tool: 'free-models', type: 'cost-reduction' },
  },
  {
    // LinkedIn: personal take, no links in body
    caption:
'I cancelled $2,400/year in AI coding subscriptions. 30 days later, my output didn\'t drop — it improved.\n\n' +
'The experiment: replace Cursor Pro + Claude Code Max with a free-model stack:\n\n' +
'🔹 Nemotron 3 Ultra (NVIDIA, free on OpenRouter) — daily driver for 80% of work\n' +
'🔹 Kimi K3 (Moonshot, free on OpenHands Cloud) — 1M context for repo-wide analysis\n' +
'🔹 Qwen3-Coder 32B (Alibaba, local via Ollama) — air-gapped, privacy-sensitive work\n\n' +
'What I learned:\n\n' +
'Nemotron isn\'t "good enough" — it\'s BETTER than Opus for routine work. Bug fixes, tests, single-file refactors, scripts — 47 seconds vs 3-4 minutes, cleaner diffs.\n\n' +
'Kimi\'s 1M context isn\'t marketing. Fed it a 48K LOC monorepo — found the WebSocket leak PLUS two more issues Nemotron missed. Produced a Mermaid architecture diagram.\n\n' +
'Qwen local is the only real option when code can\'t leave the machine. 85% quality, zero privacy tradeoff.\n\n' +
'The 15% where paid still wins: massive architectural migrations (20+ files) and IDE-integrated inline diffs (Cursor\'s genuine moat).\n\n' +
'My hybrid strategy now tiers models by task — not by vendor. 70-85% cost reduction. Zero productivity loss.\n\n' +
'Free tiers are rented ground (NVIDIA/Moonshot strategic plays). Qwen weights are the only thing you truly own. Invest in local deployment for the long term.\n\n' +
'If you\'re paying $100+/mo for coding agents, try the free stack for 7 days alongside your subscriptions. If you hit the rate limit and it hurts — you have your answer. If you don\'t — you have thousands back per year.\n\n' +
'#AI #CodingAgents #FreeModels #Nemotron #Kimi #Qwen #OpenRouter #Ollama #DeveloperProductivity #SoftwareEngineering #CostOptimization',

    metadata: { format: 'personal-take', platform: 'linkedin', tool: 'free-models', type: 'cost-reduction' },
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