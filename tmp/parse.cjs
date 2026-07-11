const fs = require('fs');
const text = fs.readFileSync('tmp/orchestrator-output.json', 'utf8');
const sections = text.split(/=== SIGNAL STREAM \d\/\d ===/);
const names = ['commits','discussions','issues','blogs','youtube'];
sections.forEach((s, i) => {
  if (i === 0) return;
  const jsonStr = s.trim();
  try {
    const obj = JSON.parse(jsonStr);
    console.log(`\n##### STREAM ${i} (${names[i-1]}) #####`);
    console.log('keys:', Object.keys(obj).join(', '));
    if (obj.window) console.log('window:', obj.window);
    if (obj.totalResults!==undefined) console.log('totalResults:', obj.totalResults, 'hn:', obj.hn, 'reddit:', obj.reddit);
    if (obj.totalCommits!==undefined) console.log('totalCommits:', obj.totalCommits);
    if (obj.totalIssues!==undefined) console.log('totalIssues:', obj.totalIssues);
    if (obj.totalNewPosts!==undefined) console.log('totalNewPosts:', obj.totalNewPosts, 'blogsWithUpdates:', obj.blogsWithUpdates);
    if (obj.error) console.log('ERROR:', obj.error);
  } catch(e) {
    console.log(`\n##### STREAM ${i} FAILED TO PARSE:`, jsonStr.slice(0,200));
  }
});
