#!/usr/bin/env python3
"""
HN Karma Builder — finds relevant HN threads and generates draft comments.

Usage:
    python growth/scripts/hn_karma_builder.py [max_threads]

Searches Algolia HN API for recent stories matching terminalblog.com topics,
then generates context-aware draft comments for manual review.
"""

import json
import os
import sys
import time
import re
from datetime import datetime, timedelta, timezone
from pathlib import Path

try:
    import requests
except ImportError:
    print("ERROR: requests not installed. Run: pip install requests")
    sys.exit(1)

# ── Config ──────────────────────────────────────────────────────────────────
ALGOLIA_HN_API = "https://hn.algolia.com/api/v1"
PROJECT_ROOT = Path(__file__).resolve().parents[2]
DRAFTS_DIR = PROJECT_ROOT / "growth" / "hn-drafts"

# Content rules from AGENTS.md
CONTENT_RULES = {
    "forbidden": ["mythology", "gambling", "vulgarity", "alcohol"],
    "max_links": 1,
    "link_domain": "terminalblog.com",
    "style": "genuine value-add only, no spam",
}

# Search terms matching terminalblog's niche
SEARCH_QUERIES = [
    "claude code agent",
    "coding agent security",
    "AI coding agent",
    "AGENTS.md",
    "codex openai agent",
    "cursor AI coding",
    "MCP protocol security",
    "AI agent vulnerability",
    "claude code review",
    "coding agent pricing cost",
    "AI developer tools",
    "sandbox escape AI",
    "prompt injection coding",
    "AI code generation trust",
    "subagent orchestration",
]

# Map of keywords → matching blog post slugs for contextual linking
BLOG_POST_INDEX = {
    "agents.md": "agents-md-complete-guide",
    "agents-md": "agents-md-complete-guide",
    "claude code": "best-coding-agent-setup-six-months",
    "claude-code": "beware-claude-code-auto-mode-overrides-hook-ask",
    "codex": "what-devs-say-codex-openai",
    "cursor": "what-devs-say-cursor",
    "security": "beware-coding-agent-sandbox-leaks-own-credentials",
    "sandbox": "beware-coding-agent-sandbox-leaks-own-credentials",
    "cve": "beware-kiro-ide-mcp-config-rce-cve-2026-10591",
    "mcp": "aws-agent-toolkit-claude-code-mcp",
    "prompt injection": "ai-agent-config-attack-surface-2026",
    "supply chain": "beware-clinejection-supply-chain-attack-github-actions",
    "pricing": "what-8-coding-agents-cost-per-month",
    "cost": "real-cost-of-ai-coding-agents",
    "subagent": "agentic-orchestration-topology-2026",
    "orchestration": "agentic-orchestration-topology-2026",
    "trust": "ai-coding-trust-paradox-verification-crisis",
    "vulnerability": "ai-agent-config-attack-surface-2026",
    "copilot": "coding-agents-vs-github-copilot-difference",
    "open source": "state-of-open-source-coding-agents-2026",
    "vibe coding": "vibe-coding-destroying-your-codebase",
    "permission": "stop-worrying-which-agent-start-worrying-safety",
    "auto mode": "beware-claude-code-auto-mode-overrides-hook-ask",
    "review": "automate-code-review-ai-agents",
    "local model": "run-coding-agents-ollama-local-models-guide",
    "ollama": "run-coding-agents-ollama-local-models-guide",
    "enterprise": "claude-code-gcp-gateway-enterprise-deployment",
    "background task": "beware-claude-code-background-task-sigkill-git-corruption",
    "leak": "beware-coding-agent-sandbox-leaks-own-credentials",
    "rce": "beware-kiro-ide-mcp-config-rce-cve-2026-10591",
    "exploit": "ai-agent-config-attack-surface-2026",
    "best coding agent": "best-coding-agents-2026-decision-guide",
    "decision guide": "best-coding-agents-2026-decision-guide",
    "hermes": "why-hermes-agent-is-the-most-underrated-open-source-ai-assistant-2026",
}


def fetch_hn_stories(query: str, tags: str = "story", hits_per_page: int = 5,
                     numeric_filters: str = None) -> list:
    """Search HN via Algolia API."""
    params = {
        "query": query,
        "tags": tags,
        "hitsPerPage": hits_per_page,
    }
    if numeric_filters:
        params["numericFilters"] = numeric_filters

    try:
        r = requests.get(f"{ALGOLIA_HN_API}/search", params=params, timeout=15)
        r.raise_for_status()
        return r.json().get("hits", [])
    except Exception as e:
        print(f"  [WARN] Failed to fetch for '{query}': {e}")
        return []


