#!/usr/bin/env node
/**
 * Fix all remaining tag issues - comprehensive
 */

const fs = require('fs');
const path = require('path');

const BLOG = path.join(__dirname, '..', 'src', 'content', 'blog');

const files = fs.readdirSync(BLOG).filter(f => f.endsWith('.mdx'));
let fixed = 0;

for (const file of files) {
  const filepath = path.join(BLOG, file);
  let raw = fs.readFileSync(filepath, 'utf8');
  
  // Fix double quotes inside tag: ""guide"" -> "guide"
  let fixedRaw = raw.replace(
    /(  - ")"([^"]*)""/g,
    '$1$2"'
  );
  
  // Fix escaped quotes inside tag: \"tag\"
  fixedRaw = fixedRaw.replace(
    /(  - "[^"]*)\\"([^"]*"$)/gm,
    '$1$2'
  );
  
  // Fix merged tags: "tag1"  - "tag2"
  fixedRaw = fixedRaw.replace(
    /(  - "[^"]*")\s{2,}-\s+"([^"]*)"/g,
    '$1\n  - "$2"'
  );
  
  // Fix merged tags with escaped quotes: "tag1"  - \"tag2\"
  fixedRaw = fixedRaw.replace(
    /(  - "[^"]*")\s{2,}-\s+\\"([^"]*)\\"/g,
    '$1\n  - "$2"'
  );
  
  // Fix any tag that has \\" in it
  fixedRaw = fixedRaw.replace(
    /(  - ")([^"]*\\")([^"]*")/g,
    (match, prefix, middle, suffix) => {
      const fixed = middle.replace(/\\"/g, '"');
      return prefix + fixed + suffix;
    }
  );
  
  if (fixedRaw !== raw) {
    fs.writeFileSync(filepath, fixedRaw, 'utf8');
    fixed++;
    console.log(`Fixed: ${file}`);
  }
}

console.log(`\nDone. Fixed ${fixed} files.`);