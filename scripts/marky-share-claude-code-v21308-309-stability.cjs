#!/usr/bin/env node
// Share Claude Code v2.1.308+309 stability surge via MyMarky (X + LinkedIn)
const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const KEY = 'mk_live_2HrW1PDCF5i4rMu809NIDtvxtu0-rdnZOGURht6RWmE';
const API = 'https://api.mymarky.ai/api/businesses/' + BIZ_ID + '/posts';
const HEADERS = { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' };
const ARTICLE = 'https://terminalblog.com/blog/claude-code-v2-1-308-309-stability-surge/';

const POSTS = [
  {
    // X/Twitter: key takeaways + link
    caption:
'Claude Code just dropped 100+ fixes in TWO DAYS 🔥 v2.1.308 + v2.1.309 (Oct 22)\n\n' +
'Sandbox escapes PLUGGED:\n' +
'• Bash startup files running OUTSIDE sandbox → fixed\n' +
'• Symlink denyWrite bypass → fixed\n' +
'• MCP config modification in sandbox → fixed\n' +
'• Profile store symlink bypass → fixed\n' +
'• Background command write-deny lift → fixed\n\n' +
'Dangerous rm/rmdir prompt in bypass mode → DENIES with rewrite hint (no more hangs)\n\n' +
'HTTP MCP double-call fix REINFORCED (write tools fail instead of retry)\n' +
'PowerShell hooks silent fail-open → FIXED (exit code 2 respected)\n' +
'Git on Windows → ACTUALLY FAST NOW\n' +
'VS Code extension: blank panel recovery, 0.75s edit speed, Ctrl+J fixed\n\n' +
'Full breakdown: ' + ARTICLE + '\n\n' +
'#CodingAgents #ClaudeCode #DevTools #AI #Stability #Security',
    link: ARTICLE,
    metadata: { format: 'release-update', tool: 'claude-code', version: 'v2.1.308-309' },
  },
  {
    // LinkedIn: personal take, no links in body
    caption:
'Claude Code v2.1.308 and v2.1.309 landed back-to-back on October 22nd. Two days, 100+ fixes.\n\n' +
'v2.1.307 gave us the safety_event telemetry — the black box finally opened. These two releases welded the box shut.\n\n' +
'The sandbox was leaking: Bash startup files running outside it, symlink bypasses on macOS, MCP config modifications slipping through, background commands lifting write denies. All plugged.\n\n' +
'The dangerous rm/rmdir prompt in bypass-permissions mode? It used to hang unattended sessions waiting for confirmation. Now it denies at once with a rewrite hint. Unattended sessions keep going.\n\n' +
'PowerShell hooks on Windows were silently failing OPEN when Git for Windows was not installed — approving everything. Now exit code 2 is respected. They block properly.\n\n' +
'Git performance on Windows? Actually fast now. Errors show in English regardless of git locale.\n\n' +
'VS Code extension got a quality-of-life wave: blank panel recovery, empty session spam gone, long messages fold properly, edit speed doubled (1.5s → 0.75s), Ctrl+J respects keybindings.\n\n' +
'This is not a feature release. It is the stability release that makes the observability from v2.1.307 meaningful — because the underlying surface is finally solid.\n\n' +
'If you run agents where reliability matters, update this week.\n\n' +
'#AI #CodingAgents #ClaudeCode #DeveloperTools #SoftwareEngineering #Stability #Production #DevOps',
    metadata: { format: 'personal-take', platform: 'linkedin', tool: 'claude-code', version: 'v2.1.308-309' },
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