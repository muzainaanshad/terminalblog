#!/usr/bin/env node
/**
 * Post Qwen Code v0.26 article to X (Twitter) and LinkedIn via MyMarky API
 * Usage: node scripts/post-qwen-v026-social.cjs
 */

const https = require('https');

const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const API_KEY = 'mk_live_w61K61zmWDi-I-pviWXoYQX7UmU2mJ-xOAVyNdsKVpY';
const API_BASE = 'https://api.mymarky.ai';

function apiRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${API_BASE}${path}`);
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method,
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });

    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function postToTwitter(text) {
  const resp = await apiRequest('POST', `/api/businesses/${BIZ_ID}/posts`, {
    caption: text,
    restrict_publish_to: ['twitter'],
    status: 'NEW',
  });
  return resp;
}

async function postToLinkedIn(text) {
  const resp = await apiRequest('POST', `/api/businesses/${BIZ_ID}/posts`, {
    caption: text,
    restrict_publish_to: ['linkedIn'],
    status: 'NEW',
  });
  return resp;
}

const ARTICLE = {
  slug: 'qwen-code-v0-26-managed-agent-desktop-local-ssh',
  title: 'Qwen Code v0.26 — Managed Agent Platform Goes Operable',
  url: 'https://terminalblog.com/blog/qwen-code-v0-26-managed-agent-desktop-local-ssh/',
  twitter: `Qwen Code v0.26 just made "run agent teams on your own server" real

Managed agents with durable sessions + failover + cold restore
Desktop app v0.26 (native GUI)
Local + SSH workspace references — point at any repo, anywhere
Session-targeted skill refresh (no restart)
--check preflight for CI/CD gates
systemd units for self-hosted deployments
8 MiB attachments, models.dev catalog

Zero breaking changes. Runs 100% local. Free. Apache-2.0.

Read more: ${this.url}`,
  linkedin: `Qwen Code v0.26.0 (October 21) completes the shift from "impressive demo" to "I can run this in production on my own server."

  If v0.25 gave you workspace agents, Mem0, and A2A (the multi-agent platform), v0.26 gives you the infrastructure to actually operate it:

  What's actually new that matters:

  Managed agents are now production-grade — Durable shell results survive restarts. Private MCP per workspace. Verified cold restore. ACP child isolation. File history & undo. Turn takeover & failover. Durable hooks. Offline recovery bundles. Broker auth for multi-tenancy. Durability is now the default — zero config.

  Desktop app v0.26 — Native GUI with full platform access (managed agents, workspace agents, Mem0, A2A). Separate release channel.

  Local + SSH workspace references — Point a managed agent at /home/user/project OR ssh://user@server:/home/user/project. It works with those files directly. No scp, no rsync, no Docker volumes.

  Session-targeted skill refresh — Update skills/extensions for ONE session without restarting others. Security team pushes new audit skill? Refresh only the security session.

  --check preflight — qwen-code --managed --check prints PASS/WARN/FAIL/SKIP for deployment readiness. Gate your CI/CD on it.

  systemd units for self-hosting — Run the entire managed-agent stack on your own Linux box. Runtime workers survive Broker restarts. No cloud, no account, no subscription.

  8 MiB attachments — Large logs, screenshots, binary data in managed agent submissions.

  models.dev catalog — New models (Gemini 4, Opus 5.5, GPT-6, Nemotron 3 Ultra) appear automatically. No waiting for Qwen Code releases.

  Zero breaking changes. All v0.25 features carry forward.

  The trajectory:
  v0.24.6 → Managed runtime infrastructure
  v0.24.7 → Hardening
  v0.25.0 → Platform (workspace agents, Mem0, A2A)
  v0.26.0 → Operable platform (desktop, SSH workspaces, --check, systemd, turn recovery evidence)

  Why pay for a cloud agent platform when Qwen Code runs the same patterns locally, free, with your data on your machine, and now with the infrastructure to operate it at scale?

  Read more: ${this.url}`
};

async function main() {
  console.log('Posting Qwen Code v0.26 article to X and LinkedIn...\n');

  // Twitter
  const twitterText = ARTICLE.twitter.replace('${this.url}', ARTICLE.url);
  console.log('Posting to Twitter...');
  try {
    const resp = await postToTwitter(twitterText);
    if (resp.status === 201) {
      console.log(`✅ Twitter: ${resp.body.id}`);
    } else {
      console.error(`❌ Twitter (${resp.status}):`, resp.body);
    }
  } catch (e) {
    console.error(`❌ Twitter error:`, e.message);
  }

  await new Promise(r => setTimeout(r, 1000));

  // LinkedIn
  const linkedinText = ARTICLE.linkedin.replace('${this.url}', ARTICLE.url);
  console.log('Posting to LinkedIn...');
  try {
    const resp = await postToLinkedIn(linkedinText);
    if (resp.status === 201) {
      console.log(`✅ LinkedIn: ${resp.body.id}`);
    } else {
      console.error(`❌ LinkedIn (${resp.status}):`, resp.body);
    }
  } catch (e) {
    console.error(`❌ LinkedIn error:`, e.message);
  }

  console.log('\n✅ Done!');
}

main().catch(e => {
  console.error('Fatal:', e);
  process.exit(1);
});