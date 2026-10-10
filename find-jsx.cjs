const fs = require('fs');
const files = fs.readdirSync('src/content/blog').filter(f => f.endsWith('.mdx'));
for (const f of files) {
  const content = fs.readFileSync('src/content/blog/' + f, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, i) => {
    for (let j = 0; j < line.length; j++) {
      if (line[j] === '<' && j+1 < line.length) {
        const next = line[j+1];
        if (/[a-zA-Z]/.test(next) && !line.trim().startsWith('>') && !line.includes('</')) {
          console.log(f + ':' + (i+1) + ':' + (j+1) + ' -> ' + line.substring(Math.max(0,j-5), j+40));
        }
      }
    }
  });
}