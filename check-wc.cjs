const fs = require('fs');
const path = require('path');

function extractText(content) {
  const fmEnd = content.indexOf('---', 3);
  const body = fmEnd > 0 ? content.slice(fmEnd + 3) : content;
  return body
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]*`/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '')
    .replace(/#+\s/g, '')
    .replace(/[*_~]/g, '')
    .replace(/\n+/g, ' ')
    .trim();
}

const file1 = fs.readFileSync(path.join(__dirname, 'src/content/blog/hermes-desktop-tooltip-ux-details.mdx'), 'utf8');
const file2 = fs.readFileSync(path.join(__dirname, 'src/content/blog/hermes-skill-system-renovate-overhaul.mdx'), 'utf8');

const text1 = extractText(file1);
const text2 = extractText(file2);

const wc1 = text1.split(/\s+/).length;
const wc2 = text2.split(/\s+/).length;

console.log('hermes-desktop-tooltip-ux-details:', wc1, 'words');
console.log('hermes-skill-system-renovate-overhaul:', wc2, 'words');