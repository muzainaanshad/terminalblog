#!/usr/bin/env node
/**
 * Send Telegram ops reports with HTML rich formatting.
 *
 * Env:
 *   TELEGRAM_BOT_TOKEN  required
 *   TELEGRAM_CHAT_ID    required
 *
 * Usage:
 *   node scripts/telegram-notify.cjs "plain or html"
 *   node scripts/telegram-notify.cjs --file report.md
 *   node scripts/telegram-notify.cjs --title "Health" --file tmp/health-report.txt
 *   node scripts/telegram-notify.cjs --plain "no html"
 *
 * Default parse_mode = HTML (Telegram rich text).
 * Long messages split into ~3500 char chunks.
 */

const fs = require('fs');
const https = require('https');

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT = process.env.TELEGRAM_CHAT_ID;

function argVal(flag) {
  const i = process.argv.indexOf(flag);
  return i >= 0 ? process.argv[i + 1] : null;
}

function hasFlag(flag) {
  return process.argv.includes(flag);
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/** Convert simple markdown-ish / plain ops logs into Telegram HTML */
function toTelegramHtml(raw, title) {
  let t = String(raw || '').replace(/\r\n/g, '\n').trim();
  if (!t) t = '(empty report)';

  // If already looks like HTML with tags we use, keep mostly as-is
  const looksHtml = /<\/?(b|i|u|code|pre|a)\b/i.test(t);

  if (!looksHtml) {
    // Escape first
    t = escapeHtml(t);

    // Headings: lines starting with # 
    t = t.replace(/^#{1,3}\s+(.+)$/gm, '<b>$1</b>');

    // **bold**
    t = t.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');

    // `code`
    t = t.replace(/`([^`\n]+)`/g, '<code>$1</code>');

    // URLs -> links (bare)
    t = t.replace(
      /(https?:\/\/[^\s<]+)/g,
      '<a href="$1">$1</a>'
    );

    // Status markers
    t = t.replace(/\bOK\b/g, '✅ <b>OK</b>');
    t = t.replace(/\bFAIL\b/g, '❌ <b>FAIL</b>');
    t = t.replace(/\bALERT\b/g, '🚨 <b>ALERT</b>');
    t = t.replace(/\bREADY\b/g, '🟢 <b>READY</b>');
    t = t.replace(/\bERROR\b/g, '🔴 <b>ERROR</b>');
    t = t.replace(/\bSUCCESS\b/g, '✅ <b>SUCCESS</b>');
  }

  const header = title
    ? `📡 <b>${escapeHtml(title)}</b>\n<code>terminalblog</code> · ${escapeHtml(
        new Date().toISOString().replace('T', ' ').slice(0, 19)
      )} UTC\n${'─'.repeat(24)}\n`
    : '';

  return header + t;
}

function readBody() {
  const file = argVal('--file');
  if (file) return fs.readFileSync(file, 'utf8');
  const rest = process.argv.slice(2).filter((a, i, arr) => {
    if (a.startsWith('--')) return false;
    if (arr[i - 1] === '--file' || arr[i - 1] === '--title') return false;
    return true;
  });
  if (rest.length) return rest.join(' ');
  if (!process.stdin.isTTY) return fs.readFileSync(0, 'utf8');
  return '';
}

function chunk(text, size = 3500) {
  const parts = [];
  let s = String(text || '').trim();
  if (!s) s = '(empty)';
  while (s.length > size) {
    let cut = s.lastIndexOf('\n', size);
    if (cut < size * 0.4) cut = size;
    parts.push(s.slice(0, cut));
    s = s.slice(cut).trimStart();
  }
  if (s) parts.push(s);
  return parts;
}

function sendMessage(text, parseMode) {
  return new Promise((resolve, reject) => {
    const payloadObj = {
      chat_id: CHAT,
      text,
      disable_web_page_preview: true,
    };
    if (parseMode) payloadObj.parse_mode = parseMode;

    const payload = JSON.stringify(payloadObj);
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

  const plain = hasFlag('--plain');
  const title = argVal('--title');
  const raw = readBody();
  const html = plain ? raw : toTelegramHtml(raw, title);
  const parts = chunk(html);

  for (let i = 0; i < parts.length; i++) {
    const prefix =
      parts.length > 1 ? `<i>Part ${i + 1}/${parts.length}</i>\n` : '';
    try {
      const r = await sendMessage(
        prefix + parts[i],
        plain ? undefined : 'HTML'
      );
      console.log('sent', r?.result?.message_id || 'ok');
    } catch (e) {
      // Fallback plain if HTML rejected
      if (!plain && String(e.message).includes('400')) {
        const r = await sendMessage(
          (title ? title + '\n\n' : '') + raw.slice(0, 3500),
          undefined
        );
        console.log('sent-plain-fallback', r?.result?.message_id || 'ok');
      } else {
        throw e;
      }
    }
  }
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
