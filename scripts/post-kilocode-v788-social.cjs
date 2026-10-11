#!/usr/bin/env node
/**
 * Post about Kilo Code v7.8.8 article to X and LinkedIn via MyMarky API
 */

const https = require('https');

const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const API_KEY = 'mk_live_w61K61zmWDi-I-pviWXoYQX7UmU2mJ-xOAVyNdsKVpY';
const API_BASE = 'https://api.mymarky.ai';

const ARTICLE_URL = 'https://terminalblog.com/blog/kilocode-v7-8-8-pinned-worktrees-integrated-browser-mcp-oauth/';
const ARTICLE_TITLE = 'Kilo Code v7.8.8 Just Made Your Worktrees Stick — Pinned Sessions, In-App Browser, and MCP OAuth That Actually Works';

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
  const tweet = `Kilo Code v7.8.8 just dropped — the open-source Cursor alternative keeps polishing the daily driver.

✅ Pinned worktrees (Shift+click → stays top, gets shortcut 1,2,3)
✅ Integrated browser tabs per session (no more dual-browser chaos)
✅ MCP OAuth tokens bound to their auth server (enterprise-ready)
✅ Session tab shortcuts: Ctrl+Alt+Left/Right
✅ Settings search: Ctrl+F everywhere

This is the "disappears when you use it" release.

${ARTICLE_URL}

#KiloCode #AICoding #OpenSource #AgentManager`;

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
  const linkedinPost = `I've been tracking Kilo Code's evolution — v7.8.8 is the release that finally makes Agent Manager feel like a daily driver, not a demo.

THE GOOD:
• Pinned worktrees — your main context stays anchored at top with keyboard shortcuts
• Integrated browser tabs per session — click a GitHub link, it opens INSIDE your session tab
• MCP OAuth credential binding — tokens stay loyal to their auth server (security fix)
• Session shortcuts (Ctrl+Alt+Left/Right) — muscle memory finally works
• Settings search (Ctrl+F) — find any of hundreds of settings in seconds

THE SHIFT:
v7.6 made Agent Manager powerful (/goal, notifications, PR loop).
v7.8 makes it *livable* — pin, search, shortcut, browse, secure.

No breaking changes. Pure polish. The kind that compounds daily.

If you're evaluating open-source coding agents, this is the one that respects your workflow.

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
  console.log('=== Posting Kilo Code v7.8.8 Article to Social ===');
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