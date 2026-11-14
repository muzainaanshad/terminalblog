const fs = require('fs');
function countWords(file) {
  const c = fs.readFileSync(file, 'utf8');
  const i = c.indexOf('---', 3);
  const b = i > 0 ? c.slice(i + 3) : c;
  return b.replace(/```[\s\S]*?```/g, '').replace(/`[^`]*`/g, '').replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/!\[([^\]]*)\]\([^)]*\)/g, '').replace(/#+/g, '').replace(/[*_~]/g, '').split(/\s+/).filter(w => w.length > 0).length;
}
console.log('why-i-stopped:', countWords('src/content/blog/why-i-stopped-using-copilot-went-full-terminal-agent.mdx'));
console.log('hermes-auto:', countWords('src/content/blog/hermes-auto-scrolling-tool-window.mdx'));