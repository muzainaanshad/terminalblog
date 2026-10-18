const fs = require('fs');
const path = require('path');

const BLOG = path.join(__dirname, 'src', 'content', 'blog');
const file = path.join(BLOG, 'best-coding-agents-2026-decision-guide.mdx');
const raw = fs.readFileSync(file, 'utf8');
const body = raw.slice(raw.indexOf('\n---', 4) + 4);

// Check for literal backslash-n-dash-dash-dash
console.log('Contains literal backslash-n-dash-dash-dash:', body.includes('\n---'));

// Check the exact chars at the end
const endIdx = body.length - 50;
const arr = Array.from(body.substring(endIdx));
const mapped = arr.map(c => {
  if (c === '\n') return 'NL';
  if (c === '\r') return 'CR';
  if (c === '\\') return 'BS';
  return c;
});
console.log('Last 50 chars as array:', mapped);