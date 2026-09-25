#!/usr/bin/env node
/**
 * Post context engineering article to X and LinkedIn via MyMarky API
 */

const https = require('https');

const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const API_KEY = 'mk_live_w61K61zmWDi-I-pviWXoYQX7UmU2mJ-xOAVyNdsKVpY';
const API_BASE = 'https://api.mymarky.ai';

const ARTICLE_URL = 'https://terminalblog.com/blog/context-engineering-coding-agents-2026/';
const ARTICLE_TITLE = 'Your Coding Agent Is Reading the Wrong Files — Here\'s How to Fix It';

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
  const tweet = `Your coding agent isn't failing because of the model. It's failing because you're feeding it garbage context.

Two devs, same agent, same model. One ships in 20 min. The other burns $40 in tokens on hallucinations.

The difference: Context Engineering.

My new guide covers the 3 levers that cut token costs 40-70%:

🔹 Repo maps / explicit file selection — stop sending 50 files when 3 matter
🔹 Conversation pruning — drop the "let me try this" history, keep decisions  
🔹 Instruction loading order — AGENTS.md first, skills on demand, files last

Real example: A refactor that cost $12.40 naive → $0.03 engineered. 413x difference.

The model is a commodity. Your context discipline is the moat.

Read the full workflow 👇

${ARTICLE_URL}

#ContextEngineering #AICoding #TokenEfficiency #AGENTSmd`;

  console.log('Posting to Twitter...');
  console.log(tweet.slice(0, 200) + '...');
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
  const linkedinPost = `I've been watching developers burn thousands on AI coding tokens for one reason: they let the agent read everything.

The model doesn't matter. What you feed it does.

Two developers. Same agent. Same model. Same repo.

Dev A: Ships feature in 20 minutes. Token cost: ~$0.15
Dev B: Burns $40 on tokens. Agent hallucinates APIs from 6 months ago.

The difference isn't the model. It's CONTEXT ENGINEERING.

This is the skill that separates developers who ship with agents from developers who watch them hallucinate. And it's tool-agnostic — works in Cursor, Claude Code, OpenCode, Hermes, Goose, Aider.

My new pillar article breaks down the 3 levers:

1️⃣ REPO MAPS / FILE SELECTION
Stop using @codebase. Name the 3-5 files that actually matter. Aider does this automatically. Everyone else: explicit @ mentions. 40-70% token reduction.

2️⃣ CONVERSATION PRUNING
A 50-message session = 100K+ tokens of garbage. Keep: task, decisions, edited files. Drop: failed attempts, apologies, "let me try" loops. Use /compact or new sessions.

3️⃣ INSTRUCTION LOADING ORDER
AGENTS.md first (universal invariants < 200 lines). Skills on demand. Files explicitly selected. NOT 500 lines of architecture docs in AGENTS.md.

The payoff is real: I showed a refactor that cost $12.40 naive vs $0.03 engineered. Same model. Same agent. 413x difference.

The model is a commodity. The harness matters. Your context discipline matters most.

Read the full guide with copy-paste workflows for every major agent 👇

#AICoding #ContextEngineering #TokenOptimization #DeveloperTools #ClaudeCode #Cursor #OpenCode #HermesAgent`;

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