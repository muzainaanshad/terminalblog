#!/usr/bin/env node
/**
 * Post about Codex 0.167 article to X and LinkedIn via MyMarky API
 */

const https = require('https');

const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const API_KEY = 'mk_live_w61K61zmWDi-I-pviWXoYQX7UmU2mJ-xOAVyNdsKVpY';
const API_BASE = 'https://api.mymarky.ai';

const ARTICLE_URL = 'https://terminalblog.com/blog/codex-0-167-agent-command-center-image-attachments/';
const ARTICLE_TITLE = 'Codex 0.167 Just Gave You a Command Center — And Your Images Finally Work in Chat';

async function apiRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${API_BASE}${path}`);
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method,
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });

    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function postToTwitter() {
  const tweet = 'Codex 0.167 dropped — and it\'s the first release that makes Codex feel like a complete daily driver.\n\n' +
  '🎯 Agent Command Center (`codex agents --no-daemon`) with unread markers\n' +
  '🖼 Local image preview in composer — paste screenshots, they just work\n' +
  '🔄 Switch backends (OpenAI/Azure/Vertex/Bedrock) — drafts survive\n' +
  '☁️ Vertex AI setup wizard built into onboarding\n' +
  '🌐 System proxy support (macOS/Windows)\n' +
  '🔍 Expandable diffs in approval prompts\n' +
  '⌨️ Ctrl+L clears display, history stays (Ctrl+T)\n\n' +
  'The workflow pieces are finally here.\n\n' +
  ARTICLE_URL + '\n\n' +
  '#OpenAICodex #AICoding #Codex0167';

  console.log('Posting to Twitter...');
  console.log(tweet);
  console.log('---');

  const resp = await apiRequest('POST', `/api/businesses/${BIZ_ID}/posts`, {
    caption: tweet,
    restrict_publish_to: ['twitter'],
    status: 'SCHEDULED',
    scheduled_publish_time: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
  });

  if (resp.status === 201) {
    console.log(`✅ Twitter post scheduled: ${resp.body.id}`);
    return true;
  } else {
    console.error(`❌ Twitter failed (${resp.status}): ${JSON.stringify(resp.body).slice(0, 300)}`);
    return false;
  }
}

async function postToLinkedIn() {
  const linkedinPost = 'Codex 0.167 is the release that finally makes OpenAI\'s coding agent feel like a complete daily driver — not a prototype.\n\n' +
'THE BIG ADDITIONS:\n' +
'• Agent Command Center (`codex agents --no-daemon`) — TUI dashboard with session picker + unread markers. Background agents finally have mission control.\n' +
'• Local image attachments — paste a screenshot, see it preview inline, send. Agent sees it. No file paths, no friction.\n' +
'• Backend switching that keeps your drafts — switch OpenAI ↔ Vertex ↔ Bedrock ↔ Azure mid-conversation. Your unsent prompt stays.\n' +
'• Vertex AI setup wizard — enable `gcp_setup_wizard`, pick ADC or service account, done. 2-minute GCP onboarding.\n' +
'• System proxy support — `/experimental system_proxy true` and it respects your OS proxy. Enterprise unblocked.\n' +
'• Expandable diffs in approval prompts — see the actual patch before you click Allow.\n\n' +
'THE DAILY DRIVER FIXES:\n' +
'• Ctrl+L = clean screen, Ctrl+T = history back (no more losing context to clear)\n' +
'• Saved chats survive model switch — banner shows "can\'t resume" + editable prompt to continue\n' +
'• Network approvals one-at-a-time — no more prompt floods\n' +
'• Realtime V3 speech saves to history\n' +
'• Smarter context compaction accounts for failed responses\n\n' +
'WHY THIS MATTERS:\n' +
'0.166 was UX polish (transcript nav, Terra everywhere, queue resume). 0.167 is workflow completion. The pieces that make Codex a full IDE replacement are finally here.\n\n' +
'If you\'ve been waiting for Codex to "feel done" — this is the version.\n\n' +
'Full breakdown with commands and comparisons 👇\n\n' +
'#AICoding #OpenAI #Codex #DeveloperTools #AIAgents';

  console.log('Posting to LinkedIn...');
  console.log(linkedinPost.slice(0, 200) + '...');
  console.log('---');

  const resp = await apiRequest('POST', `/api/businesses/${BIZ_ID}/posts`, {
    caption: linkedinPost,
    restrict_publish_to: ['linkedIn'],
    status: 'SCHEDULED',
    scheduled_publish_time: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
  });

  if (resp.status === 201) {
    console.log(`✅ LinkedIn post scheduled: ${resp.body.id}`);
    return true;
  } else {
    console.error(`❌ LinkedIn failed (${resp.status}): ${JSON.stringify(resp.body).slice(0, 300)}`);
    return false;
  }
}

async function main() {
  console.log('=== Posting Codex 0.167 Article to Social ===');
  console.log(`Article: ${ARTICLE_TITLE}`);
  console.log(`URL: ${ARTICLE_URL}`);
  console.log('');

  const twitterOk = await postToTwitter();
  await new Promise(r => setTimeout(r, 2000));
  const linkedinOk = await postToLinkedIn();

  console.log('');
  console.log('=== Summary ===');
  console.log(`Twitter: ${twitterOk ? '✅' : '❌'}`);
  console.log(`LinkedIn: ${linkedinOk ? '✅' : '❌'}`);
}

main().catch(e => {
  console.error('Fatal:', e);
  process.exit(1);
});