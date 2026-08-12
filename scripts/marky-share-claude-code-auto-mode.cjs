#!/usr/bin/env node
// Share Claude Code auto mode default article via MyMarky (X + LinkedIn).
// Usage: node scripts/marky-share-claude-code-auto-mode.cjs
const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const KEY = 'mk_live_2HrW1PDCF5i4rMu809NIDtvxtu0-rdnZOGURht6RWmE';
const API = `https://api.mymarky.ai/api/businesses/${BIZ_ID}/posts`;
const HEADERS = { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' };
const ARTICLE = 'https://terminalblog.com/blog/claude-code-auto-mode-default-august-2026/';

const POSTS = [
  {
    // X/Twitter: key takeaways + link
    caption:
`Starting Aug 14, Claude Code opens in auto mode by default. 🤖

Your agent will stop asking permission before safe actions — reading files, running tests, editing code. Just does it.

Key details:
→ Only new sessions, existing settings preserved
→ Opt out with one setting in ~/.claude/settings.json
→ Classifier runs on Anthropic infra (no quota cost)

Why it matters: first major coding agent to make hands-free the default for millions of devs.

Full breakdown: ${ARTICLE}
#ClaudeCode #CodingAgents #Anthropic`,
    link: ARTICLE,
    metadata: { format: 'release-guide', tool: 'claude-code', version: 'august-2026' },
  },
  {
    // LinkedIn: personal take, no links in body
    caption:
`Claude Code just made the quietest but most significant change any coding agent has shipped this year.

Starting August 14, new sessions open in auto mode by default. That means the agent stops asking your permission before it reads files, runs tests, edits code — it just does it. Only truly risky actions still trigger a prompt.

The classifier has been trained on five months of production use since auto mode launched in March. Anthropic shipped dozens of permission-bypass fixes, hook interaction patches, and safety refinements to get it here. The Ultraplan preview was removed in the same release, and worktree isolation now blocks Bash commands from reaching the main checkout.

What I find interesting: this is the first time a major coding agent has decided that "less interruption" is the default, not an opt-in. Cursor, Copilot, and OpenHands all support hands-free operation — but none of them flipped the switch for everyone.

The enterprise story is controlled autonomy: admins can set the default mode, restrict available modes, and override user preferences via managed settings. That is the governance model that makes auto mode enterprise-ready rather than just developer-convenient.

If you use Claude Code and prefer to keep the prompts, add {"permissions":{"defaultMode":"normal"}} to your settings before the 14th.

#ClaudeCode #AI #CodingAgents #Anthropic #DevTools`,
    metadata: { format: 'personal-take', platform: 'linkedin', tool: 'claude-code', version: 'august-2026' },
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
      console.log(`Post ${i + 1}: HTTP ${r.status} | id=${results[i].id} | sched=${scheduled}`);
    } catch (e) {
      results.push({ i: i + 1, http: 0, id: 'ERROR', error: String(e) });
      console.log(`Post ${i + 1}: ERROR ${e}`);
    }
  }
  console.log('SUMMARY:', JSON.stringify(results, null, 1));
})().catch((e) => { console.error('Fatal:', e); process.exit(1); });
