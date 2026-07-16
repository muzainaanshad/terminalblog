#!/usr/bin/env node
/**
 * Article Memory — Sync and query article knowledge base
 * 
 * Builds a searchable index of all articles for:
 * - Smart updates (what to refresh)
 * - Internal linking (related articles)
 * - Backlink opportunities (what to reference)
 * - Topic tracking (what's covered, what's missing)
 * 
 * Usage:
 *   node scripts/article-memory.cjs sync           # rebuild index
 *   node scripts/article-memory.cjs query "topic"  # find related
 *   node scripts/article-memory.cjs updates        # what to update
 *   node scripts/article-memory.cjs backlinks      # link opportunities
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const BLOG_DIR = path.join(ROOT, 'src', 'content', 'blog');
const MEMORY_PATH = path.join(ROOT, 'src', 'data', 'article-memory.json');

// Stopwords to ignore in indexing
const STOPWORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
  'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
  'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these',
  'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'what', 'which',
  'who', 'whom', 'when', 'where', 'why', 'how', 'all', 'each', 'every',
  'both', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'not',
  'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just', 'because',
  'as', 'until', 'while', 'about', 'between', 'through', 'during', 'before',
  'after', 'above', 'below', 'up', 'down', 'out', 'off', 'over', 'under',
  'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where',
  'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most',
  'other', 'some', 'such', 'nor', 'not', 'only', 'own', 'same', 'so',
  'than', 'too', 'very', 's', 't', 'don', 'now',
]);

function loadMemory() {
  try { return JSON.parse(fs.readFileSync(MEMORY_PATH, 'utf8')); }
  catch { return { articles: {}, topics: {}, backlinks: { internal: [], external: [] }, updateQueue: [], lastSync: null, version: 1 }; }
}

function saveMemory(memory) {
  fs.writeFileSync(MEMORY_PATH, JSON.stringify(memory, null, 2));
}

function extractText(content) {
  // Remove frontmatter
  const fmEnd = content.indexOf('---', 3);
  const body = fmEnd > 0 ? content.slice(fmEnd + 3) : content;
  
  // Remove markdown syntax
  return body
    .replace(/```[\s\S]*?```/g, '') // code blocks
    .replace(/`[^`]*`/g, '') // inline code
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // links → text
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '') // images
    .replace(/#+\s/g, '') // headings
    .replace(/[*_~]/g, '') // emphasis
    .replace(/\n+/g, ' ') // newlines
    .toLowerCase();
}

function extractKeywords(text, minLen = 4) {
  const words = text.split(/\s+/).filter(w => w.length >= minLen && !STOPWORDS.has(w));
  const freq = {};
  for (const w of words) {
    freq[w] = (freq[w] || 0) + 1;
  }
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([word, count]) => ({ word, count }));
}

function extractFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  
  const fm = {};
  const lines = match[1].split('\n');
  for (const line of lines) {
    const [key, ...rest] = line.split(':');
    if (key && rest.length > 0) {
      fm[key.trim()] = rest.join(':').trim().replace(/^["']|["']$/g, '');
    }
  }
  return fm;
}

function syncMemory() {
  console.log('=== Article Memory Sync ===');
  
  const memory = loadMemory();
  const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.mdx'));
  
  console.log(`Scanning ${files.length} articles...`);
  
  let updated = 0;
  let newArticles = 0;
  
  for (const file of files) {
    const filePath = path.join(BLOG_DIR, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const fm = extractFrontmatter(content);
    const text = extractText(content);
    const keywords = extractKeywords(text);
    const wordCount = text.split(/\s+/).length;
    const slug = file.replace('.mdx', '');
    
    const existing = memory.articles[slug];
    
    if (!existing) {
      newArticles++;
    }
    
    memory.articles[slug] = {
      title: fm.title || slug,
      slug,
      pubDate: fm.pubDate || null,
      updatedDate: fm.updatedDate || null,
      tags: fm.tags ? fm.tags.split(',').map(t => t.trim()) : [],
      description: fm.description || '',
      wordCount,
      keywords: keywords.map(k => k.word),
      lastIndexed: new Date().toISOString(),
      needsUpdate: wordCount < 600,
      updatePriority: wordCount < 400 ? 'high' : wordCount < 600 ? 'medium' : 'low',
    };
    
    updated++;
  }
  
  // Build topic index
  const topics = {};
  for (const [slug, article] of Object.entries(memory.articles)) {
    for (const keyword of article.keywords.slice(0, 10)) {
      if (!topics[keyword]) {
        topics[keyword] = { articles: [], count: 0 };
      }
      topics[keyword].articles.push(slug);
      topics[keyword].count++;
    }
  }
  
  memory.topics = topics;
  memory.lastSync = new Date().toISOString();
  
  saveMemory(memory);
  
  console.log(`\nSync complete:`);
  console.log(`  Articles indexed: ${updated}`);
  console.log(`  New: ${newArticles}`);
  console.log(`  Topics tracked: ${Object.keys(topics).length}`);
  console.log(`  Need update: ${Object.values(memory.articles).filter(a => a.needsUpdate).length}`);
  
  // Show top topics
  const topTopics = Object.entries(topics)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 10);
  
  console.log('\nTop topics:');
  topTopics.forEach(([topic, data]) => {
    console.log(`  ${topic}: ${data.count} articles`);
  });
}

function queryTopic(query) {
  const memory = loadMemory();
  const queryWords = query.toLowerCase().split(/\s+/);
  
  const scored = Object.entries(memory.articles).map(([slug, article]) => {
    let score = 0;
    
    // Title match
    const titleLower = article.title.toLowerCase();
    for (const word of queryWords) {
      if (titleLower.includes(word)) score += 10;
    }
    
    // Keyword match
    for (const word of queryWords) {
      if (article.keywords.includes(word)) score += 5;
    }
    
    // Tag match
    for (const tag of article.tags) {
      if (queryWords.some(w => tag.toLowerCase().includes(w))) score += 3;
    }
    
    return { slug, title: article.title, score, wordCount: article.wordCount };
  });
  
  return scored
    .filter(a => a.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
}

function findUpdates() {
  const memory = loadMemory();
  
  return Object.entries(memory.articles)
    .filter(([, a]) => a.needsUpdate)
    .sort((a, b) => {
      const priority = { high: 3, medium: 2, low: 1 };
      return (priority[b[1].updatePriority] || 0) - (priority[a[1].updatePriority] || 0);
    })
    .slice(0, 20)
    .map(([slug, a]) => ({
      slug,
      title: a.title,
      wordCount: a.wordCount,
      priority: a.updatePriority,
      missing: 600 - a.wordCount,
    }));
}

function findBacklinkOpportunities(newArticleKeywords) {
  const memory = loadMemory();
  
  const opportunities = [];
  
  for (const [slug, article] of Object.entries(memory.articles)) {
    const relevance = article.keywords.filter(k => 
      newArticleKeywords.some(nk => k.includes(nk) || nk.includes(k))
    ).length;
    
    if (relevance > 0 && slug !== newArticleKeywords[0]) {
      opportunities.push({
        slug,
        title: article.title,
        relevance,
        wordCount: article.wordCount,
      });
    }
  }
  
  return opportunities
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, 5);
}

// CLI
const cmd = process.argv[2];

switch (cmd) {
  case 'sync':
    syncMemory();
    break;
    
  case 'query': {
    const query = process.argv.slice(3).join(' ');
    if (!query) { console.log('Usage: article-memory.cjs query "topic"'); break; }
    const results = queryTopic(query);
    console.log(`\nArticles matching "${query}":`);
    results.forEach(r => console.log(`  ${r.title} (${r.wordCount}w)`));
    break;
  }
  
  case 'updates': {
    const updates = findUpdates();
    console.log('\nArticles needing updates:');
    updates.forEach(u => {
      console.log(`  [${u.priority}] ${u.title} — ${u.wordCount}w (need ${u.more} more)`);
    });
    break;
  }
  
  case 'backlinks': {
    const keywords = process.argv.slice(3);
    if (keywords.length === 0) { console.log('Usage: article-memory.cjs backlinks keyword1 keyword2'); break; }
    const opps = findBacklinkOpportunities(keywords);
    console.log('\nBacklink opportunities:');
    opps.forEach(o => console.log(`  ${o.title} (${o.relevance} keyword matches)`));
    break;
  }
  
  default:
    console.log('Usage: article-memory.cjs <sync|query|updates|backlinks> [args]');
}
