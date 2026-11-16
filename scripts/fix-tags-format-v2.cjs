#!/usr/bin/env node
/**
 * Fix frontmatter tags format - convert from stringified array to proper YAML array
 * Also fix double-escaped quotes
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
  
  // Check if tags is in the broken format (stringified array)
  const tagsMatch = fm.match(/^tags:\s*"\[([\s\S]*?)\]"/m);
  if (!tagsMatch) {
    // Check if tags is already in YAML array format but with escaped quotes
    const yamlArrayMatch = fm.match(/^tags:\s*\n((?:  - .*\n)+)/m);
    if (yamlArrayMatch) {
      // Check if the tags have double-escaped quotes
      const tagsBlock = yamlArrayMatch[1];
      if (tagsBlock.includes('\\\\"')) {
        // Fix double-escaped quotes
        let newFm = fm.replace(
          /^tags:\s*\n((?:  - .*\n)+)/m,
          (match, tagsBlock) => {
            const fixedTags = tagsBlock
              .split('\n')
              .filter(line => line.trim().startsWith('-'))
              .map(line => line.replace(/\\\\"/g, '"'))
              .join('\n');
            return 'tags:\n' + fixedTags;
          }
        );
        const newRaw = '---\n' + newFm + '\n---' + body;
        fs.writeFileSync(filepath, newRaw, 'utf8');
        return true;
      }
    }
    return false;
  }
  
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