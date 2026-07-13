#!/usr/bin/env node
/**
 * Send a Telegram message (ops / automation reports).
 *
 * Env:
 *   TELEGRAM_BOT_TOKEN  required
 *   TELEGRAM_CHAT_ID    required
 *
 * Usage:
 *   node scripts/telegram-notify.cjs "hello"
 *   node scripts/telegram-notify.cjs --file path/to/report.md
 *   echo "body" | node scripts/telegram-notify.cjs
 *
 * Long messages are split into 4000-char chunks.
 */

const fs = require('fs');
const https = require('https');

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT = process.env.TELEGRAM_CHAT_ID;

function readBody() {
  const args = process.argv.slice(2);
  const fileIdx = args.indexOf('--file');
  if (fileIdx >= 0 && args[fileIdx + 1]) {
    return fs.readFileSync(args[fileIdx + 1], 'utf8');
  }
  if (args.length && !args[0].startsWith('--')) {
    return args.join(' ');
  }
  if (!process.stdin.isTTY) {
    return fs.readFileSync(0, 'utf8');
  }
  return '';
}

function chunk(text, size = 3900) {
  const parts = [];
  let s = String(text || '').trim();
  if (!s) s = '(empty report)';
  while (s.length > size) {
    let cut = s.lastIndexOf('\n', size);
    if (cut < size * 0.5) cut = size;
    parts.push(s.slice(0, cut));
    s = s.slice(cut).trimStart();
  }
  if (s) parts.push(s);
  return parts;
}

function sendMessage(text) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      chat_id: CHAT,
      text,
      disable_web_page_preview: true,
    });
    const req = https.request(
      {
        hostname: 'api.telegram.org',
        path: `/bot${TOKEN}/sendMessage`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(JSON.parse(data || '{}'));
          } else {
            reject(new Error(`Telegram ${res.statusCode}: ${data}`));
          }
        });
      }
    );
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function main() {
  if (!TOKEN || !CHAT) {
    console.error('Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID');
    process.exit(1);
  }
  const body = readBody();
  const parts = chunk(body);
  for (let i = 0; i < parts.length; i++) {
    const prefix = parts.length > 1 ? `(${i + 1}/${parts.length})\n` : '';
    const r = await sendMessage(prefix + parts[i]);
    console.log('sent', r?.result?.message_id || 'ok');
  }
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
