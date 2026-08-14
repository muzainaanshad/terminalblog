#!/usr/bin/env node
// Share the Claude Code v2.1.232 release via MyMarky (X + LinkedIn)
const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const KEY = 'mk_live_2HrW1PDCF5i4rMu809NIDtvxtu0-rdnZOGURht6RWmE';
const API = 'https://api.mymarky.ai/api/businesses/' + BIZ_ID + '/posts';
const HEADERS = { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' };
const ARTICLE = 'https://terminalblog.com/blog/claude-code-just-made-subagents-free-and-they-remember-everything/';

const POSTS = [
  {
    // X/Twitter: key takeaways + link
    caption:
'Claude Code v2.1.232 just dropped — and your agents can finally talk to each other. \u2728\n\n' +
'\u2728 Subagent forking ON by default — inherits FULL conversation + prompt cache\n' +
'\u2728 @ mentions to ping other live sessions directly\n' +
'\u2728 GitLab support (bare URLs, nested subgroups, plugin marketplace)\n' +
'\u2728 Fable 5 advisor access for orgs with Fable\n' +
'\u2728 Windows PowerShell/Git Bash permission bypasses FIXED\n' +
'\u2728 Remote Control: 30-min reconnect, tells you WHY session ended\n' +
'\u2728 MCP no longer hangs on bad servers\n' +
'\u2728 GitLab token families now redacted\n\n' +
'Your parallel sessions (frontend/backend/infra) just got a shared brain.\n\n' +
'Full breakdown: ' + ARTICLE + '\n\n' +
'#ClaudeCode #Anthropic #AICodingAgent #Subagents #GitLab #OpenSource',
    link: ARTICLE,
    metadata: { format: 'release-update', tool: 'claude-code', version: '2.1.232' },
  },
  {
    // LinkedIn: personal take, no links in body
    caption:
'I\'ve been using Claude Code since the early CLI days. v2.1.232 (released 6 hours ago) is the first update that genuinely changes how I orchestrate work — not just "another feature."\n\n' +
'The headline: **subagent forking is now on by default.**\n\n' +
'When you spawn a subagent with `subagent_type: "fork"`, it inherits the ENTIRE parent conversation and prompt cache. No more briefing the fixer on bugs you already found. No more re-explaining the API contract to the implementer. The subagent *knows*.\n\n' +
'Combine that with **@ mentions** — type @ in any prompt, pick another live session, send a message directly. Your frontend session tells your backend session "API contract changed." Your infra session tells both "deploy target moved." No copy-paste. No context loss.\n\n' +
'Then there\'s **GitLab support** — bare `gitlab.com/group/subgroup/project` URLs clone like GitHub. Plugin marketplace works. Enterprise policies respect GitLab hosts. If your company runs on GitLab, Claude Code just became a first-class citizen.\n\n' +
'The Windows fixes alone are worth the update: PowerShell permission bypass closed, Git Bash symlink bypass closed, nested repos no longer inherit parent trust. And Remote Control finally tells you *why* a session ended (taken over, deleted, ended elsewhere) instead of silently failing.\n\n' +
'v2.1.228 fixed crashes. v2.1.232 makes Claude Code collaborative.\n\n' +
'If you run multiple sessions — stop manually syncing context. Update and let the agents talk.\n\n' +
'Full article with verification steps on terminalblog.\n\n' +
'#ClaudeCode #Anthropic #AICodingAgent #Subagents #GitLab #DeveloperTools #AIEngineering',
    metadata: { format: 'personal-take', platform: 'linkedin', tool: 'claude-code', version: '2.1.232' },
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