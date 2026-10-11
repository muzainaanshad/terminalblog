#!/usr/bin/env node
/**
 * Post about Goose v1.54.0 article to X and LinkedIn via MyMarky API
 */

const https = require('https');

const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const API_KEY = 'mk_live_w61K61zmWDi-I-pviWXoYQX7UmU2mJ-xOAVyNdsKVpY';
const API_BASE = 'https://api.mymarky.ai';

const ARTICLE_URL = 'https://terminalblog.com/blog/goose-v1-54-adaptive-thinking-html-export-windows-fix/';
const ARTICLE_TITLE = 'Goose Just Got Adaptive Thinking — And You Can Finally Export Your Sessions';

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
  const tweet = `Goose v1.54.0 just dropped — Block's open-source agent keeps shipping quiet quality.

✅ Adaptive thinking for Claude 5.5 (auto-scales reasoning to task complexity)
✅ HTML session export with interactive viewer (share/debug any session)
✅ Windows npx wrapper now uses system Node.js (no more version mismatches)
✅ GOOSE_CLI_SHOW_THINKING=1 — see model reasoning in real time
✅ Copilot token auto-refresh (no more mid-session auth failures)

The "disappears when you use it" release.

${ARTICLE_URL}

#Goose #AICoding #OpenSource #Block`;

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
  const linkedinPost = `I've been watching Goose (Block's open-source coding agent) evolve — v1.54.0 is the release that solves three real daily-driver pain points.

THE GOOD:
• Adaptive thinking for Claude Sonnet/Haiku 5.5 — the agent now auto-scales reasoning depth. Simple edits = fast/cheap. Complex refactors = deep reasoning. You configure nothing.
• HTML session export with interactive viewer — finally, a shareable, replayable session file. Open in any browser. Token usage, tool calls, reasoning, timeline slider. No Goose install needed to view.
• Windows npx wrapper now respects your system Node.js (nvm/fnm/volta). Native addons load. "Works on Mac, breaks on Windows" fixed for the CLI entry point.

THE QUIET WINS:
• GOOSE_CLI_SHOW_THINKING=1 — see model reasoning live. Trust verification, prompt debugging, hallucination catching.
• Copilot token auto-refresh — no more "auth failed" 3 hours into a session.
• Vision support detection, protocol version stamping, ASAR update fixes, Rust 1.99.

No breaking changes. Pure polish that compounds daily.

If you're evaluating free, local-first, multi-provider coding agents, Goose is the one that respects your workflow.

Read the full breakdown 👇`;

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
  console.log('=== Posting Goose v1.54.0 Article to Social ===');
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