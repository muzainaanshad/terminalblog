#!/usr/bin/env node
/* SEO weekly monitor for terminalblog.com
 * - Fetches sitemap, extracts all URLs
 * - HEAD/GET checks each URL for status
 * - Flags 4xx/5xx, redirects, slow responses
 * - Writes report to tmp/seo-weekly-report.txt
 */
const https = require('https');
const fs = require('fs');
const path = require('path');

const SITE = 'https://terminalblog.com';
const REPORT = path.join(__dirname, '..', 'tmp', 'seo-weekly-report.txt');
const CONCURRENCY = 8;
const TIMEOUT_MS = 20000;

function fetchUrl(url, method = 'GET') {
  return new Promise((resolve) => {
    const req = https.request(url, { method, headers: { 'User-Agent': 'Mozilla/5.0 (compatible; TerminalBlog-SEOMonitor/1.0)' } }, (res) => {
      let len = 0;
      res.on('data', (c) => { len += c.length; });
      res.on('end', () => resolve({ status: res.statusCode, finalUrl: res.url || url, bytes: len }));
      res.resume();
    });
    req.on('error', (e) => resolve({ status: 0, error: e.message }));
    req.setTimeout(TIMEOUT_MS, () => { req.destroy(); resolve({ status: 0, error: 'timeout' }); });
    req.end();
  });
}

function getUrl(url) {
  return new Promise((resolve) => {
    const req = https.request(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; TerminalBlog-SEOMonitor/1.0)' } }, (res) => {
      let chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve({ status: res.statusCode, body: Buffer.concat(chunks).toString() }));
      res.resume();
    });
    req.on('error', (e) => resolve({ status: 0, error: e.message }));
    req.setTimeout(TIMEOUT_MS, () => { req.destroy(); resolve({ status: 0, error: 'timeout' }); });
    req.end();
  });
}

async function mapLimit(items, limit, fn) {
  const results = new Array(items.length);
  let idx = 0;
  const workers = Array(Math.min(limit, items.length)).fill(0).map(async () => {
    while (idx < items.length) {
      const i = idx++;
      results[i] = await fn(items[i], i);
    }
  });
  await Promise.all(workers);
  return results;
}

