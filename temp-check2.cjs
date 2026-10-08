const https = require('https');

function fetch(url) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'terminalblog-cron',
        'Accept': 'application/vnd.github.v3+json'
      }
    };
    https.get(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({status: res.statusCode, data}));
    }).on('error', reject);
  });
}

async function check() {
  const repos = [
    {name: 'goose', url: 'https://api.github.com/repositories/846698999/releases'},
    {name: 'openhands', url: 'https://api.github.com/repositories/771302083/releases'}
  ];

  for (const repo of repos) {
    try {
      const result = await fetch(repo.url);
      if (result.status !== 200) {
        console.log(`${repo.name}: HTTP ${result.status} - ${result.data.substring(0, 100)}`);
        continue;
      }
      const releases = JSON.parse(result.data);
      if (Array.isArray(releases)) {
        releases.slice(0, 5).forEach(r => {
          console.log(`${repo.name}: ${r.tag_name} ${r.published_at} ${r.prerelease ? '(pre)' : ''}`);
        });
      }
    } catch (e) {
      console.log(`${repo.name}: ERROR - ${e.message}`);
    }
  }
}

check();