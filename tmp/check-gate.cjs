const r = require('../content-gate-report.json');
const want = new Set([
  'deep-dive-mimo-code-vision-fork-opencode',
  'case-for-lightweight-coding-agents-2026',
  'codex-crash-leaks-system-instructions',
  'claude-code-lock-issues-workflow-fix',
  'codex-sandbox-memory-consolidation'
]);
for (const a of r.articles) {
  if (want.has(a.slug)) {
    console.log(a.slug + ' | ' + a.words + 'w | issues:' + a.issues.length);
    a.issues.forEach(i => console.log('   [' + i.level + '] ' + i.code + ': ' + i.msg));
  }
}
