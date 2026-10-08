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
    'opencode-ai/opencode',
    'Open-Claw/OpenClaw',
    'pi-dev/pi',
    'jesseduffield/lazygit',
    'anthropics/claude-code',
    'openai/codex',
    'block/goose',
    'Kilo-Org/kilocode',
    'All-Hands-AI/OpenHands',
    'zed-industries/zed',
    'cline/cline',
    'github/copilot-cli'
  ];

  for (const repo of repos) {
    try {
      const result = await fetch(`https://api.github.com/repos/${repo}/releases`);
      if (result.status !== 200) {
        console.log(`${repo}: HTTP ${result.status} - ${result.data.substring(0, 100)}`);
        continue;
      }
      const releases = JSON.parse(result.data);
      if (Array.isArray(releases) && releases.length > 0) {
        const r = releases[0];
        console.log(`${repo}: ${r.tag_name} ${r.published_at} ${r.prerelease ? '(pre)' : ''}`);
      }
    } catch (e) {
      console.log(`${repo}: ERROR - ${e.message}`);
    }
  }
}

check();