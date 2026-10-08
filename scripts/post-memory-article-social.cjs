#!/usr/bin/env node
/**
 * Post about the memory comparison article to X and LinkedIn via MyMarky API
 */

const https = require('https');

const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const API_KEY = 'mk_live_w61K61zmWDi-I-pviWXoYQX7UmU2mJ-xOAVyNdsKVpY';
const API_BASE = 'https://api.mymarky.ai';

const ARTICLE_URL = 'https://terminalblog.com/blog/why-your-coding-agent-still-forgets-everything/';
const ARTICLE_TITLE = 'This Is Why Your Coding Agent Still Forgets Everything You Taught It';

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
  const tweet = `You spent 3 hours teaching an agent your codebase. Next session? Gone.

We tested 5 open-source agents (Hermes, pi.dev, OpenHands, Oh My Pi, Gitlawb Zero) on persistent memory.

Only 2 actually remember. The rest give you history, not memory.

${ARTICLE_URL}

#AICoding #Memory #HermesAgent #piDev #OpenHands`;

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
  const linkedinPost = `The memory problem nobody talks about: your coding agent forgets everything between sessions.

I tested the 5 open-source agents that claim "persistent memory" — Hermes, pi.dev, OpenHands, Oh My Pi, and Gitlawb Zero.

THE REALITY:
• Hermes (mem0) — Auto-extracts facts, injects relevant memories at session start. Closest to "it just works."
• pi.dev — Builds a knowledge graph from code relationships, not chat. Great for onboarding, opaque to debug.
• OpenHands — Beautiful conversation archives, but zero auto-injection. You manually copy context.
• Oh My Pi — Hash-anchored sessions for auditability, but no cross-session synthesis.
• Gitlawb Zero — Local-only, manual control. Honest but homework.

THE COLD-START TEST: "Add roles field to User API"
→ Hermes: 2 turns (auto-injected 3 memories)
→ pi.dev: 3 turns (graph traversal)
→ OpenHands: 5 turns (manual context)
→ Oh My Pi: 6 turns (exploration)
→ Gitlawb Zero: 7 turns (full exploration)

THE COST: Bad memory = ~40% more tokens per task. At $3/M tokens, that's ~$300/mo waste per developer.

THE FIX THAT WORKS EVERYWHERE: AGENTS.md + MEMORY.md in your repo. Portable, version-controlled, agent-agnostic.

Read the full breakdown with the comparison table and actionable steps 👇`;

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