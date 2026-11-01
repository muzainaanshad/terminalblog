#!/usr/bin/env node
// Share Mistral Large 4 (Le Chonk) open-weight release via MyMarky (X + LinkedIn)
const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const KEY = 'mk_live_2HrW1PDCF5i4rMu809NIDtvxtu0-rdnZOGURht6RWmE';
const API = 'https://api.mymarky.ai/api/businesses/' + BIZ_ID + '/posts';
const HEADERS = { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' };
const ARTICLE = 'https://terminalblog.com/blog/mistral-large-4-le-chonk-open-weight-coding-king/';

const POSTS = [
  {
    // X/Twitter: key takeaways + link in reply
    caption:
'Mistral just open-sourced a 1 TRILLION parameter model that beats every open-weight coding benchmark 🏆\n\nMistral Large 4 (codename: Le Chonk) leads:\n▸ FrontierCode 2.0: 19.7% (#1 open weight)\n▸ Terminal-Bench 4.0: 41% (+13 pts from preview)\n▸ Coding Agent Index: 48% tied with GLM-5.3 — but 47% FEWER tokens\n▸ Cyber Index: 51% — highest open weight for defensive security\n\nThree native reasoning modes (Low/Med/High) = built-in cost control.\nWeights on Hugging Face. Modified MIT license. API: $0.70/M in, $2.10/M out.\n\nFull breakdown: ' + ARTICLE + '\n\n#CodingAgents #Mistral #OpenSource #LLM #AI #DeveloperTools',
    link: ARTICLE,
    metadata: { format: 'release-update', tool: 'industry', topic: 'mistral-large-4' },
  },
  {
    // LinkedIn: personal take, no links in body
    caption:
'The open-weight coding crown has a new king — and it\'s a 1T parameter French cat named Le Chonk.\n\nFor two years the narrative was simple: "Closed models lead coding; open weights trail by 6-12 months." Mistral Large 4 just broke that narrative.\n\nHere\'s why this matters for anyone building with coding agents:\n\n1. **Frontier performance, open weights** — 19.7% on FrontierCode 2.0 (Cognition\'s private benchmark measuring "would a maintainer merge this?"). That\'s not academic — it\'s production signal.\n\n2. **Token efficiency is the sleeper win** — Matches GLM-5.3 on Coding Agent Index while using 47% FEWER tokens. For agentic workflows where you pay per token, this directly means lower costs and longer context.\n\n3. **Built-in reasoning modes** — Low/Medium/High baked into the model weights, not prompt-engineered. Your orchestrator just sets effort level. Same philosophy as AmpCode\'s Dial, but native.\n\n4. **Security-first** — 51% on Cyber Index (vuln discovery, reproduction, patching) with 96.6% refusal on malicious requests. Validated by Booz Allen, Cisco, Cloudflare, CrowdStrike, ENISA. Your agent can now safely analyze security issues without being tricked.\n\n5. **European sovereignty** — Trained on European infra, European-hosted API option. For EU companies/government, this isn\'t theoretical.\n\nThe honest limitations: 1T params needs 8x H100 for self-host (not a laptop model). API latency higher than dense 7B-32B models. No native tool calling in raw weights — needs an orchestrator (Hermes, OpenCode, etc.).\n\nBut the big picture: **You no longer need Anthropic/OpenAI keys for frontier coding capability.** Mistral API or self-host works. The model is commoditized; your agent orchestrator becomes the differentiator.\n\nWeights on Hugging Face: mistralai/Mistral-Large-4-1T-A52B\n\n#CodingAgents #Mistral #OpenSource #LLM #AIEngineering #DeveloperTools #EuropeanAI #SovereignAI',
    metadata: { format: 'personal-take', platform: 'linkedin', tool: 'industry', topic: 'mistral-large-4' },
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