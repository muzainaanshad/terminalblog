#!/usr/bin/env node
/**
 * Post about Pi v0.99.2 article to X and LinkedIn via MyMarky API
 */

const https = require('https');

const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const API_KEY = 'mk_live_w61K61zmWDi-I-pviWXoYQX7UmU2mJ-xOAVyNdsKVpY';
const API_BASE = 'https://api.mymarky.ai';

const ARTICLE_URL = 'https://terminalblog.com/blog/pi-v0-99-2-mcp-reliability-upgrade/';
const ARTICLE_TITLE = 'Pi Just Made MCP Actually Reliable — v0.99.2 Is the Release You\'ve Been Waiting For';

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
  const tweet = `Pi v0.99.2 just made MCP boring — in the best way.

MCP servers with default exposure no longer clutter your prompt or block the first message. They sit in a system prompt section, discoverable via searchTools() and describeNamespace().

+ Anthropic workload identity (zero-config Bedrock)
+ oauth.clientName for picky OAuth servers
+ HTTP auth via provider /login
+ /reload picks up new defaultTools

The first agent where MCP feels like infrastructure, not a science experiment.

${ARTICLE_URL}

#PiCodingAgent #MCP #AICoding #TerminalAgent`;

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
  const linkedinPost = `I've been watching Pi (the terminal coding agent from earendil-works) evolve from a promising prototype to something that genuinely feels like infrastructure.

v0.99.2 dropped yesterday and it's the first release where MCP *just works*:

THE GOOD:
• MCP servers stay out of your prompt — default exposure servers move to a system prompt section, tools discoverable via searchTools() and describeNamespace()
• Anthropic workload identity federation — if you have AWS creds configured, Pi uses them automatically for Bedrock/Claude. Zero Pi-specific config.
• oauth.clientName support for MCP servers that require known OAuth clients
• HTTP server auth via provider's /login token — no manual token juggling
• /reload now picks up new defaultTools without restart
• MCP server descriptions add context for the agent (ranks tools in search)

THE SIGNIFICANCE:
Every other agent still dumps all MCP tools into context, bloating tokens and confusing the model. Pi treats MCP as infrastructure: available when needed, invisible when not.

This is what "daily driver" reliability looks like. The version number (0.99) says it all — this is a 1.0 release candidate.

Read the full breakdown with beginner-friendly explanations 👇

${ARTICLE_URL}

#PiCodingAgent #MCP #AICoding #TerminalAgent #DeveloperTools #OpenSource`;

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
  console.log('=== Posting Article to Social ===');
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