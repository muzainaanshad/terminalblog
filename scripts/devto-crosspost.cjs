#!/usr/bin/env node
/**
 * Dev.to cross-post — posts new articles to dev.to
 * Called by blog-article-generator cron after creating articles
 * 
 * Usage:
 *   node scripts/devto-crosspost.cjs                    # cross-post all new since last run
 *   node scripts/devto-crosspost.cjs --slug my-article  # cross-post specific article
 *   node scripts/devto-crosspost.cjs --dry              # preview only
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const ROOT = path.join(__dirname, '..');
const BLOG = path.join(ROOT, 'src', 'content', 'blog');
const API = 'https://dev.to/api/articles';
const STATE_PATH = path.join(ROOT, 'tmp', 'devto-state.json');
const KEY = process.env.DEVTO_API_KEY || '9Kw5MgKzMvJ2g1G8TCUoR3un';

function hasFlag(f) { return process.argv.includes(f); }
function argVal(f) {
  const i = process.argv.indexOf(f);
  return i >= 0 ? process.argv[i + 1] : null;
}

function loadState() {
  try { return JSON.parse(fs.readFileSync(STATE_PATH, 'utf8')); }
  catch { return { posted: [] }; }
}

function saveState(state) {
  fs.mkdirSync(path.dirname(STATE_PATH), { recursive: true });
  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2));
}

function parseFront(content) {
  const m = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return { fields: {}, body: content };
  const fm = m[1];
  const fields = {};
  for (const line of fm.split(/\r?\n/)) {
    const mm = line.match(/^(\w+):\s*"([^"]*)"$/);
    if (mm) fields[mm[1]] = mm[2];
    const arr = line.match(/^tags:\s*\[(.*)\]$/);
    if (arr) fields.tags = arr[1].split(',').map(s => s.trim().replace(/"/g, ''));
  }
  const body = content.slice(m[0].length).trim();
  return { fields, body };
}

function slugTag(t) {
  return t.toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 25);
}

function postToDevTo(article) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(article);
    const req = https.request({
      hostname: 'dev.to',
      path: '/api/articles',
      method: 'POST',
      headers: {
        'api-key': KEY,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
    }, (res) => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ ok: true, url: json.url, id: json.id });
          } else {
            resolve({ ok: false, error: json.error || body.slice(0, 200), status: res.statusCode });
          }
        } catch {
          resolve({ ok: false, error: body.slice(0, 200), status: res.statusCode });
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function main() {
  const dry = hasFlag('--dry');
  const specificSlug = argVal('--slug');
  const state = loadState();
  const posted = new Set(state.posted || []);

  // Find articles to cross-post
  let slugs = [];
  if (specificSlug) {
    slugs = [specificSlug];
  } else {
    // Find all MDX files, filter to those not yet posted
    const files = fs.readdirSync(BLOG).filter(f => f.endsWith('.mdx') && !f.startsWith('.'));
    for (const f of files) {
      const slug = f.replace('.mdx', '');
      if (!posted.has(slug)) {
        slugs.push(slug);
      }
    }
  }

  if (!slugs.length) {
    console.log('No new articles to cross-post');
    return;
  }

  console.log(`Cross-posting ${slugs.length} article(s) to dev.to${dry ? ' (dry run)' : ''}...`);
  
  const results = [];
  for (const slug of slugs) {
    const fp = path.join(BLOG, slug + '.mdx');
    if (!fs.existsSync(fp)) {
      console.log(`  SKIP: ${slug} (file not found)`);
      continue;
    }

    const content = fs.readFileSync(fp, 'utf-8');
    const { fields, body } = parseFront(content);
    const title = fields.title || slug.replace(/-/g, ' ');
    const canonical = `https://terminalblog.com/blog/${slug}/`;
    const tags = (fields.tags || ['ai', 'coding']).map(slugTag).filter(Boolean).slice(0, 4);
    
    // Add terminalblog tag
    if (!tags.includes('terminalblog')) tags.push('terminalblog');

    const article = {
      title,
      published: true,
      tags,
      canonical_url: canonical,
      description: fields.description || title,
      body_markdown: body,
    };

    if (dry) {
      console.log(`  DRY: ${slug} → tags: [${tags.join(', ')}]`);
      results.push({ slug, dry: true });
      continue;
    }

    try {
      const res = await postToDevTo(article);
      if (res.ok) {
        console.log(`  OK: ${slug} → ${res.url}`);
        posted.add(slug);
        results.push({ slug, ok: true, url: res.url });
      } else {
        console.log(`  FAIL: ${slug} → ${res.error}`);
        results.push({ slug, ok: false, error: res.error });
      }
    } catch (e) {
      console.log(`  ERROR: ${slug} → ${e.message}`);
      results.push({ slug, ok: false, error: e.message });
    }

    // Rate limit: 1 request per 30 seconds for dev.to
    if (!dry && slugs.indexOf(slug) < slugs.length - 1) {
      await new Promise(r => setTimeout(r, 30000));
    }
  }

  // Save state
  if (!dry) {
    state.posted = [...posted];
    state.lastRun = new Date().toISOString();
    saveState(state);
  }

  console.log(`\nDone: ${results.filter(r => r.ok).length} posted, ${results.filter(r => !r.ok && !r.dry).length} failed`);
}

main().catch(e => {
  console.error(e.message);
  process.exit(1);
});
