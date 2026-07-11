#!/usr/bin/env node
// Batch-fix "undefined" feature comparison sections in comparison articles
const fs = require('fs');
const path = require('path');

const BLOG = path.join(__dirname, '..', 'src', 'content', 'blog');
const files = fs.readdirSync(BLOG).filter(f => f.endsWith('.mdx'));

const SECTION_RE = /## Feature Comparison\n\n\| Feature \|.*?\|\n\|\-\-\-.*?\|\n(?:\| undefined \|.*?\|\n)+/g;

let fixed = 0;

for (const file of files) {
  const fp = path.join(BLOG, file);
  let content = fs.readFileSync(fp, 'utf-8');
  const original = content;
  
  // Remove entire Feature Comparison section if all rows are undefined
  content = content.replace(SECTION_RE, '');
  content = content.replace(/\n{3,}/g, '\n\n');
  
  if (content !== original) {
    fs.writeFileSync(fp, content, 'utf-8');
    fixed++;
  }
}

console.log(`Fixed ${fixed} articles — removed empty Feature Comparison sections.`);
