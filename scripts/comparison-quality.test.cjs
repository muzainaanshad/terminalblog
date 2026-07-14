/**
 * Quality tests for comparison rewrites — drives real files + checker.
 */
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { checkBody } = require('./lib/comparison-quality.cjs');

const BLOG = path.join(__dirname, '..', 'src', 'content', 'blog');

function listComparisons() {
  return fs.readdirSync(BLOG).filter((f) => {
    if (!f.endsWith('.mdx')) return false;
    return f.includes('-vs-') || /comparison/i.test(f) || /^open-source-vs-/.test(f);
  });
}

describe('comparison quality rewrites', () => {
  it('every comparison file fails generator-meta patterns and has structure', () => {
    const files = listComparisons();
    assert.ok(files.length >= 50, `expected many comparisons, got ${files.length}`);
    const failures = [];
    for (const f of files) {
      const raw = fs.readFileSync(path.join(BLOG, f), 'utf8');
      const title = (raw.match(/^title:\s*(.+)$/m) || [])[1] || '';
      const body = raw.replace(/^---[\s\S]*?---/, '');
      const { issues, words } = checkBody(body, title);
      const errors = issues.filter((i) => i.level === 'error');
      if (errors.length) failures.push({ f, words, errors });
      if (!/^updatedDate:/m.test(raw)) failures.push({ f, errors: [{ code: 'no-updatedDate' }] });
    }
    assert.equal(failures.length, 0, JSON.stringify(failures.slice(0, 8), null, 2));
  });

  it('kilo-vs-pi is pair-specific and free of template meta', () => {
    const raw = fs.readFileSync(path.join(BLOG, 'kilo-vs-pi-dot-dev.mdx'), 'utf8');
    assert.match(raw, /pi\.dev/);
    assert.match(raw, /Cron|scheduling/i);
    assert.doesNotMatch(raw, /rotation seed/i);
    assert.doesNotMatch(raw, /Unique page id/i);
    assert.doesNotMatch(raw, /Sister comparison URLs/i);
    assert.match(raw, /## Quick verdict/i);
    assert.match(raw, /## When to choose/i);
  });

  it('token-overhead twin differs from base pair body', () => {
    const a = fs
      .readFileSync(path.join(BLOG, 'claude-code-vs-opencode.mdx'), 'utf8')
      .replace(/^---[\s\S]*?---/, '');
    const b = fs
      .readFileSync(path.join(BLOG, 'claude-code-vs-opencode-token-overhead.mdx'), 'utf8')
      .replace(/^---[\s\S]*?---/, '');
    assert.notEqual(a.trim(), b.trim());
    assert.match(b, /token/i);
  });

  it('no comparison file has consecutive identical paragraphs (pad spam)', () => {
    const files = listComparisons();
    const bad = [];
    for (const f of files) {
      const body = fs
        .readFileSync(path.join(BLOG, f), 'utf8')
        .replace(/^---[\s\S]*?---/, '');
      const paras = body
        .split(/\n\n+/)
        .map((p) => p.replace(/\s+/g, ' ').trim())
        .filter(Boolean);
      for (let i = 1; i < paras.length; i++) {
        if (paras[i] === paras[i - 1] && paras[i].length > 40) {
          bad.push(f);
          break;
        }
      }
      const spam = paras.filter((p) =>
        p.startsWith('Teams that win with agents treat the harness')
      );
      if (spam.length > 1) bad.push(f + ':spam');
    }
    assert.deepEqual(bad, [], JSON.stringify(bad.slice(0, 20)));
  });

  it('pad-thin-comparisons.cjs does not contain a while-loop that appends a fixed spam sentence', () => {
    const src = fs.readFileSync(
      path.join(__dirname, 'pad-thin-comparisons.cjs'),
      'utf8'
    );
    assert.doesNotMatch(
      src,
      /while\s*\([^)]*words\s*<\s*1000[\s\S]{0,200}Teams that win with agents/
    );
    assert.match(src, /BANK/);
  });
});
