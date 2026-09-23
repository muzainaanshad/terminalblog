#!/usr/bin/env node
/**
 * Post about Nemotron vs Kimi vs Qwen free model showdown to X and LinkedIn via MyMarky API
 */

const https = require('https');

const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const API_KEY = 'mk_live_w61K61zmWDi-I-pviWXoYQX7UmU2mJ-xOAVyNdsKVpY';
const API_BASE = 'https://api.mymarky.ai';

const ARTICLE_URL = 'https://terminalblog.com/blog/nemotron-vs-kimi-qwen-free-model-showdown/';
const ARTICLE_TITLE = 'Nemotron 3 Ultra vs Kimi K3 vs Qwen 3 — The Free Coding Model Showdown Nobody Asked For';

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
  const tweet = `Three frontier coding models. Zero dollars. One winner.

Nemotron 3 Ultra (NVIDIA) — daily driver, strongest reasoning
Kimi K3 (Moonshot) — 1M context, zero setup in OpenHands
Qwen 3 (Alibaba) — only one you truly own, runs local

We tested all three on real coding tasks. Here's the brutal truth:

${ARTICLE_URL}

#AICoding #FreeModels #Nemotron #KimiK3 #Qwen3`;

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
  const linkedinPost = `The "free frontier model" era just arrived. Three contenders. One showdown.

I tested Nemotron 3 Ultra, Kimi K3, and Qwen 3 across six real coding scenarios — not benchmarks, actual work: bug fixes, 12-file refactors, 50K LOC repo analysis, air-gapped deployment, post-2024 frameworks, and cost reality.

THE RESULTS:

🥇 Nemotron 3 Ultra — Won 3/6 rounds. Best all-rounder for daily coding. MoE architecture handles parallel tool calls cleanly. Free on OpenRouter (needs account).

🥈 Kimi K3 — Won the long-context round decisively. 1M context = sees entire repos other models physically cannot. Free by default in OpenHands Cloud.

🥉 Qwen 3 — Only option for privacy/offline/local-first. Runs on your GPU. Weights are yours forever. 32B fits 24GB VRAM.

THE STRATEGY (what smart devs actually do):
Tier 1: Nemotron for 80% of daily work
Tier 2: Kimi for big repos / when Nemotron queues
Tier 3: Qwen local for sensitive code / offline
Tier 4: Paid models (Claude/GPT) reserved for the 5% that need it

This tiering cuts AI coding costs 70-85%.

Read the full breakdown with the decision matrix 👇

${ARTICLE_URL}`;

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