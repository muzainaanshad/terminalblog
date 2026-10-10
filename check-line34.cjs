const fs = require('fs');
const files = fs.readdirSync('src/content/blog');
for (const file of files) {
  if (file.endsWith('.mdx')) {
    const content = fs.readFileSync('src/content/blog/' + file, 'utf8');
    const lines = content.split('\n');
    if (lines.length >= 34) {
      const line34 = lines[33];
      if (line34.includes('<') && !line34.includes('`<') && !line34.includes('\\<') && line34.trim().startsWith('>')) {
        console.log(file + ': ' + line34.substring(0, 60));
      }
    }
  }
}