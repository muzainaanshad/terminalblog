#!/usr/bin/env node
/**
 * Post about OpenClaw 2026.10.1 article to X and LinkedIn via MyMarky API
 */

const https = require('https');

const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const API_KEY = 'mk_live_w61K61zmWDi-I-pviWXoYQX7UmU2mJ-xOAVyNdsKVpY';
const API_BASE = 'https://api.mymarky.ai';

const ARTICLE_URL = 'https://terminalblog.com/blog/openclaw-v2026-10-1-memory-workboard-mcp-apps/';
const ARTICLE_TITLE = 'OpenClaw 2026.10.1 Just Made Agent Memory Survive Everything — Registry Changes, Gateway Restarts, and Cross-Session Context';

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
  const tweet = `OpenClaw 2026.10.1 just dropped — the managed Codex runtime gets its biggest stability wave yet.

✅ Memory survives registry changes, Gateway restarts, model switches
✅ Claude Haiku 5.5 now native (fast, cheap, smart)
✅ Workboard sidebar — personal Kanban inside the agent
✅ MCP Apps stay alive while you chat (browser, DB, Figma)
✅ Sealed immutable installs — deploy/rollback like Git tags
✅ Windows worktrees finally work
✅ Background jobs don't block your chat

This is "production-ready" becoming real.

${ARTICLE_URL}

#OpenClaw #AICoding #Codex #AgentMemory #ClaudeHaiku`;

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
  const linkedinPost = `OpenClaw 2026.10.1 is the release that finally makes the managed Codex runtime trustworthy for production work.

THE BIG SHIFT:
Agent memory now SURVIVES the things that used to kill it:
• Registry changes → memory preserved
• Gateway restarts → context kept
• Model switches → answers survive (no reasoning-tail cutoff)
• Background jobs → chat stays responsive

NEW CAPABILITIES:
• Claude Haiku 5.5 native — fast, cheap, smart daily driver
• Workboard sidebar — personal Kanban boards pinned in the agent UI
• MCP Apps that don't die — browser/DB/design tools stay alive across views
• Sealed immutable installations — prepare → activate → recover like Git tags
• Windows worktree fixes — empty/nested worktrees create correctly
• Security hardening — NUL rejection, failed-closed credentials, private context isolation

WHY THIS MATTERS:
OpenClaw isn't just "Codex with a UI" anymore. It's becoming a platform that runs background automation WHILE you use it interactively. Memory that sticks. Tools that stay connected. Deployments that roll back safely.

If you're evaluating managed agent runtimes for a team, this is the version to test.

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
  console.log('=== Posting OpenClaw 2026.10.1 Article to Social ===');
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