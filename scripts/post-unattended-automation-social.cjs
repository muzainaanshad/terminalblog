#!/usr/bin/env node
/**
 * Post about the new unattended automation article to X and LinkedIn via MyMarky API
 */

const https = require('https');

const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const API_KEY = 'mk_live_w61K61zmWDi-I-pviWXoYQX7UmU2mJ-xOAVyNdsKVpY';
const API_BASE = 'https://api.mymarky.ai';

const ARTICLE_URL = 'https://terminalblog.com/blog/your-coding-agent-is-useless-at-2am-unless-you-set-this-up/';
const ARTICLE_TITLE = 'Your Coding Agent Is Useless at 2 AM — Unless You Set This Up';

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
  const tweet = `Your coding agent is useless at 2 AM — unless you set up unattended automation.

Most devs use agents interactively. The 10x leverage comes from agents that work while you sleep:

• Nightly dependency updates with PRs ready at 9 AM
• Security scans on every push before human review
• Weekly codebase health reports in Slack
• Multi-agent fleets with worktree isolation

The complete setup guide with Hermes, OpenHands, Goose — safety checklist, provider failover, monitoring:

${ARTICLE_URL}

#AICoding #Automation #Developers`;

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
  const linkedinPost = `I've been running unattended coding agents for months. The difference between interactive and automated is the difference between a power tool and infrastructure.

Here's what changed when I set up agents to work while I sleep:

THE SETUP (30 minutes):
• Hermes Agent for cron + background tasks + multi-provider failover
• OpenHands for GitHub event automations (PR security scans)
• Goose for hidden ACP sessions (background fleet)
• Separate API keys per agent, hard caps on everything, worktree isolation

THE RESULTS:
✅ Dependency PRs ready every morning — zero manual work
✅ Every PR gets automated security review in 2 minutes
✅ Weekly health reports hit Slack at 9 AM Monday
✅ Free models (Nemotron 3 Ultra) handle 80% of work, paid fallback for the rest
✅ Total cost: $0-20/month vs $180-500 for interactive-only

THE SAFETY NET (non-negotiable):
• Separate unattended API keys — revocable without breaking your workflow
• Hard step/cost/time limits on EVERY job
• Worktree isolation — agents never share a working directory
• Credential scoping — security scan gets read-only, deps agent gets write-PR only
• Human gate for force-push, prod deploys, secret rotation
• Logs that survive terminal close + alerting only on failures

The complete guide with copy-paste configs for Hermes, OpenHands, Goose:

Read the full breakdown 👇`;

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