#!/usr/bin/env node
// Share the Claude Code v2.1.228 Windows Git fix article via MyMarky (X + LinkedIn).
// Usage: node scripts/marky-share-claude-code-v21228-windows-fix.cjs
const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const KEY = 'mk_live_2HrW1PDCF5i4rMu809NIDtvxtu0-rdnZOGURht6RWmE';
const API = `https://api.mymarky.ai/api/businesses/${BIZ_ID}/posts`;
const HEADERS = { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' };
const ARTICLE = 'https://terminalblog.com/blog/claude-code-v2-1-228-windows-git-fix-interactive-session-crash/';

const POSTS = [
  {
    // X/Twitter: key takeaways + link
    caption:
`Claude Code v2.1.228 just fixed the Windows Git bug that drove everyone crazy 🪟

• Interactive sessions randomly freezing? Fixed.
• "Git not found" when Git is right there? Fixed.
• Cross-session messages leaking conversation history? Fixed.
• Self-hosted runners dying on checkout hook errors? Fixed.

Quality-of-life: skills from claude.ai marketplace can't shadow your local commands anymore, Vertex creds fail fast, compaction shows real progress.

Full breakdown: ${ARTICLE}
#ClaudeCode #AICodingAgents #Windows #DevTools`,
    link: ARTICLE,
    metadata: { format: 'release-guide', tool: 'claude-code', version: 'v2.1.228' },
  },
  {
    // LinkedIn: personal take, no links in body
    caption:
`Claude Code v2.1.228 is the kind of release that doesn't make headlines but saves you hours of "why is this broken" debugging.

If you've ever launched Claude Code on Windows from a folder above your Git install and got "Git not found" — that's fixed. If your interactive session ever froze mid-work while the process kept running — that's fixed. If you use Remote Control and saw conversation history leak between sessions — that's fixed.

The security fix is quieter but important: marketplace skills synced from claude.ai can no longer shadow your local commands. A marketplace "build" skill won't silently replace YOUR build script anymore. Synced skill bodies are also blocked from running shell commands or expanding file references on your machine.

We're giving AI agents real execution power. The least we can do is make sure marketplace plugins can't hijack what runs.

Beginner-friendly breakdown is up on terminalblog.

#ClaudeCode #AI #Security #CodingAgents #DevTools`,
    metadata: { format: 'personal-take', platform: 'linkedin', tool: 'claude-code', version: 'v2.1.228' },
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