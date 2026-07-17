#!/usr/bin/env node
/**
 * Create first batch of 6 social media posts and schedule via MyMarky.
 * 
 * Posts:
 * 1. Twitter — developer humor
 * 2. Twitter — tool discovery
 * 3. Twitter — hot take
 * 4. LinkedIn — professional insight
 * 5. Instagram — with image (terminal tool)
 * 6. Facebook — casual shareable
 */

const https = require('https');

const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const KEY = 'mk_live_2HrW1PDCF5i4rMu809NIDtvxtu0-rdnZOGURht6RWmE';
const API = 'https://api.mymarky.ai/api';

// ── Posts ──
const POSTS = [
  {
    name: 'Twitter — humor',
    caption: `Nobody: \n\nMe at 3 AM: "I'll just fix this one bug before bed"\n\n*5 hours later*\n\nMe: "I've refactored the entire codebase and renamed every variable"`,
    image: null,
    platforms: ['twitter'],
  },
  {
    name: 'Twitter — tool discovery',
    caption: `Stop paying for download managers.\n\nThere's a terminal tool that does it better, faster, and for free.\n\nSurge — blazing fast file transfers from the command line.\n\nYou'll wonder why you ever used a GUI.`,
    image: null,
    platforms: ['twitter', 'linkedin'],
  },
  {
    name: 'Twitter — hot take',
    caption: `Hot take: The best code is the code you didn't write.\n\nEvery line of code is a liability.\n\nEvery dependency is a risk.\n\nEvery abstraction is a leak waiting to happen.\n\nShip less. Think more.`,
    image: null,
    platforms: ['twitter'],
  },
  {
    name: 'LinkedIn — professional insight',
    caption: `I've been building with AI coding agents for 6 months.\n\nHere's what nobody tells you:\n\n→ They're amazing at boilerplate\n→ They're terrible at architecture decisions\n→ They hallucinate APIs that don't exist\n→ They save 40% of time on boring tasks\n→ They waste 20% of time on wrong approaches\n\nThe sweet spot? Use them for the grunt work. Keep the thinking for yourself.\n\nThe developers who figure this out will 10x their output.\n\nWhat's your experience been?`,
    image: null,
    platforms: ['linkedin'],
  },
  {
    name: 'Instagram — terminal tool',
    caption: `Free alternative to Excel for your logs 📊\n\nnless is a terminal pager that makes log files actually readable.\n\n✅ Syntax highlighting\n✅ Real-time streaming\n✅ Filter & search\n✅ Zero config\n\nStop opening massive log files in Excel. Your terminal is all you need.\n\n#terminal #developer #coding #opensource #productivity #tech #linux #macos`,
    image: 'https://cdn.terminaltrove.com/m/39a20a00-c3e7-4509-91e3-64fa2e6c96cd.png',
    platforms: ['instagram', 'facebook'],
  },
  {
    name: 'Facebook — casual',
    caption: `Explain your job to a 5 year old:\n\n"I talk to a robot that writes code, then I tell the robot it's wrong, then the robot cries and writes different code."\n\nThat's basically what AI coding agents are. You're a professional robot therapist. 😂\n\nWho else can relate?`,
    image: null,
    platforms: ['facebook', 'twitter'],
  },
];

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

// Schedule times today (Saudi = UTC+3)
// 9 AM, 1 PM, 5 PM, 8 PM Saudi
function getScheduledTimes() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const slots = [
    new Date(today.getTime() + 6 * 3600000),   // 9 AM Saudi = 6 UTC
    new Date(today.getTime() + 10 * 3600000),  // 1 PM Saudi = 10 UTC
    new Date(today.getTime() + 14 * 3600000),  // 5 PM Saudi = 14 UTC
    new Date(today.getTime() + 17 * 3600000),  // 8 PM Saudi = 17 UTC
  ];
  // Filter to future only
  return slots.filter(s => s > now).map(s => s.toISOString());
}

async function main() {
  console.log('=== Creating 6 Social Media Posts ===\n');
  
  const scheduleTimes = getScheduledTimes();
  console.log(`Available schedule slots: ${scheduleTimes.length}`);
  scheduleTimes.forEach((t, i) => console.log(`  ${i + 1}. ${new Date(t).toLocaleString('en-US', { timeZone: 'Asia/Riyadh' })}`));
  console.log('');

  const results = [];

  for (let i = 0; i < POSTS.length; i++) {
    const post = POSTS[i];
    const scheduleTime = scheduleTimes[i % scheduleTimes.length];
    
    console.log(`[${i + 1}/6] ${post.name}`);
    console.log(`  Caption: ${post.caption.slice(0, 80)}...`);
    console.log(`  Image: ${post.image ? 'yes' : 'no'}`);
    console.log(`  Platforms: ${post.platforms.join(', ')}`);
    console.log(`  Schedule: ${new Date(scheduleTime).toLocaleString('en-US', { timeZone: 'Asia/Riyadh' })}`);

    // Create post
    const body = { caption: post.caption };
    if (post.image) body.media_urls = [post.image];

    const createResult = await apiCall('POST', `/businesses/${BIZ_ID}/posts`, body);

    if (createResult.data?.id) {
      const postId = createResult.data.id;
      console.log(`  ✅ Created: ${postId}`);

      // Schedule it
      const schedResult = await apiCall('POST', `/businesses/${BIZ_ID}/posts/${postId}/schedule`, {
        scheduled_publish_time: scheduleTime,
      });

      if (schedResult.status === 200 || schedResult.data?.status === 'SCHEDULED') {
        console.log(`  📅 Scheduled for ${new Date(scheduleTime).toLocaleString('en-US', { timeZone: 'Asia/Riyadh' })}`);
        results.push({ name: post.name, id: postId, status: 'scheduled', time: scheduleTime });
      } else {
        console.log(`  ⚠️ Schedule error: ${JSON.stringify(schedResult.data).slice(0, 100)}`);
        // Try to publish immediately instead
        const pubResult = await apiCall('POST', `/businesses/${BIZ_ID}/posts/${postId}/publish`);
        if (pubResult.data?.status === 'PUBLISHED') {
          console.log(`  🚀 Published immediately instead`);
          results.push({ name: post.name, id: postId, status: 'published' });
        } else {
          results.push({ name: post.name, id: postId, status: 'error' });
        }
      }
    } else {
      console.log(`  ❌ Create error: ${JSON.stringify(createResult.data).slice(0, 150)}`);
      results.push({ name: post.name, status: 'create_error' });
    }

    console.log('');
    await new Promise(r => setTimeout(r, 1500)); // Rate limit
  }

  // Summary
  console.log('=== Summary ===');
  for (const r of results) {
    const icon = r.status === 'scheduled' ? '📅' : r.status === 'published' ? '🚀' : '❌';
    console.log(`${icon} ${r.name}: ${r.status}`);
  }

  const scheduled = results.filter(r => r.status === 'scheduled').length;
  const published = results.filter(r => r.status === 'published').length;
  console.log(`\nTotal: ${scheduled} scheduled, ${published} published, ${results.length - scheduled - published} errors`);
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
