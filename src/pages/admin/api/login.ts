/**
 * Login API endpoint
 * POST /admin/api/login
 * Body: { password: string }
 * 
 * Sets a cookie on success and returns 200
 * Returns 401 on failure
 */

import type { APIRoute } from 'astro';

export const prerender = false;

const ADMIN_PASSWORD = 'Nopassword.123';

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json();
  const { password } = body;

  if (password === ADMIN_PASSWORD) {
    const encoded = Buffer.from(password).toString('base64');
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': `admin_auth=${encoded}; Path=/admin; HttpOnly; Secure; SameSite=Strict; Max-Age=604800`,
      },
    });
  }

  return new Response(JSON.stringify({ error: 'Invalid password' }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' },
  });
};
