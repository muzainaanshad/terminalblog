#!/usr/bin/env node
// backlink-outreach cycle 2026-07-16 — tactic: Marky social share
// Tied to the live HN wave "Cursor user wondering if Claude Code is worth it"
// and "Cursor's pricing model is problematic" (item 47619702 / 47622041, 2026-07).
// Linked article (real-cost-of-ai-coding-agents) was READ before linking — the
// piece is about the hidden token tax, context-window waste, and retry-storm
// costs that dominate a coding-agent bill, which is exactly the "Cursor pricing
// stings / Claude Code is 1/10th the price" debate playing out on HN.
// Unique phrasing, distinct from all prior cycles (cost/agent harness angle).

const API = "https://api.mymarky.ai/api/businesses/598a98f9-9ff9-4fa5-90a2-2ad0e313417e/posts";
const HEADERS = {
  "Authorization": "Bearer mk_live_2HrW1PDCF5i4rMu809NIDtvxtu0-rdnZOGURht6RWmE",
  "Content-Type": "application/json",
};

const POSTS = [
  {
    caption:
`The recurring thread on HN this week — "do I switch from Cursor to Claude Code?" — keeps landing on the same two points: Cursor feels nicer but the pricing stings, and people report paying 1/10th for Claude Code Max.

But the real bill isn't the subscription. It's the token meter you only see when the invoice arrives: a single messy refactor can quietly burn $5–30, and an agent stuck in a retry loop re-sends your whole 200K-token context window on every failed attempt.

So "pick the cheaper tool" is the wrong optimization. The lever that actually moves the number is context management + loop caps, not which IDE you opened. We broke down the costs that never show up on a pricing page:

https://terminalblog.com/blog/real-cost-of-ai-coding-agents/

#CodingAgents #DevCosts #ClaudeCode`,
    link: "https://terminalblog.com/blog/real-cost-of-ai-coding-agents/",
    metadata: {
      format: "cost-debunk",
      cycle: "2026-07-16",
      tied_to: "HN wave: Cursor-vs-Claude-Code pricing/ergonomics (item 47619702, 47622041)",
    },
  },
];

(async () => {
  const results = [];
  for (let i = 0; i < POSTS.length; i++) {
    const p = POSTS[i];
    const now = new Date(Date.now() + 180000 + i * 60000).toISOString();
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
