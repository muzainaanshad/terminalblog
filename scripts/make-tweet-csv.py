#!/usr/bin/env python3
import csv
from datetime import datetime, timedelta

tweets = [
    ("Data Insights", "Claude Code: 9M downloads/week. OpenClaw: 383K stars. Stars measure hype. Downloads measure usage. The gap is the story."),
    ("Data Insights", "The most underrated coding agent: OpenCode. 6.6M downloads/week but only 13K stars. Nobody talks about it. Everyone uses it."),
    ("Data Insights", "OpenClaw has 383K GitHub stars. But Claude Code has 4x more downloads. Stars != users."),
    ("Data Insights", "Copilot CLI: 1M downloads/week, 11K stars. Claude Code: 9M downloads/week, 137K stars. Copilot is quietly everywhere."),
    ("Data Insights", "Gemini CLI hit 105K stars in weeks. Fastest-growing AI repo. But npm downloads? Still catching up."),
    ("Data Insights", "The coding agent nobody talks about: Codebuff. 1.5K downloads/week, no hype. Just people using it."),
    ("Data Insights", "Hermes: 213K stars, no npm package. Install via curl. Different distribution model."),
    ("Data Insights", "Pi.dev: 70K stars. Gitlawb Zero: 1K stars. Oh My Pi: 17K stars. The zero agents are growing fast."),
    ("Data Insights", "Cline: 64K stars, no npm. VS Code extension model. Stars from IDE integration, not CLI usage."),
    ("Data Insights", "Goose: 51K stars, 33 npm downloads/week. Star-to-download ratio is wild. Watching but not installing."),
    ("Data Insights", "Mimo Code: 34K downloads/week, 12K stars. Xiaomi coding agent. Quiet but real."),
    ("Data Insights", "AmpCode: 18K downloads/week, no public repo. Sourcegraph agent. Downloads speak louder than stars."),
    ("Data Insights", "I compared npm downloads across 15 coding agents. Top 3 account for 90% of installs. The long tail is real."),
    ("Data Insights", "GitHub stars grew 200% for AI coding agents in 2026. npm downloads grew 400%. Usage outpacing hype."),
    ("Data Insights", "Hermes has more stars than Codex CLI. An open-source agent outperforming OpenAI in community interest."),
    ("Hot Takes", "GitHub stars are the new follower count. Meaningless for actual adoption. Fight me."),
    ("Hot Takes", "If your coding agent doesn't have npm downloads, does it even exist?"),
    ("Hot Takes", "The best coding agent isn't the one with the most features. It's the one people actually use. Period."),
    ("Hot Takes", "Hot take: Claude Code is overrated for daily use. OpenCode is better for most workflows."),
    ("Hot Takes", "Stars are hype. Downloads are truth. The gap is the most interesting story in AI right now."),
    ("Hot Takes", "The coding agent market is consolidating. Top 3 have 90% of downloads. Rest fighting for scraps."),
    ("Hot Takes", "Open source != popular. Closed source != dead. The coding agent market defies simple categorization."),
    ("Hot Takes", "Hot take: Most coding agent reviews are useless. They compare features, not adoption."),
    ("Hot Takes", "Everyone talks about Claude Code. Meanwhile OpenCode has 6.6M downloads/week. Silent majority speaks."),
    ("Hot Takes", "Stars are easy to game. Downloads are harder. That's why I track both."),
    ("Hot Takes", "The most interesting metric in AI coding agents isn't stars or downloads. It's the ratio between them."),
    ("Hot Takes", "The coding agent space is a perfect example of Goodhart's Law: when stars become the target, they stop being a good measure."),
    ("Thread Starters", "I tracked 15 AI coding agents for 30 days. Here's what the data actually shows 🧵"),
    ("Thread Starters", "Everyone says Claude Code is the best coding agent. The data tells a different story. Thread 🧵"),
    ("Thread Starters", "The most underrated coding agent in 2026 has 6.6M weekly downloads. Here's why nobody talks about it 🧵"),
    ("Thread Starters", "GitHub stars are meaningless for measuring coding agent adoption. Here's what actually matters 🧵"),
    ("Thread Starters", "I compared npm downloads, GitHub stars, and installation methods for 15 agents. Results surprised me 🧵"),
    ("Thread Starters", "The coding agent market is consolidating faster than you think. Top 3 have 90% of downloads. Thread 🧵"),
    ("Thread Starters", "7 things I learned tracking 15 AI coding agents for a month 🧵"),
    ("Thread Starters", "The star/download ratio is the most important metric in AI coding agents. Here's why 🧵"),
    ("Thread Starters", "Most coding agent comparisons are wrong. They compare features, not adoption. Here's how to do it right 🧵"),
    ("Thread Starters", "I analyzed 15 coding agents across 4 data sources. Here are the 5 biggest surprises 🧵"),
    ("Thread Starters", "The future of coding agents isn't about features. It's about adoption. Here's the data 🧵"),
    ("Thread Starters", "The most popular coding agent isn't the one with the most stars. Here's proof 🧵"),
    ("Thread Starters", "I tracked npm downloads for 15 coding agents. The power law distribution is real 🧵"),
    ("Thread Starters", "The coding agent space in 2026: stars measure hype, downloads measure usage. The gap is the story 🧵"),
    ("Thread Starters", "Why I started tracking coding agent adoption (and what I found) 🧵"),
    ("Quick Tips", "How to choose a coding agent: ignore stars, check npm downloads, read the docs, try it for a week. Done."),
    ("Quick Tips", "Pro tip: before installing a coding agent, check weekly npm downloads. High downloads = active community."),
    ("Quick Tips", "The best way to evaluate a coding agent: install it, use it for a real project for 7 days."),
    ("Quick Tips", "Quick guide: CLI agents (Claude Code, OpenCode, Codex) vs IDE agents (Cline, Kilo Code, Cursor)."),
    ("Quick Tips", "If you're new to coding agents: start with Claude Code or OpenCode. Most docs, largest community."),
    ("Quick Tips", "The #1 mistake people make when choosing a coding agent: comparing features instead of trying them."),
    ("Quick Tips", "Most coding agents are free to try. Install 2-3, use each for a week, pick the one that clicks."),
    ("Quick Tips", "Don't choose a coding agent based on what influencers say. Choose based on your actual workflow."),
    ("Quick Tips", "Pro tip: most coding agents have free tiers or trials. Use them before committing."),
    ("Quick Tips", "If a coding agent doesn't fit your workflow in the first week, it probably won't fit ever."),
    ("Questions", "Which coding agent do you use daily? Reply with just the name."),
    ("Questions", "Claude Code or OpenCode? Which one fits your workflow better? Reply with your pick."),
    ("Questions", "What's the most underrated coding agent? The one nobody talks about but you love?"),
    ("Questions", "Stars or downloads: which metric matters more when choosing a coding agent?"),
    ("Questions", "What's the first thing you check when evaluating a new coding agent? Docs? Stars? Downloads?"),
    ("Questions", "If you could only use ONE coding agent for the rest of 2026, which would it be?"),
    ("Questions", "CLI or IDE agent? Which do you prefer and why? Reply with your workflow."),
    ("Questions", "What feature would make you switch coding agents immediately?"),
    ("Questions", "What's the one thing coding agents still can't do well? Reply with your pain point."),
    ("Questions", "What's your coding agent workflow? Terminal? IDE? Both? Reply with your setup."),
    ("Blog Promos", "I built a leaderboard tracking 15 AI coding agents. Stars, downloads, pricing. Reply for link."),
    ("Blog Promos", "The most comprehensive comparison of AI coding agents. 15 agents, 4 data sources. Reply for leaderboard."),
    ("Blog Promos", "Nobody was tracking which coding agents people actually use. So I built it. Reply for link."),
    ("Blog Promos", "I compared 15 AI coding agents across npm downloads and GitHub stars. Reply for comparison."),
    ("Blog Promos", "New: a live leaderboard of AI coding agents. Updated daily. Sorted by real adoption. Reply for link."),
    ("Blog Promos", "The gap between stars and downloads in coding agents is wild. Reply for the chart."),
    ("Blog Promos", "Every coding agent comparison was based on opinions. I built one based on data. Reply for link."),
    ("Blog Promos", "Which coding agent is most popular? Stars say one thing, downloads say another. Reply for analysis."),
    ("Blog Promos", "The coding agent market is consolidating fast. Top 3 have 90% of downloads. Reply for leaderboard."),
    ("Blog Promos", "Most coding agent reviews compare features. Mine compares adoption. Reply for link."),
    ("Industry", "Gemini CLI hit 105K stars in weeks. Fastest-growing AI repo. npm downloads still catching up."),
    ("Industry", "OpenAI released Codex CLI. Anthropic has Claude Code. Google has Gemini CLI. Big 3 all-in."),
    ("Industry", "The VS Code extension model (Cline, Kilo Code) growing differently than CLI model. Interesting split."),
    ("Industry", "Open source coding agents winning on stars. Closed source winning on downloads. Interesting tension."),
    ("Industry", "AI coding agents are the fastest-adopted developer tool since Git. Growth curves are insane."),
    ("Industry", "AI coding agents are no longer experimental. They're production tools. Adoption proves it."),
    ("Industry", "Every coding agent update feels like a major release. Pace is both exciting and exhausting."),
    ("Personal", "I started tracking coding agents because I was confused. Now I track 15. Funny how that works."),
    ("Personal", "Hardest part of building a leaderboard: keeping data fresh. Different APIs, different formats."),
    ("Personal", "I'm not a coding agent expert. Just someone who tracks data and shares what I find."),
    ("Personal", "Building this leaderboard taught me more than any review could. Data > opinions."),
    ("Personal", "I update the leaderboard daily. Coffee, data, tweet. Morning routine."),
    ("Personal", "I built this leaderboard for myself first. Needed objective comparison. Glad others find it useful."),
    ("Bookmark", "The complete list of AI coding agents in 2026: 15 agents, repos, npm packages, pricing. Bookmark."),
    ("Bookmark", "AI coding agent pricing 2026: Free (OpenCode, Goose, Cline), Freemium (Cursor), Paid (Claude Code)."),
    ("Bookmark", "15 AI coding agents ranked by GitHub stars. Bookmark for reference."),
    ("Bookmark", "15 AI coding agents ranked by npm downloads. Bookmark for reference."),
    ("Bookmark", "Every AI coding agent you need to know about in 2026. 15 agents, one list, no fluff."),
    ("Bookmark", "The coding agent decision tree: Budget? Workflow? CLI or IDE? Here's your agent."),
    ("Bookmark", "The coding agent quick start: Pick one, Install, Use for a week, Decide. Don't overthink."),
    ("Seasonal", "Q3 2026 update: Claude Code dominates downloads. OpenClaw dominates stars. Gap growing."),
    ("Seasonal", "Weekly coding agent digest: biggest download changes, star movements, market shifts."),
    ("Seasonal", "Monthly report: which agents growing, which declining, which stable."),
]

start = datetime(2026, 7, 14, 9, 0)
rows = []
idx = 0
for day in range(14):
    for slot in range(7):
        if idx >= len(tweets):
            break
        t = start + timedelta(days=day, hours=slot * 3)
        cat, text = tweets[idx]
        rows.append({"datetime": t.strftime("%Y-%m-%d %H:%M"), "tweet_text": text, "category": cat})
        idx += 1

with open("docs/tweet-schedule.csv", "w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=["datetime", "tweet_text", "category"])
    w.writeheader()
    w.writerows(rows)

print(f"Generated {len(rows)} tweets for 14 days")
print(f"First: {rows[0]['datetime']} - {rows[0]['tweet_text'][:60]}")
print(f"Last: {rows[-1]['datetime']} - {rows[-1]['tweet_text'][:60]}")
