#!/usr/bin/env node
/**
 * Generate terminal-themed social media posters — v2
 * 
 * Improvements over v1:
 * - Bigger terminalblog header
 * - Multiple design variations (numbered, quote, list, minimal)
 * - Consistent monospace font (JetBrains Mono → Cascadia Code fallback)
 * - Better text wrapping and layout
 * - Accent colors per template
 * 
 * Usage:
 *   node scripts/generate-poster.cjs --text "Your text" --template humor
 *   node scripts/generate-poster.cjs --batch posts.json --output-dir posters/
 */

const fs = require('fs');
const path = require('path');

const W = 1080, H = 1080;

const THEMES = {
  humor:    { accent: '#f59e0b', label: '// developer humor',     variation: 'quote' },
  hotTake:  { accent: '#ef4444', label: '// hot take',            variation: 'bold' },
  tool:     { accent: '#22c55e', label: '// tool discovery',      variation: 'card' },
  tip:      { accent: '#3b82f6', label: '// pro tip',             variation: 'numbered' },
  quote:    { accent: '#a855f7', label: '// developer wisdom',    variation: 'quote' },
  list:     { accent: '#22c55e', label: '// developer life',      variation: 'list' },
  news:     { accent: '#ef4444', label: '// agent news',          variation: 'bold' },
};

function esc(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');
}

function wrap(text, maxChars) {
  const words = text.split(' ');
  const lines = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > maxChars) {
      if (cur) lines.push(cur.trim());
      cur = w;
    } else {
      cur += ' ' + w;
    }
  }
  if (cur.trim()) lines.push(cur.trim());
  return lines;
}

// ── Variation renderers ──

function renderQuote(lines, opts) {
  const { accent, startY, width } = opts;
  const fontSize = lines.length <= 3 ? 62 : lines.length <= 5 ? 50 : lines.length <= 8 ? 42 : 36;
  const lh = fontSize * 1.45;
  
  // Big opening quote
  const quoteMark = `<text x="120" y="${startY - 20}" font-family="'Cascadia Code','JetBrains Mono',monospace" font-size="120" fill="${accent}" opacity="0.3">"</text>`;
  
  const textEls = lines.map((line, i) => {
    const y = startY + i * lh;
    const isFirst = i === 0;
    return `<text x="${width/2}" y="${y}" text-anchor="middle" font-family="'Cascadia Code','JetBrains Mono',monospace" font-size="${fontSize}" font-weight="${isFirst ? 'bold' : 'normal'}" fill="${isFirst ? accent : '#ffffff'}">${esc(line)}</text>`;
  }).join('\n    ');

  return quoteMark + '\n    ' + textEls;
}

function renderBold(lines, opts) {
  const { accent, startY, width } = opts;
  const fontSize = lines.length <= 2 ? 68 : lines.length <= 4 ? 56 : lines.length <= 6 ? 46 : 38;
  const lh = fontSize * 1.5;

  // Accent bar on the left
  const barH = lines.length * lh + 20;
  const bar = `<rect x="100" y="${startY - fontSize}" width="6" height="${barH}" rx="3" fill="${accent}"/>`;

  const textEls = lines.map((line, i) => {
    const y = startY + i * lh;
    const isFirst = i === 0;
    return `<text x="130" y="${y}" font-family="'Cascadia Code','JetBrains Mono',monospace" font-size="${fontSize}" font-weight="bold" fill="${isFirst ? accent : '#ffffff'}">${esc(line)}</text>`;
  }).join('\n    ');

  return bar + '\n    ' + textEls;
}

