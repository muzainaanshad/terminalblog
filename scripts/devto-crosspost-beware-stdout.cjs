const fs = require('fs');

const body = fs.readFileSync(process.argv[2], 'utf8');

const payload = {
  article: {
    title: "Beware: Claude Code's `claude -p` Silently Truncates Output at 65,536 Bytes",
    body_markdown: body,
    published: true,
    tags: ["security", "productivity", "linux"],
    canonical_url: "https://terminalblog.com/blog/claude-code-stdout-silent-truncation/",
  },
};

const data = JSON.stringify(payload);

const req = require('https').request(
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
    res.on('end', () => {
      console.log('HTTP', res.statusCode);
      console.log('HEADERS', JSON.stringify(res.headers).slice(0, 400));
      console.log(out.slice(0, 1000));
    });
  }
);
req.on('error', (e) => console.error('ERR', e.message));
req.write(data);
req.end();
