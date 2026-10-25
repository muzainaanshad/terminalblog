#!/usr/bin/env node
/**
 * Post OpenClaw 2026.10.7 release to X/Twitter and LinkedIn via MyMarky
 */

const https = require('https');

const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const KEY = 'mk_live_2HrW1PDCF5i4rMu809NIDtvxtu0-rdnZOGURht6RWmE';
const API = 'https://api.mymarky.ai/api';

const ARTICLE_URL = 'https://terminalblog.com/blog/openclaw-2026-10-7-replay-safe-recovery/';
const ARTICLE_TITLE = 'OpenClaw 2026.10.7: Your Sessions Finally Survive Crashes, Updates, and Gateway Restarts';

async function apiCall(method, apiPath, body = null) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const opts = {
      hostname: 'api.mymarky.ai',
      path: `/api${apiPath}`,
      method,
      headers: {
        'Authorization': `Bearer ${KEY}`,
        'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
      },
    };
    const req = https.request(opts, (res) => {
      let responseBody = '';
      res.on('data', c => responseBody += c);
      res.on('end', () => {
        try {
          const json = JSON.parse(responseBody);
          resolve({ status: res.statusCode, data: json });
        } catch {
          resolve({ status: res.statusCode, data: responseBody });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function generateAndSchedulePost(platform, customPrompt) {
  console.log(`\n=== Generating ${platform} post ===`);
  
  const res = await apiCall('POST', `/businesses/${BIZ_ID}/posts/generate`, {
    content: customPrompt,
    count: 1,
    creative_formats: ['design'],
  });

  if (res.status !== 202) {
    console.log(`Error generating: ${JSON.stringify(res.data)}`);
    return null;
  }

  const jobId = res.data.job_id;
  console.log(`Job: ${jobId}`);

  // Poll for completion
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 2000));
    const status = await apiCall('GET', `/businesses/${BIZ_ID}/jobs/${jobId}`);
    
    if (status.data.status === 'completed') {
      console.log('Generation complete!');
      const posts = status.data.data || [];
      if (posts.length > 0) {
        const post = posts[0];
        console.log(`Caption: ${post.caption?.slice(0, 200)}...`);
        return post;
      }
      return null;
    } else if (status.data.status === 'failed') {
      console.log(`Failed: ${status.data.error}`);
      return null;
    }
  }
  console.log('Timeout');
  return null;
}

async function main() {
  console.log('=== Posting OpenClaw 2026.10.7 Release to Social ===');
  console.log(`Article: ${ARTICLE_URL}`);

  // X/Twitter post - thread style with key takeaways + link
  const xPrompt = `Write an X/Twitter thread (3-4 tweets) about the OpenClaw 2026.10.7 release. 

Key points to cover:
- OpenClaw 2026.10.7 is a "continuity release" - 70 PRs, zero breaking changes
- Sessions now survive crashes with replay-safe recovery (retains provenance + unfinished tool outcomes)
- Updates activate safely even if interrupted - verified activations survive maintenance
- Database/worker/backup durability fixes - interrupted R2 verification resumes
- Operator controls recover after session expiry - GitHub operators can still publish PRs
- Provider/plugin continuity - model refresh retains state, no more discarding valid setup
- Cross-platform upgrade convergence - macOS/Windows upgrades don't lose agent access
- NEW: Gemini 4 Argon support added

Tone: Technical but accessible, like a senior dev sharing what actually matters. No hype, just the facts that matter to operators.

End the thread with: "Read the full breakdown: ${ARTICLE_URL}"

Include relevant hashtags: #OpenClaw #AIAgents #DeveloperTools`;

  // LinkedIn post - personal take, no links in body
  const linkedinPrompt = `Write a LinkedIn post about the OpenClaw 2026.10.7 release from my perspective as someone who runs AI coding agents in production.

Personal angle: I've been burned by session crashes losing work, updates bricking installs, and backups that don't restore. This release systematically fixes ALL of those failure modes.

Key personal takeaways:
- "It just works" is finally a feature, not marketing
- 70 PRs from 50+ contributors, zero breaking changes
- The continuity fixes (sessions, updates, databases, backups, operator controls, providers) are what production operators actually need
- Gemini 4 Argon is a nice bonus

Tone: Experienced practitioner sharing what matters. No corporate speak. First-person ("I've been...", "This is the release...").

NO LINKS in the body. Just the insight.

Hashtags: #OpenClaw #AIAgents #DeveloperTools #SoftwareEngineering`;

  // Generate X post
  const xPost = await generateAndSchedulePost('x', xPrompt);
  
  // Generate LinkedIn post
  const linkedinPost = await generateAndSchedulePost('linkedin', linkedinPrompt);

  if (xPost) {
    console.log('\n✅ X post generated');
    // Schedule for now + 5 minutes
    const scheduleTime = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    const scheduled = await apiCall('POST', `/businesses/${BIZ_ID}/posts/${xPost.post_id}/schedule`, {
      scheduled_publish_time: scheduleTime,
    });
    if (scheduled.status === 200) {
      console.log(`✅ X post scheduled for ${scheduleTime}`);
    } else {
      console.log(`⚠️ X schedule failed: ${JSON.stringify(scheduled.data)}`);
    }
  }

  if (linkedinPost) {
    console.log('\n✅ LinkedIn post generated');
    const scheduleTime = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    const scheduled = await apiCall('POST', `/businesses/${BIZ_ID}/posts/${linkedinPost.post_id}/schedule`, {
      scheduled_publish_time: scheduleTime,
    });
    if (scheduled.status === 200) {
      console.log(`✅ LinkedIn post scheduled for ${scheduleTime}`);
    } else {
      console.log(`⚠️ LinkedIn schedule failed: ${JSON.stringify(scheduled.data)}`);
    }
  }

  console.log('\n=== Done ===');
}

main().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});