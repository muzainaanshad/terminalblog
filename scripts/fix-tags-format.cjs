#!/usr/bin/env node
/**
 * Fix frontmatter tags format - convert from stringified array to proper YAML array
 * Run this to fix all 319 files that have tags: "[\"tag1\", \"tag2\"]" format
 */

const fs = require('fs');
const path = require('path');

const BLOG = path.join(__dirname, '..', 'src', 'content', 'blog');

function fixTagsInFile(filepath) {
  const raw = fs.readFileSync(filepath, 'utf8');
  
  // Match the frontmatter
  const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!fmMatch) return false;
  
  const fm = fmMatch[1];
  const body = raw.slice(fmMatch[0].length);
  
  // Check if tags is in the broken format
  const tagsMatch = fm.match(/^tags:\s*"\[([\s\S]*?)\]"/m);
  if (!tagsMatch) return false;
  
  const tagsContent = tagsMatch[1];
  // Parse the tags from the stringified array
  const tags = tagsContent
    .split(',')
    .map(t => t.trim().replace(/^["']|["']$/g, ''))
    .filter(t => t.length > 0);
  
  // Build new frontmatter with proper YAML array
  let newFm = fm.replace(
    /^tags:\s*"\[[\s\S]*?\]"/m,
    'tags:\n' + tags.map(t => `  - "${t.replace(/"/g, '\\"')}"`).join('\n')
  );
  
  const newRaw = '---\n' + newFm + '\n---' + body;
  fs.writeFileSync(filepath, newRaw, 'utf8');
  return true;
}

function main() {
  const files = fs.readdirSync(BLOG).filter(f => f.endsWith('.mdx'));
  let fixed = 0;
  
  for (const file of files) {
    const filepath = path.join(BLOG, file);
    if (fixTagsInFile(filepath)) {
      fixed++;
      console.log(`Fixed: ${file}`);
    }
  }
  
  console.log(`\nDone. Fixed ${fixed} files.`);
}

main();