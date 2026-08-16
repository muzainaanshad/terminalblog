#!/usr/bin/env node
// Share the Zed v1.15.0-pre release via MyMarky (X + LinkedIn)
const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const KEY = 'mk_live_2HrW1PDCF5i4rMu809NIDtvxtu0-rdnZOGURht6RWmE';
const API = 'https://api.mymarky.ai/api/businesses/' + BIZ_ID + '/posts';
const HEADERS = { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' };
const ARTICLE = 'https://terminalblog.com/blog/zed-just-got-gpt-5-6-luna-and-self-hosted-ai-models/';

const POSTS = [
  {
    // X/Twitter: key takeaways + link
    caption:
'Zed v1.15.0-pre just dropped GPT-5.6 Luna support for ChatGPT subscribers + self-hosted Sweep edit models. 🎯\n\n' +
'💰 Use your existing ChatGPT Plus/Pro/Team sub — no double billing\n' +
'🔒 Run your own edit-prediction models (CodeLlama, StarCoder, custom) on your GPUs\n' +
'🌿 git.diff_base setting — diff against merge base with main, not just HEAD\n' +
'🖱️ Drag files from Project Panel to external apps (macOS + Linux Wayland)\n' +
'⚡ Linked editing for custom JSX/TSX elements + Emmet in arrow functions\n' +
'🛠️ MCP fixes: servers persist across worktrees, terminal commands no longer hang\n\n' +
'Rust-native, MIT licensed, zero vendor lock-in. Full breakdown: ' + ARTICLE + '\n\n' +
'#Zed #AICodingAgent #OpenSource #GPT5 #SelfHosted #DeveloperTools #ChatGPT',
    link: ARTICLE,
    metadata: { format: 'release-update', tool: 'zed', version: '1.15.0-pre' },
  },
  {
    // LinkedIn: personal take, no links in body
    caption:
'I\'ve been skeptical of AI editors that lock you into their cloud pricing. Zed v1.15.0-pre (released Aug 5) just changed that calculation entirely.\n\n' +
'The headline: **GPT-5.6 Luna support for ChatGPT subscribers**. If you already pay for ChatGPT Plus/Pro/Team, you plug it into Zed and you\'re done. No separate API key. No token counting. No surprise bills.\n\n' +
'But the feature that actually matters for teams with compliance requirements: **self-hosted Sweep Next Edit models**. You point Zed at your own OpenAI-compatible endpoint running fine-tuned CodeLlama, StarCoder, or custom sweep models on your own GPUs. Edit predictions — the inline "what should I type next" suggestions — run entirely on your infrastructure. Zero data egress.\n\n' +
'The `git.diff_base` setting is the quiet productivity win. Set it to `default_branch` and your gutter indicators show changes against the merge base with main, not just HEAD. For long-lived feature branches, this eliminates the "why does this diff show three merges ago?" confusion.\n\n' +
'On top of that: drag files to external apps, linked editing for custom JSX/TSX components, Emmet in arrow functions, and MCP server fixes that make the agent panel actually reliable across worktrees.\n\n' +
'Zed is the only editor that gives you: native speed (Rust), first-class Vim/Helix modes, ChatGPT subscription support, BYOK, AND self-hosted edit models — all in one package. v1.15 makes that stack production-ready.\n\n' +
'Full article with setup steps on terminalblog.\n\n' +
'#Zed #AICodingAgent #OpenSource #SelfHostedAI #DeveloperTools #AIEngineering #ChatGPT',
    metadata: { format: 'personal-take', platform: 'linkedin', tool: 'zed', version: '1.15.0-pre' },
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