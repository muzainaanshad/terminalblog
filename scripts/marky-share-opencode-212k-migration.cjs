#!/usr/bin/env node
// Share OpenCode 212K Stars Migration article via MyMarky (X + LinkedIn)
const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const KEY = 'mk_live_2HrW1PDCF5i4rMu809NIDtvxtu0-rdnZOGURht6RWmE';
const API = 'https://api.mymarky.ai/api/businesses/' + BIZ_ID + '/posts';
const HEADERS = { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' };
const ARTICLE = 'https://terminalblog.com/blog/opencode-212k-stars-spacex-cursor-migration/';

const POSTS = [
  {
    // X/Twitter: key takeaways + link
    caption:
'OpenCode just hit 212K GitHub stars 📈\n\n' +
'The spike started the week SpaceX bought Cursor for $60B.\n\n' +
'Developers aren\'t just starring — they\'re migrating:\n' +
'• 75+ model providers (any OpenAI-compatible)\n' +
'• Local-first (Ollama, llama.cpp, vLLM)\n' +
'• BYOK economics: $12/mo via aiFiesta vs $20-100/mo lock-in\n' +
'• Portable SKILL.md files = organizational IP, not vendor IP\n' +
'• MIT license = credible fork insurance\n\n' +
'Full breakdown: ' + ARTICLE + '\n\n' +
'#CodingAgents #OpenCode #OpenSource #SpaceX #Cursor #DeveloperTools #VendorLockIn',
    link: ARTICLE,
    metadata: { format: 'analysis', tool: 'opencode', topic: 'migration' },
  },
  {
    // LinkedIn: personal take, no links in body
    caption:
'The most telling metric in AI coding tools right now isn\'t benchmarks. It\'s GitHub stars.\n\n' +
'OpenCode: 212,000+\nCursor: ~40,000\nCopilot CLI: ~15,000\nCline: ~69,000\n\n' +
'The divergence started July 2026 — the week SpaceX closed its $60B acquisition of Cursor.\n\n' +
'Developers didn\'t suddenly fall in love with a terminal UI. They woke up to a structural risk: their daily driver is now owned by a rocket company that also sells a competing model (Grok). OpenAI publicly distanced itself. The writing was on the wall.\n\n' +
'So they voted with their stars — and their workflows.\n\n' +
'What they found on the other side:\n\n' +
'1. **Model freedom as infrastructure.** Route boilerplate to Groq ($0.80/M), complex reasoning to Claude, sensitive code to local Ollama. One config. No permission slips.\n\n' +
'2. **Skills as portable assets.** A code-review skill you write runs on your laptop, your CI, your teammate\'s machine, your server. It\'s not an IDE extension. It\'s not a cloud subscription. It\'s a markdown file.\n\n' +
'3. **Fork insurance.** MIT license means if Anomaly pivots, the community continues. Cursor users have no such option. Neither do Copilot or Claude Code users.\n\n' +
'The migration isn\'t emotional. It\'s economic. When 80% of your daily tasks cost 1/20th the price and you own the orchestration layer, the switching cost of *returning* to lock-in just keeps rising.\n\n' +
'OpenCode won\'t win on polish. It won\'t beat Cursor\'s IDE integration. But it\'s winning on the only metric that compounds: developer trust.\n\n' +
'#CodingAgents #OpenSource #OpenCode #AIEngineering #DeveloperTools #VendorLockIn #ModelFreedom',
    metadata: { format: 'personal-take', platform: 'linkedin', tool: 'opencode', topic: 'migration' },
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