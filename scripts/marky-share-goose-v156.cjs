#!/usr/bin/env node
// Share Goose v1.56.0 via MyMarky (X + LinkedIn)
const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const KEY = 'mk_live_2HrW1PDCF5i4rMu809NIDtvxtu0-rdnZOGURht6RWmE';
const API = 'https://api.mymarky.ai/api/businesses/' + BIZ_ID + '/posts';
const HEADERS = { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' };
const ARTICLE = 'https://terminalblog.com/blog/goose-v1-56-automatic-thinking-resume-subagents-windows-installer/';

const POSTS = [
  {
    // X/Twitter: key takeaways + link
    caption:
'Goose v1.56 just dropped — and it changes how the agent THINKS.\n\n' +
'✅ Automatic thinking level — model picks its own reasoning depth per turn\n' +
'✅ Resume failed/cancelled subagents — delegated tasks aren\'t dead ends\n' +
'✅ View-only subagent sessions in UI — debug multi-agent workflows\n' +
'✅ Concurrent subagent limits — prevent API bill explosions\n' +
'✅ Windows NSIS installer — finally a REAL Windows install experience\n' +
'✅ IO Intelligence provider + Boa JS runtime replacing PCTX\n' +
'✅ Provider-defined cache prices — accurate cost estimates\n\n' +
'Four words: Goose is becoming a platform. Full breakdown: ' + ARTICLE + '\n\n' +
'#Goose #AICodingAgent #Windows #Rust #OpenSource #DeveloperTools #AIEngineering',
    link: ARTICLE,
    metadata: { format: 'release-update', tool: 'goose', version: '1.56' },
  },
  {
    // LinkedIn: personal take, no links in body
    caption:
'Goose v1.56 shipped October 23, and the feature that changes everything isn\'t the Windows installer (though that\'s huge) — it\'s automatic thinking.\n\n' +
'For years, coding agents made YOU manage reasoning budgets. "Set thinking tokens to 8k." "Disable thinking for simple edits." You became the reasoning scheduler.\n\n' +
'v1.56 flips it: the MODEL decides. Simple edit → instant response. Architectural refactor → deep reasoning. You set GOOSE_CLI_SHOW_THINKING=1 once and watch it work.\n\n' +
'The other features compound the platform story:\n' +
'• Resume subagents = failed delegations recover, not restart\n' +
'• View-only subagent UI = multi-agent debugging is readable\n' +
'• Concurrent limits = your infrastructure doesn\'t melt\n' +
'• NSIS installer = Goose is a first-class Windows app now\n' +
'• Boa JS runtime = extensions run REAL JavaScript, not PCTX\n' +
'• Cache prices = your OpenRouter/Anthropic costs are finally accurate\n\n' +
'Claude Code is Anthropic-first. Codex is OpenAI-first. Goose is every-model — GPT-6 Sol, Opus 5.5, Gemini, GLM, and 50+ more through its provider system. And now it thinks for itself.\n\n' +
'Full release breakdown on terminalblog.\n\n' +
'#Goose #AICodingAgent #GPT6 #Rust #OpenSource #DeveloperTools #AIEngineering #Windows',
    metadata: { format: 'personal-take', platform: 'linkedin', tool: 'goose', version: '1.56' },
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