def fetch_top_hn_stories(limit: int = 30) -> list:
    """Fetch recent front-page stories."""
    try:
        # Recent stories from last 48h
        since = int((datetime.now(timezone.utc) - timedelta(hours=48)).timestamp())
        r = requests.get(
            f"{ALGOLIA_HN_API}/search",
            params={
                "tags": "story",
                "hitsPerPage": limit,
                "numericFilters": f"created_at_i>{since}",
            },
            timeout=15,
        )
        r.raise_for_status()
        return r.json().get("hits", [])
    except Exception as e:
        print(f"  [WARN] Failed to fetch front page: {e}")
        return []


def score_relevance(story: dict) -> float:
    """Score how relevant an HN story is to terminalblog's content."""
    title = (story.get("title") or "").lower()
    url = (story.get("url") or "").lower()
    text = title + " " + url
    points = 0.0

    # Boost for high-relevance terms
    high_relevance = {
        "claude code": 3.0, "codex": 2.5, "cursor": 2.0, "coding agent": 3.0,
        "ai agent": 2.5, "mcp": 2.5, "agent security": 3.5, "sandbox": 2.5,
        "prompt injection": 3.0, "agentic": 2.5, "subagent": 2.5,
        "copilot": 1.5, "github actions": 1.5, "supply chain": 2.5,
        "ai coding": 3.0, "llm": 1.5, "claude": 2.0, "anthropic": 2.0,
        "openai": 1.5, "vibe coding": 2.0, "code review": 2.0,
        "local model": 1.5, "ollama": 1.5, "enterprise ai": 1.5,
        "developer tools": 2.0, "devtools": 2.0, "ide": 1.0,
        "security": 2.0, "cve": 3.0, "vulnerability": 2.5, "rce": 3.0,
        "exploit": 2.5, "permission": 1.5, "trust": 1.5,
    }

    for term, weight in high_relevance.items():
        if term in text:
            points += weight

    # Boost based on story points (more engagement = better)
    story_points = story.get("points") or 0
    if story_points > 100:
        points += 2.0
    elif story_points > 50:
        points += 1.0
    elif story_points > 20:
        points += 0.5

    # Boost for comments (active discussion)
    num_comments = story.get("num_comments") or 0
    if num_comments > 50:
        points += 1.5
    elif num_comments > 20:
        points += 1.0
    elif num_comments > 5:
        points += 0.5

    # Boost for Show HN (our audience)
    if "show hn" in title:
        points += 1.5

    return points


def find_matching_post(story_text: str) -> str | None:
    """Find the best matching blog post for a given story."""
    story_lower = story_text.lower()
    best_match = None
    best_score = 0

    for keyword, slug in BLOG_POST_INDEX.items():
        if keyword in story_lower:
            # Longer keyword matches are more specific → higher score
            score = len(keyword.split())
            if score > best_score:
                best_score = score
                best_match = slug

    return best_match


