#!/usr/bin/env node
/**
 * Post Kilo Code v7.8.27 article to X (Twitter) and LinkedIn via MyMarky API
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

const article = {
  slug: 'kilocode-v7-8-27-critical-security-patch',
  title: 'Kilo Code v7.8.27 Critical Security Patch',
  url: 'https://terminalblog.com/blog/kilocode-v7-8-27-critical-security-patch/',
  twitter: `Kilo Code v7.8.27 just dropped a CRITICAL security patch 🔒\n\n15 high/critical CVEs fixed in ONE release:\n• node-forge (crypto weaknesses)\n• js-yaml (arbitrary code exec)\n• fast-xml-parser (XXE, billion laughs)\n• fastify/express (prototype pollution)\n• shell-quote (command injection)\n• axios, zod, glob, and more\n\nIf you run Kilo Code, update NOW:\n\nnpm update -g @kilocode/cli\n\nThis is supply-chain security in 2026 — agents bundle hundreds of deps, one compromised transitive dep = full repo access.\n\nRead the full breakdown: https://terminalblog.com/blog/kilocode-v7-8-27-critical-security-patch/`,
  linkedin: `Kilo Code v7.8.27 (Nov 5) is a security patch you cannot skip.

**15 critical/high-severity vulnerabilities fixed in a single release.** Every one flagged by Dependabot as actively exploitable:

| Package | Vulnerability | Severity |
|---------|---------------|----------|
| node-forge | Cryptographic weaknesses, prototype pollution | Critical |
| js-yaml | Arbitrary code execution via unsafe load | Critical |
| fast-xml-parser | XXE, billion laughs attack | Critical |
| fastify | Prototype pollution, DoS | Critical |
| express | Prototype pollution, path traversal | Critical |
| shell-quote | Command injection | Critical |
| axios | Prototype pollution, SSRF | High |
| zod | ReDoS in regex validation | High |
| glob | ReDoS, path traversal | High |
| + 6 more | Various high-severity issues | High |

**Why this matters for AI coding agents:**

Agents are uniquely vulnerable to supply-chain attacks because they:
1. Bundle everything — CLI, language servers, model SDKs, terminal emulators, browser automation, MCP clients, git wrappers, SSH clients
2. Update fast — weekly releases mean dependencies rotate constantly
3. Run with HIGH privileges — they read/write your codebase, execute shell commands, access git credentials, SSH keys, API tokens
4. Pull from everywhere — npm, PyPI, crates.io, GitHub releases, Docker Hub

A single compromised transitive dependency in \`fast-xml-parser\` or \`shell-quote\` gives an attacker **full repository access** — exfiltrate source code, inject backdoors, steal API keys, push malicious commits.

**Kilo's response time: 48 hours from advisory to patched release.** That's the new baseline. If your agent vendor takes weeks to patch critical CVEs, switch vendors.

**Update command:**
\`\`\`bash
npm update -g @kilocode/cli
\`\`\`

**Verify the fix yourself:**
- SBOM published (CycloneDX) — check \`kilo-cli-sbom-evidence.json\` from release assets
- Reproducible builds — SHA256SUMS for every artifact
- \`npm audit --audit-level=high\` returns 0 vulnerabilities

Read the full article with verification steps: https://terminalblog.com/blog/kilocode-v7-8-27-critical-security-patch/

#AICoding #Security #SupplyChain #KiloCode #DevSecOps`
};

async function main() {
  console.log(`Posting "${article.title}" to X and LinkedIn...\n`);

  // Twitter
  console.log('Posting to Twitter...');
  try {
    const resp = await postToTwitter(article.twitter);
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
  console.log('Posting to LinkedIn...');
  try {
    const resp = await postToLinkedIn(article.linkedin);
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