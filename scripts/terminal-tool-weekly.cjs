#!/usr/bin/env node
/**
 * Terminal Tool Tweet Batch Scheduler
 * 
 * Creates 7 days of terminal tool posts via MyMarky API.
 * Each post: exact tweet text + GitHub README image + published immediately or scheduled.
 * 
 * Usage:
 *   node scripts/terminal-tool-weekly.cjs                    # schedule 7 posts
 *   node scripts/terminal-tool-weekly.cjs --publish-now       # publish all immediately
 *   node scripts/terminal-tool-weekly.cjs --dry               # preview only
 *   node scripts/terminal-tool-weekly.cjs --start-day 1       # offset start (1=Mon)
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const STATE_PATH = path.join(ROOT, 'tmp', 'terminal-tool-weekly-state.json');

const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const KEY = 'mk_live_2HrW1PDCF5i4rMu809NIDtvxtu0-rdnZOGURht6RWmE';
const API = 'https://api.mymarky.ai/api';

// ── Tool database (researched from Terminal Trove, GitHub Trending) ──
const TOOLS = [
  {
    name: 'mcpsnoop',
    repo: 'kerlenton/mcpsnoop',
    stars: 271,
    language: 'Go',
    hook: 'somebody built this',
    tweet: `Somebody built Wireshark for MCP\n\nmcpsnoop sits between your AI client and MCP servers and shows every single tool call live in your terminal\n\n271 stars. MIT. Zero config\n\nIf you build MCP servers this is basically required now`,
    reply: `github.com/kerlenton/mcpsnoop\nMIT · Go · Zero config\nSession replay + export`,
    image: 'https://raw.githubusercontent.com/kerlenton/mcpsnoop/main/docs/demo.gif',
  },
  {
    name: 'tortuise',
    repo: 'buildoak/tortuise',
    stars: 233,
    language: 'Rust',
    hook: 'cant believe this exists',
    tweet: `I cant believe this exists in 2026\n\nA tool that renders 3D gaussian splats directly in your terminal using ASCII characters\n\ntortuise — 233 stars. CPU only. No GPU needed\n\nRun "tortuise --demo" and watch your terminal come alive`,
    reply: `github.com/buildoak/tortuise\nRust · MIT\n6 render modes · WASD navigation\nBuilt-in demo scene included`,
    image: 'https://raw.githubusercontent.com/buildoak/tortuise/main/assets/demo.webp',
  },
  {
    name: 'surge',
    repo: 'surge-metrics/surge',
    stars: 1200,
    language: 'Go',
    hook: 'stop paying',
    tweet: `Stop paying for download managers\n\nsurge is a blazing fast TUI download manager in your terminal\n\nMulti-connection. Pause/resume. Speed graphs. Background server mode\n\nFree. Open source. Replaced my browser downloads completely`,
    reply: `github.com/surge-metrics/surge\nGo · MIT\nBrowser extension for Chrome/Firefox\nHeadless mode for servers`,
    image: null, // will use website screenshot
  },
  {
    name: 'lazyenv',
    repo: 'LazyVim/lazyenv',
    stars: 800,
    language: 'Rust',
    hook: 'somebody built this',
    tweet: `Somebody built a TUI for managing .env files\n\nlazyenv — browse, compare, and edit multiple .env files side by side in your terminal\n\nNo more "which env var is in which file" headaches\n\nTwo panel layout. Inline editing. Diff view`,
    reply: `github.com/LazyVim/lazyenv\nRust · MIT\nSide-by-side diff\nFuzzy matching`,
    image: null,
  },
  {
    name: 'nless',
    repo: 'allinurl/nless',
    stars: 500,
    language: 'Go',
    hook: 'free alternative',
    tweet: `Free alternative to Excel for your logs\n\nnless — pipe in anything, wrangle it into columns\n\nFilter, sort, aggregate, and visualize log data right in your terminal\n\nBuilt for people who paste logs into Excel and hate it`,
    reply: `github.com/allinurl/nless\nGo · MIT\nColumn mode · Filters\nJSON/CSV/regex support`,
    image: null,
  },
  {
    name: 'gistui',
    repo: 'akunzai/gistui',
    stars: 300,
    language: 'Go',
    hook: 'why is nobody talking about this',
    tweet: `Why is nobody talking about this?\n\ngistui — a terminal UI for managing GitHub Gists\n\nBrowse, diff, upload, download, create, and pin gists without opening a browser tab\n\nWord-level diffs before syncing\n\nIf you live in Gists this is a game changer`,
    reply: `github.com/akunzai/gistui\nGo · MIT\nFile pairing · Word diffs\nCross-platform`,
    image: null,
  },
  {
    name: 'netwatch',
    repo: 'netwatch-dev/netwatch',
    stars: 400,
    language: 'Rust',
    hook: 'the terminal tool i use every day',
    tweet: `The terminal tool I use every day for networking\n\nnetwatch — real time network diagnostics in your terminal\n\nSee connections, bandwidth, latency, and packet loss live\n\nNo more guessing why your API call is slow`,
    reply: `github.com/netwatch-dev/netwatch\nRust · MIT\nReal-time graphs\nInterface filtering`,
    image: null,
  },
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
  catch { return { posts: [], lastRun: null }; }
}

function saveState(state) {
  fs.mkdirSync(path.dirname(STATE_PATH), { recursive: true });
  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2));
}

function getNextSlots(count, startDay = 0) {
  const now = new Date();
  const slots = [];
  // Schedule at 10 PM Saudi (19:00 UTC) daily
  for (let day = startDay; day < startDay + count + 7; day++) {
    const date = new Date(now);
    date.setDate(date.getDate() + day);
    date.setUTCHours(19, 0, 0, 0);
    if (date > now) {
      slots.push(date.toISOString());
    }
    if (slots.length >= count) break;
  }
  return slots.slice(0, count);
}

// ── Main ──
async function main() {
  const dry = process.argv.includes('--dry');
  const publishNow = process.argv.includes('--publish-now');
  const startDayArg = process.argv.indexOf('--start-day');
  const startDay = startDayArg >= 0 ? parseInt(process.argv[startDayArg + 1]) : 0;

  console.log('=== Terminal Tool Weekly Scheduler ===');
  console.log(`Mode: ${dry ? 'DRY RUN' : publishNow ? 'PUBLISH NOW' : 'SCHEDULE'}`);
  console.log(`Tools: ${TOOLS.length}`);
  console.log('');

  const state = loadState();
  const slots = getNextSlots(TOOLS.length, startDay);
  const results = [];

  for (let i = 0; i < TOOLS.length; i++) {
    const tool = TOOLS[i];
    console.log(`\n[${i + 1}/${TOOLS.length}] ${tool.name} (${tool.hook})`);
    console.log(`  Tweet: ${tool.tweet.slice(0, 80)}...`);

    if (dry) {
      console.log(`  Would schedule for: ${slots[i] || 'TBD'}`);
      results.push({ name: tool.name, status: 'dry-run' });
      continue;
    }

    // Create post with exact caption
    const mediaUrls = tool.image ? [tool.image] : [];
    const createRes = await apiCall('POST', `/businesses/${BIZ_ID}/posts`, {
      caption: tool.tweet,
      media_urls: mediaUrls,
    });

    if (createRes.status >= 400 || !createRes.data?.id) {
      console.log(`  ERROR creating: ${JSON.stringify(createRes.data).slice(0, 200)}`);
      results.push({ name: tool.name, status: 'error', error: createRes.data });
      continue;
    }

    const postId = createRes.data.id;
    console.log(`  Created: ${postId}`);

    if (publishNow) {
      // Publish immediately
      const pubRes = await apiCall('POST', `/businesses/${BIZ_ID}/posts/${postId}/publish`);
      if (pubRes.data?.status === 'PUBLISHED') {
        const tw = pubRes.data.publish_results?.find(r => r.platform === 'twitter');
        console.log(`  PUBLISHED → ${tw?.post_url || 'check MyMarky'}`);
        results.push({ name: tool.name, status: 'published', postId, url: tw?.post_url });
      } else {
        console.log(`  Publish failed: ${JSON.stringify(pubRes.data).slice(0, 200)}`);
        results.push({ name: tool.name, status: 'publish-error', postId });
      }
    } else {
      // Schedule for slot
      const schedRes = await apiCall('POST', `/businesses/${BIZ_ID}/posts/${postId}/schedule`, {
        scheduled_publish_time: slots[i],
      });
      if (schedRes.data?.status === 'SCHEDULED') {
        console.log(`  Scheduled: ${slots[i]}`);
        results.push({ name: tool.name, status: 'scheduled', postId, scheduled: slots[i] });
      } else {
        console.log(`  Schedule failed: ${JSON.stringify(schedRes.data).slice(0, 200)}`);
        results.push({ name: tool.name, status: 'schedule-error', postId });
      }
    }

    // Small delay to avoid rate limits
    await new Promise(r => setTimeout(r, 1500));
  }

  // Save state
  state.posts.push(...results.map(r => ({
    name: r.name,
    status: r.status,
    postId: r.postId,
    url: r.url,
    scheduled: r.scheduled,
    date: new Date().toISOString(),
  })));
  state.lastRun = new Date().toISOString();
  saveState(state);

  console.log('\n=== Summary ===');
  console.log(`Total: ${TOOLS.length}`);
  console.log(`Published: ${results.filter(r => r.status === 'published').length}`);
  console.log(`Scheduled: ${results.filter(r => r.status === 'scheduled').length}`);
  console.log(`Errors: ${results.filter(r => r.status.includes('error')).length}`);
}

main().catch(e => { console.error('Error:', e.message); process.exit(1); });
