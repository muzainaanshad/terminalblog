#!/usr/bin/env node
// Add updatedDate to all articles that don't have it
const fs = require('fs');
const path = require('path');

const BLOG = path.join(__dirname, '..', 'src', 'content', 'blog');
const files = fs.readdirSync(BLOG).filter(f => f.endsWith('.mdx'));

let count = 0;
for (const file of files) {
  const fp = path.join(BLOG, file);
  let content = fs.readFileSync(fp, 'utf-8');
  
  // Skip if already has updatedDate
  if (content.includes('updatedDate:')) continue;
  
  // Extract pubDate
  const match = content.match(/^pubDate:\s*"([^"]+)"/m);
  if (!match) continue;
  
  // Insert after pubDate
  const pubDateLine = match[0];
  content = content.replace(pubDateLine, `${pubDateLine}\nupdatedDate: "${match[1]}"`);
  fs.writeFileSync(fp, content, 'utf-8');
  count++;
}

console.log(`Added updatedDate to ${count} articles.`);
