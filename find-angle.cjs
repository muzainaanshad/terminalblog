const fs = require('fs');
const content = fs.readFileSync('src/content/blog/codex-0-161-gpt61-sol-default-daybreak-mcp-login.mdx', 'utf8');
const lines = content.split('\n');
lines.forEach((line, i) => {
  // Find any bare < character not in markdown link
  if (line.includes('<') && !line.includes('[')) {
    console.log(i+1 + ': ' + line.trim());
  }
});