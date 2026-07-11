#!/usr/bin/env node
/**
 * Article Quality Checker for terminalblog.com
 * Scans all MDX articles and reports quality metrics.
 * Run: node scripts/quality-check.js
 */

const fs = require('fs');
const path = require('path');

const BLOG_DIR = path.join(__dirname, '..', 'src', 'content', 'blog');

const BANNED_PHRASES = [
  "let's dive in",
  "it is important to note",
  "furthermore",
  "moreover",
  "delve",
  "tapestry",
  "pivotal",
  "navigate the complexities",
  "in today's fast-paced world",
  "this isn't just about",
  "game-changer",
  "ever-evolving",
  "robust solution",
  "seamless integration",
  "leverage",
  "synergy",
  "holistic approach",
  "cutting-edge",
  "state-of-the-art",
  "in conclusion",
];

const REQUIRED_FIELDS = ['title', 'description', 'pubDate', 'tags', 'tool', 'author'];

function analyzeArticle(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const filename = path.basename(filePath);
  
  // Parse frontmatter
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!fmMatch) return { filename, error: 'No frontmatter' };
  
  const fm = fmMatch[1];
  const body = content.slice(fmMatch[0].length).trim();
  
  // Extract fields
  const fields = {};
  for (const line of fm.split('\n')) {
    const m = line.match(/^(\w+):\s*"?([^"]*)"?$/);
    if (m) fields[m[1]] = m[2];
  }
  
  // Word count
  const words = body.split(/\s+/).filter(w => w.length > 0).length;
  
  // Banned phrases
  const foundBanned = BANNED_PHRASES.filter(phrase => 
    body.toLowerCase().includes(phrase)
  );
  
  // Internal links
  const internalLinks = (body.match(/\]\(\/blog\//g) || []).length;
  
  // External links
  const externalLinks = (body.match(/\]\(https?:\/\//g) || []).length;
  
  // Sentence length variation
  const sentences = body.split(/[.!?]+/).filter(s => s.trim().length > 10);
  const lengths = sentences.map(s => s.trim().split(/\s+/).length);
  const avgLen = lengths.length > 0 ? lengths.reduce((a,b) => a+b, 0) / lengths.length : 0;
  const hasVariation = lengths.length > 3 ? 
    (Math.max(...lengths) - Math.min(...lengths)) > 15 : true;
  
  // Missing fields
  const missingFields = REQUIRED_FIELDS.filter(f => !fields[f]);
  
  // Score
  let score = 100;
  if (words < 300) score -= 30;
  else if (words < 500) score -= 10;
  if (foundBanned.length > 0) score -= foundBanned.length * 5;
  if (internalLinks === 0) score -= 15;
  if (missingFields.length > 0) score -= missingFields.length * 5;
  if (!hasVariation) score -= 10;
  if (words > 2000) score += 5; // Bonus for long-form
  
  return {
    filename,
    title: fields.title || 'MISSING',
    tool: fields.tool || 'none',
    author: fields.author || 'MISSING',
    words,
    score: Math.max(0, Math.min(100, score)),
    bannedPhrases: foundBanned,
    internalLinks,
    externalLinks,
    missingFields,
    hasVariation,
    issues: [],
  };
}

// Main
const files = fs.readdirSync(BLOG_DIR)
  .filter(f => f.endsWith('.mdx'))
  .map(f => path.join(BLOG_DIR, f));

const results = files.map(analyzeArticle).filter(r => !r.error);

// Sort by score (worst first)
results.sort((a, b) => a.score - b.score);

// Summary
const avgScore = results.reduce((s, r) => s + r.score, 0) / results.length;
const thin = results.filter(r => r.words < 300);
const noAuthor = results.filter(r => r.author === 'MISSING');
const noInternal = results.filter(r => r.internalLinks === 0);
const withBanned = results.filter(r => r.bannedPhrases.length > 0);

console.log('=== ARTICLE QUALITY REPORT ===');
console.log(`Total articles: ${results.length}`);
console.log(`Average score: ${avgScore.toFixed(1)}/100`);
console.log();
console.log(`Thin (<300 words): ${thin.length}`);
console.log(`Missing author: ${noAuthor.length}`);
console.log(`No internal links: ${noInternal.length}`);
console.log(`Banned phrases found: ${withBanned.length}`);
console.log();

// Worst 10
console.log('=== WORST 10 ARTICLES ===');
results.slice(0, 10).forEach(r => {
  const issues = [];
  if (r.words < 300) issues.push(`thin(${r.words}w)`);
  if (r.author === 'MISSING') issues.push('no-author');
  if (r.internalLinks === 0) issues.push('no-internal-links');
  if (r.bannedPhrases.length > 0) issues.push(`banned:${r.bannedPhrases.join(',')}`);
  if (!r.hasVariation) issues.push('uniform-sentences');
  console.log(`  ${r.score}/100 | ${r.filename.slice(0,45).padEnd(45)} | ${issues.join(', ')}`);
});

// Best 5
console.log();
console.log('=== BEST 5 ARTICLES ===');
results.slice(-5).reverse().forEach(r => {
  console.log(`  ${r.score}/100 | ${r.filename.slice(0,45).padEnd(45)} | ${r.words}w, ${r.internalLinks} links`);
});

// Export for automation
const needsWork = results.filter(r => r.score < 60);
console.log();
console.log(`=== ${needsWork.length} ARTICLES NEED IMPROVEMENT ===`);

fs.writeFileSync(
  path.join(__dirname, '..', 'quality-report.json'),
  JSON.stringify({ summary: { total: results.length, avgScore, thin: thin.length, noAuthor: noAuthor.length, noInternal: noInternal.length, banned: withBanned.length }, needsWork: needsWork.map(r => ({ file: r.filename, score: r.score, words: r.words, issues: r.bannedPhrases.length ? r.bannedPhrases : [] })), all: results.map(r => ({ file: r.filename, score: r.score, words: r.words })) }, null, 2)
);

console.log('Full report saved to quality-report.json');
