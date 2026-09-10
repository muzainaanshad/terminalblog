#!/usr/bin/env node
// Share Qwen Code v0.23.x wave (v0.23.1-v0.23.3 + Desktop 0.3.0) via MyMarky (X + LinkedIn)
const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const KEY = 'mk_live_2HrW1PDCF5i4rMu809NIDtvxtu0-rdnZOGURht6RWmE';
const API = 'https://api.mymarky.ai/api/businesses/' + BIZ_ID + '/posts';
const HEADERS = { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' };
const ARTICLE = 'https://terminalblog.com/blog/qwen-code-v0-23-1-goals-pause-stuck-worktree-tasks/';

const POSTS = [
  {
    // X/Twitter: key takeaways + link
    caption:
'Qwen Code just shipped the wildest open-source agent feature of September: your Qwen subagent can now hand its turn to Claude Code. 🤝\n\n' +
'v0.23.3 adds ACP delegation — declare an executor, and that subagent runs in Claude Code\'s process while staying in Qwen\'s transcript & permissions.\n\n' +
'🧠 No-progress auto-pause — goals stop & ask after 3 stuck turns\n' +
'🌿 Worktree-isolated tasks — parallel agents, zero file collisions\n' +
'🤝 Delegate turns to Claude Code over ACP (fail-loud, no silent fallback)\n' +
'💸 Spend windows — see what a goal costs WHILE it runs\n\n' +
'Contractor, not takeover: the parent Qwen session stays in charge.\n\n' +
'Full breakdown: ' + ARTICLE + '\n\n' +
'#CodingAgents #QwenCode #ClaudeCode #ACP #AI #DeveloperTools #OpenSource #Autonomy',
    link: ARTICLE,
    metadata: { format: 'release-update', tool: 'qwen-code', version: '0.23.3' },
  },
  {
    // LinkedIn: personal take, no links in body
    caption:
'There are two philosophies for building an AI coding agent: keep everything in-house, or admit other agents are better at some jobs. Qwen Code just chose the second — and I think it is the right call.\n\n' +
'The newest release (v0.23.3, out this week) lets a Qwen subagent delegate its turn to an external agent over ACP — Claude Code first. Your Qwen session stays authoritative in the transcript and permissions, but a specific subagent (deep review, refactor specialist) runs inside whatever agent is best at that job. Contractor, not takeover.\n\n' +
'And the v0.23.x wave is the same maturity story in every corner:\n\n' +
'**Goals that pause themselves.** After three autonomous turns with no progress, a goal stops and calls you back instead of burning tokens against a wall.\n\n' +
'**Worktree-isolated parallel tasks.** Agents edit separate Git worktrees, so two runs cannot silently overwrite each other. Deleting a session reaps its worktrees — no orphaned branches.\n\n' +
'**Spend windows.** The UI shows what a goal has spent against its allowance while it runs, so the burn rate is visible before it becomes a surprise bill.\n\n' +
'**Fail-loud delegation.** If a declared external executor cannot run, the call fails loudly instead of silently falling back in-process and billing the wrong provider.\n\n' +
'None of this is flashy. But knowing when to stop — and when to hand a turn to a specialist — is exactly the maturity layer autonomous agents have been missing. Qwen is building that layer with real, configurable knobs.\n\n' +
'#CodingAgents #AI #QwenCode #ClaudeCode #Autonomy #DeveloperTools #AIEngineering #SoftwareDevelopment',
    metadata: { format: 'personal-take', platform: 'linkedin', tool: 'qwen-code', version: '0.23.3' },
  },
];

(async () => {
  const now = Date.now();
  const results = [];
  for (let i = 0; i < POSTS.length; i++) {
    const p = POSTS[i];
    const scheduled = new Date(now + (30 + i * 60) * 60000).toISOString();
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