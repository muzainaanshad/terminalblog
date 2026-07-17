/**
 * Simple auth middleware for Astro admin pages
 * 
 * Usage in astro.config.mjs:
 * import { defineConfig } from 'astro/config';
 * import authMiddleware from './src/middleware/auth';
 * 
 * export default defineConfig({
 *   middleware: [authMiddleware],
 * });
 * 
 * Or use inline in any page:
 * ---
 * import { checkAuth } from '../middleware/auth';
 * const isAuth = await checkAuth(Astro.request);
 * if (!isAuth) return Astro.redirect('/admin/login');
 * ---
 */

import type { MiddlewareHandler } from 'astro';

const ADMIN_PASSWORD = 'Nopassword.123';

export const checkAuth = async (request: Request): Promise<boolean> => {
  const cookie = request.headers.get('cookie') || '';
  const match = cookie.match(/admin_auth=([^;]+)/);
  if (match && match[1] === Buffer.from(ADMIN_PASSWORD).toString('base64')) {
    return true;
  }
  return false;
};

const auth: MiddlewareHandler = async ({ request, redirect }, next) => {
  const url = new URL(request.url);
  
  // Skip auth for login page and login API
  if (url.pathname === '/admin/login' || url.pathname === '/admin/api/login') {
    return next();
  }
  
  // Check auth for all other admin pages
  if (url.pathname.startsWith('/admin')) {
    const isAuth = await checkAuth(request);
    if (!isAuth) {
      return redirect('/admin/login');
    }
  }
  
  return next();
};

export default auth;
