#!/usr/bin/env node
/**
 * Add Internal Links to terminalblog.com articles
 * Adds "Related articles" section at the end of articles.
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
    filePath: filePath,
    raw: raw
  };
}

function addRelatedSection(article, relatedArticles) {
  if (relatedArticles.length === 0) return article.raw;

  // Check if already has related section
  if (article.raw.includes('## Related articles') || article.raw.includes('## You might also like')) {
    return article.raw;
  }

  const relatedSection = `\n\n## Related articles\n\n${relatedArticles.map(r => 
    `- [${r.title}](/blog/${r.slug}/)`
  ).join('\n')}`;

  // Insert before the last separator or affiliate CTA
  let insertPoint = article.raw.lastIndexOf('\n---\n');
  if (insertPoint === -1) {
    insertPoint = article.raw.lastIndexOf('\n*Your coding agent');
    if (insertPoint === -1) {
      insertPoint = article.raw.length;
    }
  }

  return article.raw.slice(0, insertPoint) + relatedSection + article.raw.slice(insertPoint);
}

function findRelated(article, allArticles) {
  const articleTags = JSON.parse(article.tags.replace(/['"]/g, '"'));
  
  return allArticles
    .filter(a => a.slug !== article.slug && a.wordCount > 500)
    .filter(a => {
      const aTags = JSON.parse(a.tags.replace(/['"]/g, '"'));
      // Match by tags or tool
      return aTags.some(t => articleTags.includes(t)) || 
             (a.tool === article.tool && a.tool !== 'industry');
    })
    .sort((a, b) => b.wordCount - a.wordCount)
    .slice(0, 3);
}

function analyze() {
  const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.mdx') && !f.startsWith('.'));
  const articles = files.map(f => parseMdx(path.join(BLOG_DIR, f))).filter(Boolean);

  let updated = 0;
  
  articles.forEach(article => {
    const related = findRelated(article, articles);
    if (related.length > 0 && !article.raw.includes('## Related articles')) {
      const newContent = addRelatedSection(article, related);
      if (newContent !== article.raw) {
        fs.writeFileSync(article.filePath, newContent);
        updated++;
        console.log(`Updated: ${article.slug} (+${related.length} related links)`);
      }
    }
  });

  console.log(`\nTotal articles updated: ${updated}`);
}

analyze();
