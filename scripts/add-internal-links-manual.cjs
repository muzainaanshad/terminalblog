#!/usr/bin/env node
/**
 * Add internal links to recent articles missing "## Related articles" section.
 * Handles Windows \r\n line endings.
 */

const fs = require('fs');
const path = require('path');

const BLOG_DIR = path.join(__dirname, '..', 'src', 'content', 'blog');

function parseMdx(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!fmMatch) return null;

  const fm = fmMatch[1];
  const body = raw.slice(fmMatch[0].length).trim();

  const fields = {};
  fm.split(/\r?\n/).forEach(line => {
    const [key, ...valueParts] = line.split(':');
    if (key && valueParts.length) {
      fields[key.trim()] = valueParts.join(':').trim();
    }
  });

  return {
    slug: path.basename(filePath, '.mdx'),
    title: fields.title?.replace(/['"]/g, '') || '',
    tags: fields.tags || '[]',
    tool: fields.tool || '',
    body: body,
    wordCount: body.split(/\s+/).filter(Boolean).length,
    filePath: filePath,
    raw: raw
  };
}

function findRelated(article, allArticles) {
  const articleTags = JSON.parse(article.tags.replace(/['"]/g, '"'));

  return allArticles
    .filter(a => a.slug !== article.slug && a.wordCount > 500)
    .filter(a => {
      const aTags = JSON.parse(a.tags.replace(/['"]/g, '"'));
      return aTags.some(t => articleTags.includes(t)) ||
             (a.tool === article.tool && a.tool !== 'industry' && a.tool !== '');
    })
    .sort((a, b) => b.wordCount - a.wordCount)
    .slice(0, 3);
}

function addRelatedSection(article, relatedArticles) {
  if (relatedArticles.length === 0) return article.raw;

  const relatedSection = `\n\n## Related articles\n\n${relatedArticles.map(r =>
    `- [${r.title}](/blog/${r.slug}/)`
  ).join('\n')}`;

  return article.raw + relatedSection;
}

function main() {
  const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.mdx') && !f.startsWith('.'));
  const articles = files.map(f => parseMdx(path.join(BLOG_DIR, f))).filter(Boolean);

  let updated = 0;
  const twoDaysAgo = Date.now() - 2 * 24 * 60 * 60 * 1000;

  articles.forEach(article => {
    const stat = fs.statSync(article.filePath);
    const mtime = stat.mtimeMs || stat.mtime.getTime();

    if (mtime < twoDaysAgo) return;
    if (article.raw.includes('## Related articles')) return;

    const related = findRelated(article, articles);
    if (related.length > 0) {
      const newContent = addRelatedSection(article, related);
      fs.writeFileSync(article.filePath, newContent);
      updated++;
      console.log(`Updated: ${article.slug} (+${related.length} related links)`);
      related.forEach(r => console.log(`  -> ${r.slug}`));
    } else {
      console.log(`Skipped (no matches): ${article.slug}`);
    }
  });

  console.log(`\nTotal articles updated: ${updated}`);
}

main();
