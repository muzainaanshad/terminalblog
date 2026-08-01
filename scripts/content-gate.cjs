#!/usr/bin/env node
/**
 * Pre-publish quality gate for terminalblog content.
 *
 * Usage:
 *   node scripts/content-gate.cjs                  # scan entire blog
 *   node scripts/content-gate.cjs path/to/file.mdx # validate one draft
 *   node scripts/content-gate.cjs --strict         # exit 1 on any failure
 *
 * Policies (throttle the firehose):
 *   - Max 3 just-shipped posts per calendar day
 *   - Max 8 total posts per calendar day
 *   - No near-duplicate slugs (stem similarity)
 *   - No near-duplicate titles (token Jaccard)
 *   - Off-niche tools must use tool: industry (or be rejected)
 *   - just-shipped posts must be >= 400 words OR be rejected as thin
 */

const fs = require('fs');
const path = require('path');

const BLOG_DIR = path.join(__dirname, '..', 'src', 'content', 'blog');
const STRICT = process.argv.includes('--strict');
const STRICT_ALL = process.argv.includes('--strict-all');
const targetFile = process.argv.slice(2).find((a) => !a.startsWith('--'));
const TODAY = new Date().toISOString().slice(0, 10);

const CODING_AGENT_TOOLS = new Set([
  'claude-code', 'hermes', 'cursor', 'opencode', 'mimo', 'kilo',
  'pi-dot-dev', 'oh-my-pi', 'gitlawb-zero', 'codex', 'goose',
  'openclaw', 'codebuff', 'ampcode', 'copilot-cli', 'cline', 'industry',
]);

const OFF_NICHE_HINTS = [
  /trading bot/i, /crypto exchange/i, /kraken/i, /seedream/i,
  /image generation/i, /bytedance/i, /internet court/i,
];

const LIMITS = {
  // Long-term SEO: fewer posts, thicker posts
  maxJustShippedPerDay: 0, // just-shipped disabled; use weekly digest only
  maxPostsPerDay: 3,
  minJustShippedWords: 800,
  minAnyWords: 400,
  minEvergreenWords: 600,
  titleJaccardMax: 0.72,
  slugStemDistanceMax: 0.85,
};

