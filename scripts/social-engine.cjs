#!/usr/bin/env node
/**
 * Social Media Engine — 3+ posts/day across Twitter, LinkedIn, Instagram, Facebook
 * 
 * Uses MyMarky API for multi-platform posting.
 * Two modes:
 *   1. AI-generated (MyMarky /generate endpoint) — quick, daily volume
 *   2. Manual posts (MyMarky POST /posts) — higher quality, specific content
 * 
 * Usage:
 *   node scripts/social-engine.cjs --generate              # AI generates 3 posts
 *   node scripts/social-engine.cjs --generate --topic "AI agents"  # specific topic
 *   node scripts/social-engine.cjs --manual "tweet text" --image "url"  # manual post
 *   node scripts/social-engine.cjs --schedule-all           # schedule batch for week
 *   node scripts/social-engine.cjs --dry                    # preview only
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const STATE_PATH = path.join(ROOT, 'tmp', 'social-engine-state.json');

const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const KEY = 'mk_live_2HrW1PDCF5i4rMu809NIDtvxtu0-rdnZOGURht6RWmE';
const API = 'https://api.mymarky.ai/api';

// ── Content topics that drive engagement ──
const CONTENT_TOPICS = [
  // Developer humor / relatable
  { topic: 'debugging at 3am', angle: 'humor', platforms: ['twitter', 'linkedin'] },
  { topic: 'code review comments that hurt', angle: 'humor', platforms: ['twitter'] },
  { topic: 'when the CI passes on first try', angle: 'humor', platforms: ['twitter', 'facebook'] },
  { topic: 'explaining tech to non-tech family', angle: 'humor', platforms: ['twitter', 'facebook'] },
  { topic: 'senior dev vs junior dev', angle: 'comparison', platforms: ['twitter', 'linkedin'] },
  
  // Tool discoveries (viral)
  { topic: 'free terminal tools that replace paid software', angle: 'discovery', platforms: ['twitter', 'linkedin', 'instagram'] },
  { topic: 'VS Code extensions nobody talks about', angle: 'discovery', platforms: ['twitter', 'linkedin'] },
  { topic: 'AI tools that actually save time', angle: 'discovery', platforms: ['twitter', 'linkedin', 'instagram'] },
  { topic: 'GitHub repos with insane documentation', angle: 'discovery', platforms: ['twitter', 'linkedin'] },
  
  // Hot takes / opinions
  { topic: 'AI will not replace developers', angle: 'opinion', platforms: ['twitter', 'linkedin'] },
  { topic: 'why most startups fail at tech', angle: 'opinion', platforms: ['linkedin'] },
  { topic: 'remote work is better for productivity', angle: 'opinion', platforms: ['twitter', 'linkedin'] },
  { topic: 'learning to code in 2026', angle: 'opinion', platforms: ['twitter', 'linkedin', 'facebook'] },
  
  // Tips / productivity
  { topic: 'git commands every developer should know', angle: 'tips', platforms: ['twitter', 'linkedin', 'instagram'] },
  { topic: 'terminal shortcuts that save hours', angle: 'tips', platforms: ['twitter', 'instagram'] },
  { topic: 'how I automate my morning routine as a developer', angle: 'tips', platforms: ['twitter', 'linkedin'] },
  { topic: 'best practices for code review', angle: 'tips', platforms: ['linkedin'] },
  
  // News / updates
  { topic: 'latest AI coding agent updates', angle: 'news', platforms: ['twitter', 'linkedin'] },
  { topic: 'new open source releases this week', angle: 'news', platforms: ['twitter', 'linkedin'] },
  
  // Culture / lifestyle
  { topic: 'developer workspace setup', angle: 'lifestyle', platforms: ['instagram', 'facebook'] },
  { topic: 'work from home essentials', angle: 'lifestyle', platforms: ['instagram', 'facebook'] },
  { topic: 'coding playlist that helps me focus', angle: 'lifestyle', platforms: ['twitter', 'instagram'] },
];

// ── API helpers ──
function apiCall(method, apiPath, body = null) {
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
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(body) }); }
        catch { resolve({ status: res.statusCode, data: body }); }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

function loadState() {
  try { return JSON.parse(fs.readFileSync(STATE_PATH, 'utf8')); }
  catch { return { posts: [], lastRun: null, dailyCount: 0 }; }
}

function saveState(state) {
  fs.mkdirSync(path.dirname(STATE_PATH), { recursive: true });
  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2));
}

function getTodaySlots(count) {
  const now = new Date();
  const slots = [];
  // Post at: 9 AM, 1 PM, 5 PM, 9 PM Saudi (6, 10, 14, 18 UTC)
  const hours = [6, 10, 14, 18];
  for (const h of hours) {
    const d = new Date(now);
    d.setUTCHours(h, 0, 0, 0);
    if (d > now) slots.push(d.toISOString());
  }
  // If not enough slots today, add tomorrow
  if (slots.length < count) {
    for (const h of hours) {
      const d = new Date(now);
      d.setDate(d.getDate() + 1);
      d.setUTCHours(h, 0, 0, 0);
      slots.push(d.toISOString());
      if (slots.length >= count) break;
    }
  }
  return slots.slice(0, count);
}

// ── Platform-specific formatting ──
function formatForPlatform(caption, platform) {
  // MyMarky handles this, but we can add platform-specific tweaks
  return caption;
}

// ── Main ──
async function main() {
  const args = process.argv.slice(2);
  const dry = args.includes('--dry');
  const generate = args.includes('--generate');
  const manual = args.includes('--manual');
  const scheduleAll = args.includes('--schedule-all');
  const topicFlag = args.indexOf('--topic');
  const specificTopic = topicFlag >= 0 ? args[topicFlag + 1] : null;

  console.log('=== Social Media Engine ===');
  console.log(`Mode: ${dry ? 'DRY RUN' : generate ? 'AI GENERATE' : manual ? 'MANUAL' : scheduleAll ? 'SCHEDULE ALL' : 'INFO'}`);

  const state = loadState();

  if (generate) {
    // AI-generated posts via MyMarky
    const topic = specificTopic || CONTENT_TOPICS[Math.floor(Math.random() * CONTENT_TOPICS.length)].topic;
    console.log(`\nGenerating posts about: ${topic}`);

    if (dry) {
      console.log('Would generate 3 posts via MyMarky AI');
      console.log(`Topic: ${topic}`);
      return;
    }

    const result = await apiCall('POST', `/businesses/${BIZ_ID}/posts/generate`, {
      topic: topic,
      count: 3,
    });

    if (result.data?.job_id) {
      console.log(`Job ID: ${result.data.job_id}`);
      console.log('Posts generating... check MyMarky dashboard');
      state.posts.push({ topic, jobId: result.data.job_id, date: new Date().toISOString() });
      state.lastRun = new Date().toISOString();
      saveState(state);
    } else {
      console.log('Error:', JSON.stringify(result.data).slice(0, 200));
    }
  }

  if (manual) {
    const text = args[args.indexOf('--manual') + 1];
    const imageIdx = args.indexOf('--image');
    const image = imageIdx >= 0 ? args[imageIdx + 1] : null;

    if (!text) {
      console.error('Usage: --manual "tweet text" --image "image_url"');
      process.exit(1);
    }

    console.log(`\nCreating manual post:`);
    console.log(`Text: ${text.slice(0, 100)}...`);
    console.log(`Image: ${image || 'none'}`);

    if (dry) {
      console.log('Would create post via MyMarky');
      return;
    }

    const body = { caption: text };
    if (image) body.media_urls = [image];

    const result = await apiCall('POST', `/businesses/${BIZ_ID}/posts`, body);

    if (result.data?.id) {
      console.log(`Post ID: ${result.data.id}`);

      // Publish immediately
      const pubResult = await apiCall('POST', `/businesses/${BIZ_ID}/posts/${result.data.id}/publish`);
      if (pubResult.data?.status === 'PUBLISHED') {
        console.log('PUBLISHED to all platforms');
        const results = pubResult.data.publish_results || [];
        for (const r of results) {
          console.log(`  ${r.platform}: ${r.status} → ${r.post_url || 'pending'}`);
        }
        state.posts.push({ id: result.data.id, text: text.slice(0, 50), date: new Date().toISOString() });
        state.lastRun = new Date().toISOString();
        saveState(state);
      } else {
        console.log('Publish error:', JSON.stringify(pubResult.data).slice(0, 200));
      }
    } else {
      console.log('Create error:', JSON.stringify(result.data).slice(0, 200));
    }
  }

  if (scheduleAll) {
    console.log('\nScheduling weekly batch...');

    // Pick 3 topics per day for 7 days = 21 posts
    const shuffled = [...CONTENT_TOPICS].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 21);

    for (let i = 0; i < selected.length; i++) {
      const t = selected[i];
      console.log(`[${i + 1}/21] ${t.topic} (${t.angle})`);

      if (dry) {
        console.log('  Would generate and schedule');
        continue;
      }

      const result = await apiCall('POST', `/businesses/${BIZ_ID}/posts/generate`, {
        topic: t.topic,
        count: 1,
      });

      if (result.data?.job_id) {
        console.log(`  Job: ${result.data.job_id}`);
        state.posts.push({ topic: t.topic, jobId: result.data.job_id, date: new Date().toISOString() });
      }

      await new Promise(r => setTimeout(r, 2000)); // Rate limit
    }

    state.lastRun = new Date().toISOString();
    saveState(state);
    console.log(`\nScheduled ${selected.length} posts`);
  }

  // Show info
  if (!generate && !manual && !scheduleAll) {
    console.log('\nUsage:');
    console.log('  --generate              AI generates 3 posts');
    console.log('  --generate --topic "X"  AI generates about specific topic');
    console.log('  --manual "text"         Create and publish specific post');
    console.log('  --manual "text" --image "url"  Post with image');
    console.log('  --schedule-all          Schedule 21 posts (3/day × 7 days)');
    console.log('  --dry                   Preview only');
    console.log('\nPlatforms: Twitter, LinkedIn, Instagram, Facebook');
    console.log(`Posts today: ${state.dailyCount || 0}`);
    console.log(`Last run: ${state.lastRun || 'never'}`);
  }
}

main().catch(e => { console.error('Error:', e.message); process.exit(1); });