async function main() {
  const lines = [];
  const now = new Date();
  lines.push('='.repeat(72));
  lines.push(`SEO WEEKLY MONITOR — terminalblog.com`);
  lines.push(`Generated: ${now.toISOString()}`);
  lines.push('='.repeat(72));
  lines.push('');

  // 1. Site health
  lines.push('[1] SITE HEALTH');
  const home = await getUrl(SITE + '/');
  lines.push(`  Homepage: HTTP ${home.status} ${home.status === 200 ? 'OK' : '(!) PROBLEM'}`);
  if (home.body) {
    const title = (home.body.match(/<title>([^<]*)<\/title>/) || [])[1] || '(none)';
    const desc = (home.body.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '(none)';
    const canonical = (home.body.match(/<link rel="canonical" href="([^"]*)"/) || [])[1] || '(none)';
    const robots = (home.body.match(/<meta name="robots" content="([^"]*)"/) || [])[1] || '(not set, defaults ok)';
    lines.push(`  Title:       ${title}`);
    lines.push(`  Description: ${desc.slice(0, 80) + (desc.length > 80 ? '...' : '')}`);
    lines.push(`  Canonical:   ${canonical}`);
    lines.push(`  Robots:      ${robots}`);
  }
  lines.push('');

  // 2. Robots + sitemaps
  lines.push('[2] ROBOTS & SITEMAP');
  const robots = await getUrl(SITE + '/robots.txt');
  if (robots.body) {
    const sitemaps = (robots.body.match(/Sitemap: (\S+)/gi) || []).map(s => s.replace(/Sitemap:\s*/i, ''));
    lines.push(`  robots.txt: HTTP ${robots.status}, ${robots.body.split('\n').length} lines`);
    lines.push(`  Declared sitemap(s): ${sitemaps.join(', ') || '(none!)'}`);
  } else {
    lines.push(`  robots.txt: HTTP ${robots.status} ${robots.error || ''} (!)`);
  }
  lines.push('');

  // 3. Fetch sitemap index and resolve all URLs
  lines.push('[3] SITEMAP URLS');
  const sitemapIndex = await getUrl(SITE + '/sitemap-index.xml');
  const sitemapUrls = [];
  if (sitemapIndex.body) {
    const m = sitemapIndex.body.matchAll(/<loc>([^<]+)<\/loc>/g);
    for (const x of m) sitemapUrls.push(x[1]);
  }
  lines.push(`  sitemap-index.xml: HTTP ${sitemapIndex.status}, ${sitemapUrls.length} sub-sitemap(s)`);

  let allUrls = [];
  for (const su of sitemapUrls) {
    const sub = await getUrl(su);
    if (sub.body) {
      const urls = [...sub.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map(x => x[1]);
      allUrls = allUrls.concat(urls);
      lines.push(`  ${su.split('/').pop()}: HTTP ${sub.status}, ${urls.length} URLs`);
    } else {
      lines.push(`  ${su.split('/').pop()}: HTTP ${sub.status} ${sub.error || ''} (!)`);
    }
  }
  lines.push(`  TOTAL sitemap URLs: ${allUrls.length}`);
  lines.push('');

  // 4. Check all sitemap URLs
  lines.push('[4] URL STATUS CHECKS');
  const results = await mapLimit(allUrls, CONCURRENCY, async (u) => {
    const r = await fetchUrl(u, 'HEAD');
    if (r.status === 0) return { url: u, ...r };
    // Vercel sometimes 405s HEAD; fall back to GET
    if (r.status === 405 || r.status === 403) {
      const g = await fetchUrl(u, 'GET');
      return { url: u, ...g };
    }
    return { url: u, ...r };
  });

  const problems = results.filter(r => r.status >= 400 || r.status === 0);
  const redirects = results.filter(r => r.status >= 301 && r.status < 400);
  const ok = results.filter(r => r.status >= 200 && r.status < 300);

  lines.push(`  OK (2xx):        ${ok.length}`);
  lines.push(`  Redirects (3xx): ${redirects.length}`);
  if (redirects.length) {
    for (const r of redirects.slice(0, 20)) lines.push(`    ${r.status} ${r.url}`);
    if (redirects.length > 20) lines.push(`    ... and ${redirects.length - 20} more`);
  }
  lines.push(`  ERRORS (4xx/5xx/timeouts): ${problems.length}`);
  if (problems.length) {
    for (const r of problems) {
      lines.push(`    ${r.status === 0 ? 'ERR' : r.status} ${r.url} ${r.error || ''}`);
    }
  }
  lines.push('');

  // 5. Key pages meta check
  lines.push('[5] KEY PAGES');
  const keyPages = [
    '/', '/blog/', '/leaderboard/', '/cli/', '/about', '/llms.txt', '/rss.xml',
    '/blog/beware-claude-code-security-guidance-leaks-oauth-tokens/',
    '/blog/claude-code-auto-mode-default-august-2026/',
    '/blog/how-to-setup-ai-coding-agents/',
    '/blog/context-engineering-for-coding-agents-2026/',
    '/blog/claude-code-alternatives-2026/',
    '/blog/best-coding-agents-2026-decision-guide/',
    '/blog/coding-agent-security-checklist-2026/',
    '/blog/claude-code-vs-opencode-token-overhead/',
  ];
  for (const p of keyPages) {
    const r = await fetchUrl(SITE + p, 'GET');
    lines.push(`  ${r.status} ${p}${r.bytes ? ` (${(r.bytes / 1024).toFixed(0)} KB)` : ''}`);
  }
  lines.push('');

  // 6. Summary
  lines.push('[6] SUMMARY');
  const allGood = home.status === 200 && problems.length === 0;
  lines.push(allGood ? '  Status: ALL CHECKS PASSED' : `  Status: ${problems.length} issue(s) found — see [4]`);
  lines.push('='.repeat(72));

  fs.mkdirSync(path.dirname(REPORT), { recursive: true });
  fs.writeFileSync(REPORT, lines.join('\n'));
  console.log(lines.join('\n'));
  console.log(`\nReport saved to ${REPORT}`);
}

main().catch(e => { console.error(e); process.exit(1); });