function parseMdx(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!fmMatch) return null;
  const fm = {};
  for (const line of fmMatch[1].split(/\r?\n/)) {
    const m = line.match(/^(\w+):\s*(.*)$/);
    if (!m) continue;
    let v = m[2].trim();
    if (v.startsWith('[') && v.endsWith(']')) {
      try { v = JSON.parse(v.replace(/'/g, '"')); } catch { /* keep string */ }
    } else {
      v = v.replace(/^["']|["']$/g, '');
    }
    fm[m[1]] = v;
  }
  const body = raw.slice(fmMatch[0].length).trim();
  const words = body.split(/\s+/).filter(Boolean).length;
  const slug = path.basename(filePath, path.extname(filePath));
  return { filePath, slug, fm, body, words };
}

function tokens(s) {
  return new Set(
    String(s || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, ' ')
      .split(/[\s-]+/)
      .filter((t) => t.length > 2)
  );
}

function jaccard(a, b) {
  const A = tokens(a);
  const B = tokens(b);
  if (!A.size || !B.size) return 0;
  let inter = 0;
  for (const t of A) if (B.has(t)) inter++;
  return inter / (A.size + B.size - inter);
}

function stemSlug(slug) {
  return slug
    .replace(/-20\d{2}-\d{2}-\d{2}$/, '')
    .replace(/-r\d+$/, '')
    .replace(/-20\d{2}$/, '');
}

function isJustShipped(article) {
  const tags = Array.isArray(article.fm.tags) ? article.fm.tags : String(article.fm.tags || '');
  return (
    article.slug.includes('just-shipped') ||
    (Array.isArray(tags) && (tags.includes('just-shipped') || tags.includes('shipped'))) ||
    /just-shipped/i.test(String(tags))
  );
}

function dayKey(article) {
  const d = article.fm.pubDate || '';
  return String(d).slice(0, 10);
}

function loadAll() {
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith('.mdx') || f.endsWith('.md'))
    .map((f) => parseMdx(path.join(BLOG_DIR, f)))
    .filter(Boolean);
}

function validateArticle(article, corpus) {
  const issues = [];
  const others = corpus.filter((a) => a.slug !== article.slug);

  if (article.words < LIMITS.minAnyWords) {
    issues.push({ level: 'error', code: 'thin', msg: `Only ${article.words} words (min ${LIMITS.minAnyWords})` });
  }
  const tagsStr = Array.isArray(article.fm.tags)
    ? article.fm.tags.join(' ')
    : String(article.fm.tags || '');
  const evergreen =
    /pillar|guide|checklist|comparison|pricing|security|beware|agents-md|decision/i.test(
      article.slug + ' ' + tagsStr + ' ' + (article.fm.title || '')
    );
  if (evergreen && article.words < LIMITS.minEvergreenWords) {
    issues.push({
      level: 'error',
      code: 'evergreen-thin',
      msg: `Evergreen/guide is ${article.words}w (min ${LIMITS.minEvergreenWords}) — expand for long-term SEO`,
    });
  }
  if (isJustShipped(article)) {
    issues.push({
      level: 'error',
      code: 'just-shipped-disabled',
      msg: 'just-shipped posts are disabled — use weekly digest or a deep Beware/guide instead',
    });
  }

  const tool = article.fm.tool;
  if (tool && !CODING_AGENT_TOOLS.has(tool)) {
    issues.push({
      level: 'error',
      code: 'invalid-tool',
      msg: `tool "${tool}" is not a tracked coding agent — use tool: industry or a real agent id`,
    });
  }

  for (const re of OFF_NICHE_HINTS) {
    if (re.test(article.fm.title || '') || re.test(article.slug)) {
      if (tool !== 'industry') {
        issues.push({
          level: 'warn',
          code: 'off-niche',
          msg: `Looks off-niche (${re}). Tag tool: industry or drop it.`,
        });
      }
    }
  }

  const isComparison = (a) => {
    const tags = Array.isArray(a.fm.tags) ? a.fm.tags.join(' ') : String(a.fm.tags || '');
    return (
      a.slug.includes('-vs-') ||
      /comparison/i.test(a.slug + ' ' + tags + ' ' + (a.fm.title || ''))
    );
  };

  /** Normalize pair pages: claude-code-vs-opencode-free-agent → sorted pair key */
  function pairKey(slug) {
    const base = stemSlug(slug)
      .replace(
        /-(github-battle|terminal-battle|pricing-battle|free-agent|token-overhead|unconstrained-challenge|open-source-rival|extensibility-showdown|extensibility|ide-vs-terminal|ide-speed.*|parallel-vs-extensible|faceoff|showdown|deep-dive|difference|2026-comparison|comparison)$/g,
        ''
      )
      .replace(/^what-devs-say-/, '');
    const parts = base.split('-vs-').filter(Boolean);
    if (parts.length >= 2) return parts.slice(0, 2).sort().join('-vs-');
    return base;
  }

  for (const other of others) {
    const bothComparison = isComparison(article) && isComparison(other);

    if (bothComparison) {
      // Comparison grid: exact title collision
      const t1 = String(article.fm.title || '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '');
      const t2 = String(other.fm.title || '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '');
      if (t1 && t1 === t2) {
        issues.push({
          level: 'error',
          code: 'duplicate-title',
          msg: `Exact title collision with ${other.slug}`,
        });
      }
      // Identical body (multi-angle variants must not share prose)
      const b1 = String(article.body || '')
        .replace(/\s+/g, ' ')
        .trim();
      const b2 = String(other.body || '')
        .replace(/\s+/g, ' ')
        .trim();
      if (b1.length > 400 && b1 === b2) {
        issues.push({
          level: 'error',
          code: 'duplicate-body',
          msg: `Body identical to ${other.slug} — multi-angle URLs need unique prose or one canonical URL`,
        });
      }
      // Same pair key + identical stem (true reverse duplicates only)
      if (
        pairKey(article.slug) === pairKey(other.slug) &&
        stemSlug(article.slug) === stemSlug(other.slug)
      ) {
        issues.push({
          level: 'error',
          code: 'duplicate-slug',
          msg: `Slug near-duplicate of ${other.slug} — one story, one URL`,
        });
      }
      continue;
    }

    const tj = jaccard(article.fm.title, other.fm.title);
    if (tj >= LIMITS.titleJaccardMax) {
      issues.push({
        level: 'error',
        code: 'duplicate-title',
        msg: `Title too similar to ${other.slug} (jaccard ${tj.toFixed(2)})`,
      });
    }
    const sa = stemSlug(article.slug);
    const sb = stemSlug(other.slug);
    if (sa === sb || jaccard(sa, sb) >= LIMITS.slugStemDistanceMax) {
      issues.push({
        level: 'error',
        code: 'duplicate-slug',
        msg: `Slug near-duplicate of ${other.slug} — one story, one URL`,
      });
    }
  }

  return issues;
}

function dailyThrottle(corpus) {
  const byDay = {};
  for (const a of corpus) {
    const day = dayKey(a) || 'unknown';
    if (!byDay[day]) byDay[day] = { total: 0, justShipped: 0, articles: [] };
    byDay[day].total++;
    if (isJustShipped(a)) byDay[day].justShipped++;
    byDay[day].articles.push(a.slug);
  }

  const violations = [];
  for (const [day, stats] of Object.entries(byDay)) {
    if (day === 'unknown') continue;
    if (stats.justShipped > LIMITS.maxJustShippedPerDay) {
      violations.push({
        level: 'error',
        code: 'daily-just-shipped-cap',
        msg: `${day}: ${stats.justShipped} just-shipped posts (max ${LIMITS.maxJustShippedPerDay})`,
      });
    }
    if (stats.total > LIMITS.maxPostsPerDay) {
      violations.push({
        level: 'warn',
        code: 'daily-volume-cap',
        msg: `${day}: ${stats.total} posts (soft max ${LIMITS.maxPostsPerDay})`,
      });
    }
  }
  return { byDay, violations };
}

function main() {
  const corpus = loadAll();
  let focus = corpus;
  if (targetFile) {
    const abs = path.isAbsolute(targetFile) ? targetFile : path.resolve(process.cwd(), targetFile);
    const one = parseMdx(abs);
    if (!one) {
      console.error('Could not parse', targetFile);
      process.exit(2);
    }
    focus = [one];
  }

  const report = { checked: focus.length, errors: 0, warnings: 0, articles: [] };

  for (const article of focus) {
    const issues = validateArticle(article, corpus);
    for (const i of issues) {
      if (i.level === 'error') report.errors++;
      else report.warnings++;
    }
    report.articles.push({
      slug: article.slug,
      words: article.words,
      tool: article.fm.tool,
      issues,
    });
  }

  const throttle = dailyThrottle(corpus);
  // Single-draft mode: only TODAY's throttle errors count toward the draft score.
  // Historical firehose debt must not block upgrading existing evergreen pages.
  const throttleForScore = targetFile
    ? throttle.violations.filter(
        (v) => v.level !== 'error' || String(v.msg).startsWith(TODAY)
      )
    : throttle.violations;
  for (const v of throttleForScore) {
    if (v.level === 'error') report.errors++;
    else report.warnings++;
  }
  // Always report full throttle for visibility, but annotate historical
  report.throttleHistorical = throttle.violations.filter(
    (v) => v.level === 'error' && !String(v.msg).startsWith(TODAY)
  ).length;

  console.log('=== CONTENT GATE ===');
  console.log(`Articles checked: ${report.checked} | corpus: ${corpus.length}`);
  console.log(`Errors: ${report.errors} | Warnings: ${report.warnings}`);
  console.log(`Policy: ≤${LIMITS.maxJustShippedPerDay} just-shipped/day, ≤${LIMITS.maxPostsPerDay} posts/day soft`);
  console.log();

  for (const a of report.articles) {
    if (!a.issues.length) continue;
    console.log(`• ${a.slug} (${a.words}w, tool=${a.tool || 'none'})`);
    for (const i of a.issues) {
      console.log(`    [${i.level}] ${i.code}: ${i.msg}`);
    }
  }

  if (throttle.violations.length) {
    console.log('\n=== DAILY THROTTLE ===');
    for (const v of throttle.violations) {
      const hist =
        targetFile && v.level === 'error' && !String(v.msg).startsWith(TODAY)
          ? ' (historical — ignored for single-draft exit)'
          : '';
      console.log(`  [${v.level}] ${v.msg}${hist}`);
    }
  }

  const outPath = path.join(__dirname, '..', 'content-gate-report.json');
  fs.writeFileSync(outPath, JSON.stringify({ ...report, throttle: throttle.violations, limits: LIMITS }, null, 2));
  console.log(`\nReport: ${outPath}`);

  // Exit codes:
  // --strict on a single draft → fail if that draft has errors (not historical corpus debt)
  // --strict on full corpus → fail only if TODAY's posts violate caps / new errors
  // --strict-all → fail on any historical error (CI debt scan)
  if (STRICT_ALL && report.errors > 0) {
    process.exit(1);
  }
  if (STRICT && targetFile) {
    // Only this draft's issues fail the gate. Corpus-wide daily caps are reported
    // but must not block upgrading an unrelated evergreen file.
    const draftErrors = report.articles.reduce(
      (n, a) => n + a.issues.filter((i) => i.level === 'error').length,
      0
    );
    if (draftErrors > 0) process.exit(1);
    process.exit(0);
  }
  if (STRICT && !targetFile) {
    const todayErrors = throttle.violations.filter(
      (v) => v.level === 'error' && String(v.msg).startsWith(TODAY)
    );
    const todayArticleErrors = report.articles.filter(
      (a) => {
        const art = corpus.find((c) => c.slug === a.slug);
        return art && dayKey(art) === TODAY && a.issues.some((i) => i.level === 'error');
      }
    );
    if (todayErrors.length || todayArticleErrors.length) {
      console.error(`\nSTRICT: today's posts fail the gate (${TODAY}). Fix or batch before publishing.`);
      process.exit(1);
    }
  }
}

main();
