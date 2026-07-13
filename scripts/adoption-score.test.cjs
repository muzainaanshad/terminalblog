/**
 * Unit tests for adoption scoring — drives real lib, not a reimplementation.
 */
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const {
  scoreAgents,
  hasEnoughData,
  WEIGHTS,
} = require('./lib/adoption-score.cjs');

describe('adoption-score', () => {
  it('exports weights that sum to ~1', () => {
    const sum = Object.values(WEIGHTS).reduce((a, b) => a + b, 0);
    assert.ok(Math.abs(sum - 1) < 0.001, `weights sum ${sum}`);
  });

  it('ranks higher multi-signal OSS agents above sparse ones', () => {
    const scored = scoreAgents([
      {
        id: 'rich',
        name: 'Rich',
        price_index: 1,
        metrics: {
          npm_downloads: 500000,
          pypi_downloads: 0,
          github_stars: 80000,
          github_forks: 5000,
          commits_30d: 200,
          github_open_issues: 100,
          issues_opened_30d: 40,
          reddit_subscribers: 10000,
          x_followers: 20000,
        },
      },
      {
        id: 'sparse',
        name: 'Sparse',
        price_index: 1,
        metrics: {
          npm_downloads: 0,
          pypi_downloads: 0,
          github_stars: 500,
          github_forks: 10,
          commits_30d: 0,
          github_open_issues: 0,
          issues_opened_30d: 0,
          reddit_subscribers: 0,
          x_followers: 0,
        },
      },
    ]);
    assert.equal(scored[0].id, 'rich');
    assert.ok(scored[0].adoption_score > scored[1].adoption_score);
    assert.ok(scored[0].value_score >= scored[1].value_score);
  });

  it('value_score rewards lower price_index for same adoption signals', () => {
    const base = {
      metrics: {
        npm_downloads: 100000,
        github_stars: 20000,
        github_forks: 2000,
        commits_30d: 50,
        github_open_issues: 20,
        issues_opened_30d: 10,
        pypi_downloads: 0,
        reddit_subscribers: 0,
        x_followers: 0,
      },
    };
    const scored = scoreAgents([
      { id: 'free', name: 'Free', price_index: 1, ...base },
      { id: 'paid', name: 'Paid', price_index: 4, ...base },
    ]);
    const free = scored.find((a) => a.id === 'free');
    const paid = scored.find((a) => a.id === 'paid');
    assert.ok(free.value_score > paid.value_score);
    assert.equal(free.price_tier, 'low');
    assert.equal(paid.price_tier, 'high');
  });

  it('hasEnoughData requires at least 2 positive signals', () => {
    assert.equal(
      hasEnoughData({
        metrics: { github_stars: 10, npm_downloads: 0, commits_30d: 0 },
      }),
      false
    );
    assert.equal(
      hasEnoughData({
        metrics: { github_stars: 10, npm_downloads: 5, commits_30d: 0 },
      }),
      true
    );
  });
});
