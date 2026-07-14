#!/usr/bin/env node
// backlink-outreach cycle 2026-07-15
// 3 unique, non-templated social-share backlinks via Marky, each tied to a
// genuinely-relevant discussion found in live research-discussions.cjs output.
// Linked articles were read before linking.

const API = "https://api.mymarky.ai/api/businesses/598a98f9-9ff9-4fa5-90a2-2ad0e313417e/posts";
const HEADERS = {
  "Authorization": "Bearer mk_live_2HrW1PDCF5i4rMu809NIDtvxtu0-rdnZOGURht6RWmE",
  "Content-Type": "application/json",
};

const POSTS = [
  {
    // Tied to HN "Coding Agents Are Arguing. Hand Them the Same Playbook" (2026-07-14)
    caption:
`Saw the post "Coding Agents Are Arguing. Hand Them the Same Playbook" and it names a real problem: when you run Claude Code, Codex, and Cursor on the same repo, each one re-derives your conventions from scratch — and they disagree.

The durable fix isn't a clever prompt. It's one instruction file every agent actually loads. The trick is knowing which filename each harness reads (AGENTS.md vs CLAUDE.md vs .cursorrules), what to put in it so the agent proves it read it, and the OS-specific pitfalls (Windows paths, permission boundaries) that silently break it.

We wrote the complete, runnable guide:

https://terminalblog.com/blog/agents-md-complete-guide/

#CodingAgents #DevWorkflow #AGENTSmd`,
    link: "https://terminalblog.com/blog/agents-md-complete-guide/",
    metadata: { format: "workflow-guide", cycle: "2026-07-15", tied_to: "HN: Coding Agents Are Arguing (2026-07-14)" },
  },
  {
    // Tied to HN "Cursor 0day: When Full Disclosure Becomes the Only Protection Left" (14pts) + "Agentmetry, catch your AI coding agent reading ~/.ssh"
    caption:
`Two threads landed on the same day and they should be read together: a Cursor 0day that supposedly only got fixed because full disclosure forced it, and Agentmetry — a tool built to catch your coding agent reading ~/.ssh and phoning home.

That's the actual threat model most teams skip. An agent isn't a chatbot with extra steps; it's a process with a shell, your env vars, and network egress. When it messes up, it commits to main or leaks a token — not a wrong sentence.

We keep a living, runnable hardening checklist for exactly this: sandbox isolation, permission denies, secrets, MCP egress, supply chain, incident response — with a command you can run today to find your own holes:

https://terminalblog.com/blog/coding-agent-security-checklist-2026/

#AIsecurity #CodingAgents #DevSecOps`,
    link: "https://terminalblog.com/blog/coding-agent-security-checklist-2026/",
    metadata: { format: "security-alert", cycle: "2026-07-15", tied_to: "HN: Cursor 0day + Agentmetry (~/.ssh)" },
  },
  {
    // Tied to HN "AI won't take your job. You may get fired anyway" (2026-07-14)
    caption:
`The "AI won't take your job, you'll get fired anyway" thread is doing the rounds, and the interesting part isn't the doom — it's the gap it exposes. Most eng teams have CI, code review, and deploy approvals and assume that means they're ready for autonomous agents. They're not.

An agent can open 10 PRs a day. If your team reviews 5, you're underwater by Friday. The bottleneck was never "will the agent write the code" — it's review throughput, deploy gates, and credential sprawl. That's a process problem, not a model problem.

We broke down what teams actually need to fix before handing agents autonomy:

https://terminalblog.com/blog/teams-not-ready-for-coding-agents/

#EngineeringManagement #CodingAgents #FutureOfWork`,
    link: "https://terminalblog.com/blog/teams-not-ready-for-coding-agents/",
    metadata: { format: "opinion-readiness", cycle: "2026-07-15", tied_to: "HN: AI won't take your job (2026-07-14)" },
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
