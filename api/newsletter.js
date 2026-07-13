/**
 * Vercel Serverless: Beehiiv subscribe proxy.
 * Secrets stay server-side (BEEHIIV_API_KEY, BEEHIIV_PUBLICATION_ID).
 *
 * POST /api/newsletter  { "email": "you@example.com" }
 */

const ALLOWED_ORIGIN = process.env.NEWSLETTER_CORS_ORIGIN || 'https://terminalblog.com';

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function json(res, status, body) {
  cors(res);
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

function isEmail(s) {
  return typeof s === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
}

module.exports = async function handler(req, res) {
  cors(res);

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  if (req.method !== 'POST') {
    return json(res, 405, { ok: false, error: 'Method not allowed' });
  }

  const apiKey = process.env.BEEHIIV_API_KEY;
  const publicationId = process.env.BEEHIIV_PUBLICATION_ID;

  if (!apiKey || !publicationId) {
    return json(res, 503, {
      ok: false,
      error: 'Newsletter not configured (missing Beehiiv env vars)',
    });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      return json(res, 400, { ok: false, error: 'Invalid JSON' });
    }
  }
  // Vercel sometimes leaves body as buffer/object
  if (body && Buffer.isBuffer(body)) {
    try {
      body = JSON.parse(body.toString('utf8'));
    } catch {
      return json(res, 400, { ok: false, error: 'Invalid JSON body' });
    }
  }

  const email = (body?.email || '').trim().toLowerCase();
  if (!isEmail(email)) {
    return json(res, 400, { ok: false, error: 'Valid email required' });
  }

  try {
    const bee = await fetch(
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

    const data = await bee.json().catch(() => ({}));

    if (bee.ok) {
      return json(res, 200, {
        ok: true,
        message: 'Subscribed — check your inbox to confirm if required.',
        status: data?.data?.status || 'active',
      });
    }

    // Beehiiv often returns 400 if already subscribed — treat as soft success
    const msg = data?.errors?.[0]?.message || data?.error || bee.statusText;
    if (bee.status === 400 && /already|exist/i.test(String(msg))) {
      return json(res, 200, { ok: true, message: 'You are already subscribed.' });
    }

    return json(res, bee.status >= 400 && bee.status < 600 ? bee.status : 502, {
      ok: false,
      error: msg || 'Beehiiv error',
    });
  } catch (e) {
    return json(res, 502, { ok: false, error: e.message || 'Upstream error' });
  }
};
