#!/usr/bin/env node
/**
 * Post about Hermes Agent article to X and LinkedIn via MyMarky API
 */

const https = require('https');

const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const API_KEY = 'mk_live_w61K61zmWDi-I-pviWXoYQX7UmU2mJ-xOAVyNdsKVpY';
const API_BASE = 'https://api.mymarky.ai';

const ARTICLE_URL = 'https://terminalblog.com/blog/why-hermes-agent-is-the-most-underrated-open-source-ai-assistant-2026/';
const ARTICLE_TITLE = 'Hermes Agent Went From Underrated to Unignorable — 90 Days, 2,260 PRs Later';

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
  const tweet = `In July I called Hermes the most underrated open-source coding agent.

90 days later: 2,260+ merged PRs in a single month.

v0.21 "Pantheon" made bots talk to each other. v0.21.4 dropped 1,800 PRs. v0.21.5 shipped 460 more in 3 days. GPT-6 + Opus 5.5 landed in the catalog.

The velocity is real:

${ARTICLE_URL}

#HermesAgent #AICoding #OpenSource #NousResearch`;

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
  const linkedinPost = `In July I wrote that Hermes Agent was the most underrated open-source AI assistant in 2026.

90 days and 2,260+ merged PRs later, the "underrated" label no longer fits.

Here's what happened:

🚀 **v0.21 "Pantheon" (Aug 31)** — Multi-agent became a user experience, not an architecture problem. Bots with names, faces, group chats where they talk to each other. hermes peer for bot-to-bot DMs. Cron jobs with memory. Live subagent steering.

⚡ **v0.21.4 (Sep 21)** — ~1,800 PRs in 3 weeks. Desktop plugin SDK, Connectors page replacing MCP tab, full French/German/Spanish catalogs, custom model entry, per-profile gateway control, live dock, kanban redesign.

🎯 **v0.21.5 / v2026.9.24 (Sep 24)** — 460 more PRs in 3 days. Stable tagged release for Docker, Hermes Cloud, self-hosted deployments.

🤖 **Frontier models landed** — GPT-6 Sol/Terra/Luna + Claude Opus 5.5 (1M context) in the Nous/OpenRouter catalogs.

⚡ **Performance you feel daily** — Config loading, tool registry, gateway message handling, model picker — all faster.

⚠️ **Reality check** — A security audit found 5 high-severity issues. Autonomy means larger blast radius. Run the security checklist before unattended work.

THE VERDICT:
Hermes has always had the better architecture (skills, slash commands, explicit lifecycle, cron, background tasks, multi-provider routing). Now it has the velocity and stability tags to match.

If you're evaluating agents — this gap between "promising project" and "production infrastructure" just narrowed significantly.

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