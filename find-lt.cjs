const fs = require('fs');
const content = fs.readFileSync('src/content/blog/openclaw-v2026-9-9-gpt61-sol-windows-recovery.mdx', 'utf8');
// Find all '<' characters
for (let i = 0; i < content.length; i++) {
  if (content[i] === '<' && i > 0 && content[i-1] !== '`') {
    const context = content.slice(Math.max(0, i-30), i+30);
    console.log('Pos ' + i + ': ...' + context.replace(/\n/g, '\\n') + '...');
  }
}