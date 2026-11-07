#!/usr/bin/env node
/** Post the new Claude Code v2.1.319 article to X and LinkedIn via MyMarky API */

const https = require('https');

const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const API_KEY = 'mk_live_w61K61zmWDi-I-pviWXoYQX7UmU2mJ-xOAVyNdsKVpY';
const API_BASE = 'https://api.mymarky.ai';

function apiRequest(method, path, body = null) {
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

async function postToTwitter(text) {
  const resp = await apiRequest('POST', `/api/businesses/${BIZ_ID}/posts`, {
    caption: text,
    restrict_publish_to: ['twitter'],
    status: 'NEW',
  });
  return resp;
}

async function postToLinkedIn(text) {
  const resp = await apiRequest('POST', `/api/businesses/${BIZ_ID}/posts`, {
    caption: text,
    restrict_publish_to: ['linkedIn'],
    status: 'NEW',
  });
  return resp;
}

const url = 'https://terminalblog.com/blog/claude-code-v2-1-319-mcp-tasks-background-auto-mode/';

const twitterText = `Claude Code v2.1.319 just dropped — and it's the first release in the daily stability streak with actual NEW features 🚀

5 things you'll use:

1. MCP tools now run in BACKGROUND — long tasks (massive grep, DB migrations) no longer freeze your session

2. permissions.denyInsteadOfPrompting = automation that doesn't stall on prompts in CI

3. /claude-api latency-optimize — profiles your API calls, tells you what to speed up

4. Spend tracking in /usage — today/week/month for gateway users

5. "Earlier in this session" — reopen finished subagents and keep talking to them

Plus auto mode changes for gateway users, 100+ fixes.

Read more: ${url}`;

const linkedinText = `Claude Code v2.1.319 (Nov 6) is the 5th release in a week — and the first one with genuine new features instead of pure fixes.

What actually matters:

**1. Background MCP Tasks**
When an MCP server runs a long tool call (grep 50K files, DB migration, LLM inference), it now moves to background immediately. You keep working. Result arrives when ready.
Opt out: CLAUDE_CODE_DISABLE_MCP_TASK_BACKGROUND=1

**2. Deny Instead of Prompt**
New setting: permissions.denyInsteadOfPrompting: true
Any tool call that would prompt gets denied automatically, turn continues. Works in terminal, subagents, teammates. Your CI scripts no longer stall on "Do you want to allow this?"

**3. Latency Optimization**
/claude-api latency-optimize profiles your Claude API usage and suggests faster settings against your eval. Free performance engineering for user-facing features.

**4. Spend Tracking**
/usage now shows Today / This Week / This Month for developers behind Claude Apps gateways with no hard spend limit. No more surprise bills.

**5. Reopen Finished Subagents**
/tasks now lists "Earlier in this session" — finished subagents you can reopen and keep talking to, even after restart. Your subagent work is no longer disposable.

Auto mode changes for LLM gateway users, plus ~100 fixes (network filesystem, auth, MCP, session handling, agents view).

This is the pattern: v2.1.315 → 316 → 317 → 318 → 319 (5 releases, 7 days). The streak continues.

Read the full breakdown: ${url}`;

async function main() {
  console.log('Posting Claude Code v2.1.319 article to X and LinkedIn...\n');
  
  // Twitter
  console.log('Posting to Twitter...');
  try {
    const resp = await postToTwitter(twitterText);
    if (resp.status === 201) {
      console.log(`✅ Twitter: ${resp.body.id}`);
    } else {
      console.error(`❌ Twitter (${resp.status}):`, resp.body);
    }
  } catch (e) {
    console.error(`❌ Twitter error:`, e.message);
  }

  await new Promise(r => setTimeout(r, 1000));

  // LinkedIn
  console.log('Posting to LinkedIn...');
  try {
    const resp = await postToLinkedIn(linkedinText);
    if (resp.status === 201) {
      console.log(`✅ LinkedIn: ${resp.body.id}`);
    } else {
      console.error(`❌ LinkedIn (${resp.status}):`, resp.body);
    }
  } catch (e) {
    console.error(`❌ LinkedIn error:`, e.message);
  }

  console.log('\n✅ Done!');
}

main().catch(e => {
  console.error('Fatal:', e);
  process.exit(1);
});