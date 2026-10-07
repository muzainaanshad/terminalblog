#!/usr/bin/env node
/**
 * Post about Claude Code v2.1.292 to X and LinkedIn via MyMarky API
 */

const https = require('https');

const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const API_KEY = 'mk_live_w61K61zmWDi-I-pviWXoYQX7UmU2mJ-xOAVyNdsKVpY';
const API_BASE = 'https://api.mymarky.ai';

const ARTICLE_URL = 'https://terminalblog.com/blog/claude-code-v2-1-292-plugin-marketplace-subagent-effort/';
const ARTICLE_TITLE = 'Claude Code v2.1.292 Just Made Plugin Installs Painless — And Gave Sub-Agents Their Own Effort Levels';

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
  const tweet = `Claude Code v2.1.292 dropped — plugins finally install from ANY marketplace in one command, sub-agents get their own effort levels, and mods get prompt caching.

Key changes:
• \`claude plugin install foo --marketplace <url>\` — one command, adds marketplace if needed
• Agent tool now accepts \`effort: "high"\` per sub-agent — main agent stays fast, research agent thinks deep
• \$.model.complete prompt caching for mods — large system prompts cached, latency drops
• 529 overload retry base delay now configurable via env var
• prompt.autocomplete hook — mods can inject custom slash commands
• 50+ fixes: UNC path perms, MCP tool name limits, cloud session cleanup, Remote Control file uploads

The plugin/mod/sub-agent layer just graduated from "experimental" to production primitives.

Read the breakdown:
${ARTICLE_URL}

#ClaudeCode #AICoding #Plugins #Agents`;

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
  const linkedinPost = `Claude Code v2.1.292 is the release where the extensibility layer grows up.

Three things that actually change how you work:

1. PLUGIN INSTALL FROM ANY MARKETPLACE — ONE COMMAND
Before: \`claude plugin marketplace add <url>\` then \`claude plugin install <name>\`
Now: \`claude plugin install <name> --marketplace <url>\`
Private registries, team registries, community forks — no friction.

2. SUB-AGENTS WITH INDEPENDENT EFFORT LEVELS
Your main agent runs at effort: "low" for speed. A spawned research sub-agent runs at effort: "high" for depth. Same session, different compute budgets. This is the primitive for heterogeneous agent teams.

3. PROMPT CACHING FOR MODS
Mods sending large system prompts (docs loaders, codebase indexers, style guides) — mark blocks \`cache: true\` and subsequent calls reuse the cached prefix. Latency drops, cost drops.

Plus 50+ fixes across sandbox/permissions (UNC paths, env-var commands), MCP (tool name limits, OAuth expiry), cloud sessions (background agent cleanup, artifact uploads), Remote Control (PDF/file uploads), and plugin/mod safety.

v2.1.288 fixed 100+ paper cuts. v2.1.289 fixed the plugin ecosystem. v2.1.292 makes plugins universally discoverable, sub-agents independently smart, and mods fast enough for production.

The full breakdown with the 50+ fixes table:
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