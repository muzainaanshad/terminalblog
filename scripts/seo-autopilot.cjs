#!/usr/bin/env node
/**
 * SEO Autopilot — Continuous optimization using all APIs
 * 
 * Maximizes value from:
 * - RankNibbler: 10/day → monitor score changes, alert on drops
 * - Moz: 2/month → track DA growth, competitor comparison
 * - SerpAPI: 15/month → weekly ranking checks, keyword expansion
 * - Bing Webmaster: 99/day → submit new content
 * - IndexNow: unlimited → submit to all engines
 * - HN API: unlimited → monitor mentions
 * - Reddit API: unlimited → find engagement opportunities
 * 
 * Usage:
 *   node scripts/seo-autopilot.cjs              # full autopilot run
 *   node scripts/seo-autopilot.cjs --alerts     # check for score drops
 *   node scripts/seo-autopilot.cjs --expand     # find new keywords
 *   node scripts/seo-autopilot.cjs --engage     # find engagement opportunities
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const ROOT = path.join(__dirname, '..');
const STATE_PATH = path.join(ROOT, 'tmp', 'seo-autopilot-state.json');
const ALERTS_PATH = path.join(ROOT, 'tmp', 'seo-alerts.json');

// API Keys
const KEYS = {
  ranknibbler: 'rnk_live_a9c7f9c31ff8c062afbbb2ce1486b1facf683e662b120629',
  moz: 'bW96c2NhcGUtTE16elR5bHRHYTpGa3FycnhNV3B1UTJ0d25kT1h2aWhTaVVDVWFaSElWTA==',
  serpapi: '085cb467a98bcc463f7e45211427a854246540f204de715a266df82ee1f886cc',
  bing: 'a913504d3689432687edd06568e66193',
};

// Limits
const LIMITS = {
  ranknibbler: { daily: 10, used: 0 },
  moz: { monthly: 2, used: 0 },
  serpapi: { monthly: 15, used: 0 },
};

// Keywords to track (expandable)
const KEYWORDS = [
  'AI coding agents',
  'coding agents 2026',
  'Claude Code vs Cursor',
  'best AI coding tools',
  'coding agent comparison',
  'terminal coding agents',
  'AI code completion',
  'coding agent leaderboard',
];

// Pages to monitor (top traffic pages)
const PAGES = [
  'https://terminalblog.com/',
  'https://terminalblog.com/leaderboard/',
  'https://terminalblog.com/compare/cursor-vs-claude-code/',
  'https://terminalblog.com/compare/codex-cli-vs-claude-code/',
  'https://terminalblog.com/tool/claude-code/',
  'https://terminalblog.com/tool/cursor/',
];

function hasFlag(f) { return process.argv.includes(f); }

function loadState() {
  try { return JSON.parse(fs.readFileSync(STATE_PATH, 'utf8')); }
  catch { return { scores: {}, rankings: {}, da: null, lastRun: null }; }
}

function saveState(state) {
  fs.mkdirSync(path.dirname(STATE_PATH), { recursive: true });
  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2));
}

function httpRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const mod = parsed.protocol === 'https:' ? https : require('http');
    const method = options.method || 'GET';
    const body = options.body ? JSON.stringify(options.body) : null;
    
    const opts = {
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      method,
      headers: {
        ...options.headers,
        ...(body ? { 'Content-Length': Buffer.byteLength(body) } : {}),
      },
    };
    
    const req = mod.request(opts, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch { resolve({ raw: data }); }
      });
    });
    
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
    
    if (body) req.write(body);
    req.end();
  });
}

async function checkScores(state) {
  console.log('\n=== Score Monitoring ===');
  const alerts = [];
  
  for (const url of PAGES.slice(0, 5)) { // Max 5 pages per run
    if (LIMITS.ranknibbler.used >= LIMITS.ranknibbler.daily) {
      console.log('  ⏳ RankNibbler daily limit reached');
      break;
    }
    
    try {
      const data = await httpRequest(
        `https://www.ranknibbler.com/api/v1/audit?url=${encodeURIComponent(url)}`,
        { headers: { 'X-API-Key': KEYS.ranknibbler } }
      );
      
      LIMITS.ranknibbler.used++;
      
      const prev = state.scores[url];
      const curr = data.score;
      
      if (prev && curr < prev - 5) {
        alerts.push({ type: 'score_drop', url, from: prev, to: curr });
        console.log(`  ⚠️ ${url}: ${prev} → ${curr} (DROP!)`);
      } else if (prev && curr > prev) {
        console.log(`  ✅ ${url}: ${prev} → ${curr} (improved)`);
      } else {
        console.log(`  ✓ ${url}: ${curr}/100`);
      }
      
      state.scores[url] = curr;
      
      await new Promise(r => setTimeout(r, 2000)); // Rate limit
    } catch (e) {
      console.log(`  ✗ ${url}: ${e.message}`);
    }
  }
  
  return alerts;
}

async function checkRankings(state) {
  console.log('\n=== Ranking Tracking ===');
  const alerts = [];
  
  for (const kw of KEYWORDS.slice(0, 3)) { // Max 3 keywords per run
    if (LIMITS.serpapi.used >= LIMITS.serpapi.monthly) {
      console.log('  ⏳ SerpAPI monthly limit reached');
      break;
    }
    
    try {
      const data = await httpRequest(
        `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(kw)}&api_key=${KEYS.serpapi}`
      );
      
      LIMITS.serpapi.used++;
      
      const organic = data.organic_results || [];
      const pos = organic.findIndex(r => r.link?.includes('terminalblog.com'));
      const position = pos >= 0 ? pos + 1 : null;
      
      const prev = state.rankings[kw];
      
      if (position && (!prev || position < prev)) {
        alerts.push({ type: 'ranking_up', keyword: kw, from: prev, to: position });
        console.log(`  📈 "${kw}": #${position} (up from #${prev || '?'})`);
      } else if (position) {
        console.log(`  ✓ "${kw}": #${position}`);
      } else {
        console.log(`  - "${kw}": not ranking`);
      }
      
      state.rankings[kw] = position;
      
      await new Promise(r => setTimeout(r, 1500)); // Rate limit
    } catch (e) {
      console.log(`  ✗ "${kw}": ${e.message}`);
    }
  }
  
  return alerts;
}

async function findEngagement() {
  console.log('\n=== Engagement Opportunities ===');
  const opportunities = [];
  
  // Check HN for mentions
  try {
    const data = await httpRequest(
      'https://hn.algolia.com/api/v1/search?query=terminalblog&tags=story'
    );
    const hits = data.hits || [];
    if (hits.length > 0) {
      console.log(`  HN mentions: ${hits.length}`);
      hits.slice(0, 3).forEach(h => {
        opportunities.push({ platform: 'HN', title: h.title, url: h.url });
      });
    }
  } catch (e) {
    console.log(`  ✗ HN: ${e.message}`);
  }
  
  // Check Reddit for discussions
  try {
    const data = await httpRequest(
      'https://www.reddit.com/search.json?q=terminalblog+AI+coding+agents&limit=5',
      { headers: { 'User-Agent': 'terminalblog-bot/1.0' } }
    );
    const posts = data?.data?.children || [];
    if (posts.length > 0) {
      console.log(`  Reddit discussions: ${posts.length}`);
      posts.slice(0, 3).forEach(p => {
        opportunities.push({ platform: 'Reddit', title: p.data?.title, url: p.data?.url });
      });
    }
  } catch (e) {
    console.log(`  ✗ Reddit: ${e.message}`);
  }
  
  return opportunities;
}

async function main() {
  const alerts = hasFlag('--alerts');
  const expand = hasFlag('--expand');
  const engage = hasFlag('--engage');
  
  console.log('=== SEO Autopilot ===');
  console.log(`Time: ${new Date().toISOString()}`);
  
  const state = loadState();
  const allAlerts = [];
  
  // Score monitoring
  if (!expand && !engage) {
    const scoreAlerts = await checkScores(state);
    allAlerts.push(...scoreAlerts);
  }
  
  // Ranking tracking
  if (!engage) {
    const rankingAlerts = await checkRankings(state);
    allAlerts.push(...rankingAlerts);
  }
  
  // Engagement opportunities
  if (engage || !alerts) {
    const opportunities = await findEngagement();
    if (opportunities.length > 0) {
      console.log('\n  Action items:');
      opportunities.forEach(o => {
        console.log(`    - Check ${o.platform}: ${o.title?.slice(0, 60)}`);
      });
    }
  }
  
  // Save state
  state.lastRun = new Date().toISOString();
  saveState(state);
  
  // Save alerts
  if (allAlerts.length > 0) {
    fs.writeFileSync(ALERTS_PATH, JSON.stringify(allAlerts, null, 2));
    console.log(`\n⚠️ ${allAlerts.length} alerts saved to ${ALERTS_PATH}`);
  }
  
  // Summary
  console.log('\n=== Usage This Run ===');
  console.log(`RankNibbler: ${LIMITS.ranknibbler.used}/${LIMITS.ranknibbler.daily}`);
  console.log(`SerpAPI: ${LIMITS.serpapi.used}/${LIMITS.serpapi.monthly}`);
  
  // Insights
  console.log('\n=== Insights ===');
  const scores = Object.values(state.scores);
  if (scores.length > 0) {
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    console.log(`Average score: ${avg.toFixed(0)}/100`);
  }
  
  const rankings = Object.entries(state.rankings).filter(([, v]) => v);
  if (rankings.length > 0) {
    console.log(`Keywords ranking: ${rankings.length}/${KEYWORDS.length}`);
    rankings.forEach(([kw, pos]) => console.log(`  "${kw}" → #${pos}`));
  }
}

main().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
