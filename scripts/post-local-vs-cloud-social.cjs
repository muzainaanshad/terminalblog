#!/usr/bin/env node
/**
 * Post about Local vs Cloud Coding Agents article to X and LinkedIn via MyMarky API
 */

const https = require('https');

const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const API_KEY = 'mk_live_w61K61zmWDi-I-pviWXoYQX7UmU2mJ-xOAVyNdsKVpY';
const API_BASE = 'https://api.mymarky.ai';

const ARTICLE_URL = 'https://terminalblog.com/blog/local-vs-cloud-coding-agents-decision-framework/';
const ARTICLE_TITLE = 'Local vs Cloud Coding Agents — The Decision Framework That Saves You From Buying the Wrong Stack';

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
  const tweet = `Goldman Sachs banned local agents. Your laptop melts running 3 agents. Cloud costs $400/mo.

Nobody tells you which execution model fits YOUR constraints — so I built the decision framework.

Local for routine + privacy. Cloud for complex + parallel. Hybrid for production teams.

The flowchart, routing policy YAML, wrapper script, enterprise proxy architecture, cost tables, 4-week migration path:

${ARTICLE_URL}

#AICoding #LocalModels #CloudAgents #Hybrid #Ollama #Enterprise`;

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
  const linkedinPost = `The question every team faces: local agents, cloud agents, or both?

Goldman Sachs banned local agents on trading floors. Solo devs hit GPU walls. Cloud bills hit $400/mo per developer.

The vendor marketing says "it just works" — but nobody tells you which one actually fits your constraints.

So I wrote the decision framework I wish existed:

✅ Flowchart: regulated data? → local-only. Budget for cloud? → hybrid.
✅ Three modes: local-only, cloud-only, hybrid (what production teams actually run)
✅ Hardware reality check: 8GB/16GB/24GB/48GB VRAM tiers with model recommendations
✅ Routing policy YAML + wrapper script — automatic task routing by pattern matching
✅ Enterprise sandboxed-cloud proxy architecture (the Goldman Sachs solution)
✅ Cost comparison: solo/team/enterprise with real numbers
✅ 4-week migration path from wherever you are
✅ Hard truths table debunking 5 common myths

The key insight: **Never pick one. Pick a policy that routes tasks to the right executor.**

Local handles the 80% routine volume (tests, docs, lint, simple fixes). Cloud handles the 20% complex reasoning (architectural refactors, novel frameworks, root cause analysis). Hybrid saves 60-80% vs cloud-only.

Read the full breakdown with copy-paste starter kit 👇

${ARTICLE_URL}

#AICoding #LocalModels #CloudComputing #EnterpriseArchitecture #DeveloperTools #AIAgents`;

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