#!/usr/bin/env node
// Share the Opencode v1.18.18 release via MyMarky (X + LinkedIn)
const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const KEY = 'mk_live_2HrW1PDCF5i4rMu809NIDtvxtu0-rdnZOGURht6RWmE';
const API = 'https://api.mymarky.ai/api/businesses/' + BIZ_ID + '/posts';
const HEADERS = { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' };
const ARTICLE = 'https://terminalblog.com/blog/opencode-v1-18-18-reliability-mcp-desktop-overhaul/';

const POSTS = [
  {
    // X/Twitter: key takeaways + link
    caption:
'Opencode v1.18.18 just fixed the reasons you kept a commercial backup. 🛠️\n\n' +
'✅ MCP reconnect loops GONE — servers recover after errors\n' +
'✅ Provider model routing fixed — GitHub Copilot, Azure, xAI, Mistral all work as intended\n' +
'✅ Desktop freezes eliminated — large images, project close, tab resize all smooth\n' +
'✅ Session ordering chaos → chronological sanity (forks, reverts, imports work)\n' +
'✅ Clickable file refs in agent responses — click "src/auth/login.ts:42" and go\n' +
'✅ Subagent permission phantom denies fixed — delegated agents run their allowed commands\n' +
'✅ AWS/GCP structured credentials in VS Code — no env var juggling\n' +
'✅ Agent Manager PR actions: resolve threads, jump to comments, scroll-to-top\n' +
'✅ WarpGrep removed (upstream search is better)\n\n' +
'160K stars just got production reliability. Full breakdown: ' + ARTICLE + '\n\n' +
'#Opencode #AICodingAgent #OpenSource #MCP #DeveloperTools #Reliability',
    link: ARTICLE,
    metadata: { format: 'release-update', tool: 'opencode', version: '1.18.18' },
  },
  {
    // LinkedIn: personal take, no links in body
    caption:
'I\'ve watched Opencode grow from a clever skill-driven experiment to a 160K-star agent. v1.18.18 (released Aug 13) is the release that finally makes it a daily driver.\n\n' +
'The headline isn\'t a feature — it\'s the absence of paper cuts:\n\n' +
'**MCP that doesn\'t hang.** SSE connections used to spin in reconnect loops after server errors. Now they recover. For teams running custom MCP tooling, this was the blocker.\n\n' +
'**Provider routing that respects the provider.** GitHub Copilot models now hit their advertised endpoints. Azure Cognitive Services works. xAI prompt caching works. Mistral caching stabilized. You pick a model, it behaves the way the provider designed it.\n\n' +
'**Desktop that stays responsive.** Large pasted images no longer lag the composer. Closing projects doesn\'t freeze. Tab resizing doesn\'t clip. Markdown parsing moved off the main thread.\n\n' +
'**Session history you can trust.** Chronological ordering survives imports, forks, reverts. No more "why is this message out of order?" debugging.\n\n' +
'The quieter wins compound daily:\n\n' +
'**Clickable file references.** Agent says "check src/auth/login.ts:42" — you click, you\'re there. No copy-paste-navigate.\n\n' +
'**Subagent permissions fixed.** A delegated read-only agent\'s allowlist no longer blocks a writable subagent from running `git status`. Edit/MCP denials still inherit as hard ceilings (correctly).\n\n' +
'**AWS/GCP credentials in VS Code.** Paste the JSON, it works. No `AWS_ACCESS_KEY_ID` env var dance.\n\n' +
'**Agent Manager PR actions.** Resolve/unresolve review threads, jump to comments, scroll-to-top in diff view. It\'s becoming a code review companion.\n\n' +
'Opencode has always had the better architecture: explicit skills, slash commands, verifiable lifecycle. v1.18.18 adds the reliability to match. If you tried it months ago and walked away — this is the version to come back for.\n\n' +
'Full article with verification steps on terminalblog.\n\n' +
'#Opencode #AICodingAgent #OpenSource #DeveloperTools #AIEngineering #MCP #Reliability',
    metadata: { format: 'personal-take', platform: 'linkedin', tool: 'opencode', version: '1.18.18' },
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