#!/usr/bin/env node
// Share the OpenHands v1.13 release via MyMarky (X + LinkedIn)
const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const KEY = 'mk_live_2HrW1PDCF5i4rMu809NIDtvxtu0-rdnZOGURht6RWmE';
const API = 'https://api.mymarky.ai/api/businesses/' + BIZ_ID + '/posts';
const HEADERS = { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' };
const ARTICLE = 'https://terminalblog.com/blog/openhands-v1-12-free-models-clarified-beginner-guide/';

const POSTS = [
  {
    // X/Twitter: key takeaways + link
    caption:
'OpenHands v1.13 just added the feature every agent user has begged for: a LIVE CONTEXT METER with manual compaction. 🎯\n\n' +
'📊 Context window usage ring — see tokens fill in real time\n' +
'🗜️ One-click Compact — summarize conversation, preserve file paths & decisions, keep working\n' +
'📄 Inline markdown artifact previews — code, diagrams, tables render live in chat\n' +
'📦 Conversation archive — local, searchable, restorable (no server changes)\n' +
'✅ Ready-for-dev issue gate — agents only pick up well-specified issues\n' +
'🔓 PLUS: 3 free models from v1.12 (GLM-5.2, DeepSeek-V4-Flash, MiniMax-M2.7) — no API key, no credit card\n\n' +
'84k stars, MIT licensed, runs anywhere. Full breakdown: ' + ARTICLE + '\n\n' +
'#OpenHands #AICodingAgent #OpenSource #ContextWindow #DeveloperTools #FreeModels',
    link: ARTICLE,
    metadata: { format: 'release-update', tool: 'openhands', version: '1.13' },
  },
  {
    // LinkedIn: personal take, no links in body
    caption:
'I\'ve been watching OpenHands since it crossed 80k stars. v1.13 (released Aug 13) solves the single biggest daily pain point for agent users: context window blindness.\n\n' +
'Before: you\'re halfway through a refactor, the agent stops with "context full," you lose momentum, you start over.\n\n' +
'Now: a live ring meter shows exactly how much context you\'ve used. When it gets tight, you hit **Compact** — one click summarizes the conversation, preserves file paths and decisions, and frees up space. You keep going. No restart. No lost context.\n\n' +
'The other v1.13 features compound this:\n\n' +
'**Inline artifact previews** — Mermaid diagrams, code blocks, tables render live in the chat stream. You see the architecture diagram *while* the agent writes it.\n\n' +
'**Conversation archive** — client-side, instant, searchable. Archive old sessions instead of deleting them. Works in self-hosted and cloud without server changes.\n\n' +
'**Ready-for-dev issue gate** — agents evaluate GitHub issues against type-specific criteria (repro steps for bugs, acceptance criteria for features) before starting. Fewer wasted cycles on underspecified tasks.\n\n' +
'On top of v1.12\'s three **free forever models** (`openhands/glm-5.2`, `openhands/deepseek-v4-flash`, `openhands/minimax-m2.7`) with orange Free badges in the picker — no API keys, no billing surprises.\n\n' +
'OpenHands is the only major agent where a beginner starts today, free, with production models, and graduates to BYOK/self-hosted without switching tools. v1.13 makes that journey sustainable.\n\n' +
'Full article with quick-start steps on terminalblog.\n\n' +
'#OpenHands #AICodingAgent #OpenSource #ContextWindow #DeveloperTools #AIEngineering #FreeModels',
    metadata: { format: 'personal-take', platform: 'linkedin', tool: 'openhands', version: '1.13' },
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