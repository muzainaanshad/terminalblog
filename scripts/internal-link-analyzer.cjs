#!/usr/bin/env node
/**
 * Internal Link Analyzer for terminalblog.com
 * Finds articles with few internal links and suggests connections.
 */

const fs = require('fs');
const path = require('path');

const BLOG_DIR = path.join(__dirname, '..', 'src', 'content', 'blog');

function parseMdx(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const fmMatch = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!fmMatch) return null;

  const fm = fmMatch[1];
  const body = raw.slice(fmMatch[0].length).trim();

  const fields = {};
  fm.split('\n').forEach(line => {
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
    internalLinks: (body.match(/\/blog\/[a-z0-9-]+/g) || []).length,
    backlinks: 0 // Will be calculated
  };
}

function analyze() {
  const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.mdx') && !f.startsWith('.'));
  const articles = files.map(f => parseMdx(path.join(BLOG_DIR, f))).filter(Boolean);

  // Count backlinks
  articles.forEach(article => {
    const linkPattern = new RegExp(`/blog/${article.slug}/`, 'g');
    articles.forEach(other => {
      if (other.slug !== article.slug && linkPattern.test(other.body)) {
        article.backlinks++;
      }
    });
  });

  // Find articles with few internal links
  const lowLinkArticles = articles
    .filter(a => a.internalLinks < 3 && a.wordCount > 400)
    .sort((a, b) => a.internalLinks - b.internalLinks);

  // Find articles with no backlinks
  const noBacklinks = articles
    .filter(a => a.backlinks === 0 && a.wordCount > 400)
    .sort((a, b) => a.wordCount - b.wordCount);

  console.log('=== INTERNAL LINK ANALYSIS ===');
  console.log(`Total articles: ${articles.length}`);
  console.log(`Articles with < 3 internal links: ${lowLinkArticles.length}`);
  console.log(`Articles with 0 backlinks: ${noBacklinks.length}`);

  console.log('\n=== TOP 10 ARTICLES NEEDING MORE LINKS ===');
  lowLinkArticles.slice(0, 10).forEach(a => {
    console.log(`${a.internalLinks} links | ${a.backlinks} backlinks | ${a.wordCount}w | ${a.slug}`);
  });

  console.log('\n=== TOP 10 ARTICLES WITH NO BACKLINKS ===');
  noBacklinks.slice(0, 10).forEach(a => {
    console.log(`${a.backlinks} backlinks | ${a.internalLinks} links | ${a.wordCount}w | ${a.slug}`);
  });

  // Suggest links
  console.log('\n=== SUGGESTED LINKS ===');
  lowLinkArticles.slice(0, 5).forEach(article => {
    // Find related articles by tags
    const articleTags = JSON.parse(article.tags.replace(/['"]/g, '"'));
    const related = articles
      .filter(a => a.slug !== article.slug && a.wordCount > 500)
      .filter(a => {
        const aTags = JSON.parse(a.tags.replace(/['"]/g, '"'));
        return aTags.some(t => articleTags.includes(t)) || a.tool === article.tool;
      })
      .slice(0, 3);

    if (related.length > 0) {
      console.log(`\n${article.slug}:`);
      related.forEach(r => {
        console.log(`  → /blog/${r.slug}/`);
      });
    }
  });
}

analyze();
