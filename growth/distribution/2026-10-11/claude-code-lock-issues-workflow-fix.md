# Distribution Package: Claude Code Lock Issues Workflow Fix

**Article:** Claude Code Just Fixed One of the Most Annoying Issues in Open Source Automation
**Canonical URL:** https://terminalblog.com/blog/claude-code-lock-issues-workflow-fix/
**Published:** 2026-06-19 (updated 2026-10-11)
**Target Platforms:** Reddit (r/ClaudeAI, r/github), Hacker News, Medium, X/Twitter

---

## REDDIT POST — r/ClaudeAI

**Title:** Claude Code fixed a silent CI bug that was failing to lock old issues — masterclass in robust GitHub Actions design

**Body:**

GitHub Actions are great until they break silently. The `lock-closed-issues` workflow in Claude Code's repo was using offset pagination to fetch issues. GitHub's API changes broke offset pagination, causing the workflow to only see the first page. Old issues weren't getting locked — but the workflow showed a green checkmark.

**The deeper lesson:** A workflow that "succeeds" while doing nothing is worse than one that fails loudly. Silent failure is the most dangerous kind.

**The fix:** Switch from offset pagination to GitHub's search API.

```yaml
# Before (broken)
- name: Fetch closed issues
  run: |
    PAGE=1
    while true; do
      gh api repos/{owner}/{repo}/issues --jq '.[] | select(.state=="closed")' --paginate
    done

# After (robust)
- name: Fetch closed issues
  run: |
    gh api search/issues -f q="repo:{owner}/{repo} is:issue is:closed" --jq '.items[]' --paginate
```

Why search API wins:
- Handles pagination consistently regardless of result set size
- Supports `is:issue is:closed` query syntax maintained by GitHub's search team
- Designed for the exact query pattern: "find all closed issues matching criteria"
- Reduces API calls — more efficient than paging through every issue

**What other coding agents can learn:**
1. Don't trust pagination — GitHub's REST pagination changes. Use search API for query patterns.
2. Assume APIs will change — offset pagination broke because GitHub's API evolved. Build for evolution.
3. Test for correctness, not just success — a green workflow that does nothing is worse than a red one.

**Principle:** Treat third-party API contracts as unstable. Pin to the query interface the vendor actually maintains, and add a check that the workflow did what it claimed — not just that it exited zero.

This pattern matters for agent-driven CI: when agents write workflows that fetch "all PRs with label X" or "all issues closed this month," they should reach for the search endpoint, not `GET /issues?page=1&per_page=100`.

Full breakdown: https://terminalblog.com/blog/claude-code-lock-issues-workflow-fix/

---

## REDDIT POST — r/github

**Title:** Silent CI failure: GitHub API change broke offset pagination, workflow showed green but did nothing — fix uses search API

**Body:**

Classic silent failure: `lock-closed-issues` workflow used offset pagination (`gh api repos/.../issues --paginate`). GitHub changed pagination behavior → workflow only saw first page → old issues not locked → but workflow exit code 0 (green checkmark).

Fix: `gh api search/issues -f q="repo:{owner}/{repo} is:issue is:closed" --jq '.items[]' --paginate`

Search API is maintained by GitHub's search team, different surface with different guarantees. Won't break when REST pagination changes.

Lesson for anyone writing/maintaining GitHub Actions: prefer query APIs over pagination APIs. Any integration depending on undocumented pagination behavior is a future incident.

---

## HACKER NEWS COMMENT DRAFT

**Context:** Post on "Show HN: Claude Code" or "Ask HN: CI/CD best practices" or GitHub Actions thread

**Comment:**

Small fix, big pattern. Claude Code's `lock-closed-issues` workflow silently broke when GitHub changed offset pagination behavior. The workflow ran successfully (green checkmark) but only processed the first page of issues.

The fix: `gh api search/issues -f q="repo:{owner}/{repo} is:issue is:closed" --jq '.items[]' --paginate`

Three principles worth encoding in agent-driven CI:
1. **Prefer query APIs over pagination APIs** — search endpoints are maintained by the vendor's search team; REST pagination is an implementation detail that changes.
2. **Assume API contracts are unstable** — offset pagination wasn't guaranteed to work forever. Build for evolution.
3. **Verify correctness, not just exit codes** — a workflow that exits 0 while doing zero work is worse than one that fails loudly.

When agents write workflows (fetching "all PRs with label X," "all issues closed this month"), they should reach for search, not `GET /issues?page=1&per_page=100`. This is institutional knowledge agents should encode.

Full writeup: https://terminalblog.com/blog/claude-code-lock-issues-workflow-fix/

---

## MEDIUM CROSS-POST

**Title:** The Silent CI Failure That Broke Open Source Automation — And the Search API Fix

**Canonical URL:** https://terminalblog.com/blog/claude-code-lock-issues-workflow-fix/

**Tags:** GitHub Actions, CI/CD, DevOps, Claude Code, Software Engineering, Automation

**Body:**

[Full article content from MDX — see canonical URL for complete version]

**CTA at end:**

*If you want to apply the same rigor to your own agent setup, our [confessor audit: what your AI coding agent touched](/blog/confessor-audit-what-ai-coding-agent-touched/) covers how to verify an agent actually did the work, and [AGENTS.md: make your coding agent 10x smarter](/blog/agents-dot-md-make-coding-agent-10x-smarter/) is a good companion on writing instructions agents won't quietly ignore.*

*Running Claude Code or Cursor but still paying separately for ChatGPT Plus? **[aiFiesta](https://aifiesta.link/muhammed-anshad)** gives you GPT, Claude, Gemini, and 6 more premium models for $12/mo — pick the best model for every task without paying for 9 subscriptions.*

---

## X/TWITTER THREAD (3-5 tweets)

**Tweet 1:** Silent CI failures are the most dangerous kind. Claude Code's lock-closed-issues workflow showed green but did nothing — GitHub's API change broke offset pagination, so only the first page of issues got processed. 🧵

**Tweet 2:** The fix: switch from pagination to search API.
```yaml
# Broken
gh api repos/{owner}/{repo}/issues --paginate

# Fixed
gh api search/issues -f q="repo:{owner}/{repo} is:issue is:closed" --paginate
```
Search API is maintained by GitHub's search team — different guarantees, won't break when REST pagination changes.

**Tweet 3:** Three lessons for agent-driven CI:
1. Prefer query APIs over pagination APIs
2. Assume third-party contracts are unstable
3. Test for correctness, not just exit codes
A green workflow that does nothing > a red one that fails loudly.

**Tweet 4:** When agents write workflows ("fetch all PRs with label X"), they should encode this: reach for search endpoint, not `GET /issues?page=1`. Institutional knowledge that prevents silent failures.
Full writeup: https://terminalblog.com/blog/claude-code-lock-issues-workflow-fix/

---

## PLATFORM POSTING PRIORITY

1. **Reddit r/ClaudeAI** — Direct relevance, agent-driven CI audience
2. **Reddit r/github** — GitHub Actions practitioners, technical
3. **Hacker News** — DevOps/CI audience, "silent failure" pattern resonates
4. **Medium** — SEO, evergreen DevOps content, canonical URL set
5. **X/Twitter** — Thread format, educational, 3-5 tweets max per week

**Timing:** Post Reddit + HN same day (morning US), Medium next day, X thread spaced over 2 days.

**Note:** This article was updated 2026-10-11 — frame as "recently updated with fresh context" when sharing.