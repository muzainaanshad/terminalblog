#!/usr/bin/env node
// Ping search engines after every deploy
const http = require('http');
const https = require('https');

function get(url) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, { timeout: 15000 }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(`${res.statusCode} ${url.split('/')[2]}`));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); resolve('timeout'); });
  });
}

async function main() {
  const now = new Date().toISOString();
  console.log(`Pinging search engines at ${now}...`);
  
  const results = await Promise.allSettled([
    get('https://www.google.com/ping?sitemap=https://terminalblog.com/sitemap-index.xml'),
    get('https://www.bing.com/ping?sitemap=https://terminalblog.com/sitemap-index.xml'),
    get('https://api.indexnow.org/indexnow?url=https://terminalblog.com/sitemap-index.xml&key=a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6'),
  ]);
  
  for (const r of results) {
    if (r.status === 'fulfilled') console.log(`  ✓ ${r.value}`);
    else console.log(`  ✗ ${r.reason?.message || r.reason}`);
  }
  console.log('Done.');
}

main().catch(console.error);
