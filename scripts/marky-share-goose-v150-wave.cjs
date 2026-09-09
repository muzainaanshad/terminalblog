#!/usr/bin/env node
// Share the Goose v1.47-1.50 wave via MyMarky (X + LinkedIn)
const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const KEY = 'mk_live_2HrW1PDCF5i4rMu809NIDtvxtu0-rdnZOGURht6RWmE';
const API = 'https://api.mymarky.ai/api/businesses/' + BIZ_ID + '/posts';
const HEADERS = { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' };
const ARTICLE = 'https://terminalblog.com/blog/goose-v1-50-gpt6-astra-web-search-security-wave/';

const POSTS = [
  {
    // X/Twitter: key takeaways + link
    caption:
'Goose just dropped a 4-release wave in 3 weeks — and it\u2019s huge.\n\n' +
'\u2705 GPT-6 Astra support \u2014 frontier models, first-class\n' +
'\u2705 Web search + browser-use skills BUILT IN \u2014 no MCP wiring\n' +
'\u2705 12+ new providers in v1.49 \u2014 OpenCode Zen, Databricks, more\n' +
'\u2705 Desktop auto-updater + Linux ARM64\n' +
'\u2705 Security wave: fail-closed configs, deny-beats-allow, sensitive traces suppressed\n' +
'\u2705 Hooks got an on_failure block for real error handling\n\n' +
'Four releases, one message: Goose wants to be the only agent you install. Full breakdown: ' + ARTICLE + '\n\n' +
'#Goose #AICodingAgent #GPT6 #Rust #OpenSource #DeveloperTools #WebSearch',
    link: ARTICLE,
    metadata: { format: 'release-update', tool: 'goose', version: '1.50' },
  },
  {
    // LinkedIn: personal take, no links in body
    caption:
'Goose shipped four releases in three weeks (v1.47\u2013v1.50), and the September wave quietly made it the most model-agnostic coding agent available.\n\n' +
'The headline is GPT-6 Astra support in v1.50 \u2014 OpenAI\u2019s newest frontier family works in Goose directly. But the features that change daily work are the quieter ones.\n\n' +
'**Built-in web search and browser use.** Coding agents historically lived inside your repo. Now Goose searches the web and uses a browser in the same session \u2014 \u201ccheck if our dependency has a newer version and update it\u201d completes end-to-end without leaving the terminal.\n\n' +
'**A security fix wave that reads like a hardening checklist.** Fail-closed behavior on malformed tool visibility and invalid credentials. Permission denies now take precedence over approvals. Windows package runners recognized. Sensitive traces suppressed in OpenTelemetry. If you run Goose with real credentials, this is the release cycle where it stopped trusting unvalidated input.\n\n' +
'**Desktop quality-of-life.** Auto-updater, Linux ARM64 packages, git branch indicator, recent-model picker. Plus an on_failure block for hooks \u2014 your safety scripts can now react to tool failures, not just deny calls.\n\n' +
'The model-agnostic case keeps getting stronger. Claude Code is Anthropic-first, Codex is OpenAI-first. Goose is every-model \u2014 GPT-6 Astra, Opus, Gemini, GLM-5.3, and dozens more through its provider system.\n\n' +
'Full article with the release-by-release breakdown is on terminalblog.\n\n' +
'#Goose #AICodingAgent #GPT6 #Rust #OpenSource #DeveloperTools #AIEngineering #WebSearch',
    metadata: { format: 'personal-take', platform: 'linkedin', tool: 'goose', version: '1.50' },
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