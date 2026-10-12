#!/usr/bin/env node
/**
 * Post about Codex v0.162.0 article to X and LinkedIn via MyMarky API
 */

const https = require('https');

const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const API_KEY = 'mk_live_w61K61zmWDi-I-pviWXoYQX7UmU2mJ-xOAVyNdsKVpY';
const API_BASE = 'https://api.mymarky.ai';

const ARTICLE_URL = 'https://terminalblog.com/blog/codex-v0-162-0-worktrees-pinned-tasks-stable/';
const ARTICLE_TITLE = 'Codex Just Learned to Juggle — v0.162.0 Adds Worktrees, Pinned Tasks, and Links You Can Actually Click';

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
  const tweet = 'Codex v0.162.0 just made parallel agents real 🧵\n\n' +
      'Managed Git worktrees — spin up isolated branches, run separate agents on each, merge when done. No more file conflicts.\n\n' +
      'Pinned tasks in Command Center (Ctrl+A → p) — your important work stops disappearing.\n\n' +
      'Clickable URLs in approval prompts — click, don\'t copy-paste.\n\n' +
      'Transcript copy (/copy, Ctrl+Insert) — your history is now a clipboard.\n\n' +
      'Custom providers get live web access + remote compaction.\n\n' +
      'Open-source. No subscription. Just `npm i -g @openai/codex@0.162.0`\n\n' +
      'Full breakdown 👇\n' +
      ARTICLE_URL + '\n\n' +
      '#Codex #OpenAI #AICoding #TerminalAgents #OpenSource';

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
  const linkedinPost = 'Codex v0.162.0 (Oct 8) is the release where the open-source terminal agent finally grows up.\n\n' +
      'THE GOOD:\n' +
      '• Managed Git worktrees — run parallel agents on the same repo without file conflicts. Each agent gets its own isolated working directory.\n' +
      '• Pinned tasks in the Command Center — press \'p\' to pin, tasks stay visible across sessions.\n' +
      '• Clickable URLs everywhere — approval prompts, MCP prompts, warnings. Click, don\'t copy-paste.\n' +
      '• Transcript copy/navigation — /copy command, Ctrl+Insert selections, configurable scroll speed.\n' +
      '• Custom model providers (Ollama, LM Studio, custom gateways) now get live web access and remote compaction.\n' +
      '• JavaScript streaming helpers + ranked tool search for plugin builders.\n\n' +
      'THE BAD:\n' +
      '• Still no voice (that\'s in alpha v0.163.x)\n' +
      '• Worktrees require manual config enable: `codex config set worktrees.enabled true`\n' +
      '• No model upgrade — still GPT-6 Astra since v0.154\n\n' +
      'THE VERDICT:\n' +
      'Codex v0.162.0 doesn\'t add a new model. It adds *agency*. Worktrees = parallelization. Pinned tasks = prioritization. Clickable URLs = flow. This is the release where Codex stops feeling like a chat loop and starts feeling like a multi-agent workspace.\n\n' +
      'Free, open-source (MIT), no vendor lock-in. Just bring your own API keys.\n\n' +
      'Read the full beginner-friendly breakdown 👇';

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
  console.log('=== Posting Codex v0.162.0 Article to Social ===');
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