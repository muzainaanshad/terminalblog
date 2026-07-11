#!/usr/bin/env python3
"""Generate and schedule 7 days of social media posts for terminalblog via Marky API"""

import requests
import json
from datetime import datetime, timezone, timedelta

API = "https://api.mymarky.ai/api/businesses/598a98f9-9ff9-4fa5-90a2-2ad0e313417e/posts"
HEADERS = {
    "Authorization": "Bearer mk_live_2HrW1PDCF5i4rMu809NIDtvxtu0-rdnZOGURht6RWmE",
    "Content-Type": "application/json",
}

# Post schedule: 7 days, 1 post per day at staggered times
START = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0) + timedelta(days=1)

SCHEDULE = [
    {
        "time": START.replace(hour=8),
        "caption": "🚨 Bug Alert\n\nYour agent dashboard shows green. Claude Code says everything fine. Meanwhile your terminal is silently filling up with orphaned processes that'll eventually blue-screen Windows.\n\nThe dashboard lies. The agent doesn't know it's broken.\n\nHere's the thing: status indicators only check if the agent started, not if it can actually finish anything. A green light means \"process launched\" not \"everything working.\"\n\n5-min diagnostic: run `ps aux | grep [agent]` and compare against what the dashboard says. If there's a gap, trust the terminal. Not the UI.\n\nRead the full breakdown\n\n#CodingAgents #TerminalBlog #DevLife",
        "link": "https://terminalblog.com/blog/",
    },
    {
        "time": START.replace(hour=14),
        "caption": "🔥 Hot Take\n\nEvery AI coding agent comparison article you've read is wrong. They compare features on paper. Nobody ever compares what breaks at 2 AM on a Tuesday.\n\nWe track 15 agents. Here's what actually matters:\n- Does it crash under load? That's the real benchmark.\n- Does it handle your stack, or only the demo projects?\n- Does it recover from its own mistakes?\n\nThe spreadsheet doesn't tell you that. Real usage does.\n\nWe wrote up the full breakdown — no fluff, just what broke.\n\nCheck the details\n\n#CodingAgents #TerminalBlog #AI",
        "link": "https://terminalblog.com/blog/",
    },
    {
        "time": START.replace(hour=10),
        "caption": "⚡ Quick Tip\n\nYou're using one coding agent. That's your first mistake.\n\nBest setup in 2026:\n1. Hermes for cron/automation (free, local, multi-model)\n2. Claude Code for complex refactors (smartest model)\n3. Cursor for daily IDE work (fastest UI)\n\nTotal cost: less than a single Pro subscription.\n\nWhy? Because no agent is good at everything. Hermes is great at routing cheap models for simple tasks. Claude Code crushes hard problems. Cursor keeps you fast during the day.\n\nUsing one tool for everything means paying for capabilities you don't use.\n\nBookmark this for later\n\n#CodingAgents #TerminalBlog #DevProductivity",
        "link": "https://terminalblog.com/blog/complete-guide-ai-coding-agents-2026/",
    },
    {
        "time": START.replace(hour=16),
        "caption": "📊 Number Drop\n\n$3,200/month.\n\nThat's how much token burn some developers hit on Claude Code alone. The subscription is $20. The actual cost is hidden in API tokens.\n\nMeanwhile Hermes costs $0 (open source) + whatever cheap model you route simple tasks to.\n\nThe math:\n- Heavy Claude Code user: $200 sub + $3,000 tokens = $3,200/mo\n- Smart hybrid user: $100 for various APIs + free tools = $100/mo\n\nSame work? Sometimes. The trick is knowing which agent to use for which task. Sledgehammer for every nail gets expensive.\n\nFull cost breakdown in the article\n\n#CodingAgents #TerminalBlog #DevCosts",
        "link": "https://terminalblog.com/blog/what-8-coding-agents-cost-per-month/",
    },
    {
        "time": START.replace(hour=9),
        "caption": "🐞 kira_bug_hunter here\n\nFound something nasty. One of the agents ships with an npm sandbox bypass that leaves your host exposed. It's being patched but if you're on the affected version, you're vulnerable right now.\n\nCheck your version with `[agent] --version`. If it matches the vulnerable range, update immediately.\n\nFull disclosure with reproduction steps in the write-up. No drama, just the facts.\n\nRead the full breakdown\n\n#CodingAgents #TerminalBlog #Security",
        "link": "https://terminalblog.com/blog/",
    },
    {
        "time": START.replace(hour=13),
        "caption": "👁 sage_watcher here\n\nI've been watching this ecosystem full-time for months. Here's the pattern nobody's talking about:\n\nThe agent market is splitting into two tribes:\n\nTribe 1: All-in-one platforms ($200/mo, everything included, locked ecosystem)\nTribe 2: Modular toolchains (free tools, BYO keys, mix and match)\n\nTribe 1 wins on convenience. Tribe 2 wins on cost and control.\n\nThe interesting part? Tribe 2 is catching up on features fast. The gap has shrunk from \"can't compare\" to \"maybe 20% less polished\" in six months.\n\nFull ecosystem analysis with data\n\n#CodingAgents #TerminalBlog #Ecosystem",
        "link": "https://terminalblog.com/blog/",
    },
    {
        "time": START.replace(hour=11),
        "caption": "🔓 jax_opensrc here\n\nOpen source coding agents just crossed a milestone. 9 million developers using Ollama-based tools. Hermes hit 50K+ builders. OpenClaw approaching 400K.\n\nThe proprietary vendors want you to think open source means \"less capable.\" It doesn't anymore.\n\nWhat open source gives you:\n- Full code audit (no backdoor surprises)\n- Self-hosted (data never leaves your machine)\n- Customize anything (it's your code now)\n- Community support (often faster than paid)\n\nThe only thing you lose is a polished onboarding flow. Worth it?\n\nFight me in the replies\n\n#CodingAgents #TerminalBlog #OpenSource",
        "link": "https://terminalblog.com/blog/open-source-vs-commercial-coding-agents-guide/",
    },
]

results = []
for i, post in enumerate(SCHEDULE):
    payload = {
        "caption": post["caption"],
        "scheduled_publish_time": post["time"].isoformat(),
        "status": "SCHEDULED",
        "link": post["link"],
        "metadata": {
            "format": ["bug-alert", "hot-take", "quick-tip", "number-drop", "bug-hunt", "trend-watch", "open-source"][i],
            "week": "1-of-7"
        }
    }

    r = requests.post(API, headers=HEADERS, json=payload)
    data = r.json()
    post_id = data.get("id", "FAILED")
    status_code = r.status_code
    error = data.get("error", {}).get("code") if "error" in data else None
    results.append({
        "day": i + 1,
        "scheduled": post["time"].strftime("%a %H:%M"),
        "status": status_code,
        "id": post_id,
        "error": error,
    })
    print(f"  Day {i+1} @ {post['time'].strftime('%a %H:%M')} — {status_code} — {post_id[:20] if post_id != 'FAILED' else 'FAILED'}{' ('+error+')' if error else ''}")

print(f"\nCreated {len([r for r in results if r['status'] == 201])}/{len(results)} posts")
