#!/usr/bin/env node
// Share Windsurf Wave 14 - Arena Mode + Plan Mode via MyMarky (X + LinkedIn)
const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const KEY = 'mk_live_2HrW1PDCF5i4rMu809NIDtvxtu0-rdnZOGURht6RWmE';
const API = 'https://api.mymarky.ai/api/businesses/' + BIZ_ID + '/posts';
const HEADERS = { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' };
const ARTICLE = 'https://terminalblog.com/blog/windsurf-wave-14-arena-mode-plan-mode/';

const POSTS = [
  {
    // X/Twitter: key takeaways + link
    caption:
'Windsurf Wave 14 just put model battles in your IDE 🏟️\n\n' +
'What Wave 14 brings:\n' +
'🏟️ Arena Mode — 2 agents, same task, YOUR codebase, YOU vote (model names hidden)\n' +
'📋 Plan Mode — agents reason & ask questions BEFORE writing code\n' +
'⚡ First week: all battle groups FREE (~50% off inference)\n' +
'📊 Personal + global leaderboards from your votes\n\n' +
'Full breakdown: ' + ARTICLE + '\n\n' +
'#CodingAgents #Windsurf #DevinDesktop #ArenaMode #AIModels #DeveloperTools',
    link: ARTICLE,
    metadata: { format: 'release-update', tool: 'windsurf', version: 'wave-14' },
  },
  {
    // LinkedIn: personal take, no links in body
    caption:
'The most underrated feature in Windsurf Wave 14 isn\'t Arena Mode — it\'s what Arena Mode enables: empirical model selection on YOUR tasks.\n\n' +
'For months, engineering teams have been picking AI models based on:\n' +
'• Marketing benchmarks from model vendors\n' +
'• Reddit threads and influencer takes\n' +
'• "Vibes" and faulty memory\n\n' +
'Wave 14 changes this fundamentally. Arena Mode spins up two Cascade agents side-by-side on the SAME prompt in YOUR actual codebase. Model names hidden. You vote on which output actually works. Your personal Elo builds. The global leaderboard aggregates.\n\n' +
'Around it, Plan Mode forces agents to articulate their approach BEFORE writing code. Type "megaplan" and watch the agent ask clarifying questions. You catch misaligned assumptions at the plan stage — not 200 lines of generated code later.\n\n' +
'The self-consistency research is clear: Best-of-N (running multiple models and picking the best) gives 20+ percentage point uplift on complex tasks. Arena Mode makes this a first-class workflow. You\'re the judge — no LLM-as-judge bias.\n\n' +
'First week: all battle groups are free (roughly 50% off since you\'re running double). After that, pricing normalizes to single-run cost.\n\n' +
'This isn\'t just a feature. It\'s a shift from "trust the benchmark" to "trust your own data." The teams that adopt this will make empirically grounded model decisions. The rest will keep guessing.\n\n' +
'#CodingAgents #Windsurf #DevinDesktop #AIEngineering #DeveloperTools #ModelEvaluation #ArenaMode',
    metadata: { format: 'personal-take', platform: 'linkedin', tool: 'windsurf', version: 'wave-14' },
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