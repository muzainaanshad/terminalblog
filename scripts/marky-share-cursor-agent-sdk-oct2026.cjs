#!/usr/bin/env node
// Share Cursor Agent SDK (Oct 20) via MyMarky (X + LinkedIn)
const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const KEY = 'mk_live_2HrW1PDCF5i4rMu809NIDtvxtu0-rdnZOGURht6RWmE';
const API = 'https://api.mymarky.ai/api/businesses/' + BIZ_ID + '/posts';
const HEADERS = { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' };
const ARTICLE = 'https://terminalblog.com/blog/cursor-agent-sdk-just-changed-how-you-build-ai-agents/';

const POSTS = [
  {
    // X/Twitter: key takeaways + link
    caption:
      'Cursor just dropped an Agent SDK and it changes everything \uD83E\uDD2F\n\n' +
      'Agents are no longer chat prompts. They\'re version-controlled code projects:\n\n' +
      '1. AGENTS AS CODE — instructions.md + tools/ + skills/ + mcp-connections/ + channels/\n' +
      '2. EVALLS — automated testing: `agent-sdk eval` runs in CI, asserts on tool calls\n' +
      '3. CHANNELS — agents wake on GitHub PR, Slack, webhooks, cron — not your keystrokes\n' +
      '4. DEPLOY ANYWHERE — `agent-sdk deploy` to Cursor\'s infra or your own\n' +
      '5. TEMPLATES — security-reviewer, pr-autofixer, linear-triager, jira-triager, owners-policy\n\n' +
      'Full breakdown: ' + ARTICLE + '\n\n' +
      '#Cursor #AgentSDK #AIAgents #DevTools #SoftwareEngineering',
    link: ARTICLE,
    metadata: { format: 'release-update', tool: 'cursor', version: 'agent-sdk-oct-2026' },
  },
  {
    // LinkedIn: personal take, no links in body
    caption:
      "Cursor's Agent SDK (Oct 20) isn't a feature — it's a paradigm shift.\n\n" +
      "For years we've treated AI agents as prompts we type into chat windows. Ephemeral. Untestable. Unreviewable. You tweak the prompt, hope it works, lose the history.\n\n" +
      "The Agent SDK makes agents **software**:\n\n" +
      "**instructions.md** = the system prompt (version-controlled)\n" +
      "**tools/** = typed actions the model can call (TypeScript, testable)\n" +
      "**skills/** = procedures the model loads on demand\n" +
      "**mcp-connections/** = MCP servers as config, not code\n" +
      "**channels/** = GitHub PR, Slack, webhooks, cron — agents wake on events\n" +
      "**evals/** = automated tests asserting on tool calls, inputs, outputs — runs in CI\n\n" +
      "Run `agent-sdk eval` and your agent's behavior is tested before deploy. `agent-sdk github replay <pr-url>` turns real PRs into test fixtures. `agent-sdk deploy` gives you a URL on managed infra with secrets dashboard.\n\n" +
      "Templates ship for security-reviewer (injection, auth bypass, secrets, SSRF), pr-autofixer, linear-triager, jira-triager, owners-policy-approver. Working agents you customize, not blank slates.\n\n" +
      "The Origin Marketplace apps ARE Agent SDK agents. You build -> deploy -> publish to marketplace -> teams install. Cursor handles auth, webhooks, secrets, logging.\n\n" +
      "This is the first time AI coding assistance feels like engineering. Agent behavior in PRs. Git bisect for agent regressions. Rollback with git revert.\n\n" +
      "If you're building developer tools, this is a platform. If you're a team, your guardrails become code reviewable.\n\n" +
      "#AI #CodingAgents #Cursor #SoftwareEngineering #DevTools #AgentOrchestration #PlatformEngineering #AIEngineering",
    metadata: { format: 'personal-take', platform: 'linkedin', tool: 'cursor', version: 'agent-sdk-oct-2026' },
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