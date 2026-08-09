/**
 * /api/go/[slug] — Affiliate redirect with click tracking
 *
 * GET /api/go/aifiesta → 302 redirect to https://aifiesta.link/muhammed-anshad
 *
 * Logs every click with timestamp, IP, user agent, referrer.
 * Stats dashboard: /admin/stats
 */

export const prerender = false;

import type { APIRoute } from 'astro';
import affiliates from '../../../data/affiliates.json';

export const GET: APIRoute = async ({ params, request, clientAddress }) => {
  const slug = params?.slug;
  const aff = affiliates.affiliates.find(a => a.id === slug);

  if (!aff || aff.status !== 'active') {
    return new Response('Not found', { status: 404 });
  }

  // Log the click asynchronously (don't block redirect)
  const clickData = {
    slug,
    timestamp: new Date().toISOString(),
    ip: clientAddress || 'unknown',
    userAgent: request.headers.get('user-agent') || 'unknown',
    referrer: request.headers.get('referer') || 'direct',
  };

  // Fire-and-forget: log click via internal API
  try {
    const baseUrl = new URL(request.url).origin;
    fetch(`${baseUrl}/api/track-click`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(clickData),
    }).catch(() => {}); // Don't await — redirect immediately
  } catch {
    // Silently fail — redirect anyway
  }

  // 302 redirect to affiliate URL
  return new Response(null, {
    status: 302,
    headers: {
      Location: aff.url,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
};