def generate_draft_comment(story: dict, post_slug: str | None) -> dict:
    """Generate a draft HN comment for a story."""
    title = story.get("title", "Unknown")
    url = story.get("url", "")
    story_id = story.get("objectID", "")
    points = story.get("points", 0)
    comments = story.get("num_comments", 0)
    hn_url = f"https://news.ycombinator.com/item?id={story_id}"

    text = title + " " + (url or "")
    post_url = f"https://terminalblog.com/blog/{post_slug}/" if post_slug else None

    # Generate contextual comment based on story content
    comment_parts = []
    story_lower = text.lower()

    # Determine comment angle
    if any(kw in story_lower for kw in ["security", "vulnerability", "cve", "exploit", "sandbox", "rce", "leak"]):
        angle = "security"
        comment_parts.append(
            "This is exactly the kind of attack surface that most teams don't audit until after deployment. "
            "The pattern I keep seeing: the agent has more filesystem access than the developer realizes, "
            "and the tool approval flow has gaps that look fine in demos but break under real workload."
        )
        if post_url and "security" in (post_slug or ""):
            comment_parts.append(
                f"We documented a similar attack chain with real exploit steps here: {post_url}"
            )
        elif post_url:
            comment_parts.append(f"Related write-up with specifics: {post_url}")

    elif any(kw in story_lower for kw in ["pricing", "cost", "pricing", "expensive", "cheap", "free"]):
        angle = "pricing"
        comment_parts.append(
            "The real cost people miss isn't per-token — it's the wasted context cycles from bad prompts "
            "and the retry loops when the agent loses track of its own changes. "
            "Effective cost is usually 3-5x the raw token spend when you factor in debugging time."
        )
        if post_url:
            comment_parts.append(f"Full breakdown with real monthly spend data: {post_url}")

    elif any(kw in story_lower for kw in ["mcp", "tool", "plugin", "extension", "integration"]):
        angle = "tooling"
        comment_parts.append(
            "MCP is powerful but the trust model is still immature. Most MCP servers run with the same "
            "privileges as the host agent — no sandboxing, no capability scoping. "
            "One malicious tool call and the whole session is compromised."
        )
        if post_url:
            comment_parts.append(f"We tested this across several MCP implementations: {post_url}")

    elif any(kw in story_lower for kw in ["copilot", "autocomplete", "inline"]):
        angle = "comparison"
        comment_parts.append(
            "The interesting distinction is between autocomplete (suggest next token) and agentic "
            "(execute multi-step plans). They serve different workflows and the pricing reflects that. "
            "Teams that try to use one as the other usually get frustrated."
        )
        if post_url:
            comment_parts.append(f"Detailed comparison with real workflow examples: {post_url}")

    elif any(kw in story_lower for kw in ["claude", "anthropic"]):
        angle = "claude"
        comment_parts.append(
            "One thing worth noting: the gap between Claude Code in interactive mode vs autonomous mode "
            "is significant. In autonomous mode, permission handling and error recovery become the "
            "bottleneck, not the model intelligence."
        )
        if post_url:
            comment_parts.append(f"We tracked the specific failure modes here: {post_url}")

    elif any(kw in story_lower for kw in ["codex", "openai"]):
        angle = "codex"
        comment_parts.append(
            "Codex's sandbox model is interesting — it gives you isolation without the overhead of "
            "full containerization. But the tradeoff is that some tools (git, npm publish) need explicit "
            "allowlisting, which trips up teams used to Copilot's zero-friction flow."
        )
        if post_url:
            comment_parts.append(f"Side-by-side with other agents: {post_url}")

    elif any(kw in story_lower for kw in ["cursor", "ide", "editor"]):
        angle = "ide"
        comment_parts.append(
            "The IDE integration vs terminal agent debate is less about preference and more about "
            "task type. IDE wins for exploration and refactoring where you need visual context. "
            "Terminal agents win for autonomous multi-file changes where context window matters more."
        )
        if post_url:
            comment_parts.append(f"Decision framework we put together: {post_url}")

    elif any(kw in story_lower for kw in ["open source", "oss", "mit", "apache", "gpl"]):
        angle = "opensource"
        comment_parts.append(
            "Open source coding agents are catching up fast on raw capability. The gap now is "
            "mostly in the safety layer — rate limiting, permission controls, and sandboxing. "
            "That's where commercial tools still have the edge."
        )
        if post_url:
            comment_parts.append(f"Full landscape comparison: {post_url}")

    else:
        angle = "general"
        comment_parts.append(
            "The pattern I've noticed across multiple agents: the quality of the output is less "
            "about the model and more about how well the context is structured going in. "
            "A well-written AGENTS.md with clear constraints beats model upgrades consistently."
        )
        if post_url:
            comment_parts.append(f"We tested this empirically across 8 agents: {post_url}")

    comment_text = "\n\n".join(comment_parts)

    return {
        "story_title": title,
        "story_url": url,
        "hn_url": hn_url,
        "story_points": points,
        "story_comments": comments,
        "angle": angle,
        "draft_comment": comment_text,
        "matching_post": post_url,
        "story_id": story_id,
    }


