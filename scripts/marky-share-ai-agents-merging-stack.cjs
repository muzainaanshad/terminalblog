#!/usr/bin/env node
// Share "AI Coding Agents Merging Into One Stack" article via MyMarky (X + LinkedIn)
const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const KEY = 'mk_live_2HrW1PDCF5i4rMu809NIDtvxtu0-rdnZOGURht6RWmE';
const API = 'https://api.mymarky.ai/api/businesses/' + BIZ_ID + '/posts';
const HEADERS = { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' };
const ARTICLE = 'https://terminalblog.com/blog/ai-coding-agents-merging-stack-nobody-planned/';

const POSTS = [
  {
    // X/Twitter: key takeaways + link in tweet
    caption:
      'OpenAI built a Codex plugin for Claude Code. Cursor runs agents on any model. The 3 biggest tools are layering into each other — and nobody planned this stack 🧵\n\n' +
      'What happened in October 2026:\n\n' +
      '1. @OpenAI ships official Codex plugin for @AnthropicAI\'s Claude Code → /codex:review, /codex:rescue, /codex:transfer\n\n' +
      '2. @Cursor runs agents that call ANY model (Composer 2, GPT-6, Opus 5.5, Grok 4.7) + iOS remote control + 20+ marketplace integrations\n\n' +
      '3. @OpenAI Codex adds mid-response steering, parallel read tools, config UI — and runs as subagent inside BOTH Cursor and Claude Code\n\n' +
      'The war was supposed to produce ONE winner. Instead: COMPOSITION.\n\n' +
      'Full breakdown: ' + ARTICLE + '\n\n' +
      '#AIAgents #CodingAgents #Cursor #ClaudeCode #Codex #DevTools #SoftwareEngineering #PlatformEngineering',
    link: ARTICLE,
    metadata: { format: 'deep-dive', tool: 'industry', topic: 'ecosystem-convergence' },
  },
  {
    // LinkedIn: personal take, no links in body (link goes in first comment)
    caption:
      "The AI coding agent war didn't produce a winner. It produced a stack nobody planned.\n\n" +
      "OpenAI shipped an official plugin that runs Codex inside Claude Code. Cursor's agents call any model — including Anthropic's and OpenAI's. Codex runs as a subagent inside both.\n\n" +
      "Three layers are forming:\n\n" +
      "🏗️ LAYER 1 — Editor Shell (Cursor): Coordinator agents, cloud agents with interactive canvases, Origin marketplace (Vercel, Semgrep, Linear, Datadog), iOS remote control. The IDE is now one client; orchestration is the product.\n\n" +
      "⚙️ LAYER 2 — Terminal Agent OS (Claude Code): Mods platform rewrites agent behavior at the hook level, remote MCP with resilience, UNC path blocking. OpenAI's own plugin adds Codex reviews and task delegation as slash commands.\n\n" +
      "🔧 LAYER 3 — Portable Runtime (Codex): Mid-response steering, parallel read-only tools, searchable config UI, background daemon. Runs inside Cursor, inside Claude Code, embedded via SDK.\n\n" +
      "The skill format (SKILL.md / AGENTS.md) is converging across all three. Write once, runs everywhere. Your workflow becomes portable IP — not vendor IP.\n\n" +
      "Economics flipped: Horizontal freedom (BYOK, any model, local execution) beats vertical lock-in. $12/mo for 8+ models vs $20-100/mo for one.\n\n" +
      "Security surface expanded: OpenCode 2.0's persistent daemon, Cursor's managed cloud, Claude Code's Mod hooks — each needs review.\n\n" +
      "The question isn't \"which agent?\" anymore. It's \"which platform do I build on?\"\n\n" +
      "#AI #CodingAgents #Cursor #ClaudeCode #Codex #OpenCode #SoftwareEngineering #DevTools #PlatformEngineering #AgentOrchestration #DeveloperExperience",
    metadata: { format: 'personal-take', platform: 'linkedin', tool: 'industry', topic: 'ecosystem-convergence' },
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