#!/usr/bin/env node
/**
 * Post about Claude Code v2.1.312 to X and LinkedIn via MyMarky API
 */

const https = require('https');

const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const API_KEY = 'mk_live_w61K61zmWDi-I-pviWXoYQX7UmU2mJ-xOAVyNdsKVpY';
const API_BASE = 'https://api.mymarky.ai';

const ARTICLE_URL = 'https://terminalblog.com/blog/claude-code-v2-1-312-80-fixes-you-feel/';
const ARTICLE_TITLE = 'Claude Code v2.1.312 Just Dropped 80+ Fixes — Write Stalls, MCP Hangs, Subagent Ghosts All Gone';

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
  const tweet = `Claude Code v2.1.312 dropped 5 hours after v2.1.311 — another 80+ fixes, zero features.

The paper cuts you hit daily are finally gone:
• Write/Edit stalling 5s on large files → fixed
• Ctrl+C ignored while MCP server hung → fixed  
• Subagents couldn't use MCP tools → fixed
• CLAUDE.md with long lists freezing startup → fixed
• Stale MEMORY.md after compaction → fixed

Two days, 160+ fixes. This is what a mature tool feels like.

${ARTICLE_URL}

#ClaudeCode #AICoding #Stability`;

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
  const linkedinPost = `Claude Code shipped two stability releases in two days (v2.1.311 Oct 26, v2.1.312 Oct 27) — 160+ fixes total. Anthropic is clearly in "stability sprint" mode.

  THE FIXES THAT MATTER FOR DAILY USERS:

  ✅ Write/Edit tools stalling for 5 seconds on large files — GONE
  ✅ Ctrl+C not working while MCP server timed out — GONE
  ✅ Subagents unable to use MCP tools from late-connecting servers — GONE
  ✅ CLAUDE.md with massive lists freezing startup for seconds — GONE
  ✅ Stale MEMORY.md/CLAUDE.md content after compaction — GONE
  ✅ Read tool PDF failures during session cleanup — GONE
  ✅ Effort indicator showing wrong level mid-task — FIXED
  ✅ Remote Control stuck 2 min behind proxy — FIXED

  THE VERDICT:
  No breaking changes. No config migrations. Just 'claude update' and 80+ daily paper cuts disappear. If you've been fighting startup freezes, MCP hangs, or subagent ghost runs — this is the release that finally smooths them out.

  This is what a mature tool feels like. Update and keep coding.

  Read the full breakdown 👇`;

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