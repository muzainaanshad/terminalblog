#!/usr/bin/env node
/**
 * Lightweight live health check for terminalblog.com
 * Exit 0 always (report failures in output for Telegram).
 */

const https = require('https');

const ORIGIN = process.env.SITE_URL || 'https://terminalblog.com';
const PATHS = [
  '/',
  '/blog/',
  '/leaderboard/',
  '/embed/leaderboard/',
  '/rss.xml',
  '/sitemap-index.xml',
  '/blog/coding-agent-security-checklist-2026/',
  '/api/newsletter',
];

function check(path, method = 'GET') {
  return new Promise((resolve) => {
    const url = new URL(path, ORIGIN);
    const req = https.request(
      url,
      { method, timeout: 15000, headers: { 'User-Agent': 'terminalblog-health/1.0' } },
      (res) => {
        // drain
        res.on('data', () => {});
        res.on('end', () => {
          resolve({
            path,
            method,
            status: res.statusCode,
            ok: res.statusCode >= 200 && res.statusCode < 400,
          });
        });
      }
    );
    req.on('error', (e) =>
      resolve({ path, method, status: 0, ok: false, error: e.message })
    );
    req.on('timeout', () => {
      req.destroy();
      resolve({ path, method, status: 0, ok: false, error: 'timeout' });
    });
    if (method === 'POST') {
      req.setHeader('Content-Type', 'application/json');
      req.end(JSON.stringify({ email: 'invalid' })); // expect 400, proves route is up
    } else {
      req.end();
    }
  });
}

async function main() {
  const results = [];
  for (const p of PATHS) {
    if (p === '/api/newsletter') {
      results.push(await check(p, 'POST'));
    } else {
      results.push(await check(p, 'GET'));
    }
  }

  // Newsletter POST with invalid email should be 400 (healthy) not 5xx
  const nl = results.find((r) => r.path === '/api/newsletter');
  if (nl) {
    nl.ok = nl.status === 400 || nl.status === 200;
    nl.note = 'POST invalid email expects 400';
  }

  const failed = results.filter((r) => !r.ok);
  const now = new Date().toISOString();
  const lines = [
    `terminalblog HEALTH ${now}`,
    `origin: ${ORIGIN}`,
    `ok: ${results.length - failed.length}/${results.length}`,
    '',
    ...results.map((r) => {
      const mark = r.ok ? 'OK' : 'FAIL';
      return `${mark} ${r.status || 'ERR'} ${r.method || 'GET'} ${r.path}${r.error ? ' · ' + r.error : ''}${r.note ? ' · ' + r.note : ''}`;
    }),
  ];
  if (failed.length) {
    lines.push('', `ALERT: ${failed.length} check(s) failed`);
  } else {
    lines.push('', 'All checks passed.');
  }

  const text = lines.join('\n');
  console.log(text);

  // write for telegram --file
  const fs = require('fs');
  const path = require('path');
  const out = path.join(__dirname, '..', 'tmp', 'health-report.txt');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, text);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
