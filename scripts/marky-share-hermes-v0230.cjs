#!/usr/bin/env node
// Share Hermes Agent v0.23.0 "Hearth Release" via MyMarky (X + LinkedIn)
const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const KEY = 'mk_live_2HrW1PDCF5i4rMu809NIDtvxtu0-rdnZOGURht6RWmE';
const API = 'https://api.mymarky.ai/api/businesses/' + BIZ_ID + '/posts';
const HEADERS = { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' };
const ARTICLE = 'https://terminalblog.com/blog/hermes-agent-v0-23-hearth-release-desktop-webapp-browser/';

const POSTS = [
  {
    // X/Twitter: key takeaways + link
    caption:
'Hermes Agent v0.23 "The Hearth Release" just dropped — ~10k commits since v0.22. 🔥\n\n' +
'🌐 Webapp: Full Desktop workspace in ANY browser tab — phone, tablet, remote machine\n' +
'🧠 One gateway owns EVERY conversation — CLI, TUI, Desktop, editors, bots, cron = one truth\n' +
'🖼️ Terminal images: Paste screenshots, see them inline (kitty, Ghostty, iTerm2, WezTerm, VS Code)\n' +
'⏪ Rewind: Esc+Esc or /rewind → edit any past message, fork new session from that point\n' +
'🖥️ Multi-machine Desktop: All your gateways (laptop, SSH, VPS) in one window\n' +
'🤖 Self-running Group Chats: Lead bot or auto-router picks who answers, live status "scout · terminal · 7s"\n' +
'🔌 Plugins auto-update: 1,050+ catalog, Verified tier (vendor-maintained), held-back safety\n' +
'💰 Spend limits: Paid MCP tools show price per call + running total, asks before limit (even in YOLO)\n' +
'🔀 Pluggable delegation: advanced-delegation plugin = route subagents to different models/profiles\n' +
'⚡ Faster, lighter: ~1,570 fewer tokens/call, cron cache sharing, memory release, 121s→instant sidebar\n' +
'🔒 Curator lock: hermes curator lock protects your hand-edited skills from any tool\n\n' +
'Full breakdown with upgrade steps: ' + ARTICLE + '\n\n' +
'#HermesAgent #AICodingAgent #OpenSource #DeveloperTools #Terminal #Rust #Automation #AIEngineering',
    link: ARTICLE,
    metadata: { format: 'release-update', tool: 'hermes', version: '0.23.0' },
  },
  {
    // LinkedIn: personal take, no links in body
    caption:
'I\'ve been running Hermes Agent daily since before it had a gateway. v0.23 "The Hearth Release" (Nov 5, 2026) is the release that finally makes it feel like infrastructure — not a tool.\n\n' +
'Since v0.22 (Threshold, September): ~10,080 commits · ~1,950 merged PRs · ~8,720 files changed · ~850 issues closed · 666 contributors.\n\n' +
'The compound effect is what hits:\n\n' +
'**Your workspace is now a URL.** Enable the Webapp (webapp.enabled or Settings → Web Access) and your full Desktop — chats, Group Chats, plugins, settings — opens in any browser. On your phone. On a tablet. On a machine without Hermes installed. The gateway *is* the workspace.\n\n' +
'**One gateway, one truth.** No more "which window has the real chat?" The CLI, TUI, Desktop, VS Code ACP, Telegram bots, cron jobs — they all attach to the *same gateway* on each machine. Edit a prompt in Desktop, it updates in the terminal. Send from the terminal, it appears in Desktop. Split-brain conversations are dead.\n\n' +
'**Terminal images.** Paste a screenshot (Ctrl+Shift+V). It renders. In kitty, Ghostty, iTerm2, WezTerm, Konsole, VS Code terminal — real pixels. Coloured blocks elsewhere. Ask "what is in this error screenshot?" — the agent sees it. Tools that screenshot (Playwright, browser automation) show results inline.\n\n' +
'**Rewind.** Press Esc twice or type /rewind. Pick any earlier message. Edit it. Resend it. Fork a new session from that point. The original stays intact. The TUI can even start /new while a turn runs; the old one keeps going in background. Version control for conversations.\n\n' +
'**Multi-machine Desktop.** Add your laptop, your SSH gateway, your VPS — all connected at once. Terminal tabs run on the host they opened on. A Group Chat can mix bots from different machines. One UI, all your infrastructure.\n\n' +
'**Group Chats that run themselves.** Add specialized bots (coder, reviewer, researcher, deployer). Enable auto-route. Drop "refactor the auth module." Watch the lead bot or router pick who answers. Live status: "scout · terminal · 7s". Scheduled jobs can post into the room. Rooms have purpose and shared notes. Bots don\'t ping-loop.\n\n' +
'**Plugins that maintain themselves.** hermes plugins update = everything. Auto-update switch (CLI, chat, Desktop, dashboard) keeps catalog and git plugins current. Breaking updates are *held back*, not applied. Catalog: 600 to 1,050+. Verified tier = vendor-built (Meshy, ElevenLabs, X Chat, REA, bubblewrap sandbox).\n\n' +
'**Spend limits for paid tools.** Meshy 3D, ElevenLabs audio — they declare cost per call. Approval prompt shows: "This call: $0.12 | Running total: $3.47 | Limit: $5.00 — proceed?" Even in YOLO mode, it asks. Set /spend_limit 5.00 and sleep easy.\n\n' +
'**Pluggable delegation.** Install advanced-delegation. Configure: "planning to Opus 5.5", "coding to Sonnet 5.5", "tests to Haiku 5.5". The agent routes automatically. Each subagent on different models, different hardware, different profiles.\n\n' +
'**Lighter, faster, stays running.** Cron jobs share prompt cache. One-shots send ~1,570 fewer tokens. patch/write_file in milliseconds with LSP. Gateway releases closed-session memory. Desktop sidebar: 35k cron runs went from 121s refresh to instant. This is an agent you leave running for weeks.\n\n' +
'**Curator lock.** hermes curator lock stops *any* tool from rewriting a skill you curated — even in YOLO. Your custom skills stay yours.\n\n' +
'If you run Hermes, hermes update takes 30 seconds. Enable the Webapp. Add a remote gateway. Paste an image. Type /rewind. The polish pays off every session after.\n\n' +
'Full article with upgrade steps on terminalblog.\n\n' +
'#HermesAgent #AICodingAgent #OpenSource #DeveloperTools #Terminal #Automation #AIEngineering #Rust',
    metadata: { format: 'personal-take', platform: 'linkedin', tool: 'hermes', version: '0.23.0' },
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
      console.log('Post ' + (i + 1) + ': HTTP ' + r.status + ' | id=' + results[results.length - 1].id + ' | sched=' + scheduled);
    } catch (e) {
      results.push({ i: i + 1, http: 0, id: 'ERROR', error: String(e) });
      console.log('Post ' + (i + 1) + ': ERROR ' + e);
    }
  }
  console.log('SUMMARY:', JSON.stringify(results, null, 1));
})().catch((e) => { console.error('Fatal:', e); process.exit(1); });