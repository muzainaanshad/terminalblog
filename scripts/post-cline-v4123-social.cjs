#!/usr/bin/env node
/**
 * Post Cline v4.1.23 article to X (Twitter) and LinkedIn via MyMarky
 */

const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const KEY = 'mk_live_2HrW1PDCF5i4rMu809NIDtvxtu0-rdnZOGURht6RWmE';
const API = 'https://api.mymarky.ai/api/businesses/' + BIZ_ID + '/posts';
const HEADERS = { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' };
const ARTICLE = 'https://terminalblog.com/blog/cline-v4-1-23-claude-azure-fixes-commit-rules-mcp-paging/';

const POSTS = [
  {
    // X/Twitter: key takeaways + link
    caption:
      'Cline v4.1.23 just fixed the Azure/Corporate Gateway 400 error for Claude + Generate Commit Message now respects .clinerules + MCP tool output paging. 🔧\n\n' +
      '✨ Azure AI Foundry & custom Anthropic base URLs work again (v4.1.22 broke this)\n' +
      '📝 Generate Commit Message finally follows your .clinerules conventions\n' +
      '📄 MCP tool output exceeding context? Now pageable via read_files\n' +
      '🧠 Kimi K3 & picky models: auto-negotiates reasoning level\n' +
      '📋 Model catalog refresh — GPT-6.1 Sol added, DeepSeek V4.1 Flash dropped\n' +
      '✅ Approve/Reject race condition fixed while panel updates\n' +
      '🧹 Focus Chain cleanup on task reopen\n\n' +
      'The quiet reliability patch enterprise teams needed. Full breakdown: ' + ARTICLE + '\n\n' +
      '#Cline #AICodingAgent #Azure #Claude #MCP #DeveloperTools #VSCode #AIEngineering',
    link: ARTICLE,
    metadata: { format: 'release-update', tool: 'cline', version: '4.1.23' },
  },
  {
    // LinkedIn: personal take, no links in body
    caption:
      "Cline v4.1.23 dropped and it's the kind of release that fixes the things that make you silently curse at your terminal.\n\n" +
      "Azure/Corporate Gateway 400 error for Claude? Fixed.\n" +
      "Generate Commit Message finally respects .clinerules? Fixed.\n" +
      "MCP output that exceeds context? Now pageable.\n" +
      "Kimi K3 and picky models rejecting requests? Auto-negotiation added.\n\n" +
      "This is what sustainable velocity looks like — not features for demos, fixes for the workflow you actually live in.\n\n" +
      "The Azure fix alone saves enterprise teams hours of \"why is my custom endpoint returning 400?\" debugging. The .clinerules for commit messages means your conventions actually apply everywhere — not just in chat, but in the commits the agent writes for you.\n\n" +
      "MCP paging is quietly huge: database queries, log dumps, large file reads — the agent can now page through results instead of hitting a hard wall. It fetches page 2, page 3, using the same tool.\n\n" +
      "No breaking changes. Seven fixes. Update before your next session.\n\n" +
      "#Cline #AICodingAgent #Azure #Claude #MCP #DeveloperTools #AIEngineering #VSCode #Productivity",
    metadata: { format: 'personal-take', platform: 'linkedin', tool: 'cline', version: '4.1.23' },
  },
];

(async () => {
  const now = Date.now();
  const results = [];
  for (let i = 0; i < POSTS.length; i++) {
    const p = POSTS[i];
    // Schedule X in ~2 min, LinkedIn in ~7 min
    const scheduled = new Date(now + (2 + i * 5) * 60000).toISOString();
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