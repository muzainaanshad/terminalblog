import json
import requests
from datetime import datetime, timedelta

# MyMarky API config
BUSINESS_ID = "598a98f9-9ff9-4fa5-90a2-2ad0e313417e"
TOKEN = "mk_live_w61K61zmWDi-I-pviWXoYQX7UmU2mJ-xOAVyNdsKVpY"
BASE_URL = f"https://api.mymarky.ai/api/businesses/{BUSINESS_ID}/posts"
HEADERS = {
    "Authorization": f"Bearer {TOKEN}",
    "Content-Type": "application/json"
}

# Calculate next week dates (Mon-Fri)
today = datetime(2026, 8, 16)  # Sunday Aug 16
monday = today + timedelta(days=2)  # Aug 18
tuesday = today + timedelta(days=3)  # Aug 19
wednesday = today + timedelta(days=4)  # Aug 20
thursday = today + timedelta(days=5)  # Aug 21
friday = today + timedelta(days=6)  # Aug 22

schedule = [
    # Monday - Twitter - terminal tool (Format 2: Somebody built this)
    {
        "day": "Monday",
        "date": monday.replace(hour=10, minute=0, second=0, microsecond=0),
        "platform": "twitter",
        "caption": """Somebody built a terminal UI for git that makes GitHub Desktop look like a toy.

lazygit — 80K stars. Free.

```bash
brew install lazygit
```

Visual commit staging. Instant log navigation. No mouse needed."""
    },
    # Tuesday - LinkedIn - developer workflow (Format 5: The terminal tool I use every day)
    {
        "day": "Tuesday",
        "date": tuesday.replace(hour=13, minute=0, second=0, microsecond=0),
        "platform": "linkedin",
        "caption": """The terminal tool I use every day:

fd — a faster, user-friendly alternative to find.

43K stars. Written in Rust. Instant results. Respects .gitignore by default.

```bash
brew install fd
fd "pattern" /path
```

Replaced find completely for me. The syntax is intuitive — fd pattern instead of find /path -name pattern. Color output. Parallel execution. Smart case sensitivity.

Small tools that do one thing well compound into massive productivity gains over a career. What's the one CLI tool you can't live without?"""
    },
    # Wednesday - Twitter - coding agent (Format 10: Open source just dropped)
    {
        "day": "Wednesday",
        "date": wednesday.replace(hour=16, minute=0, second=0, microsecond=0),
        "platform": "twitter",
        "caption": """Open source just dropped:

Aider — AI pair programming in your terminal.

35K stars. Works with any LLM. Edits files directly.

```bash
pip install aider-chat
aider --model gpt-4o
```

No IDE lock-in. No subscription. Just code."""
    },
    # Thursday - LinkedIn - terminal productivity (Format 1: Stop paying for X)
    {
        "day": "Thursday",
        "date": thursday.replace(hour=19, minute=0, second=0, microsecond=0),
        "platform": "linkedin",
        "caption": """Stop paying for Warp or Terminal.app upgrades.

Ghostty — the terminal emulator that's silently eating the market.

59K stars. GPU-accelerated. Cross-platform. Zero config.

```bash
brew install ghostty
```

Tabs, splits, ligatures, true color — all native. No Electron bloat. Written in Zig by a former iTerm2 contributor.

The best tools don't announce themselves. They just show up, work better, and stay free. What terminal are you using right now?"""
    },
    # Friday - Twitter - open source tool (Format 3: I can't believe this exists)
    {
        "day": "Friday",
        "date": friday.replace(hour=10, minute=0, second=0, microsecond=0),
        "platform": "twitter",
        "caption": """I can't believe this exists in 2026:

A terminal that renders images, PDFs, and graphs inline.

WezTerm — 22K stars. Lua config. GPU rendering.

```bash
brew install wezterm
```

Images in ls output. PDF preview. Kitty graphics protocol. Tabs, panes, multiplexer built-in. No tmux needed."""
    }
]

# Platform mapping
platform_map = {
    "twitter": "TWITTER",
    "linkedin": "LINKEDIN"
}

for post in schedule:
    payload = {
        "caption": post["caption"],
        "restrict_publish_to": [platform_map[post["platform"]]],
        "status": "NEW",
        "scheduled_publish_time": post["date"].isoformat() + "Z",
        "metadata": {
            "day": post["day"],
            "platform": post["platform"],
            "format": "terminal-tool-tweets"
        }
    }
    
    response = requests.post(BASE_URL, headers=HEADERS, json=payload)
    result = response.json()
    print(f"{post['day']} ({post['platform']}): {response.status_code}")
    if response.status_code >= 400:
        print(f"  Error: {result}")
    else:
        print(f"  Post ID: {result.get('id')}")
        print(f"  Scheduled: {result.get('scheduled_publish_time')}")
    print()

print("Done!")