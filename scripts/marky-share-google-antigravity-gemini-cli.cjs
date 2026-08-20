#!/usr/bin/env node
// Share Google Antigravity 2.0 killed Gemini CLI article via MyMarky (X + LinkedIn)
const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const KEY = 'mk_live_2HrW1PDCF5i4rMu809NIDtvxtu0-rdnZOGURht6RWmE';
const API = 'https://api.mymarky.ai/api/businesses/' + BIZ_ID + '/posts';
const HEADERS = { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' };
const ARTICLE = 'https://terminalblog.com/blog/google-antigravity-killed-gemini-cli-terminal-ai-war/';

const POSTS = [
  {
    // X/Twitter: key takeaways + link
    caption:
'Google just killed Gemini CLI 💀\\n\\n' +
'On June 18, free/Pro/Ultra users lost access. The replacement: Antigravity 2.0 + a Go-built CLI with multi-agent orchestration baked in.\\n\\n' +
'🔧 Built in Go — 200ms cold start vs 2s Node\\n' +
'🤖 Dynamic subagents + async `/goal` workflows\\n' +
'⏰ `/schedule` cron jobs — agents work while you sleep\\n' +
'🔄 Unified harness across CLI, desktop, cloud API, SDK\\n' +
'🔒 Trade-off: Model lock-in to Gemini (no Opus 5, GPT-5.6, local models)\\n\\n' +
'Full breakdown + migration guide + vs Claude Code/Codex table: ' + ARTICLE + '\\n\\n' +
'#GoogleAntigravity #GeminiCLI #AICodingAgents #TerminalAI #ClaudeCode #CodexCLI #DeveloperTools',
    link: ARTICLE,
    metadata: { format: 'release-update', tool: 'google-antigravity', topic: 'gemini-cli-sunset' },
  },
  {
    // LinkedIn: personal take, no links in body
    caption:
"Google didn't just deprecate Gemini CLI. They executed a full platform pivot — and most developers missed it.\n\n" +
"On June 18, 2026, anyone on the free tier, Google AI Pro, or Ultra woke up to a dead terminal agent. 100K+ GitHub stars, 6K PRs, millions of users — sunset with a blog post.\n\n" +
"The replacement (Antigravity 2.0) is actually impressive:\n" +
"• A Go binary CLI that starts in 200ms (not 2 seconds)\n" +
"• Native multi-agent orchestration — `/goal \"refactor auth\"` spawns subagents that coordinate\n" +
"• Scheduled tasks via `/schedule` — agents run cron jobs while you sleep\n" +
"• Unified harness across CLI, desktop app, cloud API, and SDK\n\n" +
"But there's a catch: **model lock-in**. You get Gemini. Want Opus 5? GPT-5.6? Qwen3-Max running locally? Not happening in Antigravity.\n\n" +
"My take: Run Antigravity CLI for Google Cloud/Firebase/Workspace work. Run OpenCode/Kilo/Aider for everything else. They're all just terminals — dual-wielding is the pragmatic play.\n\n" +
"Wrote the full breakdown with migration steps, comparison table, and strategic analysis on terminalblog.\n\n" +
"#GoogleAntigravity #AICodingAgents #TerminalAI #GeminiCLI #DeveloperTools #PlatformStrategy #GoogleCloud #AIEngineering",
    metadata: { format: 'personal-take', platform: 'linkedin', tool: 'google-antigravity', topic: 'gemini-cli-sunset' },
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