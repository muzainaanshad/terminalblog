#!/usr/bin/env node
// Retry Claude Code LinkedIn post
const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const KEY = 'mk_live_2HrW1PDCF5i4rMu809NIDtvxtu0-rdnZOGURht6RWmE';
const API = 'https://api.mymarky.ai/api/businesses/' + BIZ_ID + '/posts';
const HEADERS = { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' };

const URL = 'https://terminalblog.com/blog/claude-code-v2-1-234-ntlm-leak-fixed-50-fixes/';

const liCaption =
  'Claude Code v2.1.234 is the kind of release that makes you realize how many paper cuts you\'ve been tolerating.\n\n' +
  'The headline: Windows NTLM credential leak patched. Any pre-approval file access touching `\\\\??\\\\` paths now rejected. If you\'re on Windows with `--dangerously-skip-permissions`, this alone justifies the update.\n\n' +
  'But scroll down and there are 50+ fixes that change daily workflow:\n\n' +
  '• GitLab MR badges in the statusline — `MR !42` with draft/pending/green states. No more browser context-switch.\n' +
  '• Auto-resume when your claude.ai usage limit resets. Optional in `/config`.\n' +
  '• Your prompts now RENDER MARKDOWN in the transcript. Code blocks, inline code, lists — readable as documentation.\n' +
  '• Session titles shifted from sentences to scannable nouns: "Login button bug" not "Fix the login button on mobile".\n' +
  '• `/permissions`, `/add-dir`, `/autocompact`, `/theme`, `/help`, `/config`, `/advisor` all open mid-turn in fullscreen TUI.\n' +
  '• Built-in `claude-api` skill context cost: 200k+ tokens → ~25k. Load reference docs on demand.\n' +
  '• Remote Control: account switch stops session in seconds. Phone/claude.ai/code now sync permission mode, model, effort.\n' +
  '• Windows startup no longer stalls on read-only `~/.claude.json`.\n\n' +
  'v2.1.233 (2 days ago) fixed the Windows git crash. v2.1.234 plugs the security hole AND cleans up a year of paper cuts. The transcript markdown rendering alone changes how you review sessions.\n\n' +
  'Update. `claude update` takes seconds.\n\n' +
  '#ClaudeCode #Anthropic #AICodingAgent #Security #DeveloperTools #Terminal #Windows #GitLab #Productivity';

const now = Date.now();
const scheduled = new Date(now + 30 * 60000).toISOString();

const payload = {
  caption: liCaption,
  status: 'SCHEDULED',
  scheduled_publish_time: scheduled,
  metadata: { format: 'personal-take', platform: 'linkedin', tool: 'claude-code', version: '2.1.234' },
};

(async () => {
  try {
    const r = await fetch(API, { method: 'POST', headers: HEADERS, body: JSON.stringify(payload) });
    const data = await r.json();
    console.log('HTTP ' + r.status + ' | id=' + (data.id || (data.data && data.data.id) || 'FAILED') + ' | sched=' + scheduled);
  } catch (e) {
    console.error('ERROR:', e);
  }
})();