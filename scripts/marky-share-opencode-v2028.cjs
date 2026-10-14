#!/usr/bin/env node
// Share OpenCode v2.0.28 - OpenCode 2 launches via MyMarky (X + LinkedIn)
const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const KEY = 'mk_live_2HrW1PDCF5i4rMu809NIDtvxtu0-rdnZOGURht6RWmE';
const API = 'https://api.mymarky.ai/api/businesses/' + BIZ_ID + '/posts';
const HEADERS = { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' };
const ARTICLE = 'https://terminalblog.com/blog/opencode-v2-just-launched-per-project-auto-accept-windows-arm64/';

const POSTS = [
  {
    // X/Twitter: key takeaways + link
    caption:
'OpenCode 2 just launched (v2.0.28) and it\'s the default install now 🚀\\n\\n' +
'What v2.0.28 brings:\\n' +
'🎯 Per-project auto-accept (mod+shift+a) — no more global approve-all\\n' +
'💪 Native Windows ARM64 binaries — Snapdragon laptops run at full speed\\n' +
'📦 WinGet install: `winget install Anomaly.OpenCode`\\n' +
'🛑 Auto-updates DEAD — explicit `/update` command only\\n' +
'🌳 Built-in worktree tools: create/list/remove in Code Mode\\n' +
'✨ Release highlights dialog post-update\\n\\n' +
'Full breakdown: ' + ARTICLE + '\\n\\n' +
'#CodingAgents #OpenCode #OpenSource #OpenCode2 #DeveloperTools #WindowsARM',
    link: ARTICLE,
    metadata: { format: 'release-update', tool: 'opencode', version: 'v2.0.28' },
  },
  {
    // LinkedIn: personal take, no links in body
    caption:
'OpenCode 2 isn\'t just a version bump — it\'s the first time an open-source coding agent treats the operator like an adult.\n\n' +
'For years, the pattern was: agent auto-updates mid-session, you lose context. Global permission settings — either approve everything (dangerous) or approve nothing (slow). Windows on ARM? Emulation tax. No native package manager path.\n\n' +
'v2.0.28 flips all of it:\n\n' +
'1. **Per-project auto-accept.** Press `mod+shift+a` in any session. Your throwaway experiment repo? Auto-accept on. Production? Strict approval. The context decides, not a global toggle.\n\n' +
'2. **Explicit updates.** The `/update` command (TUI) and `opencode upgrade` (CLI) mean YOU decide when the runtime changes. Not your agent in the middle of debugging. For CI/CD, this is huge — predictable runtime, no surprise pulls.\n\n' +
'3. **Native Windows ARM64.** Surface Pro 11, Snapdragon X Elite laptops — native binaries, no WoW64. Ripgrep, sqlite3, the terminal itself — all native. WinGet makes it `winget install Anomaly.OpenCode`.\n\n' +
'4. **Built-in worktree tools.** `worktree_create`, `worktree_list`, `worktree_remove` in Code Mode. Isolated contexts, normal edit approval. The agent handles git; you approve edits.\n\n' +
'5. **Release highlights dialog.** Post-update TUI shows what changed once. `/highlights` to reopen. You actually read the changelog now.\n\n' +
'OpenCode\'s thesis remains: provider-neutral, local-first, skill-driven. v2 doesn\'t change the thesis — it removes the friction from owning your environment.\n\n' +
'The migration from v1 is one command: `opencode upgrade --major` (added in v1.19.0). Config, skills, sessions migrate. Rollback on failure.\n\n' +
'#CodingAgents #OpenSource #OpenCode #AIEngineering #DeveloperTools #OpenCode2 #WindowsARM',
    metadata: { format: 'personal-take', platform: 'linkedin', tool: 'opencode', version: 'v2.0.28' },
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