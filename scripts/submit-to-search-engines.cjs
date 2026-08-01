#!/usr/bin/env node
/**
 * Submit URLs to all search engines and directories
 * 
 * IndexNow: Bing, Yandex, Seznam, Naver (one API, multiple engines)
 * Bing: direct sitemap ping + Webmaster API
 * Brave: direct submission
 * DuckDuckGo: uses Bing index (covered by IndexNow)
 * Naver: separate submission
 * Yandex: separate submission
 * 
 * Usage:
 *   node scripts/submit-to-search-engines.cjs                    # submit all URLs
 *   node scripts/submit-to-search-engines.cjs --sitemap-only     # just ping sitemaps
 *   node scripts/submit-to-search-engines.cjs --url https://...  # submit single URL
 *   node scripts/submit-to-search-engines.cjs --new-only         # only new/updated since last run
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { URL } = require('url');

const ROOT = path.join(__dirname, '..');
const STATE_PATH = path.join(ROOT, 'tmp', 'search-submit-state.json');
const SITE = 'terminalblog.com';
const SITEMAP_URL = `https://${SITE}/sitemap-index.xml`;
const INDEXNOW_KEY = 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6';
const INDEXNOW_KEY_FILE = `https://${SITE}/${INDEXNOW_KEY}.txt`;

// IndexNow supports: Bing, Yandex, Seznam, Naver
const INDEXNOW_ENDPOINTS = [
  'https://api.indexnow.org/indexnow',
  // Alternative endpoints (some engines have their own)
  'https://yandex.com/indexnow',   // Yandex accepts IndexNow
  'https://search.naver.com/indexnow', // Naver
];

// Direct submission endpoints
const DIRECT_ENDPOINTS = {
  bing: 'https://www.bing.com/ping',
  google: 'https://www.google.com/ping',
  // Brave uses IndexNow
  // DuckDuckGo uses Bing index
};

function hasFlag(f) { return process.argv.includes(f); }
function argVal(f) {
  const i = process.argv.indexOf(f);
  return i >= 0 ? process.argv[i + 1] : null;
}

function loadState() {
  try { return JSON.parse(fs.readFileSync(STATE_PATH, 'utf8')); }
  catch { return { submitted: [], lastRun: null, counts: { total: 0, success: 0, failed: 0 } }; }
}

function saveState(state) {
  fs.mkdirSync(path.dirname(STATE_PATH), { recursive: true });
  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2));
}

function httpPost(url, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const data = JSON.stringify(body);
    const opts = {
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        ...headers,
      },
    };
    const req = https.request(opts, (res) => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function httpGet(url) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const mod = parsed.protocol === 'https:' ? https : require('http');
    const req = mod.get(url, { timeout: 15000 }, (res) => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

async function submitToIndexNow(urls) {
  console.log(`\n=== IndexNow (Bing, Yandex, Seznam, Naver) ===`);
  
  const payload = {
    host: SITE,
    key: INDEXNOW_KEY,
    keyLocation: INDEXNOW_KEY_FILE,
    urlList: urls,
  };

  const results = [];
  let rateLimited = false;
  
  for (const endpoint of INDEXNOW_ENDPOINTS) {
    if (rateLimited) {
      console.log(`  ⏭ ${endpoint} → skipped (rate limited)`);
      continue;
    }
    
    try {
      const res = await httpPost(endpoint, payload);
      const ok = res.status === 200 || res.status === 202;
      const body = JSON.parse(res.body || '{}');
      
      if (res.status === 429) {
        console.log(`  ⏳ ${endpoint} → rate limited (will skip remaining)`);
        rateLimited = true;
      } else {
        console.log(`  ${ok ? '✓' : '✗'} ${endpoint} → ${res.status}`);
      }
      results.push({ endpoint, status: res.status, ok });
    } catch (e) {
      console.log(`  ✗ ${endpoint} → ${e.message}`);
      results.push({ endpoint, error: e.message, ok: false });
    }
  }
  return results;
}

async function submitToBing(urls) {
  console.log(`\n=== Bing Direct ===`);
  
  // Ping sitemap
  try {
    const res = await httpGet(`${DIRECT_ENDPOINTS.bing}?sitemap=${encodeURIComponent(SITEMAP_URL)}`);
    console.log(`  ✓ Sitemap ping → ${res.status}`);
  } catch (e) {
    console.log(`  ✗ Sitemap ping → ${e.message}`);
  }

  // IndexNow already covers Bing, but direct API is faster
  const BING_API_KEY = 'a913504d3689432687edd06568e66193';
  
  // Submit URLs via Bing Webmaster API (batch)
  if (urls.length > 0) {
    try {
      const res = await httpPost(
        `https://ssl.bing.com/webmaster/api.svc/json/SubmitUrlBatch?apikey=${BING_API_KEY}`,
        { siteUrl: 'https://terminalblog.com', urlList: urls.slice(0, 100) }
      );
      console.log(`  ✓ Bing API batch (${Math.min(urls.length, 100)} URLs) → ${res.status}`);
    } catch (e) {
      console.log(`  ✗ Bing API batch → ${e.message}`);
    }
  }
}

async function submitToGoogle(urls) {
  console.log(`\n=== Google ===`);
  
  // Google ping (sitemap only)
  try {
    const res = await httpGet(`${DIRECT_ENDPOINTS.google}?sitemap=${encodeURIComponent(SITEMAP_URL)}`);
    console.log(`  ✓ Sitemap ping → ${res.status}`);
  } catch (e) {
    console.log(`  ✗ Sitemap ping → ${e.message}`);
  }

  // Google Search Console API requires OAuth — can't automate without manual setup
  console.log(`  ℹ URL submission needs GSC API (manual setup required)`);
}

async function submitToBrave(urls) {
  console.log(`\n=== Brave ===`);
  
  // Brave uses IndexNow — already covered
  // But we can also submit via their form
  // https://search.brave.com/submit — manual, can't automate
  console.log(`  ℹ Brave accepts IndexNow submissions (covered above)`);
  console.log(`  ℹ For faster indexing: https://search.brave.com/submit`);
}

async function submitToYandex(urls) {
  console.log(`\n=== Yandex ===`);
  
  // Yandex accepts IndexNow — covered above
  // Direct ping:
  try {
    const res = await httpGet(`https://webmaster.yandex.com/ping?sitemap=${encodeURIComponent(SITEMAP_URL)}`);
    console.log(`  ✓ Sitemap ping → ${res.status}`);
  } catch (e) {
    console.log(`  ✗ Sitemap ping → ${e.message}`);
  }
}

async function submitToNaver(urls) {
  console.log(`\n=== Naver ===`);
  
  // Naver uses IndexNow — covered above
  console.log(`  ℹ Naver accepts IndexNow submissions (covered above)`);
}

async function submitToDuckDuckGo(urls) {
  console.log(`\n=== DuckDuckGo ===`);
  
  // DDG uses Bing's index — covered by IndexNow/Bing
  console.log(`  ℹ DuckDuckGo uses Bing's index (covered by IndexNow)`);
}

async function submitToSeznam(urls) {
  console.log(`\n=== Seznam ===`);
  
  // Seznam uses IndexNow — covered above
  // Direct ping:
  try {
    const res = await httpGet(`https://api.search.seznam.cz/ping?sitemap=${encodeURIComponent(SITEMAP_URL)}`);
    console.log(`  ✓ Sitemap ping → ${res.status}`);
  } catch (e) {
    console.log(`  ✗ Sitemap ping → ${e.message}`);
  }
}

function getChangedUrls() {
  // Read sitemap to get all URLs (dist after build)
  let sitemapPath = path.join(ROOT, 'dist', 'client', 'sitemap-0.xml');
  if (!fs.existsSync(sitemapPath)) {
    sitemapPath = path.join(ROOT, 'dist', 'sitemap-0.xml');
  }
  if (!fs.existsSync(sitemapPath)) {
    sitemapPath = path.join(ROOT, 'public', 'sitemap-0.xml');
  }
  if (!fs.existsSync(sitemapPath)) {
    console.log('No sitemap found — run build first');
    return [];
  }
  
  const content = fs.readFileSync(sitemapPath, 'utf8');
  const urls = [];
  const regex = /<loc>(.*?)<\/loc>/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    urls.push(match[1]);
  }
  return urls;
}

function getNewUrls(allUrls, state) {
  const submitted = new Set(state.submitted.map(s => s.url));
  return allUrls.filter(url => !submitted.has(url));
}

async function main() {
  const sitemapOnly = hasFlag('--sitemap-only');
  const singleUrl = argVal('--url');
  const newOnly = hasFlag('--new-only');
  
  console.log('=== Search Engine Submission ===');
  console.log(`Time: ${new Date().toISOString()}`);
  
  const state = loadState();
  let urls;
  
  if (singleUrl) {
    urls = [singleUrl];
    console.log(`Mode: single URL`);
  } else {
    const allUrls = getChangedUrls();
    console.log(`Total URLs in sitemap: ${allUrls.length}`);
    
    if (newOnly) {
      urls = getNewUrls(allUrls, state);
      console.log(`New URLs (not yet submitted): ${urls.length}`);
    } else {
      urls = allUrls;
    }
  }
  
  if (sitemapOnly) {
    console.log('\nMode: sitemap-only (pinging sitemaps only)');
    urls = [];
  }
  
  if (!urls.length && !sitemapOnly) {
    console.log('No URLs to submit');
    return;
  }
  
  // Submit to all engines
  const allResults = {};
  
  // IndexNow (covers Bing, Yandex, Seznam, Naver)
  if (urls.length > 0) {
    // IndexNow recommends max 10,000 URLs per request, but rate limit is strict
    // Submit in small batches with delays
    const BATCH_SIZE = 100;
    const batches = [];
    for (let i = 0; i < urls.length; i += BATCH_SIZE) {
      batches.push(urls.slice(i, i + BATCH_SIZE));
    }
    
    console.log(`  Submitting ${urls.length} URLs in ${batches.length} batches...`);
    
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      allResults.indexnow = await submitToIndexNow(batch);
      
      // Rate limit: wait between batches
      if (i < batches.length - 1) {
        await new Promise(r => setTimeout(r, 2000));
      }
    }
  }
  
  // Direct submissions
  await submitToBing(urls);
  await submitToGoogle(urls);
  await submitToBrave(urls);
  await submitToYandex(urls);
  await submitToNaver(urls);
  await submitToDuckDuckGo(urls);
  await submitToSeznam(urls);
  
  // Update state
  if (!sitemapOnly) {
    const now = new Date().toISOString();
    for (const url of urls) {
      state.submitted.push({ url, when: now });
    }
    state.lastRun = now;
    state.counts.total += urls.length;
    saveState(state);
  }
  
  console.log('\n=== Summary ===');
  console.log(`URLs submitted: ${urls.length}`);
  console.log(`Engines: IndexNow (Bing+Yandex+Seznam+Naver), Google, Brave, DuckDuckGo`);
  console.log(`State: ${STATE_PATH}`);
}

main().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
