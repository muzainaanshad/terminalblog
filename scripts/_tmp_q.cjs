const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..', 'src', 'content', 'blog');

for (const f of ['beware-cline-kanban-websocket-rce.mdx','hermes-agent-zip-update-silent-data-loss.mdx','hermes-agent-allowlist-bug-security-boundaries.mdx','openclaw-2026-8-1-beta2-secret-egress-gpt56-macos-profiles.mdx','claude-code-just-patched-credential-leak-cross-session-messaging.mdx','zero-sandbox-credential-leak.mdx','your-coding-agent-is-a-harness-the-model-is-the-commodity.mdx','what-coding-agent-knows-codebase.mdx','why-i-stopped-using-copilot-went-full-terminal-agent.mdx','windows-stepchild-coding-agents-fixing-up.mdx','run-claude-codex-in-browser.mdx','google-ai-studio-github-import-autodeploy.mdx','ui-md-design-rules-coding-agents.mdx']) {
  try {
    const txt = fs.readFileSync(path.join(dir, f), 'utf8').split('\n').slice(0, 10).join('\n');
    console.log('=== ' + f + ' ===');
    console.log(txt.split('\n').filter(l => /^title:|^pubDate:|^updatedDate:|^tags:|^tool:/.test(l)).join('\n'));
  } catch (e) { console.log('=== ' + f + ' === ERR', e.message); }
}