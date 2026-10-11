#!/usr/bin/env node
/**
 * Post the model router guide to X and LinkedIn via MyMarky API
 */

const https = require('https');

const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const API_KEY = 'mk_live_w61K61zmWDi-I-pviWXoYQX7UmU2mJ-xOAVyNdsKVpY';
const API_BASE = 'https://api.mymarky.ai';

const ARTICLE_URL = 'https://terminalblog.com/blog/build-model-router-role-based-assignment-guide/';
const ARTICLE_TITLE = "Your AI Agent Keeps Burning $200 on Simple Tasks — Here's How to Fix It";

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
  const tweet = `Your AI agent doesn't know the difference between "rename a variable" and "refactor the auth system." It burns Opus on both. 💸

Hacker News devs exposed the absurdity: agents never say "wait, this is simple, use a cheaper model."

Here's how to build a role-based router that slashes costs 90%+:

${ARTICLE_URL}

#AICoding #ModelRouting #CostOptimization #ClaudeCode #OpenCode`;

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
  const linkedinPost = `I've been seeing the same complaint everywhere: developers burning $200+/month on API calls because their coding agent sends boilerplate tasks to Opus 5.5.

The Hacker News thread last week nailed it: "The agent never stops and says, 'Wait, this is something another model could do cheaper and faster.'"

The fix isn't waiting for model providers. It's building a role-based router into your harness.

Here's the practical breakdown:

THE PROBLEM:
• Planner tasks (architecture) → need Opus
• Implementer tasks (writing code) → need Sonnet  
• Reviewer tasks (code review, linting) → Haiku is perfect
• Researcher tasks (codebase exploration) → Flash/local models
• Boilerplate (tests, configs, docs) → cheapest model available

THE SOLUTION:
Define 5 roles. Map each to the right model. Enforce it at the harness level.

OpenCode already supports this natively with agent definitions.
Claude Code can do it with hooks.
Custom harnesses: 30 lines of routing logic.

THE RESULTS:
• Opus-only: ~$2,400/month
• Role-based router: ~$180/month (92% savings)
• Role-based + local fallback: ~$40/month (98% savings)

The Cockroach Labs "teaching hospital" pipeline proved this at scale: 1M+ lines, 7 reverts, 5 months — using a multi-agent pipeline with role-based model assignment.

Read the full guide with copy-paste implementations for Claude Code, OpenCode, and custom harnesses 👇`;

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