function renderCard(lines, opts) {
  const { accent, startY, width } = opts;
  const fontSize = lines.length <= 3 ? 56 : lines.length <= 5 ? 46 : 38;
  const lh = fontSize * 1.4;
  const cardH = lines.length * lh + 60;
  const cardW = width - 200;
  const cardX = 100;
  const cardY = startY - fontSize - 20;

  const card = `<rect x="${cardX}" y="${cardY}" width="${cardW}" height="${cardH}" rx="8" fill="#111111" stroke="${accent}" stroke-width="2" opacity="0.8"/>`;

  const textEls = lines.map((line, i) => {
    const y = startY + i * lh;
    const isFirst = i === 0;
    return `<text x="${width/2}" y="${y}" text-anchor="middle" font-family="'Cascadia Code','JetBrains Mono',monospace" font-size="${fontSize}" font-weight="${isFirst ? 'bold' : 'normal'}" fill="${isFirst ? accent : '#ffffff'}">${esc(line)}</text>`;
  }).join('\n    ');

  return card + '\n    ' + textEls;
}

function renderNumbered(lines, opts) {
  const { accent, startY, width } = opts;
  const fontSize = lines.length <= 4 ? 52 : lines.length <= 6 ? 44 : 36;
  const lh = fontSize * 1.5;

  const textEls = lines.map((line, i) => {
    const y = startY + i * lh;
    const num = `<text x="130" y="${y}" font-family="'Cascadia Code','JetBrains Mono',monospace" font-size="${fontSize}" font-weight="bold" fill="${accent}">${String(i + 1).padStart(2, '0')}</text>`;
    const txt = `<text x="180" y="${y}" font-family="'Cascadia Code','JetBrains Mono',monospace" font-size="${fontSize}" fill="#ffffff">${esc(line)}</text>`;
    return num + '\n    ' + txt;
  }).join('\n    ');

  return textEls;
}

function renderList(lines, opts) {
  const { accent, startY, width } = opts;
  const fontSize = lines.length <= 5 ? 48 : lines.length <= 8 ? 40 : 34;
  const lh = fontSize * 1.5;

  const textEls = lines.map((line, i) => {
    const y = startY + i * lh;
    const bullet = line.startsWith('•') || line.startsWith('-') || line.startsWith('☐');
    const txt = bullet
      ? `<text x="140" y="${y}" font-family="'Cascadia Code','JetBrains Mono',monospace" font-size="${fontSize}" fill="${accent}">•</text><text x="170" y="${y}" font-family="'Cascadia Code','JetBrains Mono',monospace" font-size="${fontSize}" fill="#ffffff">${esc(line.replace(/^[•\-☐]\s*/, ''))}</text>`
      : `<text x="140" y="${y}" font-family="'Cascadia Code','JetBrains Mono',monospace" font-size="${fontSize}" font-weight="bold" fill="${accent}">${esc(line)}</text>`;
    return txt;
  }).join('\n    ');

  return textEls;
}

const RENDERERS = { quote: renderQuote, bold: renderBold, card: renderCard, numbered: renderNumbered, list: renderList };

// ── Main generator ──

