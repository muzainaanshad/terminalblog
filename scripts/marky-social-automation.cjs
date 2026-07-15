#!/usr/bin/env node
/**
 * MyMarky Social Media Automation
 * 
 * Generates and schedules social posts from terminalblog content.
 * Uses MyMarky's AI generation with your brand voice + templates.
 * 
 * Usage:
 *   node scripts/marky-social-automation.cjs                      # generate from recent articles
 *   node scripts/marky-social-automation.cjs --topic "hot take"   # specific topic
 *   node scripts/marky-social-automation.cjs --count 5            # number of posts
 *   node scripts/marky-social-automation.cjs --schedule           # auto-schedule
 *   node scripts/marky-social-automation.cjs --dry                # preview only
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const ROOT = path.join(__dirname, '..');
const BLOG = path.join(ROOT, 'src', 'content', 'blog');
const STATE_PATH = path.join(ROOT, 'tmp', 'marky-state.json');

const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const KEY = 'mk_live_2HrW1PDCF5i4rMu809NIDtvxtu0-rdnZOGURht6RWmE';
const API = 'https://api.mymarky.ai/api';

// Post categories with MyMarky creative formats
const POST_TYPES = [
  {
    name: 'hot-take',
    format: 'ai-image',
    ai_image_type: 'meme',
    voice: 'Dry, self-deprecating, slightly unhinged. Like explaining to a smart friend who also uses the terminal.',
    topics: [
      'Why most coding agent comparisons are wrong',
      'The one thing nobody tells you about AI code generation',
      'Hot take: your coding agent is not as smart as you think',
      'The real cost of using AI coding agents (hint: it is not money)',
      'Unpopular opinion: most developers use coding agents wrong',
    ],
  },
  {
    name: 'data-drop',
    format: 'design',
    voice: 'Factual, slightly surprised, like sharing interesting data you just found.',
    topics: [
      'npm downloads this week show a surprising trend',
      'GitHub stars do not equal actual usage — here is the data',
      'Which coding agent is actually growing fastest?',
      'The adoption numbers that nobody is talking about',
      'Agent popularity vs real-world usage: the gap is huge',
    ],
  },
  {
    name: 'tip',
    format: 'design',
    voice: 'Helpful, concise, like sharing a useful trick you discovered.',
    topics: [
      'Quick tip: how to make your coding agent 10x more effective',
      'The one setting that changes everything in Claude Code',
      'Stop doing this with your AI coding agent',
      'Pro tip: most developers miss this in their agent setup',
      'The terminal trick that saves me hours every week',
    ],
  },
  {
    name: 'beware',
    format: 'ai-image',
    ai_image_type: 'infographic',
    voice: 'Warning, slightly dramatic, like alerting friends about a real danger.',
    topics: [
      'Warning: your coding agent might be leaking credentials',
      'The security risk nobody is talking about',
      'Stop! Check this setting before your next coding session',
      'This bug affected thousands of developers last week',
      'The dark side of AI coding agents you need to know about',
    ],
  },
  {
    name: 'comparison',
    format: 'carousel',
    voice: 'Analytical, fair, like helping someone make a decision.',
    topics: [
      'Claude Code vs Cursor: which one actually wins?',
      'The real difference between free and paid coding agents',
      'I tested 5 coding agents — here is what happened',
      'The coding agent that surprised me the most',
      'Stop debating — here is how to pick the right agent',
    ],
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

function apiCall(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const opts = {
      hostname: 'api.mymarky.ai',
      path: `/api${path}`,
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

function parseFront(content) {
  const m = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return { fields: {}, body: content };
  const fields = {};
  for (const line of m[1].split(/\r?\n/)) {
    const mm = line.match(/^(\w+):\s*"([^"]*)"$/);
    if (mm) fields[mm[1]] = mm[2];
  }
  return { fields, body: content.slice(m[0].length).trim() };
}

function getRecentArticles(count = 5) {
  const files = fs.readdirSync(BLOG)
    .filter(f => f.endsWith('.mdx'))
    .map(f => {
      const fp = path.join(BLOG, f);
      const stat = fs.statSync(fp);
      return { file: f, slug: f.replace('.mdx', ''), mtime: stat.mtime };
    })
    .sort((a, b) => b.mtime - a.mtime)
    .slice(0, count);

  return files.map(f => {
    const content = fs.readFileSync(path.join(BLOG, f.file), 'utf-8');
    const { fields } = parseFront(content);
    return { ...f, title: fields.title || f.slug, tags: fields.tags || [] };
  });
}

function selectPostType(index) {
  return POST_TYPES[index % POST_TYPES.length];
}

function selectTopic(postType, article = null) {
  const topics = postType.topics;
  const topic = topics[Math.floor(Math.random() * topics.length)];
  
  if (article) {
    return `${topic} — related to: ${article.title}`;
  }
  return topic;
}

async function generatePost(postType, article = null) {
  const topic = selectTopic(postType, article);
  
  console.log(`\nGenerating ${postType.name} post...`);
  console.log(`  Topic: ${topic}`);
  
  const body = {
    business_id: BIZ_ID,
    content: topic,
    count: 1,
    creative_formats: [postType.format],
    voice: postType.voice,
  };

  if (postType.format === 'ai-image') {
    body.ai_image_type = postType.ai_image_type || 'design';
  }

  const res = await apiCall('POST', `/businesses/${BIZ_ID}/posts/generate`, body);
  
  if (res.status !== 202) {
    console.log(`  Error: ${JSON.stringify(res.data)}`);
    return null;
  }

  const jobId = res.data.job_id;
  console.log(`  Job ID: ${jobId}`);

  // Poll for completion
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 2000));
    const status = await apiCall('GET', `/businesses/${BIZ_ID}/jobs/${jobId}`);
    
    if (status.data.status === 'completed') {
      const post = status.data.data?.[0];
      if (post) {
        console.log(`  Created: ${post.post_id}`);
        return post;
      }
    } else if (status.data.status === 'failed') {
      console.log(`  Failed: ${status.data.error}`);
      return null;
    }
  }

  console.log('  Timeout waiting for generation');
  return null;
}

async function schedulePost(postId, publishAt) {
  const res = await apiCall('POST', `/businesses/${BIZ_ID}/posts/${postId}/schedule`, {
    scheduled_publish_time: publishAt,
    restrict_publish_to: ['twitter', 'facebook', 'linkedIn'], // Instagram needs images
  });
  
  if (res.status === 200) {
    console.log(`  Scheduled for ${publishAt}`);
    return true;
  } else {
    console.log(`  Schedule error: ${JSON.stringify(res.data)}`);
    return false;
  }
}

function getNextSlots(count) {
  const now = new Date();
  const slots = [];
  
  // Schedule at 9 AM, 1 PM, 5 PM Saudi time (6 AM, 10 AM, 2 PM UTC)
  const hours = [6, 10, 14];
  
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
  const topicFilter = argVal('--topic');

  console.log('=== MyMarky Social Automation ===');
  console.log(`Mode: ${dry ? 'DRY RUN' : schedule ? 'GENERATE + SCHEDULE' : 'GENERATE ONLY'}`);
  console.log(`Posts: ${count}`);
  console.log('');

  const state = loadState();
  const recentArticles = getRecentArticles(5);
  
  console.log('Recent articles:');
  recentArticles.forEach((a, i) => console.log(`  ${i + 1}. ${a.title}`));
  console.log('');

  const posts = [];
  const slots = schedule ? getNextSlots(count) : [];

  for (let i = 0; i < count; i++) {
    const postType = topicFilter 
      ? POST_TYPES.find(t => t.name === topicFilter) || selectPostType(i)
      : selectPostType(i);
    
    const article = recentArticles[i % recentArticles.length];
    
    if (dry) {
      const topic = selectTopic(postType, article);
      console.log(`[DRY] ${postType.name}: ${topic}`);
      posts.push({ dry: true, type: postType.name, topic });
      continue;
    }

    const post = await generatePost(postType, article);
    if (!post) continue;

    posts.push({
      id: post.post_id,
      type: postType.name,
      caption: post.caption?.slice(0, 100),
      format: postType.format,
    });

    // Schedule if requested
    if (schedule && slots[i]) {
      await schedulePost(post.post_id, slots[i]);
      posts[posts.length - 1].scheduled = slots[i];
    }

    // Rate limit: 1 request per 10 seconds
    if (i < count - 1) {
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
    console.log(`Scheduled: ${posts.filter(p => p.scheduled).length} posts`);
  }
  
  if (posts.length > 0) {
    console.log('\nPosts:');
    posts.forEach((p, i) => {
      console.log(`  ${i + 1}. [${p.type}] ${p.caption || p.topic || 'dry run'}`);
      if (p.scheduled) console.log(`     → ${p.scheduled}`);
    });
  }
}

main().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
