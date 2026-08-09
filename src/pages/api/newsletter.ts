/**
 * Newsletter subscribe endpoint — Kit (ConvertKit) v3 API
 *
 * POST /api/newsletter
 * Body: { email: string, source?: string }
 *
 * Env vars needed (Vercel):
 *   KIT_API_KEY   — Kit v3 API key
 *   KIT_FORM_ID   — Kit form ID (numeric, from dashboard URL)
 *
 * Works in "demo mode" if env vars are missing.
 */

// Force server-side rendering — this is a POST-only API route
export const prerender = false;

import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  try {
    const body = await request.json();
    const email = body.email?.trim().toLowerCase();
    const source = body.source || 'unknown';

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(JSON.stringify({ ok: false, error: 'Invalid email address.' }), {
        status: 400,
        headers,
      });
    }

    const apiKey = process.env.KIT_API_KEY || 'YByciIO2zLOV2CjPOtUcZw';
    const formId = process.env.KIT_FORM_ID || '9758065';

    // Demo mode — no Kit configured or form ID is placeholder
    if (!apiKey || !formId || formId === 'placeholder' || !/^\d+$/.test(formId)) {
      console.log(`[newsletter] DEMO — would subscribe: ${email} (source: ${source})`);
      return new Response(JSON.stringify({
        ok: true,
        message: "Thanks! You're subscribed. (Demo mode — Kit not configured yet.)",
        demo: true,
      }), { status: 200, headers });
    }

    // Kit v3 — subscribe to form (api_key goes in body, NOT query string)
    const kitUrl = `https://api.convertkit.com/v3/forms/${formId}/subscribe`;
    const kitRes = await fetch(kitUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: apiKey,
        email,
        first_name: '',
      }),
    });

    const kitData = await kitRes.json().catch(() => ({}));

    if (kitRes.ok && (kitData.subscription || kitData.success !== false)) {
      return new Response(JSON.stringify({
        ok: true,
        message: "You're subscribed! Check your inbox for the welcome email.",
      }), { status: 200, headers });
    }

    // Already subscribed
    if (kitData.message?.includes('already') || kitData.message?.includes('exists')) {
      return new Response(JSON.stringify({
        ok: true,
        message: "You're already subscribed! Check your inbox.",
      }), { status: 200, headers });
    }

    console.error(`[newsletter] Kit error ${kitRes.status}:`, JSON.stringify(kitData));
    return new Response(JSON.stringify({
      ok: false,
      error: 'Something went wrong. Please try again.',
    }), { status: 502, headers });

  } catch (err) {
    console.error('[newsletter] Error:', err);
    return new Response(JSON.stringify({
      ok: false,
      error: 'Network error. Please try again.',
    }), { status: 500, headers });
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
