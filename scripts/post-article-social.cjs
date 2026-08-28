#!/usr/bin/env node
/**
 * Post about a specific article to X and LinkedIn via MyMarky API
 */

const https = require('https');

const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const API_KEY = 'mk_live_w61K61zmWDi-I-pviWXoYQX7UmU2mJ-xOAVyNdsKVpY';
const API_BASE = 'https://api.mymarky.ai';

const ARTICLE_URL = 'https://terminalblog.com/blog/cursor-3-glass-agents-window-review/';
const ARTICLE_TITLE = 'Cursor 3 Just Replaced Your Code Editor With an Agent Command Center — Here\'s the Honest Truth';

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
  const tweet = `Cursor 3 "Glass" dropped the Agents Window — a whole new interface for running agent fleets.

Composer 2 (their own model), cloud agents with seamless handoff, /multitask + worktrees for parallel subagents, Marketplace.

But the diff view is broken, no VS Code extensions, no WSL. Honest review:

${ARTICLE_URL}

#Cursor #AICoding #AgentsWindow`;

  console.log('Posting to Twitter...');
  console.log(tweet);
  console.log('---');

  const resp = await apiRequest('POST', `/api/businesses/${BIZ_ID}/posts`, {
    caption: tweet,
    restrict_publish_to: ['twitter'],
    status: 'SCHEDULED',
    // Schedule for next available slot (9 AM Saudi = 6 AM UTC)
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
  const linkedinPost = `I've been testing Cursor 3 "Glass" for the past few weeks. Here's the honest breakdown:

THE GOOD:
• Agents Window = first real agent orchestration UI in a commercial IDE
• Composer 2 scores 61.7 on Terminal-Bench 2.0 (their own model, priced at $0.50/M in)
• Cloud agents produce demos/screenshots/video — not just diffs
• /multitask + Git worktrees = parallel subagents across isolated branches
• Marketplace consolidates MCPs, skills, subagents in one click

THE BAD (from real users on their forum):
• No VS Code extensions — no Prettier, no TypeScript tooling, no linting
• Diff view shows entire files as "new" instead of actual changes
• No WSL support, no custom themes
• Built-in browser has no auto-refresh or session memory
• Missing basic keyboard shortcuts

THE VERDICT:
Cursor bet on "Era 3" — autonomous agent fleets. The architecture is right. The UX is early. Keep the classic editor open beside it. Use Agents Window for parallel agent work, classic for review.

Agent usage grew 15x at Cursor in the last year. 35% of their internal PRs are now agent-created. The shift is real.

Read the full breakdown with the forum feedback 👇`;

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