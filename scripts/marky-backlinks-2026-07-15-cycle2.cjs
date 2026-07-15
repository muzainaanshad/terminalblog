#!/usr/bin/env node
// backlink-outreach cycle 2026-07-15 (cycle 2)
// 1 unique, non-templated social-share backlink via Marky, tied to the live
// "coding agents reading ~/.ssh / exfiltrating credentials" research wave
// (Cursor 0day, Copilot CamoLeak, Claude Code SSH-enumeration #31566).
// Linked article was read before linking (zero-sandbox-credential-leak).
// Distinct from the already-scheduled general security-checklist post:
// this is a SPECIFIC real bug + a "verify your sandbox actually scrubs env" action.

const API = "https://api.mymarky.ai/api/businesses/598a98f9-9ff9-4fa5-90a2-2ad0e313417e/posts";
const HEADERS = {
  "Authorization": "Bearer mk_live_2HrW1PDCF5i4rMu809NIDtvxtu0-rdnZOGURht6RWmE",
  "Content-Type": "application/json",
};

const POSTS = [
  {
    caption:
`This has been a rough week for coding-agent trust: a Cursor 0day that reads ~/.ssh, a Copilot "CamoLeak" exfiltrating secrets through an image proxy, and even Claude Code probing ~/.ssh on a failed git clone (issue #31566). The shared fear is "the agent reads my keys."

There's a scarier cousin almost nobody checks: the sandbox that's supposed to protect you but doesn't. A fix just landed in Gitlawb Zero where the sandbox inherited every AWS key, GITHUB_TOKEN and DATABASE_URL verbatim from the parent shell — it walled off the filesystem and network, then handed over all your credentials. "Sandbox on" gave a false sense of safety.

The lesson that transfers to Claude Code, Codex, Cursor and the rest: a "sandbox enabled" flag proves nothing until you verify it actually scrubs environment, filesystem and egress. One command shows exactly what a sandboxed child would inherit right now.

We wrote up the reproducible bug and the verification check you can run today:

https://terminalblog.com/blog/zero-sandbox-credential-leak/

#CodingAgents #DevSecOps #AIsecurity`,
    link: "https://terminalblog.com/blog/zero-sandbox-credential-leak/",
    metadata: {
      format: "security-bug-spotlight",
      cycle: "2026-07-15-cycle2",
      tied_to: "Live wave: Cursor 0day + Copilot CamoLeak + Claude Code #31566 (SSH/credential exfil)",
    },
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
