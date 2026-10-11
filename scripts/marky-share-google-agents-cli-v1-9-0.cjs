#!/usr/bin/env node
// Share the Google Agents CLI v1.9.0 release via MyMarky (X + LinkedIn)
const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const KEY = 'mk_live_2HrW1PDCF5i4rMu809NIDtvxtu0-rdnZOGURht6RWmE';
const API = 'https://api.mymarky.ai/api/businesses/' + BIZ_ID + '/posts';
const HEADERS = { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' };
const ARTICLE = 'https://terminalblog.com/blog/google-agents-cli-v1-9-0-telemetry-cmek-dry-run/';

const POSTS = [
  {
    // X/Twitter: key takeaways + link
    caption:
'Google Agents CLI v1.9.0 just made agent deployments production-grade. 🛠️\n\n' +
'✅ Usage telemetry ON by default — your GCP project, your data (opt-out: AGENTS_CLI_TELEMETRY=0)\n' +
'✅ CMEK encryption for Agent Runtime — customer-managed KMS keys, meets compliance\n' +
'✅ Dry-run deploy — validates APIs, IAM, secrets before real deploy (read-only, exits 1 on problems)\n' +
'✅ New ADK defaults — GOOGLE_GENAI_USE_ENTERPRISE, Go formatters enabled, no duplicate JSONRPC\n' +
'✅ Terraform log sink fix — re-apply no longer deletes BigQuery exported logs\n' +
'✅ Windows tool errors finally make sense — "uv.exe blocked by AppLocker" not PermissionError\n\n' +
'This is the "trust release" for ADK agents. Full breakdown: ' + ARTICLE + '\n\n' +
'#GoogleAgentsCLI #ADK #AgentRuntime #GCP #DevOps #Compliance #CMEK #DeveloperTools',
    link: ARTICLE,
    metadata: { format: 'release-update', tool: 'agents-cli', version: '1.9.0' },
  },
  {
    // LinkedIn: personal take, no links in body
    caption:
'Google Agents CLI v1.9.0 (released Oct 6) is the release that makes ADK agents deployable in regulated environments.\n\n' +
'The headline isn\'t a feature — it\'s operational maturity:\n\n' +
'**Observability you own.** Usage telemetry writes to YOUR Google Cloud project — command, exit code, error class, duration, versions. Never arguments or file contents. Opt out anytime. This is how you debug "why does deploy take 5 minutes?" without guessing.\n\n' +
'**Compliance-ready encryption.** CMEK (Customer-Managed Encryption Keys) for Agent Runtime. `deploy --key` encrypts with your Cloud KMS key. Works in projects enforcing `constraints/gcp.restrictNonCmekServices`. Finance, healthcare, gov — this was the blocker.\n\n' +
'**Safety before commit.** `deploy --dry-run` validates APIs, engine, IAM, `actAs`, secrets — read-only, exits 1 on definite problems. CI pipelines can gate on this. No more "deploy failed after 5 minutes because IAM was missing."\n\n' +
'**Terraform that doesn\'t delete your logs.** Re-applying infra no longer replaces BigQuery log sink tables (was deleting ALL exported logs). `completions_view` gains `service_version` column. `scaffold upgrade` brings it to existing projects.\n\n' +
'**New projects start enterprise-ready.** Python: `GOOGLE_GENAI_USE_ENTERPRISE=true`. Go: `gofmt` + `goimports` enabled. Agent card: no duplicate JSONRPC. You get hygiene from `init`.\n\n' +
'**Windows errors that help.** Blocked tools name the tool + OS reason: "`uv.exe` blocked by AppLocker" — not a `PermissionError` traceback. Extensions only warn when they actually override a command.\n\n' +
'Google Agents CLI is positioning as the deployment/ops layer for ADK agents — not just "create agent" but "deploy, validate, encrypt, observe, iterate." v1.9.0 adds the trust layer enterprise adoption requires.\n\n' +
'Full article with verification steps on terminalblog.\n\n' +
'#GoogleAgentsCLI #ADK #AgentRuntime #GCP #DevOps #Compliance #CMEK #AIEngineering #DeveloperTools',
    metadata: { format: 'personal-take', platform: 'linkedin', tool: 'agents-cli', version: '1.9.0' },
  },
];

(async () => {
  const now = Date.now();
  const results = [];
  for (let i = 0; i < POSTS.length; i++) {
    const p = POSTS[i];
    const scheduled = new Date(now + (30 + i * 45) * 60000).toISOString();
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