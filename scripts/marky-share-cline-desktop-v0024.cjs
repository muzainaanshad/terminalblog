#!/usr/bin/env node
// Share Cline Desktop v0.0.24 update via MyMarky (X + LinkedIn)
const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const KEY = 'mk_live_2HrW1PDCF5i4rMu809NIDtvxtu0-rdnZOGURht6RWmE';
const API = 'https://api.mymarky.ai/api/businesses/' + BIZ_ID + '/posts';
const HEADERS = { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' };
const ARTICLE = 'https://terminalblog.com/blog/cline-desktop-free-coding-models-zero-api-keys/';

const POSTS = [
  {
    // X/Twitter: key takeaways + link
    caption:
'Cline Desktop v0.0.24 is the update that fixes the trust problem. 🛠️\n\n' +
'What shipped in the last 2 weeks:\n\n' +
'💬 Chat stream duplication FIXED — no more double messages\n' +
'📨 Queued messages actually arrive (race condition gone)\n' +
'🤖 Agent asks before giving up on loops (5 identical calls)\n' +
'📂 Import sessions from Claude Code, Codex, opencode\n' +
'⚡ Checkpoint perf: no more 90s freezes on large projects\n' +
'🪟 Windows custom title bar — finally feels native\n' +
'💰 Token costs visible for every session, not just 4\n' +
'🔌 Agent Plugins from ~/.agents/plugins\n' +
'🔄 Hub update dialog loop fixed\n\n' +
'Tried Cline Desktop in August and bounced off bugs? This is the version to come back to.\n\n' +
'Full breakdown: ' + ARTICLE + '\n\n' +
'#Cline #AICodingAgent #DesktopApp #OpenSource #DeveloperTools',
    link: ARTICLE,
    metadata: { format: 'release-update', tool: 'cline', version: '0.0.24' },
  },
  {
    // LinkedIn: personal take, no links in body
    caption:
'Cline Desktop just shipped 14 releases in 2 weeks. I tracked the most important fixes.\n\n' +
'The headline: **trust.** Cline Desktop in August had duplicated chat messages, queued prompts that vanished, and a loop detector that killed runs silently. These are the kind of bugs that make you abandon a tool.\n\n' +
'v0.0.24 fixes all three:\n\n' +
'1. **Chat stream duplication.** Two internal listeners were both rendering the same session events. The fix asks the observer directly instead of guessing from a timer. What you see is what the agent said.\n\n' +
'2. **Queued messages.** Race condition between queue drain and transcript refresh erased your message bubble. Now deferred to the newer turn.\n\n' +
'3. **Silent stops.** When a model loops (5 identical tool calls), you now get a prompt: "Try a different approach" or "Stop." The agent knows why it paused.\n\n' +
'The migration feature: **import sessions from Claude Code, Codex, and opencode.** Your existing work transfers. The agent summarizes the foreign history on first resume. Original transcript stays intact.\n\n' +
'For large projects, **checkpoint creation went from 90 seconds to near-instant.** The old path rebuilt a throwaway git index on every message. Now one snapshot index per session.\n\n' +
'Windows gets a proper title bar. Token costs show for every session, not just the 4 most recent. Agent Plugins from your filesystem.\n\n' +
'This is what "production-ready" looks like for open-source agent desktops. Not feature count. Fix count.',
    metadata: { format: 'personal-take', platform: 'linkedin', tool: 'cline', version: '0.0.24' },
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
