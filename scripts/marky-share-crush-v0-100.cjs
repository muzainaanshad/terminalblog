#!/usr/bin/env node
// Share Crush v0.100.0 release via MyMarky (X + LinkedIn)
const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const KEY = 'mk_live_2HrW1PDCF5i4rMu809NIDtvxtu0-rdnZOGURht6RWmE';
const API = 'https://api.mymarky.ai/api/businesses/' + BIZ_ID + '/posts';
const HEADERS = { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' };
const ARTICLE = 'https://terminalblog.com/blog/crush-v0-100-subagents-sysadmin-pgp-ssh/';

const POSTS = [
  {
    // X/Twitter: key takeaways + link
    caption:
      'Crush v0.100.0: Your terminal agent just hired a team 🚀\n\n' +
      "What's new:\n\n" +
      '1. SUBAGENTS — Spawn background agents, monitor live progress bars, send mid-run corrections, stop or reassign models on the fly\n\n' +
      '2. SYSADMIN MODE — Granular permissions for server work: read-only auto-allow, safe-write single-prompt, service-control per-command, privileged always-audit\n\n' +
      '3. PGP/SSH AUTH IN CHAT — Sign commits and SSH to prod without leaving Crush. Keys stay in gpg-agent/ssh-agent. You approve once/session/never.\n\n' +
      '4. CATWALK v3 HOOKS — Full lifecycle: session, turn, permission, subagent hooks. Editor integration leveled up.\n\n' +
      'Run `npm update -g crush` or grab binaries from GitHub.\n\n' +
      'Full breakdown: ' + ARTICLE + '\n\n' +
      '#Crush #Charm #CodingAgents #Terminal #DevTools #OpenSource #AI #Subagents #Sysadmin',
    link: ARTICLE,
    metadata: { format: 'release-update', tool: 'crush', version: 'v0.100.0' },
  },
  {
    // LinkedIn: personal take, no links in body
    caption:
      "Crush v0.100.0 is the release where the terminal agent grows up.\\n\\n" +
      "v0.99 gave us hooks everywhere and Catwalk v3 for editor integration. v0.100.0 gives us **a team you manage**:\\n\\n" +
      "🤖 SUBAGENTS — Delegate parallel work (tests + docs + migration) to background agents. Watch live progress bars in main chat. Send mid-run corrections: \"@subagent-2 use OpenAPI 3.1.\" Stop a runaway agent. Reassign models mid-run (cheap for grunt work, smart for architecture). You're not the typist anymore — you're the tech lead.\\n\\n" +
      "⚙️ SYSADMIN MODE — Coding permissions don't work for servers. New permission tiers: read-only (auto-allow `journalctl`, `systemctl status`), safe-write (config files, single prompt), service-control (`systemctl restart` per-command), privileged (`sudo`, audit-logged). Say \"fix nginx\" — Crush asks for the right permissions at the right level.\\n\\n" +
      "🔐 PGP/SSH IN CHAT — Commit signing and SSH deploys without leaving the agent. Private keys never leave gpg-agent/ssh-agent. You approve: once / session / never. Full audit trail in chat.\\n\\n" +
      "🪝 CATWALK v3 — Hooks now cover the full lifecycle: session start, turn boundaries, permission decisions, subagent events. If you host Crush in VS Code/Zed, the integration just got serious.\\n\\n" +
      "Bug fixes: Windows clipboard (Ctrl+V/Shift+Insert + images), WSL paste, no duplicate diffs in exec, stripped binaries = smaller downloads.\\n\\n" +
      "If you live in the terminal, this is the upgrade that changes the workflow. v0.99 made it extensible. v0.100 makes it a platform.\\n\\n" +
      "#AI #CodingAgents #Crush #Charm #Terminal #DevTools #OpenSource #SoftwareEngineering #Productivity #Subagents",
    metadata: { format: 'personal-take', platform: 'linkedin', tool: 'crush', version: 'v0.100.0' },
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