# Admin Dashboard Package

A reusable admin dashboard for Astro sites. Drop it into any Astro project.

## Installation

```bash
# Copy these files to your Astro project
cp -r src/middleware/auth.ts YOUR_PROJECT/src/middleware/
cp -r src/pages/admin YOUR_PROJECT/src/pages/
```

## Configuration

Set the admin password via environment variable:

```bash
# .env
ADMIN_PASSWORD=your-secure-password-here
```

Or edit `src/middleware/auth.ts` to change the default password.

## Features

- Password-protected admin pages
- Simple cookie-based auth
- Terminal theme (dark, green, amber)
- Customizable dashboard
- Mobile responsive

## Customization

### Change Theme

Edit the colors in `src/pages/admin/index.astro`:

```astro
<!-- Primary color: #22c55e (green) -->
<!-- Background: #0a0a0a (dark) -->
<!-- Accent: #f59e0b (amber) -->
```

### Add Your Crons

Edit the table in `src/pages/admin/index.astro` to add your own crons.

### Reuse Across Multiple Sites

1. Create a shared repo with the admin files
2. Copy to each project
3. Set different passwords per site

## File Structure

```
src/
├── middleware/
│   └── auth.ts              # Auth middleware
└── pages/
    └── admin/
        ├── index.astro      # Dashboard
        ├── login.astro      # Login page
        └── api/
            └── login.ts     # Login API
```

## Security Notes

- Password is stored in base64 (not secure for production)
- For production, use a proper auth system
- Consider adding rate limiting
- Use HTTPS only

## Astro Config

If using middleware, add to `astro.config.mjs`:

```js
import { defineConfig } from 'astro/config';
import auth from './src/middleware/auth';

export default defineConfig({
  middleware: [auth],
});
```

Or use inline auth check in each page (recommended for simplicity).
