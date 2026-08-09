/**
 * /api/track-click — Log affiliate link clicks
 *
 * POST /api/track-click
 * Body: { slug, timestamp, ip, userAgent, referrer }
 *
 * Storage: Vercel KV (Upstash Redis) — free tier: 30K req/day
 * Setup: Enable KV in Vercel dashboard → Settings → Storage → Create Database
 *        Env vars auto-set: KV_REST_API_URL + KV_REST_API_TOKEN
 *
 * Falls back to console logging if KV not configured.
 * Stats dashboard: /admin/stats
 */

export const prerender = false;

import type { APIRoute } from 'astro';

interface ClickEntry {
  slug: string;
  timestamp: string;
  ip: string;
  userAgent: string;
  referrer: string;
}

// Try to import Vercel KV (available when KV is enabled in Vercel dashboard)
let kv: any = null;
try {
  const kvModule = await import('@vercel/kv');
  kv = kvModule.kv;
} catch {
  // KV not installed — will use console fallback
}

export const POST: APIRoute = async ({ request }) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  try {
    const body = await request.json();
    const { slug, timestamp, ip, userAgent, referrer } = body;

    if (!slug || !timestamp) {
      return new Response(JSON.stringify({ ok: false, error: 'Missing slug or timestamp' }), {
        status: 400,
        headers,
      });
    }

    const entry: ClickEntry = {
      slug,
      timestamp,
      ip: ip || 'unknown',
      userAgent: userAgent || 'unknown',
      referrer: referrer || 'direct',
    };

    if (kv) {
      // Vercel KV — append to list
      await kv.lpush(`clicks:${slug}`, JSON.stringify(entry));
      await kv.lpush('clicks:all', JSON.stringify(entry));

      // Trim to last 10K entries per key
      await kv.ltrim(`clicks:${slug}`, 0, 9999);
      await kv.ltrim('clicks:all', 0, 9999);

      // Increment counters
      await kv.incr(`clicks:count:${slug}`);
      await kv.incr('clicks:count:total');

      // Daily counter (YYYY-MM-DD)
      const day = timestamp.split('T')[0];
      await kv.incr(`clicks:day:${day}`);
      await kv.incr(`clicks:day:${slug}:${day}`);
    }

    // Always log to console (Vercel dashboard → Functions → Logs)
    console.log(`[track-click] ${slug} ref=${referrer} ip=${ip} ua=${userAgent?.substring(0, 50)}`);

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers });

  } catch (err) {
    console.error('[track-click] Error:', err);
    return new Response(JSON.stringify({ ok: false, error: 'Server error' }), {
      status: 500,
      headers,
    });
  }
};

export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};
