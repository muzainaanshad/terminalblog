#!/usr/bin/env node
// Share Browser AI Coding Agents comparison via MyMarky (X + LinkedIn)
const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const KEY = 'mk_live_2HrW1PDCF5i4rMu809NIDtvxtu0-rdnZOGURht6RWmE';
const API = 'https://api.mymarky.ai/api/businesses/' + BIZ_ID + '/posts';
const HEADERS = { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' };
const ARTICLE = 'https://terminalblog.com/blog/browser-ai-coding-agents-bolt-replit-v0-lovable/';

const POSTS = [
  {
    // X/Twitter: key takeaways + link
    caption:
'Your browser just became an AI coding agent. Bolt.new, Replit Agent, v0.dev, Lovable — compared on real projects 🧵\n\n' +
'Bolt = 60-sec live URL, zero backend\n' +
'Replit = ONLY one with real DB + auth + cron + secrets\n' +
'v0 = shadcn components you\'d actually write\n' +
'Lovable = non-technical founder → SaaS skeleton in 30 min\n\n' +
'Stop picking one. Chain them:\n' +
'1. v0 → design system\n' +
'2. Cursor/Claude → backend\n' +
'3. Bolt → throwaway prototype\n' +
'4. Replit → staging env\n' +
'5. Lovable → validate idea\n\n' +
'Full breakdown: ' + ARTICLE + '\n\n' +
'#CodingAgents #AI #DevTools #Bolt #Replit #v0 #Lovable #BrowserIDE #SaaS',
    link: ARTICLE,
    metadata: { format: 'comparison', tool: 'browser-agents', type: 'guide' },
  },
  {
    // LinkedIn: personal take, no links in body
    caption:
    'I\'ve spent the last month building real projects with all four browser-based AI coding agents. Here\'s what the marketing pages won\'t tell you.\n\n' +
    'The category is real: you type a prompt in a browser tab, get a file tree, a running dev server, and a live URL. No git, no terminal, no local setup. But they solve fundamentally different problems.\n\n' +
    'Bolt.new is the speed demon. 30 seconds to a live React/Next.js/Vue app. But no backend, no database, no secrets, and refresh the tab and your session might vanish. It\'s for prototypes and stakeholder demos \u2014 not production.\n\n' +
    'Replit Agent is the only one with a real backend. Provisioned PostgreSQL, Clerk/Auth.js auth, secrets vault with rotation, scheduled cron jobs that actually run, always-on VM (no cold starts), and git sync to GitHub. It\'s the only one you can build a real SaaS on end-to-end. The trade-off: 2-3 minutes to first preview, opinionated Node/TS/Postgres stack, and pricing that scales fast.\n\n' +
    'v0.dev is for designers and frontend devs who use Next.js + Tailwind + shadcn. It generates component *pieces* \u2014 data tables, forms, charts, navbars \u2014 with clean Radix+Tailwind code you\'d actually write. No backend, no full-app preview, no deployment. But the components are production-grade.\n\n' +
    'Lovable targets non-technical founders. "SaaS for dog walkers with Stripe subscriptions" \u2192 full skeleton with Supabase auth+DB, Stripe billing, admin panel, email notifications, one-click Vercel deploy. But zero git workflow, custom logic is painful, and you\'re locked into their OAuth for Supabase/Stripe.\n\n' +
    'The honest truth: none of them replace git. All generate code you\'ll rewrite 40-60% before production. Free tiers last a week of real work. Budget $50-200/mo if you\'re serious.\n\n' +
    'My actual workflow: v0 for design system \u2192 Cursor for backend \u2192 Bolt for throwaway prototypes \u2192 Replit for staging \u2192 Lovable for idea validation. Chain the right tool to the right phase.\n\n' +
    'The browser didn\'t kill the terminal. It killed the "blank repository" phase.\n\n' +
    '#AI #CodingAgents #DeveloperTools #SaaS #Startup #ProductDevelopment #v0 #Bolt #Replit #Lovable #SoftwareEngineering',
    metadata: { format: 'personal-take', platform: 'linkedin', tool: 'browser-agents', type: 'guide' },
  },
];

(async () => {
  const now = Date.now();
  const results = [];
  for (let i = 0; i < POSTS.length; i++) {
    const p = POSTS[i];
    const scheduled = new Date(now + (5 + i * 60) * 60000).toISOString();
    const payload = {
      caption: p.caption,
      link: p.link || undefined,
      status: 'SCHEDULED',
      scheduled_publish_time: scheduled,
      metadata: p.metadata,
    };
    try {
      const r = await fetch(API, { method: 'POST', headers: HEADERS, body: JSON.stringify(payload) });
      const data = await r.json();
      results.push({ i: i + 1, http: r.status, id: data.id || (data.data && data.data.id) || 'FAILED', error: data.error || null });
      console.log('Post ' + (i + 1) + ': HTTP ' + r.status + ' | id=' + results[i].id + ' | sched=' + scheduled);
    } catch (e) {
      results.push({ i: i + 1, http: 0, id: 'ERROR', error: String(e) });
      console.log('Post ' + (i + 1) + ': ERROR ' + e);
    }
  }
  console.log('SUMMARY:', JSON.stringify(results, null, 1));
})().catch((e) => { console.error('Fatal:', e); process.exit(1); });