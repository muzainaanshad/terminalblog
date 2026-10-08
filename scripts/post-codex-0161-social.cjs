#!/usr/bin/env node
/**
 * Post about Codex 0.161 to X and LinkedIn via MyMarky API
 */

const https = require('https');

const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const API_KEY = 'mk_live_w61K61zmWDi-I-pviWXoYQX7UmU2mJ-xOAVyNdsKVpY';
const API_BASE = 'https://api.mymarky.ai';

const ARTICLE_URL = 'https://terminalblog.com/blog/codex-0-161-gpt61-sol-default-daybreak-mcp-login/';
const ARTICLE_TITLE = 'Codex 0.161 Just Made GPT-6.1 Sol the Default — And You Can Finally Log Into MCP From the Terminal';

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
  const tweet = `Codex 0.161 promotes GPT-6.1 Sol to default across bundled + Bedrock catalogs. You also get /mcp login <name> from inside a session, explicit Daybreak opt-in, per-device audio for voice, and hardened Windows sandbox + SQLite recovery.

The stable release that quietly upgrades your daily workflow.

Read the breakdown 👇
${ARTICLE_URL}

#Codex #AICoding #GPT6 #MCP`;

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
  const linkedinPost = `Codex 0.161 just shipped the stable release that makes you realize the agent has been getting better while you weren't looking.

THE GOOD:
• GPT-6.1 Sol is now THE default — bundled catalog AND Amazon Bedrock. Open Codex, start coding, you're on the flagship.
• /mcp login <name> — authenticate MCP servers from inside a running session. No restart, no config file editing.
• Daybreak (Cyber access) is explicitly opt-in — no surprise routing changes. You choose it consciously.
• Voice conversations now let you pick YOUR microphone, YOUR speaker, YOUR channels. Preferences save locally.
• Windows: elevated sessions work with embedded server, PowerShell preserves relative paths under protected profiles.
• Enter key finally submits after paste detection — even in Vim insert mode.
• Thread resume includes latest committed history. SQLite corruption detected at startup with automatic backup preservation.
• Retries honor server guidance — fewer premature failures during overload.

THE VERDICT:
Codex 0.161 doesn't scream. It settles. GPT-6.1 Sol as default means every new session starts smarter. /mcp login means MCP auth stops being a context switch. Windows fixes mean the platform isn't second-class. SQLite protection means your history has a safety net.

This is the stable release where Codex stops feeling like "that OpenAI CLI tool" and starts feeling like the terminal agent that just works.

Read the full beginner-friendly breakdown with the upgrade checklist 👇`;

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
  console.log('=== Posting Codex 0.161 Article to Social ===');
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