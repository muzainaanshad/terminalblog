/**
 * Vercel Serverless: Beehiiv subscribe proxy.
 * Env: BEEHIIV_API_KEY, BEEHIIV_PUBLICATION_ID
 *
 * POST /api/newsletter  { "email": "you@example.com" }
 */

const ALLOWED_ORIGINS = new Set([
  'https://terminalblog.com',
  'https://www.terminalblog.com',
  'http://localhost:4321',
  'http://localhost:3000',
]);

function setCors(req, res) {
  const origin = req.headers.origin || '';
  if (ALLOWED_ORIGINS.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', 'https://terminalblog.com');
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function send(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

function isEmail(s) {
  return typeof s === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
}

async function readJsonBody(req) {
  if (req.body != null) {
    if (typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
      return req.body;
    }
    if (typeof req.body === 'string') {
      return req.body ? JSON.parse(req.body) : {};
    }
    if (Buffer.isBuffer(req.body)) {
      const s = req.body.toString('utf8');
      return s ? JSON.parse(s) : {};
    }
  }

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  if (!chunks.length) return {};
  const raw = Buffer.concat(chunks).toString('utf8').trim();
  if (!raw) return {};
  return JSON.parse(raw);
}

module.exports = async function handler(req, res) {
  setCors(req, res);

  try {
    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      return res.end();
    }

    if (req.method !== 'POST') {
      return send(res, 405, { ok: false, error: 'Method not allowed' });
    }

    const apiKey = process.env.BEEHIIV_API_KEY;
    const publicationId = process.env.BEEHIIV_PUBLICATION_ID;

    if (!apiKey || !publicationId) {
      return send(res, 503, {
        ok: false,
        error: 'Newsletter not configured (missing Beehiiv env vars)',
      });
    }

    let body;
    try {
      body = await readJsonBody(req);
    } catch {
      return send(res, 400, { ok: false, error: 'Invalid JSON body' });
    }

    const email = String(body?.email || '')
      .trim()
      .toLowerCase();
    if (!isEmail(email)) {
      return send(res, 400, { ok: false, error: 'Valid email required' });
    }

    const beeRes = await fetch(
      `https://api.beehiiv.com/v2/publications/${publicationId}/subscriptions`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          reactivate_existing: true,
          send_welcome_email: true,
          utm_source: 'terminalblog',
          utm_medium: 'website',
          utm_campaign: 'homepage_newsletter',
          referring_site: 'https://terminalblog.com/',
        }),
      }
    );

    const data = await beeRes.json().catch(() => ({}));

    if (beeRes.ok) {
      return send(res, 200, {
        ok: true,
        message: 'Subscribed — check your inbox to confirm if required.',
        status: data?.data?.status || 'active',
      });
    }

    const msg =
      data?.errors?.[0]?.message ||
      data?.error ||
      data?.statusText ||
      beeRes.statusText ||
      'Beehiiv error';

    if (beeRes.status === 400 && /already|exist|subscribed/i.test(String(msg))) {
      return send(res, 200, { ok: true, message: 'You are already subscribed.' });
    }

    console.error('Beehiiv error', beeRes.status, JSON.stringify(data));
    return send(res, beeRes.status >= 400 && beeRes.status < 600 ? beeRes.status : 502, {
      ok: false,
      error: msg,
    });
  } catch (e) {
    console.error('newsletter handler crash', e);
    return send(res, 500, { ok: false, error: e.message || 'Server error' });
  }
};
