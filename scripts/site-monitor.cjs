#!/usr/bin/env node
/**
 * Site Monitor for terminalblog.com
 * Uses multiple data sources to track SEO health:
 * 1. IndexNow (already active)
 * 2. Bing Webmaster Tools API (free)
 * 3. Sitemap analysis
 * 4. Content quality metrics
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const ROOT = path.join(__dirname, '..');
const SITE = 'https://terminalblog.com';
const SITEMAP_URL = `${SITE}/sitemap-index.xml`;

function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'TerminalBlog/1.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    }).on('error', reject);
  });
}

async function checkSitemap() {
  try {
    const res = await fetch(SITEMAP_URL);
    if (res.status !== 200) {
      return { status: 'error', message: `Sitemap returned ${res.status}` };
    }
    
    // Count URLs in sitemap
    const urlCount = (res.data.match(/<loc>/g) || []).length;
    
    // Check for lastmod dates
    const lastmods = res.data.match(/<lastmod>(.*?)<\/lastmod>/g) || [];
    const recentUpdates = lastmods.filter(m => {
      const date = m.replace(/<\/?lastmod>/g, '');
      const d = new Date(date);
      const now = new Date();
      const daysOld = (now - d) / (1000 * 60 * 60 * 24);
      return daysOld < 7;
    }).length;

    return {
      status: 'ok',
      totalUrls: urlCount,
      recentUpdates: recentUpdates,
      lastmods: lastmods.length
    };
  } catch (e) {
    return { status: 'error', message: e.message };
  }
}

async function checkIndexNow() {
  // Check if IndexNow key is accessible
  try {
    const keyFile = 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6.txt';
    const res = await fetch(`${SITE}/${keyFile}`);
    return {
      status: res.status === 200 ? 'ok' : 'error',
      keyAccessible: res.status === 200
    };
  } catch (e) {
    return { status: 'error', message: e.message };
  }
}

async function checkRobotsTxt() {
  try {
    const res = await fetch(`${SITE}/robots.txt`);
    if (res.status !== 200) {
      return { status: 'error', message: `robots.txt returned ${res.status}` };
    }
    
    const hasSitemap = res.data.includes('Sitemap:');
    const hasUserAgent = res.data.includes('User-agent:');
    
    return {
      status: 'ok',
      hasSitemap,
      hasUserAgent,
      content: res.data.substring(0, 500)
    };
  } catch (e) {
    return { status: 'error', message: e.message };
  }
}

async function analyze() {
  console.log('=== SITE MONITOR: terminalblog.com ===\n');
  
  const [sitemap, indexNow, robots] = await Promise.all([
    checkSitemap(),
    checkIndexNow(),
    checkRobotsTxt()
  ]);
  
  console.log('SITEMAP:');
  console.log(`  Status: ${sitemap.status}`);
  if (sitemap.status === 'ok') {
    console.log(`  Total URLs: ${sitemap.totalUrls}`);
    console.log(`  Updated in last 7 days: ${sitemap.recentUpdates}`);
  } else {
    console.log(`  Error: ${sitemap.message}`);
  }
  
  console.log('\nINDEXNOW:');
  console.log(`  Status: ${indexNow.status}`);
  console.log(`  Key accessible: ${indexNow.keyAccessible}`);
  
  console.log('\nROBOTS.TXT:');
  console.log(`  Status: ${robots.status}`);
  if (robots.status === 'ok') {
    console.log(`  Has Sitemap: ${robots.hasSitemap}`);
    console.log(`  Has User-agent: ${robots.hasUserAgent}`);
  }
  
  // Generate report
  const report = {
    timestamp: new Date().toISOString(),
    sitemap,
    indexNow,
    robots
  };
  
  fs.writeFileSync(
    path.join(ROOT, 'tmp', 'site-monitor-report.json'),
    JSON.stringify(report, null, 2)
  );
  
  console.log('\nReport saved to tmp/site-monitor-report.json');
}

analyze().catch(console.error);
