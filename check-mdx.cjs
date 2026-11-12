const fs = require('fs');
const path = require('path');
const blogDir = 'src/content/blog';
const files = fs.readdirSync(blogDir).filter(f => f.endsWith('.mdx'));
for (const file of files) {
  const content = fs.readFileSync(path.join(blogDir, file), 'utf8');
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim().startsWith('```') || line.trim().startsWith('---')) continue;
    if (line.match(/<[a-zA-Z]/) && !line.match(/href=/) && !line.match(/src=/) && !line.match(/^\[.*\]\(.*\)/) && !line.match(/<code>/) && !line.match(/<\/code>/) && !line.match(/<kbd>/) && !line.match(/<\/kbd>/) && !line.match(/<em>/) && !line.match(/<\/em>/) && !line.match(/<strong>/) && !line.match(/<\/strong>/) && !line.match(/<br\s*\/>/) && !line.match(/<hr\s*\/>/)) {
      console.log(file + ':' + (i+1) + ':' + line.substring(0, 150));
    }
  }
}