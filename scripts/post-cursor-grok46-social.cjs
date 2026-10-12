#!/usr/bin/env node
/**
 * Post about Cursor Grok 4.6 article to X and LinkedIn via MyMarky API
 */

const https = require('https');

const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const API_KEY = 'mk_live_w61K61zmWDi-I-pviWXoYQX7UmU2mJ-xOAVyNdsKVpY';
const API_BASE = 'https://api.mymarky.ai';

const ARTICLE_URL = 'https://terminalblog.com/blog/cursor-grok-46-long-running-agents-visual-work/';
const ARTICLE_TITLE = 'Cursor Just Got a Model Built for Agents That Run All Night — Grok 4.6 Is Different';

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
  const tweet = `Most models are optimized for chat. Grok 4.6 was trained for agents that work for HOURS.

Cursor just integrated it with 2x usage for the first week.

It matches GPT-5.6 Sol on intelligence benchmarks. It self-tests, sustains 50+ step trajectories, and delivers styled visual v1s in one pass.

This changes what you can delegate:

${ARTICLE_URL}

#Cursor #Grok46 #AIAgents #Coding`;

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
  const linkedinPost = `I've been watching the model specialization shift in AI coding agents. Grok 4.6 is the clearest signal yet: models are no longer general-purpose — they're workload-specific.

Cursor integrated Grok 4.6 this week. Here's why it matters:

THE SHIFT:
• Grok 4.6 = trained specifically for LONG-RUNNING AGENTS (50+ step trajectories)
• Matches GPT-5.6 Sol on Artificial Analysis Intelligence Index (9 benchmarks)
• Self-tests and verifies its own work mid-trajectory
• Delivers styled, interactive visual v1s — not skeletons

WHY THIS CHANGES WORKFLOWS:
• Projects (coordinator + subagents) now have a model that doesn't hallucinate at step 47
• Overnight agents: "Write tests for entire auth module" → wake up to finished PR
• Visual work: dashboard/admin panel → working v1 with design system in one pass
• Background automation that actually COMPLETES (CI babysitting, security scans, dep updates)

THE HONEST CONSTRAINTS:
• Reasoning = slower responses (normal for this class)
• Overkill for quick edits — use fast models for that
• 2x usage deal = 1 week only in Cursor/Grok Build

THE BIGGER PICTURE:
We're past "which model is best." We're at "which model for which workload."

Quick edits → Haiku 5.5 / GPT-5.6 mini
Standard coding → Sonnet 5.5 / Opus 5.5
LONG-RUNNING AGENTS + VISUAL WORK → Grok 4.6 / GPT-6 Sol
Deep research/architecture → Fable 5.1 / Opus 5.5 extended

Cursor's Dial (low/medium/high/ultra) abstracts this. But knowing WHY Grok 4.6 exists lets you pick it intentionally.

Read the full breakdown with workflows 👇`;

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