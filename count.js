const fs = require('fs');
const content = fs.readFileSync('src/content/blog/zed-just-got-gpt-5-6-luna-and-self-hosted-ai-models.mdx', 'utf8');
const parts = content.split('---');
const body = parts.slice(2).join('---');
const clean = body
  .replace(/```[\s\S]*?```/g, '')
  .replace(/`[^`]*`/g, '')
  .replace(/[#*\[\]()_~]/g, '')
  .replace(/\|.*\|/g, '');
const words = clean.split(/\s+/).filter(w => w.length > 0).length;
console.log('Word count (body):', words);