function generate(text, template = 'humor', opts = {}) {
  const theme = THEMES[template] || THEMES.humor;
  const variation = theme.variation;
  const renderer = RENDERERS[variation] || renderQuote;

  // Detect if text is a list (has multiple bullet-like lines)
  const lines = text.split('\n').filter(l => l.trim());
  const isList = lines.filter(l => /^[•\-\d]/.test(l.trim())).length >= 3;

  let processedLines;
  if (isList && variation !== 'list') {
    processedLines = lines.map(l => l.trim());
  } else {
    processedLines = wrap(text.replace(/\n/g, ' '), 26);
  }

  const startY = variation === 'list' ? 240 : 350;
  const rendered = renderer(processedLines, { accent: theme.accent, startY, width: W });

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <style>
    text { font-family: 'Cascadia Code', 'JetBrains Mono', 'Fira Code', monospace; }
  </style>

  <!-- BG -->
  <rect width="${W}" height="${H}" fill="#0a0a0a"/>

  <!-- Subtle grid -->
  <defs>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#111" stroke-width="0.5"/>
    </pattern>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#grid)" opacity="0.5"/>

  <!-- Terminal frame -->
  <rect x="50" y="50" width="${W-100}" height="${H-100}" rx="10" fill="#0d0d0d" stroke="#1a1a1a" stroke-width="2"/>

  <!-- Title bar -->
  <rect x="50" y="50" width="${W-100}" height="44" rx="10" fill="#151515"/>
  <rect x="50" y="78" width="${W-100}" height="16" fill="#151515"/>

  <!-- Traffic lights -->
  <circle cx="82" cy="72" r="7" fill="#ff5f57"/>
  <circle cx="106" cy="72" r="7" fill="#febc2e"/>
  <circle cx="130" cy="72" r="7" fill="#28c840"/>

  <!-- Terminal prompt -->
  <text x="82" y="140" font-size="28" fill="${theme.accent}" font-weight="bold">$</text>
  <text x="112" y="140" font-size="22" fill="#555">~/</text>
  <text x="140" y="140" font-size="22" fill="#888" font-weight="bold">terminalblog</text>

  <!-- Blinking cursor -->
  <rect x="${W-100}" y="125" width="12" height="22" fill="${theme.accent}" opacity="0.8">
    <animate attributeName="opacity" values="0.8;0;0.8" dur="1.2s" repeatCount="indefinite"/>
  </rect>

  <!-- Main content -->
  <g transform="translate(0, 20)">
    ${rendered}
  </g>

  <!-- Subtitle / category -->
  <text x="${W/2}" y="${H-145}" text-anchor="middle" font-size="22" fill="#555">${esc(theme.label)}</text>

  <!-- Divider -->
  <line x1="80" y1="${H-120}" x2="${W-80}" y2="${H-120}" stroke="#1a1a1a" stroke-width="1"/>

  <!-- Footer -->
  <text x="${W/2}" y="${H-88}" text-anchor="middle" font-size="22" fill="#666" font-weight="bold">terminalblog.com</text>

  <!-- Accent bar -->
  <rect x="50" y="${H-70}" width="${W-100}" height="4" rx="2" fill="${theme.accent}" opacity="0.6"/>

  <!-- Corner accent -->
  <rect x="${W-80}" y="50" width="30" height="4" rx="2" fill="${theme.accent}" opacity="0.4"/>
</svg>`;

  return svg;
}

// ── CLI ──

function main() {
  const args = process.argv.slice(2);
  const textIdx = args.indexOf('--text');
  const tmplIdx = args.indexOf('--template');
  const outIdx = args.indexOf('--output');
  const batchIdx = args.indexOf('--batch');
  const outDirIdx = args.indexOf('--output-dir');

  const outDir = outDirIdx >= 0 ? args[outDirIdx + 1] : path.join(__dirname, '..', 'tmp', 'posters');
  fs.mkdirSync(outDir, { recursive: true });

  if (batchIdx >= 0) {
    const posts = JSON.parse(fs.readFileSync(args[batchIdx + 1], 'utf8'));
    for (let i = 0; i < posts.length; i++) {
      const p = posts[i];
      const svg = generate(p.text, p.template || 'humor');
      const out = path.join(outDir, `poster-${String(i + 1).padStart(3, '0')}.svg`);
      fs.writeFileSync(out, svg);
      console.log(`[${i + 1}/${posts.length}] ✅ ${path.basename(out)}`);
    }
  } else if (textIdx >= 0) {
    const text = args[textIdx + 1];
    const template = tmplIdx >= 0 ? args[tmplIdx + 1] : 'humor';
    const svg = generate(text, template);
    const out = outIdx >= 0 ? args[outIdx + 1] : path.join(outDir, `poster-${Date.now()}.svg`);
    fs.writeFileSync(out, svg);
    console.log(`✅ ${out}`);
  } else {
    console.log('Usage:');
    console.log('  --text "message" --template humor --output file.svg');
    console.log('  --batch posts.json --output-dir posters/');
    console.log('\nTemplates: humor, hotTake, tool, tip, quote, list, news');
  }
}

module.exports = { generate };
if (require.main === module) main();
