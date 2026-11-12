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
    if (line.match(/<[0-9]/) && !line.match(/href=/) && !line.match(/src=/)) {
      console.log(file + ':' + (i+1) + ':' + line.substring(0, 150));
    }
  }
}