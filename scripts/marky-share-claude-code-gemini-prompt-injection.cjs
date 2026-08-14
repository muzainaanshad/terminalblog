#!/usr/bin/env node
// Share the "Comment and Control" prompt injection article via MyMarky (X + LinkedIn).
// Usage: node scripts/marky-share-claude-code-gemini-prompt-injection.cjs
const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const KEY = 'mk_live_2HrW1PDCF5i4rMu809NIDtvxtu0-rdnZOGURht6RWmE';
const API = `https://api.mymarky.ai/api/businesses/${BIZ_ID}/posts`;
const HEADERS = { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' };
const ARTICLE = 'https://terminalblog.com/blog/claude-code-gemini-cli-prompt-injection-steals-ci-secrets/';

const POSTS = [
  {
    // X/Twitter: key takeaways + link
    caption:
`Your GitHub issue just stole your CI secrets. ���

Three major AI agents — Claude Code Security Review, Gemini CLI Action, GitHub Copilot Agent — all vulnerable to "Comment and Control" prompt injection.

Attacker writes a malicious PR title/issue comment → agent reads it as instructions → executes commands on your runner → posts ANTHROPIC_API_KEY, GEMINI_API_KEY, GITHUB_TOKEN back to the PR.

CVEs you need to patch NOW:
• CVE-2026-54316 (Claude WebFetch → HuggingFace exfil channel)
• CVE-2026-12537 (Gemini CLI RCE before sandbox init, CVSS 10.0)
• CVE-2026-25724 (Claude symlink bypass)

Full breakdown with mitigation checklist: ${ARTICLE}

#PromptInjection #AISecurity #ClaudeCode #GeminiCLI #GitHubCopilot #DevSecOps`,
    link: ARTICLE,
    metadata: { format: 'security-alert', tool: 'claude-code', cves: 'CVE-2026-54316, CVE-2026-12537, CVE-2026-25724' },
  },
  {
    // LinkedIn: personal take, no links in body
    caption:
`I've been writing about AI coding agents for months. This is the scariest thing I've covered.

A security researcher (Aonan Guan, with Johns Hopkins) found that three of the most deployed AI agents on GitHub Actions can be hijacked by... a GitHub comment.

Not malware. Not a supply chain attack. A comment.

The attacker creates a PR with a malicious title. Your automated security review bot (Claude Code) reads it, breaks out of its prompt, runs ps auxeww, and posts your ANTHROPIC_API_KEY and GITHUB_TOKEN as a "security finding" in the PR comments.

Gemini CLI Action? Same. Attacker comments with a fake "Trusted Content Section" and Gemini obediently posts the GEMINI_API_KEY as a public issue comment.

GitHub Copilot Agent? Most sophisticated. Attacker hides the payload in an HTML comment — invisible to humans, parsed by the AI. Victim assigns the issue, Copilot executes ps auxeww | base64, commits the encoded secrets to a new branch. Attacker downloads, decodes, owns your CI.

All three vendors are patching. But the pattern — "Comment and Control" — will keep coming back in every agent that reads external input as prompt context.

If you run AI agents in CI/CD, your issue tracker is now an unauthenticated command injection surface.

Mitigation checklist:
1. Update run-gemini-cli to ≥ v0.1.22 TODAY
2. Update Gemini CLI to ≥ 0.39.1 TODAY
3. Add --disallowed-tools 'Bash(*)' to Claude Code workflows
4. Rotate every secret touched by an AI agent
5. Move to fine-grained PATs + environment protection

The agents aren't going away. The attack surface is growing. Harden the perimeter now.

Full article with PoC details and universal hardening guide on terminalblog.

#AISecurity #PromptInjection #ClaudeCode #GeminiCLI #GitHubCopilot #DevSecOps #CICD`,
    metadata: { format: 'personal-take', platform: 'linkedin', tool: 'claude-code', cves: 'CVE-2026-54316, CVE-2026-12537, CVE-2026-25724' },
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
      console.log(`Post ${i + 1}: HTTP ${r.status} | id=${results[i].id} | sched=${scheduled}`);
    } catch (e) {
      results.push({ i: i + 1, http: 0, id: 'ERROR', error: String(e) });
      console.log(`Post ${i + 1}: ERROR ${e}`);
    }
  }
  console.log('SUMMARY:', JSON.stringify(results, null, 1));
})().catch((e) => { console.error('Fatal:', e); process.exit(1); });