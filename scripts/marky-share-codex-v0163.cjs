#!/usr/bin/env node
// Share Codex v0.163.0 release via MyMarky (X + LinkedIn)
const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const KEY = 'mk_live_2HrW1PDCF5i4rMu809NIDtvxtu0-rdnZOGURht6RWmE';
const API = 'https://api.mymarky.ai/api/businesses/' + BIZ_ID + '/posts';
const HEADERS = { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' };
const ARTICLE = 'https://terminalblog.com/blog/codex-v0-163-0-config-parallel-interrupt/';

const POSTS = [
  {
    // X/Twitter: key takeaways + link
    caption:
      'Codex v0.163.0 stable: /config UI, instant interrupt + steer, leader key, daemon restart, parallel read tools, Daybreak default 🚀\n\n' +
      'What\'s new:\n\n' +
      '1. /config — searchable preferences UI, toggle settings, see what needs restart\n\n' +
      '2. INSTANT INTERRUPT + FOLLOW-UP STEER — type correction mid-response, Codex stops, re-plans, continues\n\n' +
      '3. LEADER KEY in /keymap — default Ctrl+X, set whatever matches your muscle memory\n\n' +
      '4. /daemon RESTART — warns about interrupted work, reconnects automatically\n\n' +
      '5. PARALLEL READ-ONLY TOOLS — skill, memory, history lookups run concurrently\n\n' +
      '6. DAYBREAK DEFAULT — GPT-6.1 Sol enabled by default for eligible accounts\n\n' +
      'v0.162.0 gave you worktrees. v0.163.0 gives you CONTROL.\n\n' +
      'Full breakdown: ' + ARTICLE + '\n\n' +
      '#Codex #OpenAI #CodingAgents #DevTools #Terminal #OpenSource #AI',
    link: ARTICLE,
    metadata: { format: 'release-update', tool: 'codex', version: 'v0.163.0' },
  },
  {
    // LinkedIn: personal take, no links in body
    caption:
      "Codex v0.163.0 is the control layer the open-source terminal agent needed.\n\n" +
      "v0.162.0 gave us managed worktrees (parallel agents). v0.163.0 gives us the steering wheel:\n\n" +
      "⚙️ /config UI — Searchable, visual preferences. No more memorizing dot-notation flags. Toggle, see restart requirements, done.\n\n" +
      "🛑 INSTANT INTERRUPT + STEER — Agent going wrong direction mid-response? Type your correction. Codex stops, incorporates, continues. No more wait → explain → wait cycles.\n\n" +
      "⌨️ LEADER KEY — Default Ctrl+X, but configure whatever your fingers expect. Shortcut hints stay open until you choose.\n\n" +
      "🔄 /daemon RESTART — Background server stuck? Restart with warning, auto-reconnect. Your sessions survive.\n\n" +
      "⚡ PARALLEL READ TOOLS — Skill lookups, memory searches, conversation history run concurrently. Agent \"thinks faster\" when gathering context.\n\n" +
      "🌅 DAYBREAK DEFAULT — GPT-6.1 Sol enabled by default for eligible accounts. Better model, zero config.\n\n" +
      "Bug fixes: Thread resume restores permissions, network proxy checks before DNS, credential aliases can't bypass hooks, Windows clipboard (Ctrl+V/Shift+Insert + images), WSL paste fixes, no more duplicate diffs in exec, stripped binaries = smaller downloads.\n\n" +
      "If you use Codex daily, this is the upgrade that changes the workflow. v0.162.0 made it multi-task. v0.163.0 makes it drivable.\n\n" +
      "#AI #CodingAgents #Codex #OpenAI #SoftwareEngineering #DevTools #Terminal #OpenSource #Productivity",
    metadata: { format: 'personal-take', platform: 'linkedin', tool: 'codex', version: 'v0.163.0' },
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