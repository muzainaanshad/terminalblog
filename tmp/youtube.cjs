const fs = require('fs');
const text = fs.readFileSync('tmp/orchestrator-output.json', 'utf8');
const sections = text.split(/=== SIGNAL STREAM \d\/\d ===/);
const yt = JSON.parse(sections[5].trim());
console.log('totalResults:', yt.totalResults);
yt.results.forEach((r,i) => {
  console.log(`\n[${i+1}] ${r.title}`);
  console.log('   channel:', r.channel);
  console.log('   views:', r.views);
  console.log('   published:', r.published);
  console.log('   url:', r.url);
});
