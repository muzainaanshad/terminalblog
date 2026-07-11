const fs = require('fs');
const text = fs.readFileSync('tmp/orchestrator-output.json', 'utf8');
const parts = text.split(/\n=== SIGNAL STREAM \d\/\d ===\n/);
const streams = ['STREAM1(commits)', 'STREAM2(discussions)', 'STREAM3(issues)', 'STREAM4(blogs)', 'STREAM5(youtube)'];
for (let i = 1; i <= 5; i++) {
  console.log('==== ' + streams[i - 1] + ' ====');
  console.log(parts[i]);
  console.log();
}
