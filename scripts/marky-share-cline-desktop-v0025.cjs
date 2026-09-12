#!/usr/bin/env node
// Share Cline Desktop v0.0.25 update via MyMarky (X + LinkedIn)
const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const KEY = 'mk_live_2HrW1PDCF5i4rMu809NIDtvxtu0-rdnZOGURht6RWmE';
const API = 'https://api.mymarky.ai/api/businesses/' + BIZ_ID + '/posts';
const HEADERS = { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' };
const ARTICLE = 'https://terminalblog.com/blog/cline-desktop-free-coding-models-zero-api-keys/';

const POSTS = [
  {
    // X/Twitter: key takeaways + link
    caption:
'Cline Desktop v0.0.25: the model picker finally stops lying to you. 🎯\n\n' +
'What just shipped:\n\n' +
'✅ ChatGPT/Codex plans now show ONLY models you can use\n' +
'   (gone: retired gpt-5.4, ghost GPT-4o entries, wrong context caps)\n' +
'✅ Windows updates stop failing — installer kills the sidecar daemon first\n' +
'✅ Claude Code / Codex CLI sessions start WITHOUT pasting an API key\n' +
'✅ Sent messages no longer vanish when a send fails (OAuth refresh)\n' +
'✅ OpenCode = local CLI auth now, not a dead browser button\n' +
'✅ Session import moved to its own Settings page\n' +
'⚠️ Heads up: default model reshuffled for 36 providers — pin yours\n\n' +
'Check your default model after updating.\n\n' +
'Full breakdown: ' + ARTICLE + '\n\n' +
'#Cline #AICodingAgent #DesktopApp #DeveloperTools #ChatGPT',
    link: ARTICLE,
    metadata: { format: 'release-update', tool: 'cline', version: '0.0.25' },
  },
  {
    // LinkedIn: personal take, no links in body
    caption:
'Cline Desktop shipped v0.0.25 — a small release that fixes three daily frustrations.\n\n' +
'1. **The model picker stopped lying.** ChatGPT/Codex subscribers saw models they could not use (GPT-4o, chatgpt-image-latest next to Codex models), and the runtime lost the Codex context caps. Now the picker lists only what your plan supports, and every Codex model is capped at its real 400K/272K/128K backend budget instead of the API\u2019s 1.05M limits. Retired gpt-5.4/mini are gone; default is gpt-5.6-terra.\n\n' +
'2. **Windows updates actually complete.** The detached Cline Hub daemon held code-sidecar.exe open, so Tauri\u2019s installer failed with "Error opening file for writing" until you killed it by hand. The installer now stops the daemon first — matched on full path, so stable and Beta channels no longer take each other down.\n\n' +
'3. **Login friction is gone for CLI-authenticated providers.** Claude Code and Codex CLI sessions now start without an API key. OpenCode is treated as a local CLI provider instead of a dead OAuth button. And if a send fails before the turn starts, your prompt comes back to the composer instead of being lost.\n\n' +
'One thing every existing user should do: the built-in catalog reshuffled default models for **36 providers** — many moved from Claude Fable 5.1 to GPT-6 Astra, Vertex to Gemini 3.8 Flash, OpenRouter/Kilo to Inception Mercury 2.5. If you never pinned a model, your next session may run on something different. One glance at Settings → Models and you are in control again.\n\n' +
'Small release, real trust fixes.',
    metadata: { format: 'personal-take', platform: 'linkedin', tool: 'cline', version: '0.0.25' },
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