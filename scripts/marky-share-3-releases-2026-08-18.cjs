#!/usr/bin/env node
// Share 3 release articles via MyMarky (X + LinkedIn)
const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const KEY = 'mk_live_2HrW1PDCF5i4rMu809NIDtvxtu0-rdnZOGURht6RWmE';
const API = 'https://api.mymarky.ai/api/businesses/' + BIZ_ID + '/posts';
const HEADERS = { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' };

const ARTICLES = [
  {
    slug: 'hermes-agent-v0-20-4-patch-74-prs-glass-ui-bot-mode',
    tool: 'hermes',
    version: '0.20.4',
    title: 'Hermes Agent Just Dropped v0.20.4 — 74 PRs in 48 Hours, Glass UI, and Bot Mode That Actually Works',
  },
  {
    slug: 'claude-code-v2-1-234-ntlm-leak-fixed-50-fixes',
    tool: 'claude-code',
    version: '2.1.234',
    title: 'Claude Code Just Patched the NTLM Credential Leak — And 50 Other Fixes You\'ll Actually Feel',
  },
  {
    slug: 'zed-v1-16-pre-gemini-flash-git-panel-mermaid',
    tool: 'zed',
    version: '1.16.0-pre',
    title: 'Zed Just Added Gemini 3.6 Flash — And Made Git Panel Actually Usable',
  },
];

const POSTS = [];

for (const art of ARTICLES) {
  const URL = 'https://terminalblog.com/blog/' + art.slug + '/';

  // X/Twitter: key takeaways + link
  let xCaption = '';
  if (art.tool === 'hermes') {
    xCaption =
      'Hermes Agent v0.20.4 dropped 3 HOURS AGO — 74 PRs, 146 commits in 48h. 🚀\n\n' +
      '🖥️ Matte glass desktop + frost picker + macOS pre-select\n' +
      '📑 Tabbed SESSIONS|BOTS sidebar with per-bot hide/unhide\n' +
      '🤖 Bot Mode: long turns fixed, Markdown fixed, cross-machine routing\n' +
      '🔒 NVIDIA SkillEvaluator Tier 1 scanning on every skill install\n' +
      '⏰ Cron: configurable media timeout, manual-run attachments preserved, missed-fire surfacing\n' +
      '🧠 SessionDB contention fixed + parked-branch honesty in `hermes update`\n' +
      '🔔 Kanban native OS notifications\n' +
      '📦 MCP 2.x SDK migration + Upstage Solar provider (128K ctx, reasoning_effort)\n\n' +
      'Full breakdown: ' + URL + '\n\n' +
      '#HermesAgent #AICodingAgent #OpenSource #DeveloperTools #Terminal #MCP #AgentSwarm #Automation';
  } else if (art.tool === 'claude-code') {
    xCaption =
      'Claude Code v2.1.234: NTLM credential leak PATCHED on Windows + 50 QoL fixes. 🔐\n\n' +
      '🛡️ Windows NT-namespace paths (`\\\\??\\\\`) rejected — closes NTLM hash leak vector\n' +
      '🦊 GitLab MR badges in statusline (draft/pending/green via glab)\n' +
      '🔄 Auto-resume session when claude.ai usage limit resets\n' +
      '📝 Your prompts now RENDER MARKDOWN in transcript (code blocks, lists, inline code)\n' +
      '🏷️ Session titles: "Fix login button on mobile" → "Login button bug"\n' +
      '⚙️ `/permissions`, `/add-dir`, `/config` now open MID-TURN\n' +
      '🐛 50+ fixes: auto-mode re-checks, MCP secret leaks, fullscreen copy, Remote Control sync\n\n' +
      'Full changelog: ' + URL + '\n\n' +
      '#ClaudeCode #Anthropic #AICodingAgent #Security #DeveloperTools #Terminal #Windows #GitLab';
  } else if (art.tool === 'zed') {
    xCaption =
      'Zed v1.16.0-pre: Gemini 3.6 Flash native + Git Panel that actually works. ⚡\n\n' +
      '🤖 Gemini 3.6 Flash in model picker — fast, cheap, no extension needed\n' +
      '📁 Git Panel: collapsible grouped changes + optional stash messages\n' +
      '📐 Mermaid diagrams: zoom + horizontal scroll + triple-tilde fences work\n' +
      '🖥️ Terminal Panel: `terminal.starts_open = false` keeps it closed on new workspaces\n' +
      '🐧 Linux: memory usage improved\n' +
      '⌨️ Helix mode: tab/shift-tab in code actions menu\n' +
      '🐛 30+ bug fixes: path traversal, SSH IOPub, undo/redo safety, rename symbol, remote images\n\n' +
      'Pre-release (stable ~2 weeks): ' + URL + '\n\n' +
      '#ZedEditor #AICodingAgent #Gemini #Git #Mermaid #Linux #DeveloperTools #Rust #Editor';
  }

  POSTS.push({
    caption: xCaption,
    link: URL,
    metadata: { format: 'release-update', tool: art.tool, version: art.version },
  });

  // LinkedIn: personal take, no links in body
  let liCaption = '';
  if (art.tool === 'hermes') {
    liCaption =
      'Hermes Agent v0.20.4 landed 3 hours after I wrote about v0.20.3. The velocity is absurd — 74 PRs merged in 48 hours. 146 commits across 265 files. This isn\'t a patch cycle. This is a feature release wearing a patch label.\n\n' +
      'What actually changed:\n\n' +
      '**Desktop overhaul.** Matte glass translucency with a frost picker. The TUI sidebar splits into SESSIONS | BOTS tabs with per-bot hide/unhide. If you run multiple bot conversations, you finally have organization without mental overhead.\n\n' +
      '**Bot Mode surgery.** Long-running member turns no longer stall. Markdown renders correctly in group chats. Cross-machine routing works — your desktop can hand off to your laptop mid-conversation.\n\n' +
      '**Skills get security scanned.** NVIDIA\'s SkillEvaluator Tier 1 runs on every install. License checks. Security checks. No more blind `hermes skill install` and hoping.\n\n' +
      '**Cron that doesn\'t silently fail.** Configurable media timeout. Manual runs keep attachments. Missed fires surface as `last_fire_error`. Background automation that survives load.\n\n' +
      '**SessionDB contention gone.** The event-loop-thread stalls under load? Fixed. `hermes update` now tells you honestly when you\'re on a parked branch.\n\n' +
      'v0.20.0 → v0.20.4 in 4 days. 1,178+ PRs total. The "Herald" wave (voice, A2A, webhooks, MCP2, Bot Mode, CommandCode) now has 4 layers of hardening.\n\n' +
      'If you run Hermes, `hermes update` takes 30 seconds. The capabilities unlocked today didn\'t exist this morning.\n\n' +
      '#HermesAgent #AICodingAgent #OpenSource #DeveloperTools #Terminal #Automation #AIEngineering #MCP #AgentSwarm';
  } else if (art.tool === 'claude-code') {
    liCaption =
      'Claude Code v2.1.234 is the kind of release that makes you realize how many paper cuts you\'ve been tolerating.\n\n' +
      'The headline: Windows NTLM credential leak patched. Any pre-approval file access touching `\\\\??\\\\` paths now rejected. If you\'re on Windows with `--dangerously-skip-permissions`, this alone justifies the update.\n\n' +
      'But scroll down and there are 50+ fixes that change daily workflow:\n\n' +
      '• GitLab MR badges in the statusline — `MR !42` with draft/pending/green states. No more browser context-switch.\n' +
      '• Auto-resume when your claude.ai usage limit resets. Optional in `/config`.\n' +
      '• Your prompts now RENDER MARKDOWN in the transcript. Code blocks, inline code, lists — readable as documentation.\n' +
      '• Session titles shifted from sentences to scannable nouns: "Login button bug" not "Fix the login button on mobile".\n' +
      '• `/permissions`, `/add-dir`, `/autocompact`, `/theme`, `/help`, `/config`, `/advisor` all open mid-turn in fullscreen TUI.\n' +
      '• Built-in `claude-api` skill context cost: 200k+ tokens → ~25k. Load reference docs on demand.\n' +
      '• Remote Control: account switch stops session in seconds. Phone/claude.ai/code now sync permission mode, model, effort.\n' +
      '• Windows startup no longer stalls on read-only `~/.claude.json`.\n\n' +
      'v2.1.233 (2 days ago) fixed the Windows git crash. v2.1.234 plugs the security hole AND cleans up a year of paper cuts. The transcript markdown rendering alone changes how you review sessions.\n\n' +
      'Update. `claude update` takes seconds.\n\n' +
      '#ClaudeCode #Anthropic #AICodingAgent #Security #DeveloperTools #Terminal #Windows #GitLab #Productivity';
  } else if (art.tool === 'zed') {
    liCaption =
      'Zed v1.16.0-pre dropped last week. It\'s a pre-release, but the signal is clear: Zed is becoming the editor where AI works natively — not bolted on, not a sidebar afterthought.\n\n' +
      'Gemini 3.6 Flash joins the Google AI lineup same-week as announcement. No API key juggling, no extension. If you have a Google AI key, it\'s in the model picker.\n\n' +
      'The Git Panel finally got organized: collapsible grouped change sections. Click to expand only what you care about. Optional stash messages — no more `stash@{0}` mystery meat.\n\n' +
      'Mermaid diagrams zoom and scroll horizontally. ER diagrams with multibyte attributes render. Triple-tilde fences work. If you document architecture in Mermaid, this matters.\n\n' +
      'Terminal Panel: `terminal.starts_open = false` keeps it closed on new workspaces. Open it when you need it.\n\n' +
      'Linux memory usage improved (PR #62192). Helix mode: tab/shift-tab in code actions. 30+ bug fixes including path traversal blocks, SSH IOPub retries, undo/redo safety, rename symbol fixes.\n\n' +
      'Weekly pre-releases. v1.15.0 was July 27. v1.16.0-pre August 12. Model parity as a first-class feature — Claude Opus 5 in v1.13.2, Gemini 3.6 Flash in v1.16.0-pre, GPT-5 in pipeline.\n\n' +
      'The editor isn\'t waiting for plugins. It\'s baking model access into the core.\n\n' +
      'Stable v1.16.0 in ~2 weeks. Pre-release is stable enough for daily use.\n\n' +
      '#ZedEditor #AICodingAgent #Gemini #Git #Mermaid #Linux #DeveloperTools #Rust #Editor #AIEngineering';
  }

  POSTS.push({
    caption: liCaption,
    metadata: { format: 'personal-take', platform: 'linkedin', tool: art.tool, version: art.version },
  });
}

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
      console.log('Post ' + (i + 1) + ': HTTP ' + r.status + ' | id=' + results[results.length - 1].id + ' | sched=' + scheduled);
    } catch (e) {
      results.push({ i: i + 1, http: 0, id: 'ERROR', error: String(e) });
      console.log('Post ' + (i + 1) + ': ERROR ' + e);
    }
  }
  console.log('SUMMARY:', JSON.stringify(results, null, 1));
})().catch((e) => { console.error('Fatal:', e); process.exit(1); });