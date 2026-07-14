const fs = require('fs');
const path = require('path');
const more = `

Document the rollout: default tool, specialist tool, worktree policy, secret policy, and a quarterly review date. Prefer one strong updated URL over ten thin near-duplicates. Measure jobs, not brand heat.

If the two tools still look equal after three real tickets, pick the one with clearer permissions UX and better recovery from a red CI log—not the one with more social proof.

Keep human merge gates for production. Agents accelerate drafts; they do not replace review culture.

Adoption signals from the leaderboard are relative context. A quieter tool with better permissions can beat a louder brand on your monorepo.
`;
for (const f of [
  'coding-agents-vs-github-copilot-difference.mdx',
  'what-devs-say-claude-code-vs-cursor.mdx',
]) {
  const p = path.join(__dirname, '..', 'src', 'content', 'blog', f);
  let r = fs.readFileSync(p, 'utf8');
  r = r.trimEnd() + more + '\n';
  r = r.replace(/^updatedDate:.*$/m, 'updatedDate: "2026-07-14"');
  fs.writeFileSync(p, r);
  const w = r
    .replace(/^---[\s\S]*?---/, '')
    .split(/\s+/)
    .filter(Boolean).length;
  console.log(f, w);
}
