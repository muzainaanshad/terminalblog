#!/usr/bin/env node
// Share Visual Studio 2026 November Cloud Agent Preview via MyMarky (X + LinkedIn)
const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const KEY = 'mk_live_2HrW1PDCF5i4rMu809NIDtvxtu0-rdnZOGURht6RWmE';
const API = 'https://api.mymarky.ai/api/businesses/' + BIZ_ID + '/posts';
const HEADERS = { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' };
const ARTICLE = 'https://terminalblog.com/blog/visual-studio-2026-november-cloud-agent-preview/';

const POSTS = [
  {
    // X/Twitter: key takeaways + link
    caption:
'Visual Studio 2026 November Update just shipped GitHub Cloud Agent Preview \u{1F680}\n\n' +
'What this means for .NET devs on GitHub:\n' +
'\u{2022} Delegate UI cleanups, refactors, doc updates, multi-file edits to a cloud agent\n' +
'\u{2022} Review changes via PR \u{2014} standard GitHub workflow, no new tools\n' +
'\u{2022} Copilot Actions in context menu: generate comments, explain, optimize, architecture review \u{2014} one click\n' +
'\u{2022} Agent handles end-to-end tasks with less back-and-forth\n\n' +
'The catch: Azure DevOps not supported yet (Microsoft acknowledged demand, no timeline)\n\n' +
'Full breakdown: ' + ARTICLE + '\n\n' +
'#CodingAgents #GitHubCopilot #VisualStudio #DotNet #DeveloperTools #AI',
    link: ARTICLE,
    metadata: { format: 'release-update', tool: 'github-copilot', version: '2026-nov' },
  },
  {
    // LinkedIn: personal take, no links in body
    caption:
'Visual Studio 2026 November Update isn\'t just another IDE release. It\'s the first time Microsoft put a cloud-based coding agent inside the flagship .NET IDE with a workflow that fits how enterprise teams actually work: delegate \u{2192} PR \u{2192} review \u{2192} merge.\n\n' +
'If you live in VS 2026 + GitHub, this changes your daily flow:\n\n' +
'1. **Cloud Agent Preview** \u{2014} You describe the task ("add validation to UserController \u{2014} DTO, tests, the works"), the agent works in the cloud, and a PR appears with all files changed. You review and merge. No more "also update the DTO" \u{2192} "also update the tests" \u{2192} "run the tests" back-and-forth.\n\n' +
'2. **Copilot Actions in context menu** \u{2014} Right-click code \u{2192} Generate comments, Explain, Optimize, Architecture review. Zero typing. The agent analyzes selected code + surrounding context + project structure.\n\n' +
'3. **More capable agent workflows** \u{2014} The release notes say "handle end-to-end tasks with less back-and-forth." In practice: you delegate a full feature slice, get a PR back. That\'s the loop.\n\n' +
'The elephant in the room: **Azure DevOps users are left out.** Microsoft explicitly said Cloud Agent preview is "focused on GitHub." If your org uses ADO (which Microsoft has steered .NET shops toward for years), you can\'t use it. The devblogs comments are... spirited.\n\n' +
'Bottom line: If you\'re on GitHub + VS 2026, update today and try it. The context menu actions alone save clicks daily. The Cloud Agent preview lets you offload the work you\'ve been putting off for months.\n\n' +
'If you\'re on Azure DevOps... you\'re filing feature requests and waiting.\n\n' +
'#CodingAgents #GitHubCopilot #VisualStudio #DotNet #DeveloperExperience #AIEngineering #EnterpriseSoftware',
    metadata: { format: 'personal-take', platform: 'linkedin', tool: 'github-copilot', version: '2026-nov' },
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
      console.log('Post ' + (i + 1) + ': HTTP ' + r.status + ' | id=' + results[results.length - 1].id + ' | sched=' + scheduled);
    } catch (e) {
      results.push({ i: i + 1, http: 0, id: 'ERROR', error: String(e) });
      console.log('Post ' + (i + 1) + ': ERROR ' + e);
    }
  }
  console.log('SUMMARY:', JSON.stringify(results, null, 1));
})().catch((e) => { console.error('Fatal:', e); process.exit(1); });