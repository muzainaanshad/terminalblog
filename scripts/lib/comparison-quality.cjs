/**
 * Quality bar for comparison posts — fails generator sludge.
 */
const FORBIDDEN = [
  /rotation seed/i,
  /Unique page id/i,
  /Sister comparison URLs/i,
  /page slug\s*`/i,
  /forces unique coverage/i,
  /Orientation key/i,
  /reverse-slug twin/i,
  /anti-thin content/i,
  /Scenario bank unique to/i,
  /Fill weights for \*your\* team/i,
  /scorecard \(fill in\)/i,
];

const REQUIRED = [
  { re: /##\s*Quick verdict/i, name: 'Quick verdict' },
  { re: /##\s*When to (choose|pick)/i, name: 'When to choose' },
  { re: /\|.+\|/, name: 'markdown table' },
];

function checkBody(body, title) {
  const issues = [];
  for (const re of FORBIDDEN) {
    if (re.test(body) || re.test(title || '')) {
      issues.push({ level: 'error', code: 'generator-meta', msg: String(re) });
    }
  }
  if (/coding agent comparison [a-z0-9 -]+vs/i.test(title || '')) {
    issues.push({
      level: 'error',
      code: 'slug-title',
      msg: 'title looks like raw slug dump',
    });
  }
  for (const r of REQUIRED) {
    if (!r.re.test(body)) {
      issues.push({ level: 'error', code: 'missing-section', msg: r.name });
    }
  }
  // Circular when-to-pick anti-pattern (weak but useful)
  if (
    /capabilities .+ has that .+ lacks on the matrix above/i.test(body) &&
    !/specifically:|named:|because it has/i.test(body)
  ) {
    issues.push({
      level: 'warn',
      code: 'circular-pick',
      msg: 'when-to-pick may be circular',
    });
  }
  const words = body.split(/\s+/).filter(Boolean).length;
  if (words < 900) {
    issues.push({
      level: 'error',
      code: 'thin',
      msg: `${words} words`,
    });
  }
  return { issues, words };
}

module.exports = { FORBIDDEN, REQUIRED, checkBody };
