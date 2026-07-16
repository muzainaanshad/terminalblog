#!/usr/bin/env node
/**
 * MyMarky Social Automation — Generate + Schedule
 * 
 * Uses MyMarky's AI to generate posts with images, then schedules them.
 * Profile tone/topics drive the content. No manual image work needed.
 * 
 * Usage:
 *   node scripts/marky-social-automation.cjs                         # generate 2 posts
 *   node scripts/marky-social-automation.cjs --count 5               # more posts
 *   node scripts/marky-social-automation.cjs --schedule              # auto-schedule
 *   node scripts/marky-social-automation.cjs --topic "hot takes"     # specific topic
 *   node scripts/marky-social-automation.cjs --dry                   # preview only
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const ROOT = path.join(__dirname, '..');
const STATE_PATH = path.join(ROOT, 'tmp', 'marky-state.json');

const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const KEY = 'mk_live_2HrW1PDCF5i4rMu809NIDtvxtu0-rdnZOGURht6RWmE';
const API = 'https://api.mymarky.ai/api';

// Content themes (MyMarky uses profile tone + these to generate)
const THEMES = [
  'Programmer life observations and relatable moments that make devs go that is so true',
  'Tech hot takes and controversial opinions about tools, languages, and workflows',
  'The gap between what tutorials teach and what real jobs actually need',
  'Developer humor: debugging stories, meeting frustrations, and late night commits',
  'Remote work life: the unspoken rules of working from home as a developer',
  'Things senior devs wish they knew when they started coding',
  'The weird side of programming: edge cases, legacy code, and mysterious bugs',
  'AI coding tools: what actually works vs what the marketing says',
  'Code review dynamics: the passive aggressive comments and unspoken rules',
  'Startup culture observations: equity talks, ping pong tables, and pivots',
];

function hasFlag(f) { return process.argv.includes(f); }
function argVal(f) {
  const i = process.argv.indexOf(f);
  return i >= 0 ? process.argv[i + 1] : null;
}

function loadState() {
  try { return JSON.parse(fs.readFileSync(STATE_PATH, 'utf8')); }
  catch { return { posts: [], lastRun: null }; }
}

function saveState(state) {
  fs.mkdirSync(path.dirname(STATE_PATH), { recursive: true });
  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2));
}

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
        try {
          const json = JSON.parse(body);
          resolve({ status: res.statusCode, data: json });
        } catch {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

function selectTheme(topicFilter = null) {
  if (topicFilter) {
    const match = THEMES.find(t => t.toLowerCase().includes(topicFilter.toLowerCase()));
    return match || topicFilter;
  }
  return THEMES[Math.floor(Math.random() * THEMES.length)];
}

function getNextSlots(count) {
  const now = new Date();
  const slots = [];
  // Schedule at 9 AM, 1 PM, 5 PM, 9 PM Saudi (6, 10, 14, 18 UTC)
  const hours = [6, 10, 14, 18];
  
  for (let day = 0; day < Math.ceil(count / 4); day++) {
    for (const hour of hours) {
      if (slots.length >= count) break;
      const date = new Date(now);
      date.setDate(date.getDate() + day);
      date.setUTCHours(hour, 0, 0, 0);
      if (date > now) {
        slots.push(date.toISOString());
      }
    }
  }
  return slots.slice(0, count);
}

async function generatePosts(theme, count) {
  console.log(`\nGenerating ${count} posts...`);
  console.log(`Theme: ${theme}`);
  
  const res = await apiCall('POST', `/businesses/${BIZ_ID}/posts/generate`, {
    content: theme,
    count,
    creative_formats: ['design', 'ai-image', 'carousel'],
  });

  if (res.status !== 202) {
    console.log(`Error: ${JSON.stringify(res.data)}`);
    return null;
  }

  const jobId = res.data.job_id;
  console.log(`Job: ${jobId}`);

  // Poll for completion (max 60 seconds)
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 2000));
    const status = await apiCall('GET', `/businesses/${BIZ_ID}/jobs/${jobId}`);
    
    if (status.data.status === 'completed') {
      console.log('Generation complete!');
      return status.data.data || [];
    } else if (status.data.status === 'failed') {
      console.log(`Failed: ${status.data.error}`);
      return null;
    }
  }

  console.log('Timeout');
  return null;
}

async function schedulePost(postId, publishAt) {
  const res = await apiCall('POST', `/businesses/${BIZ_ID}/posts/${postId}/schedule`, {
    scheduled_publish_time: publishAt,
  });

  if (res.status === 200) {
    return true;
  } else {
    console.log(`  Schedule error: ${res.data?.error?.message || 'unknown'}`);
    return false;
  }
}

async function main() {
  const dry = hasFlag('--dry');
  const schedule = hasFlag('--schedule');
  const count = parseInt(argVal('--count') || '2');
  const topicFilter = argVal('--topic');

  console.log('=== MyMarky Social Automation ===');
  console.log(`Mode: ${dry ? 'DRY RUN' : schedule ? 'GENERATE + SCHEDULE' : 'GENERATE ONLY'}`);
  console.log(`Posts: ${count}`);

  const state = loadState();
  const theme = selectTheme(topicFilter);

  if (dry) {
    console.log(`\nWould generate ${count} posts about:`);
    console.log(`  "${theme}"`);
    console.log('\nProfile tone: Tech-savvy friend who makes you laugh');
    console.log('Formats: design, ai-image, carousel');
    if (schedule) {
      const slots = getNextSlots(count);
      slots.forEach((s, i) => console.log(`  Post ${i + 1}: ${s}`));
    }
    return;
  }

  const posts = await generatePosts(theme, count);
  if (!posts || !posts.length) {
    console.log('No posts generated');
    return;
  }

  console.log(`\nGenerated ${posts.length} posts:`);
  
  const slots = schedule ? getNextSlots(posts.length) : [];
  const results = [];

  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    const caption = post.caption || '';
    console.log(`\n${i + 1}. ${caption.slice(0, 120)}...`);
    
    if (post.media_urls) {
      console.log(`   Images: ${post.media_urls.length}`);
    }

    if (schedule && slots[i]) {
      const ok = await schedulePost(post.post_id, slots[i]);
      if (ok) {
        console.log(`   Scheduled: ${slots[i]}`);
        results.push({ id: post.post_id, scheduled: slots[i], caption: caption.slice(0, 80) });
      }
    } else {
      results.push({ id: post.post_id, caption: caption.slice(0, 80) });
    }
  }

  // Save state
  state.posts.push(...results);
  state.lastRun = new Date().toISOString();
  saveState(state);

  console.log(`\n=== Summary ===`);
  console.log(`Generated: ${posts.length}`);
  if (schedule) console.log(`Scheduled: ${results.filter(r => r.scheduled).length}`);
}

main().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
