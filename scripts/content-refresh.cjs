#!/usr/bin/env node
/**
 * Find evergreen posts that need periodic updates (staleness + thin pillars).
 *
 * Usage:
 *   node scripts/content-refresh.cjs
 *   node scripts/content-refresh.cjs --days 60
 *
 * Output: tmp/content-refresh-report.txt (+ stdout)
 */

const fs = require('fs');
const path = require('path');

const BLOG = path.join(__dirname, '..', 'src', 'content', 'blog');
const DAYS = Number(
  process.argv.includes('--days')
    ? process.argv[process.argv.indexOf('--days') + 1]
    : 45
);

const EVERGREEN_HINTS =
  /pillar|guide|checklist|comparison|pricing|security|beware|agents-md|decision|complete-guide|features-comparison/i;

function parse(file) {
  const raw = fs.readFileSync(file, 'utf8');
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return null;
  const fm = {};
  for (const line of m[1].split(/\r?\n/)) {
    const mm = line.match(/^(\w+):\s*(.*)$/);
    if (!mm) continue;
    let v = mm[2].trim().replace(/^["']|["']$/g, '');
    fm[mm[1]] = v;
  }
  const body = raw.slice(m[0].length);
  const words = body.split(/\s+/).filter(Boolean).length;
  const slug = path.basename(file, '.mdx');
  const updated = fm.updatedDate || fm.pubDate;
  const ts = updated ? new Date(updated).getTime() : 0;
  const ageDays = ts ? Math.floor((Date.now() - ts) / 864e5) : 999;
  const tags = String(fm.tags || '');
  const evergreen =
    EVERGREEN_HINTS.test(slug) ||
    EVERGREEN_HINTS.test(tags) ||
    EVERGREEN_HINTS.test(fm.title || '');

  return {
    slug,
    title: fm.title || slug,
    words,
    ageDays,
    updated: updated || 'unknown',
    evergreen,
    isJustShipped: /just-shipped/.test(slug),
  };
}

function main() {
  const posts = fs
    .readdirSync(BLOG)
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => parse(path.join(BLOG, f)))
    .filter(Boolean);

  const due = posts
    .filter((p) => p.evergreen && !p.isJustShipped && p.ageDays >= DAYS)
    .sort((a, b) => b.ageDays - a.ageDays);

  const thinEvergreen = posts
    .filter((p) => p.evergreen && p.words < 800)
    .sort((a, b) => a.words - b.words);

  const lines = [
    `CONTENT REFRESH QUEUE`,
    `Rule: evergreen posts older than ${DAYS} days should be reviewed/updated`,
    `Evergreen stale: ${due.length}`,
    `Evergreen thin (<800w): ${thinEvergreen.length}`,
    '',
    '=== STALE EVERGREEN (update these — long-term traffic) ===',
    ...due.slice(0, 20).map(
      (p) =>
        `• ${p.ageDays}d · ${p.words}w · ${p.slug}\n  ${p.title}\n  https://terminalblog.com/blog/${p.slug}/`
    ),
    '',
    '=== THIN EVERGREEN (expand, do not delete pillars) ===',
    ...thinEvergreen.slice(0, 15).map(
      (p) => `• ${p.words}w · ${p.slug}`
    ),
    '',
    'Policy: prefer updatedDate on existing URL over new near-duplicate posts.',
  ];

  const text = lines.join('\n');
  console.log(text);

  const outDir = path.join(__dirname, '..', 'tmp');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'content-refresh-report.txt'), text);

  fs.writeFileSync(
    path.join(__dirname, '..', 'content-refresh-report.json'),
    JSON.stringify({ days: DAYS, due, thinEvergreen: thinEvergreen.slice(0, 40) }, null, 2)
  );
}

main();
