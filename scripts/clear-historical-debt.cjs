#!/usr/bin/env node
/**
 * Historical debt cleaner for terminalblog.
 *
 * "Historical debt" = old posts that fail today's quality bar
 * (thin pages, fake tool: values, template vs-pages). They still
 * rank poorly and pollute the site — but we keep them until you
 * choose fix / noindex / delete.
 *
 * Usage:
 *   node scripts/clear-historical-debt.cjs              # report only
 *   node scripts/clear-historical-debt.cjs --fix-tools  # rewrites bad tool: → industry
 *   node scripts/clear-historical-debt.cjs --list-delete # print candidates to delete (manual)
 *   node scripts/clear-historical-debt.cjs --archive-thin # move thin non-pillar posts to _archive/
 */

const fs = require('fs');
const path = require('path');

const BLOG = path.join(__dirname, '..', 'src', 'content', 'blog');
const ARCHIVE = path.join(BLOG, '_archive');
const args = new Set(process.argv.slice(2));

const VALID_TOOLS = new Set([
  'claude-code', 'hermes', 'cursor', 'opencode', 'mimo', 'kilo',
  'pi-dot-dev', 'oh-my-pi', 'gitlawb-zero', 'codex', 'goose',
  'openclaw', 'codebuff', 'ampcode', 'copilot-cli', 'industry',
]);

const BAD_TOOLS = new Set([
  'launches', 'dev', 'Guide', 'unsloth', 'seedream', 'meta',
  'research', 'openai', 'genlayer', 'tencent-hy3',
]);

function parse(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return null;
  const fm = {};
  for (const line of m[1].split(/\r?\n/)) {
    const mm = line.match(/^(\w+):\s*(.*)$/);
    if (!mm) continue;
    let v = mm[2].trim().replace(/^["']|["']$/g, '');
    fm[mm[1]] = v;
  }
  const body = raw.slice(m[0].length).trim();
  const words = body.split(/\s+/).filter(Boolean).length;
  const tags = fm.tags || '';
  return {
    file: path.basename(filePath),
    path: filePath,
    raw,
    fm,
    words,
    isPillar: /pillar/.test(tags) || /pillar/.test(filePath),
    isJustShipped: /just-shipped/.test(filePath) || /just-shipped/.test(tags),
    tool: fm.tool || '',
  };
}

function main() {
  const files = fs
    .readdirSync(BLOG)
    .filter((f) => f.endsWith('.mdx') && !f.startsWith('_'))
    .map((f) => parse(path.join(BLOG, f)))
    .filter(Boolean);

  const invalidTool = files.filter((a) => a.tool && !VALID_TOOLS.has(a.tool));
  const thin = files.filter((a) => a.words < 300 && !a.isPillar);
  const thinJust = files.filter((a) => a.isJustShipped && a.words < 400);
  const templateVs = files.filter(
    (a) =>
      /-vs-/.test(a.file) &&
      a.words < 350 &&
      !a.isPillar
  );

  console.log('=== HISTORICAL DEBT (plain English) ===\n');
  console.log('These are OLD posts that already live on the site.');
  console.log('They are not "broken deploys" — they are content that is too thin,');
  console.log('duplicative, or mis-tagged. Google still crawls them.\n');
  console.log(`Total posts:        ${files.length}`);
  console.log(`Invalid tool: tags: ${invalidTool.length}  (e.g. tool: launches)`);
  console.log(`Thin (<300 words):  ${thin.length}`);
  console.log(`Thin just-shipped:  ${thinJust.length}`);
  console.log(`Thin A-vs-B pages:  ${templateVs.length}`);

  console.log('\n--- Top invalid tools ---');
  invalidTool.slice(0, 15).forEach((a) => console.log(`  ${a.file}  tool=${a.tool}`));

  console.log('\n--- Sample thin posts (delete or expand) ---');
  thin
    .sort((a, b) => a.words - b.words)
    .slice(0, 15)
    .forEach((a) => console.log(`  ${a.words}w  ${a.file}`));

  if (args.has('--fix-tools')) {
    let n = 0;
    for (const a of invalidTool) {
      if (!BAD_TOOLS.has(a.tool) && !VALID_TOOLS.has(a.tool)) {
        // still fix unknown tools to industry
      }
      const next = a.raw.replace(
        /^tool:\s*["']?[^"'\n]+["']?/m,
        'tool: "industry"'
      );
      if (next !== a.raw) {
        fs.writeFileSync(a.path, next);
        n++;
        console.log(`fixed tool → industry: ${a.file}`);
      }
    }
    console.log(`\nFixed ${n} tool fields.`);
  }

  if (args.has('--archive-thin')) {
    if (!fs.existsSync(ARCHIVE)) fs.mkdirSync(ARCHIVE, { recursive: true });
    // Only archive thin just-shipped + template vs under 250w (safest batch)
    const victims = files.filter(
      (a) =>
        !a.isPillar &&
        ((a.isJustShipped && a.words < 350) || (/-vs-/.test(a.file) && a.words < 250))
    );
    let n = 0;
    for (const a of victims) {
      const dest = path.join(ARCHIVE, a.file);
      fs.renameSync(a.path, dest);
      n++;
      console.log(`archived ${a.file} (${a.words}w)`);
    }
    console.log(`\nArchived ${n} posts to src/content/blog/_archive/`);
    console.log('They drop out of the site build (folder ignored if not in glob).');
    console.log('Add vercel redirects if any of these ranked — or leave 404.');
  }

  if (args.has('--list-delete')) {
    console.log('\n=== DELETE CANDIDATES (review before rm) ===');
    const cand = files
      .filter((a) => !a.isPillar && a.words < 220)
      .sort((a, b) => a.words - b.words);
    cand.forEach((a) => console.log(a.file));
    console.log(`\n${cand.length} files under 220 words (non-pillar).`);
  }

  // write report
  const report = {
    generatedAt: new Date().toISOString(),
    totals: {
      posts: files.length,
      invalidTool: invalidTool.length,
      thin: thin.length,
      thinJustShipped: thinJust.length,
      templateVs: templateVs.length,
    },
    invalidTool: invalidTool.map((a) => ({ file: a.file, tool: a.tool, words: a.words })),
    thinnest: thin
      .sort((a, b) => a.words - b.words)
      .slice(0, 50)
      .map((a) => ({ file: a.file, words: a.words })),
  };
  const out = path.join(__dirname, '..', 'historical-debt-report.json');
  fs.writeFileSync(out, JSON.stringify(report, null, 2));
  console.log(`\nReport: ${out}`);
  console.log('\nRecommended order:');
  console.log('  1. node scripts/clear-historical-debt.cjs --fix-tools');
  console.log('  2. node scripts/clear-historical-debt.cjs --archive-thin');
  console.log('  3. Review historical-debt-report.json thinnest[] and expand or delete');
  console.log('  4. npm run content-gate && git commit');
}

main();
