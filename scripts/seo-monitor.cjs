#!/usr/bin/env node
/**
 * SEO Monitor — Smart usage of RankNibbler + Moz + SerpAPI
 * 
 * Usage limits (DON'T EXCEED):
 * - RankNibbler: 100/day → use 10/day (audit top articles only)
 * - Moz: 10/month → use 2/month (track domain authority)
 * - SerpAPI: 100/month → use 15/month (track rankings weekly)
 * 
 * Usage:
 *   node scripts/seo-monitor.cjs                  # full report
 *   node scripts/seo-monitor.cjs --audit URL      # audit single URL
 *   node scripts/seo-monitor.cjs --rankings       # check rankings
 *   node scripts/seo-monitor.cjs --authority      # check domain authority
 *   node scripts/seo-monitor.cjs --dashboard      # generate dashboard data
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const ROOT = path.join(__dirname, '..');
const STATE_PATH = path.join(ROOT, 'tmp', 'seo-monitor-state.json');
const REPORT_PATH = path.join(ROOT, 'seo-report.json');

// API Keys
const RANKNIBBLER_KEY = 'rnk_live_a9c7f9c31ff8c062afbbb2ce1486b1facf683e662b120629';
const MOZ_KEY = 'bW96c2NhcGUtTE16elR5bHRHYTpGa3FycnhNV3B1UTJ0d25kT1h2aWhTaVVDVWFaSElWTA==';
const SERPAPI_KEY = '085cb467a98bcc463f7e45211427a854246540f204de715a266df82ee1f886cc';

// Daily limits (conservative)
const LIMITS = {
  ranknibbler: { daily: 10, monthly: 300 },
  moz: { monthly: 2 },
  serpapi: { monthly: 15 },
};

function hasFlag(f) { return process.argv.includes(f); }
function argVal(f) {
  const i = process.argv.indexOf(f);
  return i >= 0 ? process.argv[i + 1] : null;
}

function loadState() {
  try { return JSON.parse(fs.readFileSync(STATE_PATH, 'utf8')); }
  catch { return { ranknibbler: { daily: 0, date: null }, moz: { monthly: 0, date: null }, serpapi: { monthly: 0, date: null } }; }
}

function saveState(state) {
  fs.mkdirSync(path.dirname(STATE_PATH), { recursive: true });
  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2));
}

function checkLimits(state) {
  const today = new Date().toISOString().split('T')[0];
  const month = today.slice(0, 7);
  
  // Reset daily counter
  if (state.ranknibbler.date !== today) {
    state.ranknibbler.daily = 0;
    state.ranknibbler.date = today;
  }
  
  // Reset monthly counters
  if (state.moz.date?.slice(0, 7) !== month) {
    state.moz.monthly = 0;
    state.moz.date = today;
  }
  if (state.serpapi.date?.slice(0, 7) !== month) {
    state.serpapi.monthly = 0;
    state.serpapi.date = today;
  }
  
  return state;
}

function canUse(state, api) {
  if (api === 'ranknibbler') return state.ranknibbler.daily < LIMITS.ranknibbler.daily;
  if (api === 'moz') return state.moz.monthly < LIMITS.moz.monthly;
  if (api === 'serpapi') return state.serpapi.monthly < LIMITS.serpapi.monthly;
  return false;
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

function httpGet(url, headers = {}) {
  return httpRequest(url, { headers });
}

async function auditWithRankNibbler(url, state) {
  if (!canUse(state, 'ranknibbler')) {
    console.log(`  ⏳ RankNibbler: daily limit reached (${state.ranknibbler.daily}/${LIMITS.ranknibbler.daily})`);
    return null;
  }
  
  try {
    const data = await httpGet(
      `https://www.ranknibbler.com/api/v1/audit?url=${encodeURIComponent(url)}`,
      { 'X-API-Key': RANKNIBBLER_KEY }
    );
    
    state.ranknibbler.daily++;
    saveState(state);
    
    return {
      score: data.score,
      grade: data.grade,
      issues: data.issues || [],
      usage: data.usage,
    };
  } catch (e) {
    console.log(`  ✗ RankNibbler: ${e.message}`);
    return null;
  }
}

async function getDomainAuthority(state) {
  if (!canUse(state, 'moz')) {
    console.log(`  ⏳ Moz: monthly limit reached (${state.moz.monthly}/${LIMITS.moz.monthly})`);
    return null;
  }
  
  try {
    const data = await httpRequest(
      'https://lsapi.seomoz.com/v2/url_metrics',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${MOZ_KEY}`,
          'Content-Type': 'application/json',
        },
        body: { targets: ['terminalblog.com'] },
      }
    );
    
    state.moz.monthly++;
    saveState(state);
    
    const result = data.results?.[0];
    return {
      domain_authority: result?.domain_authority,
      page_authority: result?.page_authority,
      linking_root_domains: result?.root_domains_to_root_domain,
      spam_score: result?.spam_score,
      pages_to_root_domain: result?.pages_to_root_domain,
    };
  } catch (e) {
    console.log(`  ✗ Moz: ${e.message}`);
    return null;
  }
}

async function checkRankings(keywords, state) {
  if (!canUse(state, 'serpapi')) {
    console.log(`  ⏳ SerpAPI: monthly limit reached (${state.serpapi.monthly}/${LIMITS.serpapi.monthly})`);
    return null;
  }
  
  const results = [];
  for (const kw of keywords.slice(0, 3)) { // Max 3 per run
    try {
      const data = await httpGet(
        `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(kw)}&api_key=${SERPAPI_KEY}`
      );
      
      state.serpapi.monthly++;
      
      // Find terminalblog.com in results
      const organic = data.organic_results || [];
      const position = organic.findIndex(r => r.link?.includes('terminalblog.com'));
      
      results.push({
        keyword: kw,
        position: position >= 0 ? position + 1 : 'not found',
        topResult: organic[0]?.title?.slice(0, 60) || 'none',
      });
      
      await new Promise(r => setTimeout(r, 1000)); // Rate limit
    } catch (e) {
      console.log(`  ✗ SerpAPI (${kw}): ${e.message}`);
    }
  }
  
  saveState(state);
  return results;
}

async function main() {
  const auditUrl = argVal('--audit');
  const rankings = hasFlag('--rankings');
  const authority = hasFlag('--authority');
  const dashboard = hasFlag('--dashboard');
  
  console.log('=== SEO Monitor ===');
  console.log(`Time: ${new Date().toISOString()}`);
  
  let state = loadState();
  state = checkLimits(state);
  
  // Show current usage
  console.log('\n=== API Usage ===');
  console.log(`RankNibbler: ${state.ranknibbler.daily}/${LIMITS.ranknibbler.daily} today`);
  console.log(`Moz: ${state.moz.monthly}/${LIMITS.moz.monthly} this month`);
  console.log(`SerpAPI: ${state.serpapi.monthly}/${LIMITS.serpapi.monthly} this month`);
  
  const report = { timestamp: new Date().toISOString() };
  
  // Audit single URL
  if (auditUrl) {
    console.log(`\n=== Auditing: ${auditUrl} ===`);
    const result = await auditWithRankNibbler(auditUrl, state);
    if (result) {
      console.log(`Score: ${result.score}/100 (${result.grade})`);
      console.log(`Issues: ${result.issues.length}`);
      result.issues.forEach(i => console.log(`  - ${i}`));
      report.audit = result;
    }
  }
  
  // Check domain authority
  if (authority || dashboard) {
    console.log('\n=== Domain Authority ===');
    const result = await getDomainAuthority(state);
    if (result) {
      console.log(`DA: ${result.domain_authority}`);
      console.log(`PA: ${result.page_authority}`);
      console.log(`Root domains: ${result.linking_root_domains}`);
      console.log(`Spam score: ${result.spam_score}%`);
      report.authority = result;
    }
  }
  
  // Check rankings
  if (rankings || dashboard) {
    console.log('\n=== Rankings ===');
    const keywords = [
      'AI coding agents',
      'coding agents 2026',
      'Claude Code vs Cursor',
      'best AI coding tools',
      'coding agent comparison',
    ];
    const results = await checkRankings(keywords, state);
    if (results) {
      results.forEach(r => {
        console.log(`  "${r.keyword}" → #${r.position} (top: ${r.topResult})`);
      });
      report.rankings = results;
    }
  }
  
  // Auto-audit top articles (if within limits)
  if (!auditUrl && !rankings && !authority && canUse(state, 'ranknibbler')) {
    console.log('\n=== Auto-audit top articles ===');
    const topArticles = [
      'https://terminalblog.com/',
      'https://terminalblog.com/leaderboard/',
    ];
    
    for (const url of topArticles) {
      if (!canUse(state, 'ranknibbler')) break;
      const result = await auditWithRankNibbler(url, state);
      if (result) {
        console.log(`  ${url} → ${result.score}/100 (${result.grade})`);
      }
    }
  }
  
  // Save report
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
  console.log(`\nReport saved to ${REPORT_PATH}`);
  
  // Summary
  console.log('\n=== Limits ===');
  console.log('RankNibbler: 10/day (auto-audit top pages)');
  console.log('Moz: 2/month (domain authority tracking)');
  console.log('SerpAPI: 15/month (weekly ranking checks)');
}

main().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
