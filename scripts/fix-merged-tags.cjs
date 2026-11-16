#!/usr/bin/env node
/**
 * Direct fix for the specific problematic file
 */

const fs = require('fs');
const path = require('path');

const BLOG = path.join(__dirname, '..', 'src', 'content', 'blog');

// First, fix the specific broken file manually
const problemFile = path.join(BLOG, 'ai-agents-keep-deleting-production-databases-pattern.mdx');
if (fs.existsSync(problemFile)) {
  let raw = fs.readFileSync(problemFile, 'utf8');
  // Fix the merged line
  raw = raw.replace(
    /  - "antigravity\\\\"  - "\\\\\\"incident-response"/,
    '  - "antigravity"\n  - "incident-response"'
  );
  fs.writeFileSync(problemFile, raw, 'utf8');
  console.log('Fixed merged line in ai-agents-keep-deleting-production-databases-pattern.mdx');
}

// Now run a more careful fix for all files
const files = fs.readdirSync(BLOG).filter(f => f.endsWith('.mdx'));
let fixed = 0;

for (const file of files) {
  const filepath = path.join(BLOG, file);
  let raw = fs.readFileSync(filepath, 'utf8');
  
  // Fix any lines that have merged tags like "tag1\"  - \"tag2"
  const fixedRaw = raw.replace(
    /(  - "[^"]*")\s{2,}-\s+"([^"]*)"/g,
    '$1\n  - "$2"'
  );
  
  // Also fix lines with triple quotes
  const fixedRaw2 = fixedRaw.replace(
    /(  - "[^"]*")\s{2,}-\s+\\"([^"]*)\\"/g,
    '$1\n  - "$2"'
  );
  
  // Fix lines that have escaped quotes inside
  const fixedRaw3 = fixedRaw2.replace(
    /(  - ")([^"]*\\")([^"]*")/g,
    (match, prefix, middle, suffix) => {
      const fixed = middle.replace(/\\"/g, '"');
      return prefix + fixed + suffix;
    }
  );
  
  if (fixedRaw3 !== raw) {
    fs.writeFileSync(filepath, fixedRaw3, 'utf8');
    fixed++;
    console.log(`Fixed: ${file}`);
  }
}

console.log(`\nDone. Fixed ${fixed} files.`);