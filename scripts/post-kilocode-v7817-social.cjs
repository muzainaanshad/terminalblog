#!/usr/bin/env node
/**
 * Post KiloCode v7.8.17 security patch article to MyMarky (X + LinkedIn)
 */

const https = require('https');

const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const API_KEY = 'mk_live_w61K61zmWDi-I-pviWXoYQX7UmU2mJ-xOAVyNdsKVpY';
const API_BASE = 'https://api.mymarky.ai';

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

async function main() {
  const articleUrl = 'https://terminalblog.com/blog/kilocode-v7-8-17-security-patch-browser-mcp-fixes/';
  
  // Twitter post - emotional hook, link in reply
  const twitterText = `KiloCode just patched the eMudhra certificate compromise 🔒

Your MCP prompts can no longer execute shell commands
Browser links locked to HTTPS only
Session PR badges restored

This is the security release you update for, not the one you read about.

https://terminalblog.com/blog/kilocode-v7-8-17-security-patch-browser-mcp-fixes/`;

  // LinkedIn post - longer format, link in comment
  const linkedinText = `KiloCode v7.8.17 dropped October 23 as a security patch release. Here's what changed and why it matters:

🔒 **eMudhra certificate compromise patched** — pinned Bun runtime blocks compromised cert chains across all CLI platforms

🌐 **Browser links & MCP OAuth restricted to HTTPS** — no more file://, data://, or custom scheme attacks

⚡ **Shell expressions in MCP prompts treated as literal text** — eliminates an RCE vector affecting every MCP client

✅ **Session PR badges restored** when Remote Control is disabled — local workflows aren't penalized

☁️ **Kilo Cloud provider added** — built-in session host registry for cloud session management

This isn't a feature release. It's a security release with zero breaking changes. If you run KiloCode in production, update today.

#KiloCode #Security #AICodingAgents #DevTools #OpenSource`;

  const schedTime = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 min from now

  // Post to Twitter
  console.log('Posting to Twitter (X)...');
  try {
    const resp = await apiRequest('POST', `/api/businesses/${BIZ_ID}/posts`, {
      caption: twitterText,
      restrict_publish_to: ['twitter'],
      status: 'SCHEDULED',
      scheduled_publish_time: schedTime,
    });
    if (resp.status === 201) {
      console.log(`✅ Twitter post scheduled: ${resp.body.id}`);
    } else {
      console.error(`❌ Twitter failed (${resp.status}): ${JSON.stringify(resp.body).slice(0, 200)}`);
    }
  } catch (e) {
    console.error(`❌ Twitter error: ${e.message}`);
  }

  // Post to LinkedIn
  console.log('Posting to LinkedIn...');
  try {
    const resp = await apiRequest('POST', `/api/businesses/${BIZ_ID}/posts`, {
      caption: linkedinText,
      restrict_publish_to: ['linkedIn'],
      status: 'SCHEDULED',
      scheduled_publish_time: schedTime,
    });
    if (resp.status === 201) {
      console.log(`✅ LinkedIn post scheduled: ${resp.body.id}`);
    } else {
      console.error(`❌ LinkedIn failed (${resp.status}): ${JSON.stringify(resp.body).slice(0, 200)}`);
    }
  } catch (e) {
    console.error(`❌ LinkedIn error: ${e.message}`);
  }

  console.log('\nDone. Posts scheduled for ~5 minutes from now.');
}

main().catch(e => {
  console.error('Fatal:', e);
  process.exit(1);
});