/**
 * Vercel Serverless (ESM): Beehiiv subscribe proxy.
 * Env: BEEHIIV_API_KEY, BEEHIIV_PUBLICATION_ID
 *
 * POST /api/newsletter  { "email": "you@example.com" }
 */

export default async function handler(req, res) {
  const origin = req.headers?.origin || '';
  const allowed = new Set([
    'https://terminalblog.com',
    'https://www.terminalblog.com',
    'http://localhost:4321',
    'http://localhost:3000',
  ]);
  res.setHeader(
    'Access-Control-Allow-Origin',
    allowed.has(origin) ? origin : 'https://terminalblog.com'
  );
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  const send = (status, body) => {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify(body));
  };

  try {
    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      return res.end();
    }
    if (req.method !== 'POST') {
      return send(405, { ok: false, error: 'Method not allowed' });
    }

    const apiKey = process.env.BEEHIIV_API_KEY;
    const publicationId = process.env.BEEHIIV_PUBLICATION_ID;
    if (!apiKey || !publicationId) {
      return send(503, {
        ok: false,
        error: 'Newsletter not configured (missing Beehiiv env vars)',
      });
    }

    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = body ? JSON.parse(body) : {};
      } catch {
        return send(400, { ok: false, error: 'Invalid JSON body' });
      }
    }
    if (body == null) body = {};

    const email = String(body.email || '')
      .trim()
      .toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return send(400, { ok: false, error: 'Valid email required' });
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
      return send(200, {
        ok: true,
        message: 'Subscribed — check your inbox to confirm if required.',
        status: data?.data?.status || 'active',
      });
    }

    const msg =
      data?.errors?.[0]?.message ||
      data?.error ||
      beeRes.statusText ||
      'Beehiiv error';

    if (beeRes.status === 400 && /already|exist|subscribed/i.test(String(msg))) {
      return send(200, { ok: true, message: 'You are already subscribed.' });
    }

    console.error('Beehiiv error', beeRes.status, JSON.stringify(data));
    return send(
      beeRes.status >= 400 && beeRes.status < 600 ? beeRes.status : 502,
      { ok: false, error: msg }
    );
  } catch (e) {
    console.error('newsletter handler crash', e);
    return send(500, { ok: false, error: e?.message || 'Server error' });
  }
}
