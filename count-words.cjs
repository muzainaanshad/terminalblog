const fs = require('fs');
function countWords(file) {
  const content = fs.readFileSync(file, 'utf8');
  const fmEnd = content.indexOf('---', 3);
  const body = fmEnd > 0 ? content.slice(fmEnd + 3) : content;
  const text = body
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]*`/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '')
    .replace(/#+\s/g, '')
    .replace(/[*_~]/g, '')
    .replace(/\n+/g, ' ');
  const words = text.split(/\s+/).filter(w => w.length > 0);
  return words.length;
}
console.log('Codex:', countWords('src/content/blog/beware-codex-desktop-windows-silent-exit-node-leak.mdx'));
console.log('Oh My Pi:', countWords('src/content/blog/oh-my-pi-hard-blocking-model-exemptions.mdx'));