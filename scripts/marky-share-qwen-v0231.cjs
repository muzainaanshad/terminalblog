#!/usr/bin/env node
// Share Qwen Code v0.23.1 via MyMarky (X + LinkedIn)
const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const KEY = 'mk_live_2HrW1PDCF5i4rMu809NIDtvxtu0-rdnZOGURht6RWmE';
const API = 'https://api.mymarky.ai/api/businesses/' + BIZ_ID + '/posts';
const HEADERS = { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' };
const ARTICLE = 'https://terminalblog.com/blog/qwen-code-v0-23-1-goals-pause-stuck-worktree-tasks/';

const POSTS = [
  {
    // X/Twitter: key takeaways + link
    caption:
'Your coding agent spun for 40 minutes on one failing test and burned $12. 😤\n\nQwen Code v0.23.1 just fixed that — with a feature every agent needs: goals that PAUSE THEMSELVES after 3 stuck turns.\n\n' +
'🧠 No-progress auto-pause — goals stop & ask, instead of burning tokens\n' +
'🌿 Worktree-isolated tasks — parallel agents, zero file collisions\n' +
'💸 Spend windows — see what a goal costs WHILE it runs\n' +
'🔒 Session leases — concurrent agents can\'t corrupt each other\n\n' +
'Knowing when to give up is a feature, not a bug. The agent that admits it\'s stuck is the agent you can trust with autonomy.\n\n' +
'Full breakdown: ' + ARTICLE + '\n\n' +
'#CodingAgents #QwenCode #AI #DeveloperTools #OpenSource #Terminal #Autonomy #DevLife',
    link: ARTICLE,
    metadata: { format: 'release-update', tool: 'qwen-code', version: '0.23.1' },
  },
  {
    // LinkedIn: personal take, no links in body
    caption:
'We have all been there: you start an agent on a "fix the failing tests" goal, walk away, and come back to it still grinding the same test — burning tokens and churning your git history for nothing.\n\n' +
'The newest Qwen Code release (v0.23.1, out this week) directly attacks that failure. And it is the most honest feature an agent can ship.\n\n' +
'**Goals now pause themselves after three autonomous turns that make no progress.** Not "stop and delete everything" — pause, and call you back for a decision. That single behavior turns an autonomous loop from a cost hazard into a monitored budget.\n\n' +
'The release also adds three things that matter for anyone running agents in anger:\n\n' +
'**Worktree-isolated named tasks.** Each parallel task edits its own Git worktree, so agents can run side by side without overwriting each other. And deleting a session reaps its worktrees — no more orphaned branches piling up.\n\n' +
'**Spend windows.** The UI shows what a goal has spent against what it is allowed, live. You see the burn rate before it becomes a surprise bill, not after.\n\n' +
'**Session leases and fencing.** Writers must hold a lease; concurrent daemons are fenced. The cross-session corruption class of bugs gets addressed at the protocol level instead of with prayers.\n\n' +
'None of this is flashy. No new model, no benchmark score. But "knowing when to stop" is the missing maturity layer for autonomous agents — and it is exactly the direction every tool needs to go. Qwen just got there with knobs you can actually configure.\n\n' +
'If you run autonomous goals on any agent, the no-progress pause is the single setting worth checking for first.\n\n' +
'#CodingAgents #AI #QwenCode #Autonomy #DeveloperTools #AIEngineering #SoftwareDevelopment',
    metadata: { format: 'personal-take', platform: 'linkedin', tool: 'qwen-code', version: '0.23.1' },
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