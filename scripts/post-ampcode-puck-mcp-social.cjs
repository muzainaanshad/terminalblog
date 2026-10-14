#!/usr/bin/env node
/**
 * Post about AmpCode Puck MCP article to X and LinkedIn via MyMarky API
 */

const https = require('https');

const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const API_KEY = 'mk_live_w61K61zmWDi-I-pviWXoYQX7UmU2mJ-xOAVyNdsKVpY';
const API_BASE = 'https://api.mymarky.ai';

const ARTICLE_URL = 'https://terminalblog.com/blog/ampcode-puck-mcp-chatgpt-claude-everywhere/';
const ARTICLE_TITLE = 'Your Meta-Agent Just Escaped the Browser — AmpCode Puck Now Lives in ChatGPT and Claude';

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
  const tweet = `Your meta-agent just escaped the browser 🧠

AmpCode's Puck now speaks MCP. Talk to it from ChatGPT, Claude, Cursor — anywhere.

Start a feature on a walk via voice → Puck implements → review diff at your desk.
Debug in Claude Code → ask Puck for context → get it instantly.
Check running orbs from your phone.

The agent that manages your agents is now omnipresent.

Read the breakdown:
${ARTICLE_URL}

#AmpCode #AICoding #MCP #Agents`;

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
  const linkedinPost = `I've been watching the agent space closely, and AmpCode's latest move is genuinely different.

Puck — their meta-agent that coordinates your coding agents — now speaks MCP.

What this means in practice:
• Voice-chat an idea in ChatGPT on a walk → "Send to Puck" → it's implemented by the time you sit down
• Debugging in Claude Code → ask Puck for context from your Amp threads → get it instantly
• Check running cloud agents (orbs) from your phone via ChatGPT app
• Cursor agent delegates to Puck → Puck spins up orbs → results back to Cursor

The meta-agent becomes the universal coordinator. Every tool with MCP support can now delegate to your Amp infrastructure.

This isn't a convenience feature. It's a protocol shift: agents talking to agents.

The setup takes 30 seconds: Settings → Puck → "Add to Claude" or copy the MCP URL to ChatGPT.

What's still missing: write depth from external agents is asymmetric, multi-workspace routing needs work, voice-to-orb latency varies.

But the direction is clear: your agent stack becomes a network, not a silo.

Full breakdown with setup steps and honest assessment 👇`;

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
  console.log('=== Posting AmpCode Puck MCP Article to Social ===');
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