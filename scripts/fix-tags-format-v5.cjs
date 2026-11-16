#!/usr/bin/env node
/**
 * Fix frontmatter tags format - convert from inline array with escaped quotes to proper YAML array
 * Also fix YAML array with escaped quotes
 * More robust version that handles edge cases
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
  
  let newFm = fm;
  let changed = false;
  
  // Check for inline array format with escaped quotes: tags: ["\"tag1\\"", "\"tag2\\""]
  const inlineMatch = fm.match(/^tags:\s*\[([\s\S]*?)\]/m);
  if (inlineMatch) {
    const tagsContent = inlineMatch[1];
    // Parse the tags from the inline array
    const tags = tagsContent
      .split(',')
      .map(t => t.trim().replace(/^["']|["']$/g, ''))
      .filter(t => t.length > 0)
      .map(t => t.replace(/\\"/g, '"').replace(/\\\\/g, '\\'));
    
    // Build new frontmatter with proper YAML array
    newFm = fm.replace(
      /^tags:\s*\[[\s\S]*?\]/m,
      'tags:\n' + tags.map(t => `  - "${t.replace(/"/g, '\\"')}"`).join('\n')
    );
    changed = true;
  } else {
    // Check if tags is already in YAML array format but with escaped quotes
    const yamlArrayMatch = fm.match(/^tags:\s*\n((?:  - .*\n)+)/m);
    if (yamlArrayMatch) {
      const tagsBlock = yamlArrayMatch[1];
      // Check if the tags have escaped quotes that need fixing
      if (tagsBlock.includes('\\"') || tagsBlock.includes('\\\\')) {
        newFm = fm.replace(
          /^tags:\s*\n((?:  - .*\n)+)/m,
          (match, tagsBlock) => {
            const fixedTags = tagsBlock
              .split('\n')
              .filter(line => line.trim().startsWith('-'))
              .map(line => {
                // Remove leading "  - " and fix quotes
                let tag = line.replace(/^  - /, '');
                tag = tag.replace(/^"(.*)"$/, '$1'); // Remove outer quotes
                tag = tag.replace(/\\"/g, '"'); // Fix escaped quotes
                tag = tag.replace(/\\\\/g, '\\'); // Fix double backslashes
                return `  - "${tag}"`;
              })
              .join('\n');
            return 'tags:\n' + fixedTags + '\n'; // Ensure trailing newline
          }
        );
        changed = true;
      }
    }
  }
  
  if (!changed) return false;
  
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