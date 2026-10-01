#!/usr/bin/env node
// Share Goose v1.52.0 voice release via MyMarky (X + LinkedIn)
const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const KEY = 'mk_live_2HrW1PDCF5i4rMu809NIDtvxtu0-rdnZOGURht6RWmE';
const API = 'https://api.mymarky.ai/api/businesses/' + BIZ_ID + '/posts';
const HEADERS = { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' };
const ARTICLE = 'https://terminalblog.com/blog/goose-just-got-a-voice-and-its-changing-everything/';

const POSTS = [
  {
    // X/Twitter: key takeaways + link
    caption:
'Goose just got a VOICE. 🎙️\\n\\n' +
'v1.52.0 drops live voice conversations in the desktop app — hit Ctrl+Space and talk to your agent.\\n\\n' +
'✅ Voice chat (speak → it responds with voice)\\n' +
'✅ OpenRouter + Jev providers = ANY model\\n' +
'✅ Z.AI streaming tool calls = faster loops\\n' +
'✅ Opus 5.5, GPT-6-sol, GPT-6-luna day one\\n' +
'✅ Full-screen settings redesign\\n' +
'✅ Recipe param limits enforced\\n\\n' +
'Typing is for execution. Speaking is for direction. Goose now gives you both. Full breakdown: ' + ARTICLE + '\\n\\n' +
'#Goose #AICodingAgent #VoiceAI #Rust #OpenSource #DeveloperTools',

    link: ARTICLE,
    metadata: { format: 'release-update', tool: 'goose', version: '1.52.0' },
  },
  {
    // LinkedIn: personal take, no links in body
    caption:
'Goose v1.52.0 shipped live voice conversations in the desktop app, and it quietly changes how you direct an AI coding agent.\\n\\n' +
'The feature is simple: Ctrl+Space, speak your intent, get a voice response. But the workflow shift is real.\\n\\n' +
'**When you type a prompt, you focus on syntax. When you speak, you focus on intent.** You articulate the "what" and "why" — not just the "how." That clarity transfers to the agent. Better plans. Fewer wrong turns. Less "wait, that\'s not what I meant."\\n\\n' +
'The provider expansion is equally significant. OpenRouter and Jev implementations mean Goose now routes to ANY model — Claude, GPT, Gemini, Llama, local models — without leaving the tool. Opus 5.5, GPT-6-sol, GPT-6-luna supported day one.\\n\\n' +
'Z.AI streaming tool calls cut the think → wait → think loop. Results stream back in real-time. Debugging gets faster.\\n\\n' +
'Settings got a full-screen redesign. Small UX win, big daily impact.\\n\\n' +
'Claude Code is Anthropic-first. Codex is OpenAI-first. Goose is every-model. The model-agnostic case keeps getting stronger.\\n\\n' +
'Full article with the release breakdown is on terminalblog.\\n\\n' +
'#Goose #AICodingAgent #VoiceAI #Rust #OpenSource #DeveloperTools #AIEngineering',

    metadata: { format: 'personal-take', platform: 'linkedin', tool: 'goose', version: '1.52.0' },
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