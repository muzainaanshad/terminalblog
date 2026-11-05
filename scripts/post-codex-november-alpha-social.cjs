#!/usr/bin/env node
/**
 * Post about Codex November 2026 alpha wave to X and LinkedIn via MyMarky API
 */

const https = require('https');

const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const API_KEY = 'mk_live_w61K61zmWDi-I-pviWXoYQX7UmU2mJ-xOAVyNdsKVpY';
const API_BASE = 'https://api.mymarky.ai';

const ARTICLE_URL = 'https://terminalblog.com/blog/codex-november-2026-alpha-wave/';
const ARTICLE_TITLE = 'Codex Just Dropped Three Alpha Releases in Four Days — Here\'s What Actually Changed';

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
  const tweet = `Codex shipped 3 alpha releases in 4 days (Nov 1–5).

v0.167 alphas: Windows sandbox fixes, model switching that keeps context
v0.168 alphas: Parallel agent scaffolding — the foundation for running multiple background sessions

Stable cadence ~weekly. v0.166.0 is rock solid today.

${ARTICLE_URL}

#Codex #OpenAI #AICoding #TerminalAgents`;

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
  const linkedinPost = 'Codex just dropped three alpha releases in four days (Nov 1–5). The velocity is relentless.\n\n' +
    'WHAT\'S COOKING IN ALPHA:\n' +
    '• v0.167 alphas: Windows sandbox hardening (Smart App Control, Defender ASR), model switching mid-session without context loss, transcript search fixes\n' +
    '• v0.168 alphas: PARALLEL AGENT FOUNDATION — session manager refactored for multiple background sessions, unified transcript renderer\n\n' +
    'THE SIGNAL:\n' +
    'OpenAI is building toward "codex spawn --background" — fire off a refactor in session A, tests in session B, docs in session C. You become the team lead, not the pair programmer.\n\n' +
    'STABLE CADENCE:\n' +
    'Weekly stable drops. v0.166.0 (Oct 29) has keyboard transcript nav, Terra on Vertex/Bedrock, queue resume, network doctor. Rock solid.\n\n' +
    'v0.167 stable ~Nov 5-7. v0.168 stable ~Nov 12-14.\n\n' +
    'BEGINNER TAKEAWAY:\n' +
    'Stay on v0.166.0. Learn "/model", "/compact", transcript nav (/, n, v, y). Watch alpha changelogs for the parallel-agent API design.\n\n' +
    'The shift from "AI pair programmer" to "AI team lead" is happening in the alpha branch.\n\n' +
    'Read the full breakdown 👇';

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
  console.log('=== Posting Codex Alpha Wave Article to Social ===');
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