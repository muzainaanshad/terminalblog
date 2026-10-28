#!/usr/bin/env node
/**
 * Post about Codex 0.164 article to X and LinkedIn via MyMarky API
 */

const https = require('https');

const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const API_KEY = 'mk_live_w61K61zmWDi-I-pviWXoYQX7UmU2mJ-xOAVyNdsKVpY';
const API_BASE = 'https://api.mymarky.ai';

const ARTICLE_URL = 'https://terminalblog.com/blog/codex-0-164-presets-model-switching-images-land/';
const ARTICLE_TITLE = 'OpenAI Codex 0.164 Just Made Model Switching Instant — And Your Prompts Finally Stick';

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
  const tweet = `OpenAI Codex 0.164 just dropped and it's the first release in a while built for daily users.

Three things that change your workflow:

1. /presets — 10 saved prompt slots, keyboard menu. Your standard "review this PR" workflow? One keystroke.

2. /model gpt-5 --reasoning high --speed fast — inline model switching mid-session. No restart, same context.

3. Fullscreen image preview in Kitty/Sixel terminals (Ghostty, WezTerm, Kitty, iTerm2). Diagrams render IN your terminal.

Plus: enterprise MCP auth, session resume fixed, Windows proxy auth works, disk pruning.

Full breakdown: ${ARTICLE_URL}

#Codex #OpenAI #AICoding #TerminalDev`;

  console.log('Posting to Twitter...');
  console.log(tweet);
  console.log('---');

  const resp = await apiRequest('POST', `/api/businesses/${BIZ_ID}/posts`, {
    caption: tweet,
    restrict_publish_to: ['twitter'],
    status: 'SCHEDULED',
    scheduled_publish_time: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 min from now
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
  const linkedinPost = `I've been using OpenAI Codex since the early CLI days. Version 0.164 (released Oct 23) is the first update that genuinely changes how I work daily.

THE GOOD:
• /presets — Save 10 reusable prompt templates. Your "review for security + performance + tests" workflow lives in slot 3. One keystroke, every session.
• /model inline switching — /model o3-mini --reasoning high --speed fast. Mid-conversation. Same context. No restart.
• Fullscreen image preview — If your terminal supports Kitty/Sixel (Ghostty, WezTerm, Kitty, iTerm2), diagrams and generated images render INSIDE the terminal. Zoom, scroll, done.
• Enterprise MCP auth — Real OAuth with secrets support. No more API key workarounds for private MCP servers.
• Session resume finally works — Restores compressed history AND thread settings. Compaction failures don't leave partial summaries.
• Windows proxy auth (Negotiate/NTLM) — Corporate users, this one's for you.
• Disk pruning — Automatic cleanup of unused installs, abandoned checkouts, unbounded daemon logs.

THE VERDICT:
Codex 0.164 isn't a feature drop — it's a workflow drop. The /presets system alone saves 5-10 minutes per session if you have standard prompts. Inline model switching removes the context-switching tax. Image preview makes Codex a visual reasoning tool.

If you use Codex daily, this is the update you've been waiting for.

Read the full breakdown with commands and screenshots 👇`;

  console.log('Posting to LinkedIn...');
  console.log(linkedinPost.slice(0, 200) + '...');
  console.log('---');

  const resp = await apiRequest('POST', `/api/businesses/${BIZ_ID}/posts`, {
    caption: linkedinPost,
    restrict_publish_to: ['linkedIn'],
    status: 'SCHEDULED',
    scheduled_publish_time: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour from now
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
  console.log('=== Posting Codex 0.164 Article to Social ===');
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