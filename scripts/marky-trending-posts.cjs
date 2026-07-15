#!/usr/bin/env node
/**
 * Marky Trending Posts Generator
 * 
 * Generates social posts from trending AI/coding topics.
 * Use when you want fresh content not tied to specific articles.
 * 
 * Usage:
 *   node scripts/marky-trending-posts.cjs                    # auto-select trending topics
 *   node scripts/marky-trending-posts.cjs --count 5          # number of posts
 *   node scripts/marky-trending-posts.cjs --schedule         # auto-schedule
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const ROOT = path.join(__dirname, '..');
const STATE_PATH = path.join(ROOT, 'tmp', 'marky-state.json');

const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const KEY = 'mk_live_2HrW1PDCF5i4rMu809NIDtvxtu0-rdnZOGURht6RWmE';

// Trending topics that work well on social media
const TRENDING_TOPICS = [
  {
    topic: 'Claude Code just dropped a major update and nobody noticed',
    format: 'ai-image',
    ai_image_type: 'meme',
    hook: 'Breaking',
  },
  {
    topic: 'The npm download numbers for coding agents this week are insane',
    format: 'design',
    hook: 'Data',
  },
  {
    topic: 'Why I switched from Cursor to Claude Code (and why you might too)',
    format: 'carousel',
    hook: 'Thread',
  },
  {
    topic: 'The security vulnerability that affects every coding agent user',
    format: 'ai-image',
    ai_image_type: 'infographic',
    hook: 'Warning',
  },
  {
    topic: 'Hot take: GitHub Copilot is becoming irrelevant',
    format: 'ai-image',
    ai_image_type: 'meme',
    hook: 'Hot Take',
  },
  {
    topic: 'The real reason developers are switching to terminal-based agents',
    format: 'design',
    hook: 'Insight',
  },
  {
    topic: 'I tested 5 coding agents on the same bug — the results surprised me',
    format: 'carousel',
    hook: 'Experiment',
  },
  {
    topic: 'The hidden cost of AI coding agents nobody talks about',
    format: 'design',
    hook: 'Reality Check',
  },
  {
    topic: 'Stop using coding agents wrong — here is the right way',
    format: 'ai-image',
    ai_image_type: 'infographic',
    hook: 'Tip',
  },
  {
    topic: 'The coding agent that nobody is talking about but should be',
    format: 'design',
    hook: 'Discovery',
  },
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

function selectTopics(count) {
  const shuffled = [...TRENDING_TOPICS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function getNextSlots(count) {
  const now = new Date();
  const slots = [];
  const hours = [6, 10, 14]; // 9 AM, 1 PM, 5 PM Saudi
  
  for (let day = 0; day < Math.ceil(count / 3); day++) {
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

async function main() {
  const dry = hasFlag('--dry');
  const schedule = hasFlag('--schedule');
  const count = parseInt(argVal('--count') || '3');

  console.log('=== Marky Trending Posts ===');
  console.log(`Mode: ${dry ? 'DRY RUN' : schedule ? 'GENERATE + SCHEDULE' : 'GENERATE ONLY'}`);
  console.log(`Posts: ${count}`);
  console.log('');

  const state = loadState();
  const topics = selectTopics(count);
  const slots = schedule ? getNextSlots(count) : [];

  const posts = [];

  for (let i = 0; i < topics.length; i++) {
    const { topic, format, ai_image_type, hook } = topics[i];
    
    console.log(`\n[${hook}] ${topic}`);
    
    if (dry) {
      console.log(`  Format: ${format}${ai_image_type ? ` (${ai_image_type})` : ''}`);
      posts.push({ dry: true, hook, topic, format });
      continue;
    }

    const body = {
      business_id: BIZ_ID,
      content: topic,
      count: 1,
      creative_formats: [format],
    };

    if (format === 'ai-image') {
      body.ai_image_type = ai_image_type || 'design';
    }

    const res = await apiCall('POST', `/businesses/${BIZ_ID}/posts/generate`, body);
    
    if (res.status !== 202) {
      console.log(`  Error: ${JSON.stringify(res.data)}`);
      continue;
    }

    const jobId = res.data.job_id;
    console.log(`  Job: ${jobId}`);

    // Poll
    for (let j = 0; j < 30; j++) {
      await new Promise(r => setTimeout(r, 2000));
      const status = await apiCall('GET', `/businesses/${BIZ_ID}/jobs/${jobId}`);
      
      if (status.data.status === 'completed') {
        const post = status.data.data?.[0];
        if (post) {
          console.log(`  Created: ${post.post_id}`);
          
          if (schedule && slots[i]) {
            await apiCall('POST', `/businesses/${BIZ_ID}/posts/${post.post_id}/schedule`, {
              scheduled_publish_time: slots[i],
            });
            console.log(`  Scheduled: ${slots[i]}`);
          }

          posts.push({
            id: post.post_id,
            hook,
            topic,
            format,
            scheduled: slots[i] || null,
          });
        }
        break;
      } else if (status.data.status === 'failed') {
        console.log(`  Failed: ${status.data.error}`);
        break;
      }
    }

    // Rate limit
    if (i < topics.length - 1) {
      await new Promise(r => setTimeout(r, 10000));
    }
  }

  // Save state
  if (!dry) {
    state.posts.push(...posts.filter(p => p.id));
    state.lastRun = new Date().toISOString();
    saveState(state);
  }

  console.log(`\n=== Summary ===`);
  console.log(`Generated: ${posts.length} posts`);
  if (schedule) {
    console.log(`Scheduled: ${posts.filter(p => p.scheduled).length}`);
  }
}

main().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
