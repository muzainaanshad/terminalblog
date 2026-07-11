const fs = require('fs');
const text = fs.readFileSync('tmp/orchestrator-output.json', 'utf8');
const sections = text.split(/=== SIGNAL STREAM \d\/\d ===/);
sections.forEach((s, i) => {
  if (i === 0) return;
  const firstLine = s.trim().split('\n')[0];
  console.log(`--- PART ${i} starts with: ${firstLine.slice(0,80)}`);
});
