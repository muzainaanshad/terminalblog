#!/usr/bin/env node
/**
 * Fix frontmatter tags format - more robust approach
 * Reads the file, parses frontmatter manually, fixes tags, writes back
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
  
  // Parse frontmatter line by line
  const lines = fm.split('\n');
  const newLines = [];
  let inTags = false;
  let tags = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check for inline tags array
    const inlineMatch = line.match(/^tags:\s*\[([\s\S]*?)\]/);
    if (inlineMatch) {
      const tagsContent = inlineMatch[1];
      tags = tagsContent
        .split(',')
        .map(t => t.trim().replace(/^["']|["']$/g, ''))
        .filter(t => t.length > 0)
        .map(t => t.replace(/\\"/g, '"').replace(/\\\\/g, '\\'));
      inTags = true;
      continue;
    }
    
    // Check for YAML array start
    if (line.match(/^tags:\s*$/)) {
      inTags = true;
      continue;
    }
    
    // If we're in tags section, collect tag lines
    if (inTags) {
      const tagMatch = line.match(/^\s*-\s*"?([^"]*)"?/);
      if (tagMatch) {
        let tag = tagMatch[1];
        tag = tag.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
        if (tag.length > 0) {
          tags.push(tag);
        }
      } else if (!line.match(/^\s*-\s*/) && !line.match(/^\s*$/)) {
        // End of tags section
        inTags = false;
        // Don't continue - we'll process this line below
        i--; // Re-process this line
        continue;
      }
      continue;
    }
    
    newLines.push(line);
  }
  
  if (tags.length === 0) return false;
  
  // Insert tags in proper YAML format before the last non-tags line
  // Find a good place to insert (after description or pubDate)
  const insertIndex = newLines.findIndex(l => l.match(/^(pubDate|updatedDate|tool|author|image|canonical|slug):/)) - 1;
  const finalIndex = insertIndex >= 0 ? insertIndex : newLines.length;
  
  // Build tags section
  const tagsSection = ['tags:'].concat(tags.map(t => `  - "${t.replace(/"/g, '\\"')}"`));
  
  const finalLines = [
    ...newLines.slice(0, finalIndex + 1),
    ...tagsSection,
    ...newLines.slice(finalIndex + 1)
  ];
  
  const newFm = finalLines.join('\n');
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