#!/usr/bin/env node
/**
 * Share Kilo Code v7.8.18 release on Twitter/X and LinkedIn via MyMarky API
 * 
 * Usage: node scripts/marky-share-kilocode-v7-8-18.cjs
 */

const https = require('https');

const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const KEY = 'mk_live_2HrW1PDCF5i4rMu809NIDtvxtu0-rdnZOGURht6RWmE';
const API = 'https://api.mymarky.ai/api';

const ARTICLE_URL = 'https://terminalblog.com/blog/kilocode-v7-8-18-security-cve-cloud-sessions/';

async function apiCall(method, apiPath, body = null) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const opts = {
      hostname: 'api.mymarky.ai',
      path: `/api${apiPath}`,
      method,
      headers: {
        'Authorization': `Bearer ${KEY}`,
        'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
      },
    };
    const req = https.request(opts, (res) => {
      let responseBody = '';
      res.on('data', c => responseBody += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(responseBody) }); }
        catch { resolve({ status: res.statusCode, data: responseBody }); }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function main() {
  console.log('=== Sharing Kilo Code v7.8.18 Release ===\n');

  // Twitter/X post — key takeaways + link
  const twitterCaption = `Kilo Code v7.8.18 just dropped (stable, Oct 26) and it's the quiet release that matters:

🔒 CVE-2026-112944 patched in Vite build toolchain
🛡️ DOMPurify 3.4.17 fixes sanitization gaps
📋 Chat copy finally works in VS Code 1.143 (no more selection clearing)
☁️ CLI controls cloud sessions WITHOUT handling their API keys
🚫 MCP redirect attacks blocked (1.32.1 SDK)

The "boring" security updates are the ones that save you.

Read: ${ARTICLE_URL}

#KiloCode #CodingAgents #Security #OpenSource #VSCode`;

  // LinkedIn post — personal take, no link in body
  const linkedinCaption = `I've been watching Kilo Code's release cadence for months. v7.8.18 is the kind of release that doesn't make headlines but changes how you work daily.

The highlights that actually matter:

• Your editor's build tool (Vite) had a CVE. Now patched.
• Agent output rendering had sanitization gaps. Now hardened.
• Copying code from the chat in VS Code 1.143 was broken — selection cleared, focus jumped. Fixed.
• You can now list, read, and resume cloud-hosted agent sessions from your local CLI without ever touching their Anthropic/OpenAI/Google API keys. The credentials stay on the runner; you just orchestrate.
• MCP servers can't redirect your tool calls to attacker domains anymore.

This is the "infrastructure over features" philosophy paying off. Kilo doesn't ship demos. It ships the substrate that makes agents safe and operable in production.

For teams running shared agent compute: the cloud sessions CLI is a genuine workflow unlock. Your CI spins up a session, you inspect/resume/handoff from your laptop, zero credential sharing.

What's the most underrated "boring" fix that saved your team time?`;

  const posts = [
    {
      name: 'Twitter/X — Kilo Code v7.8.18 release',
      caption: twitterCaption,
      platforms: ['twitter'],
    },
    {
      name: 'LinkedIn — Kilo Code v7.8.18 personal take',
      caption: linkedinCaption,
      platforms: ['linkedin'],
    },
  ];

  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    console.log(`[${i + 1}/2] ${post.name}`);
    console.log(`  Platforms: ${post.platforms.join(', ')}`);
    console.log(`  Caption: ${post.caption.slice(0, 100)}...\n`);

    const createResult = await apiCall('POST', `/businesses/${BIZ_ID}/posts`, {
      caption: post.caption,
    });

    if (createResult.data?.id) {
      const postId = createResult.data.id;
      console.log(`  ✅ Created: ${postId}`);

      // Publish immediately
      const pubResult = await apiCall('POST', `/businesses/${BIZ_ID}/posts/${postId}/publish`);

      if (pubResult.data?.status === 'PUBLISHED') {
        console.log(`  🚀 Published immediately`);
      } else {
        console.log(`  ⚠️ Publish result: ${JSON.stringify(pubResult.data).slice(0, 200)}`);
      }
    } else {
      console.log(`  ❌ Create error: ${JSON.stringify(createResult.data).slice(0, 200)}`);
    }

    console.log('');
    await new Promise(r => setTimeout(r, 2000));
  }

  console.log('=== Done ===');
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });