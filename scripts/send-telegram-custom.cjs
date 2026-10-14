#!/usr/bin/env node
const https = require('https');

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT = process.env.TELEGRAM_CHAT_ID;

const message = process.argv.slice(2).join(' ');

if (!TOKEN || !CHAT) {
  console.error('TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID required');
  process.exit(1);
}

const payload = JSON.stringify({
  chat_id: CHAT,
  text: message,
  parse_mode: 'HTML',
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
        console.log('Sent:', JSON.parse(data).result?.message_id || 'ok');
      } else {
        console.error(`Telegram ${res.statusCode}: ${data}`);
        process.exit(1);
      }
    });
  }
);
req.on('error', (e) => { console.error(e); process.exit(1); });
req.write(payload);
req.end();