const faqContent = `**Q1: What is AGENTS.md?**

AGENTS.md is a project instruction file placed at the repository root that tells coding agents (Claude Code, OpenCode, Cursor, Codex, etc.) how to work with your codebase. It contains build commands, architecture rules, safety constraints, and style preferences so the agent follows your repo's conventions without tribal knowledge.

**Q2: Do all coding agents read AGENTS.md?**

Most do, but the exact filename varies: Claude Code reads \`CLAUDE.md\` (and \`AGENTS.md\`), Cursor reads project rules, OpenCode and Hermes read \`AGENTS.md\`, Codex reads repository instructions. The safest approach is to maintain both \`AGENTS.md\` and the agent-specific variant (e.g., \`CLAUDE.md\`) or have one import the other.`;

const pattern1 = /\*\*Q\d*:\s*([^*]+?)\*\*\s*\n([\s\S]*?)(?=\n\s*\*\*Q\d*:|$)/gi;
let match;
while ((match = pattern1.exec(faqContent)) !== null) {
  console.log('Match:', match[0].substring(0, 100));
  console.log('Q:', match[1]);
  console.log('A:', match[2].substring(0, 100));
  console.log('---');
}