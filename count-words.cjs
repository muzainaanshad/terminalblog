const fs = require('fs');

function countWords(file) {
  const content = fs.readFileSync(file, 'utf8');
  const fmEnd = content.indexOf('---', 3);
  const body = fmEnd > 0 ? content.slice(fmEnd + 3) : content;
  const words = body
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]*`/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '')
    .replace(/#+/g, '')
    .replace(/[*_~]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 0);
  return words.length;
}

console.log('google-ai-studio:', countWords('src/content/blog/google-ai-studio-github-import-autodeploy.mdx'));
console.log('google-huggingface:', countWords('src/content/blog/google-huggingface-gemma-4-inference-5x.mdx'));