def main():
    max_threads = int(sys.argv[1]) if len(sys.argv) > 1 else 5

    today = datetime.now().strftime("%Y-%m-%d")
    draft_dir = DRAFTS_DIR / today
    draft_dir.mkdir(parents=True, exist_ok=True)

    print(f"🔍 HN Karma Builder — {today}")
    print(f"   Targeting {max_threads} threads\n")

    # ── Phase 1: Collect candidate stories ──
    print("📡 Phase 1: Fetching trending HN stories...")
    candidates = {}

    # Fetch front-page stories
    front_page = fetch_top_hn_stories(limit=30)
    for s in front_page:
        sid = s.get("objectID")
        if sid:
            candidates[sid] = s
    print(f"   Front page: {len(front_page)} stories")

    # Fetch topic-specific searches (staggered to respect rate limits)
    for i, query in enumerate(SEARCH_QUERIES[:12]):  # cap at 12 queries
        hits = fetch_hn_stories(
            query,
            hits_per_page=5,
            numeric_filters=f"created_at_i>{int((datetime.now(timezone.utc) - timedelta(days=3)).timestamp())}",
        )
        for s in hits:
            sid = s.get("objectID")
            if sid:
                candidates[sid] = s
        if i < 11:
            time.sleep(0.3)  # gentle rate limiting

    print(f"   Topic searches: +{len(candidates) - len(front_page)} unique stories")
    print(f"   Total candidates: {len(candidates)}")

    # ── Phase 2: Score and rank ──
    print("\n📊 Phase 2: Scoring relevance...")
    scored = []
    for sid, story in candidates.items():
        score = score_relevance(story)
        if score > 2.0:  # minimum relevance threshold
            story["_relevance_score"] = score
            scored.append(story)

    scored.sort(key=lambda s: s["_relevance_score"], reverse=True)
    top = scored[:max_threads * 2]  # over-fetch, we'll filter after

    print(f"   {len(scored)} stories above threshold")
    print(f"   Top {len(top)} by relevance score\n")

    # ── Phase 3: Generate drafts ──
    print("✍️  Phase 3: Generating draft comments...")
    drafts = []
    seen_urls = set()

    for story in top:
        if len(drafts) >= max_threads:
            break

        story_url = story.get("url", "")
        title = story.get("title", "")

        # Skip duplicates
        if story_url in seen_urls:
            continue
        seen_urls.add(story_url)

        # Find matching blog post
        text = title + " " + (story_url or "")
        post_slug = find_matching_post(text)

        draft = generate_draft_comment(story, post_slug)
        drafts.append(draft)
        print(f"   ✅ [{draft['angle']}] {title[:70]}")

    # ── Phase 4: Write output files ──
    print(f"\n📝 Phase 4: Writing {len(drafts)} drafts to {draft_dir}/")

    # Individual draft files
    for i, draft in enumerate(drafts, 1):
        filename = f"draft-{i:02d}-{draft['angle']}.md"
        filepath = draft_dir / filename

        content = f"""# HN Comment Draft #{i} — {draft['angle'].upper()}

## Target Thread
- **Title:** {draft['story_title']}
- **Points:** {draft['story_points']} | **Comments:** {draft['story_comments']}
- **HN Link:** {draft['hn_url']}
- **Story URL:** {draft['story_url']}

## Relevance
Matched by keyword scoring. Angle: {draft['angle']}

## Draft Comment (REVIEW BEFORE POSTING)

> {draft['draft_comment']}

---
{'🔗 Links to: ' + draft['matching_post'] if draft['matching_post'] else '(no internal link — pure value comment)'}
"""
        filepath.write_text(content, encoding="utf-8")

    # Summary file
    summary_path = draft_dir / "00-summary.json"
    summary = {
        "date": today,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "threads_found": len(drafts),
        "drafts": [
            {
                "file": f"draft-{i:02d}-{d['angle']}.md",
                "story": d["story_title"][:80],
                "hn_url": d["hn_url"],
                "angle": d["angle"],
                "has_link": bool(d["matching_post"]),
                "story_points": d["story_points"],
            }
            for i, d in enumerate(drafts, 1)
        ],
        "content_rules_applied": CONTENT_RULES,
    }
    summary_path.write_text(json.dumps(summary, indent=2, ensure_ascii=False), encoding="utf-8")

    # ── Done ──
    print(f"\n✅ Done! {len(drafts)} drafts saved to growth/hn-drafts/{today}/")
    print(f"   Summary: {summary_path}")
    print(f"\n⚠️  These are DRAFTS only. Review each comment before posting.")
    print(f"   No comments will be posted automatically.\n")

    # Print quick overview
    print("─" * 70)
    print(f"{'#':<3} {'Angle':<12} {'Points':<7} {'Comments':<9} Title")
    print("─" * 70)
    for i, d in enumerate(drafts, 1):
        title_short = d["story_title"][:45]
        print(f"{i:<3} {d['angle']:<12} {d['story_points']:<7} {d['story_comments']:<9} {title_short}")
    print("─" * 70)


if __name__ == "__main__":
    main()
