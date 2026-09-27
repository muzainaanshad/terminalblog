#!/usr/bin/env node
// Share Qwen Code v0.24.6 via MyMarky (X + LinkedIn)
const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const KEY = 'mk_live_2HrW1PDCF5i4rMu809NIDtvxtu0-rdnZOGURht6RWmE';
const API = 'https://api.mymarky.ai/api/businesses/' + BIZ_ID + '/posts';
const HEADERS = { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' };
const ARTICLE = 'https://terminalblog.com/blog/qwen-code-v0-24-6-managed-runtime-advisor-tool-breakthrough/';

const POSTS = [
  {
    // X/Twitter: key takeaways + link
    caption:
'Qwen Code v0.24.6 just shipped enterprise infrastructure in an open-source agent 🚀\n\n' +
'✅ Managed runtime foundation — hosted harness, durable sessions, failover, batch API\n' +
'✅ Native Advisor tool — built-in second-opinion code review before commits\n' +
'✅ Java SDK with typed contracts — embed agentic workflows in JVM services\n' +
'✅ 60% faster cold start, half the memory\n' +
'✅ Fail-closed permissions, preserved Claude thinking across turns\n\n' +
'Open source just closed the infrastructure gap with commercial agents. Full breakdown: ' + ARTICLE + '\n\n' +
'#QwenCode #AICodingAgent #OpenSource #ManagedRuntime #JavaSDK #DeveloperTools #AIEngineering',
    link: ARTICLE,
    metadata: { format: 'release-update', tool: 'qwen-code', version: '0.24.6' },
  },
  {
    // LinkedIn: personal take, no links in body
    caption:
'Qwen Code v0.24.6 dropped and it\'s the clearest signal yet: open-source coding agents are building production-grade infrastructure, not just features.\n\n' +
'The release ships a complete **managed runtime stack** — hosted harness private client, durable sessions with failover, managed-context envelopes, v2 execute/status/cancel contracts, and a Spring control plane with dual-path WebShell. Plus an agent-prepared Batch API workflow (`/batch-api`) for async work queues.\n\n' +
'**The Advisor tool** is the standout for daily work: a native tool that lets the agent consult a second model before committing risky changes. Structured self-review as a first-class feature, not a prompt hack. Usage limits prevent runaway loops.\n\n' +
'**Java SDK** means JVM shops (Spring Boot, Quarkus, Android, data pipelines) can now embed agentic workflows *inside their services* with proper typed contracts — not shell-out hacks.\n\n' +
'**Perf:** 60% faster cold start, half the RSS memory. Env files with only credentials no longer trigger full reloads.\n\n' +
'Quiet fixes you\'ll feel: fail-closed permissions (deny beats allow), preserved Claude thinking across tool turns, session deletion from sidebar, deduplicated system prompts.\n\n' +
'Three waves tell the story:\n' +
'• v0.23.1–3: **Brakes** — self-pausing goals, spend windows, worktree isolation, ACP delegation to Claude Code\n' +
'• v0.23.2: **Bridges** — built-in web search, reasoning-effort controls, remote start\n' +
'• v0.24.6: **Infrastructure** — managed runtime, advisor, Java SDK, 60% faster startup\n\n' +
'First the agent learned to stop when stuck. Then to call for backup. Now it\'s building the runtime that makes it reliable at scale.\n\n' +
'Full article on terminalblog.\n\n' +
'#QwenCode #AICodingAgent #OpenSource #ManagedRuntime #JavaSDK #AIEngineering #DeveloperTools #Infrastructure',
    metadata: { format: 'personal-take', platform: 'linkedin', tool: 'qwen-code', version: '0.24.6' },
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