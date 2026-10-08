#!/usr/bin/env node
// Share Zed v1.24.1-pre (Git tags, Terminal→Agent drag, Bedrock BYOK, JSONL tables, -23% Linux binary) via MyMarky (X + LinkedIn)
const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const KEY = 'mk_live_2HrW1PDCF5i4rMu809NIDtvxtu0-rdnZOGURht6RWmE';
const API = 'https://api.mymarky.ai/api/businesses/' + BIZ_ID + '/posts';
const HEADERS = { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' };
const ARTICLE = 'https://terminalblog.com/blog/zed-v1-24-gpt6-sol-git-tags-agent-memory/';

const POSTS = [
  {
    // X/Twitter: key takeaways + link
    caption:
'Zed v1.24 just shipped Git tags, Terminal→Agent drag, and a 23% smaller Linux binary — the pre-release that feels like a milestone 🚀\n\n' +
'The quiet wins that change daily work:\n\n' +
'🏷️ Git tag creation from UI — Create Tag… in Git History/Graph, no terminal needed\n' +
'🖱️ Drag Terminal tabs into Agent Panel — context follows the agent automatically\n' +
'☁️ Amazon Bedrock BYOK with configurable tool use, images, thinking\n' +
'📊 JSONL/NDJSON files render as sortable, filterable tables (millions of rows)\n' +
'🐧 Linux binary -23% (stripped debug symbols), faster startup\n' +
'⚡ Project search/memory over misclassified binaries fixed\n' +
'🐛 50+ bug fixes: .env language, Unicode fonts on Linux, remote SFTP spaces, Mermaid fences\n\n' +
'Full breakdown: ' + ARTICLE + '\n\n' +
'#Zed #CodingAgents #AIEditor #Git #Linux #DeveloperTools',
    link: ARTICLE,
    metadata: { format: 'release-update', tool: 'zed', version: 'v1.24.1-pre' },
  },
  {
    // LinkedIn: personal take, no links in body
    caption:
'The best editor releases don\'t announce themselves — they just remove friction you\'ve been living with.\n\n' +
'Zed v1.24.1-pre (Oct 7) is that kind of release. No splashy blog post. Just:\n\n' +
'• Git tag creation from the UI — two clicks instead of `git tag -a` + `git push origin`\n' +
'• Drag a Terminal tab into the Agent Panel and the agent inherits working directory, env, and recent output as context. Your terminal becomes a context source, not a separate tool.\n' +
'• Amazon Bedrock BYOK with full tool/image/thinking config — no more "Bedrock model X doesn\'t support tools in Zed" dead ends.\n' +
'• JSONL/NDJSON files become sortable, filterable tables. Your LLM streaming outputs, logs, datasets — browsable.\n' +
'• 23% smaller Linux binary, faster startup, project search that doesn\'t choke on build artifacts.\n' +
'• 50+ bug fixes covering the paper cuts you hit daily: .env false shellcheck warnings, emoji fonts on Linux, remote SFTP with spaces, Mermaid rendering.\n\n' +
'The pattern is clear: Zed is building the editor substrate where AI works natively. Not bolted on. Not a sidebar afterthought. The terminal tool improvements benefit every agent that shells out. The Git Panel upgrades benefit every workflow. The model picker expanding weekly benefits every BYOK setup.\n\n' +
'v1.22 gave you model parity. v1.23 gave you GPT-6.1 Sol and JSONL tables. v1.24 gives you Git workflows that stay in the editor and a terminal that feeds the agent directly.\n\n' +
'If you\'ve been waiting for a pre-release that feels like a milestone — this is it.\n\n' +
'#CodingAgents #Zed #AIEditor #DeveloperTools #Git #Linux #AIEngineering',
    metadata: { format: 'personal-take', platform: 'linkedin', tool: 'zed', version: 'v1.24.1-pre' },
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