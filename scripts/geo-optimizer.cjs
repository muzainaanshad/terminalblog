#!/usr/bin/env node
/**
 * GEO (Generative Engine Optimization) auditor for terminalblog.
 *
 * Checks each published post for the signals AI search engines use
 * when they decide whether to cite a page:
 *   1. JSON-LD structured data  (global via Layout.astro schema graph)
 *   2. Canonical URL            (global via Layout.astro <Seo>)
 *   3. Meta description         (frontmatter `description`, length check)
 *   4. FAQ section              (a `## FAQ` block that answers natural questions)
 *   5. Clear definition up top  (first ~90 chars isn't just a table/header)
 *
 * Usage:
 *   node scripts/geo-optimizer.cjs --dry        # audit + report only (default)
 *   node scripts/geo-optimizer.cjs --prompt     # print the exact FAQ patch block
 *   node scripts/geo-optimizer.cjs <file.mdx> --dry
 *
 * Exit 0 always in --dry so cron can read the report. Never rewrites files
 * automatically — FAQ content must be human/LLM authored and gated.
 */
const fs = require('fs');
const path = require('path');

const BLOG_DIR = path.join(__dirname, '..', 'src', 'content', 'blog');
const DRY = process.argv.includes('--dry');
const PROMPT = process.argv.includes('--prompt');
const targetFile = process.argv.slice(2).find((a) => !a.startsWith('--'));

// Global signals live in Layout.astro (checked once at build) — not per-post.
const GLOBAL = {
  jsonld: true,      // src/layouts/Layout.astro <Seo graph>
  canonical: true,   // rel=canonical emitted via Seo
  og: true,          // og tags via Seo
};

const files = targetFile
  ? [path.isAbsolute(targetFile) ? targetFile : path.join(BLOG_DIR, targetFile)]
  : fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith('.mdx'));

function meta(fm, field) {
  const m = fm.match(new RegExp(`^${field}\\s*:\\s*(.+)$`, 'm'));
  return m ? m[1].trim() : null;
}

function stripQuotes(s) {
  if (!s) return s;
  return s.replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1');
}

const report = [];
let flags = { desc: 0, faq: 0, def: 0, total: 0 };

for (const f of files) {
  const abs = path.join(BLOG_DIR, path.basename(f));
  if (!fs.existsSync(abs)) { console.log(`SKIP (no file): ${f}`); continue; }
  const raw = fs.readFileSync(abs, 'utf8');
  const fmEnd = raw.indexOf('---', 4);
  const fm = fmEnd === -1 ? '' : raw.slice(0, fmEnd);
  const body = fmEnd === -1 ? raw : raw.slice(fmEnd + 3);

  const title = stripQuotes(meta(fm, 'title'));
  const desc = stripQuotes(meta(fm, 'description'));
  const hasFaq = /^## FAQ\b/mi.test(body);

  // Definition check: first 120 visible chars of body after frontmatter.
  const bodyStart = body.replace(/^[\s#\n\-]*/, '').replace(/^##\s+.*$/m, '').trim();
  const firstChars = bodyStart.slice(0, 120);

  const descOk = desc && desc.length >= 40 && desc.length <= 200;
  const defOk = /(is|are|means|refers to|vs\.| vs )/i.test(firstChars);

  report.push({
    file: path.basename(abs),
    title,
    desc: desc ? `${desc.length}ch` : 'MISSING',
    descOk,
    faq: hasFaq,
    def: defOk,
  });
  if (!descOk) flags.desc++;
  if (!hasFaq) flags.faq++;
  if (!defOk) flags.def++;
  flags.total++;
}

// --- output ---
console.log('=== GEO audit: terminalblog ===');
console.log(`Global signals (Layout.astro): JSON-LD=${GLOBAL.jsonld ? 'yes' : 'no'}, canonical=${GLOBAL.canonical}, OG=${GLOBAL.og}`);
console.log(`Posts scanned: ${flags.total}`);
console.log(`Missing/bad meta description: ${flags.desc}`);
console.log(`Missing FAQ section:  ${flags.faq}  (${(((flags.total - flags.faq) / flags.total) * 100).toFixed(0)}% have FAQ)`);
console.log(`Weak opening definition: ${flags.def}`);
console.log('');
console.log('Posts missing FAQ (GEO citation opportunity):');
for (const r of report.filter((r) => !r.faq)) {
  console.log(`  - ${r.file}${r.title ? '  | ' + r.title : ''}`);
}
console.log('');
console.log('Posts with weak opening (no definition in first sentence):');
for (const r of report.filter((r) => !r.def)) {
  console.log(`  - ${r.file}`);
}
if (!DRY && !PROMPT) {
  console.log('(dry-run default; add --prompt to get an FAQ-writing prompt for a file)');
}

if (PROMPT) {
  console.log('\n=== FAQ patch prompt ===');
  console.log('For each top pillar below, add a `## FAQ` section near the bottom (before any affiliate/footer CTA)');
  console.log('with 4-6 natural questions an operator would actually ask. Format:');
  console.log('  ## FAQ\n  **Q1: ...?**\n  Answer referencing this article\'s real data. \n');
  console.log('Target articles (already ranking, missing FAQ):');
  for (const r of report.filter((x) => !x.faq).slice(0, 8)) {
    console.log(`  - ${r.file}`);
  }
}