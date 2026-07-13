const https = require('https');
const minimal = {
  article: {
    title: 'Beware Claude Code pipe truncation 65536',
    body_markdown: 'Claude Codes claude -p silently drops stdout past 65536 bytes when piped. No error, exits 0. Redirect to a file to avoid data loss. See issue 77112.',
    published: true,
    tags: ['linux'],
  },
};
const data = JSON.stringify(minimal);
const req = https.request(
  {
    hostname: 'dev.to',
    path: '/api/articles',
    method: 'POST',
    headers: {
      'api-key': '9Kw5MgKzMvJ2g1G8TCUoR3un',
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data),
    },
  },
  (res) => {
    let out = '';
    res.on('data', (c) => (out += c));
    res.on('end', () => console.log('HTTP', res.statusCode, out.slice(0, 500)));
  }
);
req.on('error', (e) => console.error('ERR', e.message));
req.write(data);
req.end();
