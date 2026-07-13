/**
 * Structural tests for comparison inventory + evergreen floor.
 * Drives real scripts/files — no hardcoded fake word counts.
 */
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');

describe('comparison inventory + evergreen upgrades', () => {
  it('inventory script writes rows with word counts and priority', () => {
    execSync('node scripts/comparison-inventory.cjs', {
      cwd: ROOT,
      stdio: 'pipe',
    });
    const invPath = path.join(ROOT, 'tmp', 'comparison-inventory.json');
    assert.ok(fs.existsSync(invPath), 'inventory json exists');
    const inv = JSON.parse(fs.readFileSync(invPath, 'utf8'));
    assert.ok(inv.total >= 50, 'expected a large comparison set');
    assert.equal(inv.rows.length, inv.total);
    for (const r of inv.rows.slice(0, 20)) {
      assert.ok(typeof r.words === 'number');
      assert.ok(typeof r.priority === 'number');
      assert.ok(r.file.endsWith('.mdx'));
      assert.ok(r.path.includes('src/content/blog/'));
      assert.ok(r.angle);
    }
  });

  it('every inventoried comparison meets evergreen floor and structure', () => {
    const inv = JSON.parse(
      fs.readFileSync(path.join(ROOT, 'tmp', 'comparison-inventory.json'), 'utf8')
    );
    assert.equal(inv.thin, 0, 'thin comparisons must be 0');
    for (const r of inv.rows) {
      const raw = fs.readFileSync(path.join(ROOT, r.path), 'utf8');
      const body = raw.replace(/^---[\s\S]*?---/, '');
      const words = body.split(/\s+/).filter(Boolean).length;
      assert.ok(words >= 1000, `${r.file} has ${words} words`);
      assert.ok(/^updatedDate:/m.test(raw), `${r.file} missing updatedDate`);
      assert.ok(/\|.+\|/.test(body), `${r.file} missing table`);
      assert.ok(
        /verdict|When to choose which|Decision rubric/i.test(body),
        `${r.file} missing verdict/structure`
      );
      assert.ok(
        /\]\(\/blog\//.test(body),
        `${r.file} missing internal blog links`
      );
    }
  });

  it('content-gate --strict passes on a sample of upgraded comparison files', () => {
    const inv = JSON.parse(
      fs.readFileSync(path.join(ROOT, 'tmp', 'comparison-inventory.json'), 'utf8')
    );
    const sample = inv.rows.slice(0, 8);
    for (const r of sample) {
      assert.doesNotThrow(() => {
        execSync(`node scripts/content-gate.cjs ${JSON.stringify(r.path)} --strict`, {
          cwd: ROOT,
          stdio: 'pipe',
        });
      }, `gate failed for ${r.file}`);
    }
  });

  it('priority queue head prefers higher priority than tail', () => {
    const inv = JSON.parse(
      fs.readFileSync(path.join(ROOT, 'tmp', 'comparison-inventory.json'), 'utf8')
    );
    const head = inv.rows[0].priority;
    const tail = inv.rows[inv.rows.length - 1].priority;
    assert.ok(head >= tail, 'queue should be sorted by priority desc');
  });

  it('no two comparison pages share an identical body', () => {
    const crypto = require('crypto');
    const inv = JSON.parse(
      fs.readFileSync(path.join(ROOT, 'tmp', 'comparison-inventory.json'), 'utf8')
    );
    const byHash = new Map();
    for (const r of inv.rows) {
      const raw = fs.readFileSync(path.join(ROOT, r.path), 'utf8');
      const body = raw.replace(/^---[\s\S]*?---/, '').trim();
      const h = crypto.createHash('sha1').update(body).digest('hex');
      if (!byHash.has(h)) byHash.set(h, []);
      byHash.get(h).push(r.file);
    }
    const dups = [...byHash.values()].filter((v) => v.length > 1);
    assert.deepEqual(dups, [], `identical bodies: ${JSON.stringify(dups)}`);
  });

  it('known multi-angle twins differ and mention their angle keywords', () => {
    const twins = [
      [
        'src/content/blog/claude-code-vs-opencode-token-overhead.mdx',
        'token overhead',
      ],
      [
        'src/content/blog/claude-code-vs-ampcode-unconstrained-challenge.mdx',
        'unconstrained',
      ],
      [
        'src/content/blog/codex-vs-copilot-cli-terminal-battle.mdx',
        'terminal battle',
      ],
      [
        'src/content/blog/ampcode-vs-copilot-cli-pricing-battle.mdx',
        'pricing battle',
      ],
    ];
    const base = fs
      .readFileSync(
        path.join(ROOT, 'src/content/blog/claude-code-vs-opencode.mdx'),
        'utf8'
      )
      .replace(/^---[\s\S]*?---/, '');
    for (const [rel, needle] of twins) {
      const raw = fs.readFileSync(path.join(ROOT, rel), 'utf8');
      const body = raw.replace(/^---[\s\S]*?---/, '');
      assert.notEqual(body.trim(), base.trim(), `${rel} must not equal base pair body`);
      assert.match(body.toLowerCase(), new RegExp(needle, 'i'), `${rel} missing ${needle}`);
    }
  });
});
