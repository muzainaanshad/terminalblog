#!/usr/bin/env node
/**
 * Post about Claude Code v2.1.300 to X and LinkedIn via MyMarky API
 */

const https = require('https');

const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const API_KEY = 'mk_live_w61K61zmWDi-I-pviWXoYQX7UmU2mJ-xOAVyNdsKVpY';
const API_BASE = 'https://api.mymarky.ai';

const ARTICLE_URL = 'https://terminalblog.com/blog/claude-code-v2-1-300-aws-advisor-opentelemetry-mod-power/';
const ARTICLE_TITLE = 'Claude Code v2.1.300 Just Gave Mods Superpowers — And AWS Advisors Arrived';

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
  const tweet = `Claude Code v2.1.300 just graduated mods to platform citizens.

/advisor on AWS — a second brain reviewing every agent action
virtualText — UI in the prompt box that never pollutes context
OpenTelemetry GenAI attributes — real observability out of the box
prompt.change hook — catch history recall, undo, plugin fills
agent.spawn rewrite — governance mods can now govern

80+ fixes. Zero breaking changes.

Full breakdown 👇

${ARTICLE_URL}

#ClaudeCode #AICoding #Mods #AWS #OpenTelemetry`;

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
  const linkedinPost = `Claude Code v2.1.300 dropped today. This is the release where mods stop being hacks and become platform primitives.

THE BIG THREE:

1. /advisor on AWS — Pick an advisor model that reviews your agent's work before it commits. First native "agent overseeing agent" primitive. Security review, cost control, compliance gates — all in real-time.

2. virtualText for mods — Render text in the prompt box that NEVER enters context. Live token estimates, security scan results, git status — visible to you, invisible to the model. Clean context, readable transcripts.

3. OpenTelemetry GenAI semantic conventions — gen_ai.provider.name, gen_ai.conversation.id, gen_ai.tool.name, cache_creation_5m/1h_tokens, error.type. Your Datadog/Honeycomb/Grafana dashboards just got real AI observability without parsing JSON blobs.

THE DEVELOPER EXPERIENCE WINS:

• prompt.change hook — Finally catch history recall (up-arrow), undo (Ctrl+Z), clear (Escape), plugin fills. Mods see *intent*, not just keystrokes.

• agent.spawn rewrite — Mods can now rewrite workflow agent prompts and models at spawn time. Enterprise governance without blocking.

• dir: 'rtl' on Text — Arabic/Hebrew/Persian devs, your terminal alignment pain is over.

• 80+ paper cuts fixed — Worktree/reftable bugs, cloud session hangs, daemon lies, MCP reconnection storms, OTel gaps, Windows PowerShell orphans... all gone.

VERDICT:
This isn't a bugfix release. It's a platform graduation. If you build mods, run on AWS, need observability, or use worktrees — update today. If you're on v2.1.299 and nothing bites you, idle compaction alone paid for that update. This one makes the next mod you build 10x easier.

Read the full breakdown with code examples 👇`;

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