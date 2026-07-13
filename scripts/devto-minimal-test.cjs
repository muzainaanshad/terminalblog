const https = require('https');
const minimal = {
  article: {
    title: 'Test minimal post',
    body_markdown: 'Just a test.\n\nHello world.',
    published: false,
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
      'Accept': 'application/vnd.forem.api-v1+json',
      'Content-Length': Buffer.byteLength(data),
    },
  },
  (res) => {
    let out = '';
    res.on('data', (c) => (out += c));
    res.on('end', () => console.log('HTTP', res.statusCode, out.slice(0, 400)));
  }
);
req.on('error', (e) => console.error('ERR', e.message));
req.write(data);
req.end();
