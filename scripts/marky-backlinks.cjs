#!/usr/bin/env node
// Execute Marky social-share backlinks for terminalblog.com.
// 3 unique posts, each tied to a real trending discussion found via research,
// each linking to a genuinely-relevant terminalblog article.
// Uses the provided live Marky business API key.

const API = "https://api.mymarky.ai/api/businesses/598a98f9-9ff9-4fa5-90a2-2ad0e313417e/posts";
const HEADERS = {
  "Authorization": "Bearer mk_live_2HrW1PDCF5i4rMu809NIDtvxtu0-rdnZOGURht6RWmE",
  "Content-Type": "application/json",
};

// Unique, non-templated posts. No two share phrasing.
const POSTS = [
  {
    // Tied to the 182-point HN thread "Old and new apps, via modern coding agents by Terry Tao"
    caption:
`Terence Tao just ported ~two dozen of his 1999 Java math applets to JS with a coding agent — in hours — and the agent caught bugs in his original code.\n\nThe interesting part isn't \"a famous mathematician used AI.\" It's that he treated the agent like a junior collaborator on unfamiliar legacy code, not a magic box. The HN thread (180+ points) is mostly people surprised it worked on 25-year-old code.\n\nWe broke down what's actually transferable from his workflow to a normal dev job — the parts that generalize, and the parts that were only possible because he's Tao:\n\nhttps://terminalblog.com/blog/terence-tao-coding-agents-applets/\n\n#CodingAgents #DevLife`,
    link: "https://terminalblog.com/blog/terence-tao-coding-agents-applets/",
    metadata: { format: "community-spotlight", cycle: "2026-07-12", tied_to: "HN: Terry Tao coding agents (182pts)" },
  },
  {
    // Tied to the "DejaView" Show HN — session sprawl across projects
    caption:
`If you run Claude Code on more than one project, this will feel personal: you start a refactor in repo A, a side quest in repo B, a bugfix in repo C — and \`claude --resume\` only works if you remember which directory you were in.\n\nA new Show HN (DejaView) is a TUI that lists every Claude Code session on your machine so you can see where you left off and jump back in with one key. The problem it solves is real and weirdly universal.\n\nWe wrote up why session sprawl is a genuine productivity tax, not a niche complaint:\n\nhttps://terminalblog.com/blog/dejaview-claude-code-session-dashboard/\n\n#ClaudeCode #TerminalLife #DevProductivity`,
    link: "https://terminalblog.com/blog/dejaview-claude-code-session-dashboard/",
    metadata: { format: "tooling-spotlight", cycle: "2026-07-12", tied_to: "HN Show: DejaView" },
  },
  {
    // Tied to the real Codex PreToolUse hook security issue
    caption:
`Heads up if you run Codex with PreToolUse hooks for security: a freshly filed, reproducible issue shows that even when your hook *correctly denies and redacts* a shell command, the raw input can still get appended to the denial message — defeating hook-side redaction and leaking secrets into the visible transcript.\n\nSo a hook that looks like it sanitizes can quietly be the leak. The fix is to redact on the agent side too, not trust the hook response.\n\nFull reproduction + what to check in your own setup:\n\nhttps://terminalblog.com/blog/codex-pretooluse-hook-raw-command-leak/\n\n#Codex #AIsecurity #DevSecOps`,
    link: "https://terminalblog.com/blog/codex-pretooluse-hook-raw-command-leak/",
    metadata: { format: "security-alert", cycle: "2026-07-12", tied_to: "Codex PreToolUse hook leak (GitHub issue)" },
  },
];

(async () => {
  const results = [];
  for (let i = 0; i < POSTS.length; i++) {
    const p = POSTS[i];
    const now = new Date(Date.now() + 120000 + i * 60000).toISOString();
    const payload = {
      caption: p.caption,
      link: p.link,
      status: "SCHEDULED",
      scheduled_publish_time: now,
      metadata: p.metadata,
    };
    try {
      const r = await fetch(API, { method: "POST", headers: HEADERS, body: JSON.stringify(payload) });
      const data = await r.json();
      const id = data.id || (data.data && data.data.id) || "FAILED";
      results.push({ index: i + 1, http: r.status, id, link: p.link, tied_to: p.metadata.tied_to });
      console.log(`Post ${i + 1}: HTTP ${r.status} | id=${id} | link=${p.link}`);
      if (data.error) console.log("  error:", JSON.stringify(data.error));
    } catch (e) {
      results.push({ index: i + 1, http: 0, id: "ERROR", error: String(e) });
      console.log(`Post ${i + 1}: ERROR ${e}`);
    }
  }
  console.log("\nSUMMARY:", JSON.stringify(results, null, 2));
  const ok = results.filter(r => r.http === 200 || r.http === 201).length;
  console.log(`Published ${ok}/${POSTS.length} backlink posts.`);
})();
