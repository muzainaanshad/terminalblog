#!/usr/bin/env node
// Share Hermes Agent v0.20.2 release via MyMarky (X + LinkedIn)
const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const KEY = 'mk_live_2HrW1PDCF5i4rMu809NIDtvxtu0-rdnZOGURht6RWmE';
const API = 'https://api.mymarky.ai/api/businesses/' + BIZ_ID + '/posts';
const HEADERS = { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' };
const ARTICLE = 'https://terminalblog.com/blog/hermes-agent-v0-20-2-patch-release-desktop-gateway-cli/';

const POSTS = [
  {
    // X/Twitter: key takeaways + link
    caption:
'Hermes Agent v0.20.2 just dropped — 397 PRs in 3 DAYS. 🚀\n\n' +
'🖥️ Desktop: Multi-gateway connections registry, profile-scoped refreshes, MCP health checks & deep links\n' +
'⌨️ CLI: Windows update probes, Kitty keyboard protocol, chat `-c` hardening\n' +
'🌐 Gateway: Persisted model routes, `/loop` completion, Telegram DM topics\n' +
'💾 Model routing: Prompt caching for LiteLLM Claude on OpenAI wire = lower bills\n' +
'🔧 Cron: Secret scope isolation, auth resolution per-profile\n' +
'📦 Installer: Linux + Windows robustness (self-healing venvs, no more "hermes not found")\n\n' +
'v0.20.0 Herald features (voice, A2A, webhooks) now double-hardened. Full breakdown: ' + ARTICLE + '\n\n' +
'#HermesAgent #AICodingAgent #OpenSource #DeveloperTools #Terminal #Rust #Automation',
    link: ARTICLE,
    metadata: { format: 'release-update', tool: 'hermes', version: '0.20.2' },
  },
  {
    // LinkedIn: personal take, no links in body
    caption:
'I\'ve been running Hermes Agent daily since the early days. v0.20.2 (released Aug 16) is the kind of release that reminds you what open-source velocity looks like when a team treats polish as a feature.\n\n' +
'Three days after v0.20.1, they shipped **397 merged PRs** — ~967 commits across ~1,279 files. That\'s not a typo.\n\n' +
'The headline isn\'t a single feature. It\'s the compound effect:\n\n' +
'**Desktop got multi-gateway management.** Switch between gateway profiles without restarting. MCP servers show health status with deep links to debug. Profile-scoped refreshes mean you fix one connection without nuking the others.\n\n' +
'**CLI works on Windows now.** Update probes catch venv corruption. Kitty keyboard protocol means full modifier/Unicode support in ghostty/WezTerm/Kitty. The `chat -c` resume flag is hardened against corrupted session DBs.\n\n' +
'**Gateway persists your model routes.** Reboot the gateway, your routing choices survive. `/loop` autonomous completion works. Telegram notifications route to specific topics/threads — organized, not spam.\n\n' +
'**Prompt caching for LiteLLM Claude on OpenAI wire.** If you route Claude through LiteLLM, prompt caching now works. Significant cost savings on long conversations.\n\n' +
'**Cron jobs get secret isolation.** Scheduled tasks only see their explicitly scoped credentials. Auth resolves per-profile, not globally. This is governance infrastructure.\n\n' +
'**Installer is genuinely robust on both Linux and Windows.** Self-healing venvs, proper PATH resolution, no more "install succeeded but command not found."\n\n' +
'The v0.20.0 "Herald" features (voice interruption, A2A agent chat, webhooks) now have two layers of hardening under them. v0.21.0 will ship the full curated notes with contributor credits.\n\n' +
'If you run Hermes, `hermes update` takes 30 seconds. The polish pays off every session after.\n\n' +
'Full article with update steps on terminalblog.\n\n' +
'#HermesAgent #AICodingAgent #OpenSource #DeveloperTools #Terminal #Automation #AIEngineering',
    metadata: { format: 'personal-take', platform: 'linkedin', tool: 'hermes', version: '0.20.2' },
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