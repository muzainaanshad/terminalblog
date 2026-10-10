#!/usr/bin/env node
/**
 * Post about Claude Code v2.1.296 article to X and LinkedIn via MyMarky API
 */

const https = require('https');

const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const API_KEY = 'mk_live_w61K61zmWDi-I-pviWXoYQX7UmU2mJ-xOAVyNdsKVpY';
const API_BASE = 'https://api.mymarky.ai';

const ARTICLE_URL = 'https://terminalblog.com/blog/claude-code-v2-1-296-stability-wave-two/';
const ARTICLE_TITLE = 'Claude Code v2.1.296 Just Dropped Another 100+ Fixes — The Stability Wave Keeps Coming';

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
  const tweet = `Claude Code v2.1.296 dropped Oct 9 — another 100+ fixes the day after v2.1.295.

Two-day, 200+ fix stability wave. Here's what actually matters:

• Corporate proxies/gateways: beta header rejection FIXED
• WebFetch 100k char ceiling GONE — offset pagination now works
• Terminal freezing on 10k+ line outputs SOLVED
• Resumed subagents KEEP their thinking & prompt cache
• Hook onFailure: "block" now enforced everywhere
• Mods get native OS notifications via $.ui.notify
• Background agents survive compaction & handoff
• Gateway sign-in gets a DENY button (no more stalled approvals)
• Session attach/logs by partial name
• Multiple Windows fixes (CRLF, piped input, keyboard)

Zero breaking changes. This is the release where Claude Code stops being beta infrastructure.

Full breakdown 👇

${ARTICLE_URL}

#ClaudeCode #AICoding #StabilityRelease`;

  console.log('Posting to Twitter...');
  console.log(tweet.slice(0, 200) + '...');
  console.log('---');

  const resp = await apiRequest('POST', `/api/businesses/${BIZ_ID}/posts`, {
    caption: tweet,
    restrict_publish_to: ['twitter'],
    status: 'SCHEDULED',
    // Schedule for next available slot
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
  const linkedinPost = `Claude Code v2.1.296 landed October 9 — literally the day after v2.1.295. Another 100+ fixes.

That's 200+ fixes in 48 hours. Zero breaking changes.

THE HEADLINES (what you'll actually feel):

✅ Corporate proxies/gateways that reject beta headers — FIXED
✅ WebFetch silently truncating at 100k chars — GONE (offset pagination works)
✅ Terminal freezing on massive outputs (10k+ lines) — SOLVED
✅ Resumed subagents losing their thinking/context — PRESERVED
✅ Hook onFailure: "block" — NOW ENFORCED EVERYWHERE (security hooks actually block)
✅ Mods get native OS notifications via $.ui.notify — NO MORE POLLING
✅ Background agents survive container restarts & compaction — /loop KEEPS RUNNING
✅ Gateway sign-in gets a DENY button — stalled approvals end in SECONDS
✅ Windows: CRLF line endings, piped input, keyboard after restart — ALL FIXED

THE VERDICT:
v2.1.295 gave hooks teeth. v2.1.296 makes the teeth bite everywhere.

If you've been working around proxy breaks, truncated fetches, frozen terminals, amnesiac subagents, or silent hook failures — this two-day wave plugs all of it.

This isn't a feature release. It's the release where Claude Code becomes the reliable daily driver you've been waiting for.

Read the full breakdown with every fix categorized 👇

Why pay $20/mo for ChatGPT, $20/mo for Claude, $20/mo for Gemini? **aiFiesta** gives you all of them and more for just $12/mo. One subscription, every answer. https://aifiesta.link/muhammed-anshad`;

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