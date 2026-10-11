#!/bin/bash
# Schedule terminal tool tweets for next week (Mon-Fri) via MyMarky API

BASE_URL="https://api.mymarky.ai/api/businesses/598a98f9-9ff9-4fa5-90a2-2ad0e313417e"
AUTH="Bearer mk_live_w61K61zmWDi-I-pviWXoYQX7UmU2mJ-xOAVyNdsKVpY"

# Next Monday is Oct 12, 2026
MONDAY="2026-10-12"

schedule_post() {
    local caption="$1"
    local platform="$2"
    local day_offset="$3"
    local time="$4"
    local post_num="$5"
    
    # Calculate date
    local post_date=$(date -u -d "${MONDAY} + ${day_offset} days" +"%Y-%m-%d")
    local scheduled_at="${post_date}T${time}:00.000Z"
    
    echo "Scheduling post $post_num: $platform on $post_date at $time UTC"
    
    # Escape caption for JSON
    local escaped_caption=$(echo "$caption" | sed 's/\\/\\\\/g' | sed 's/"/\\"/g' | sed ':a;N;$!ba;s/\n/\\n/g')
    
    payload=$(cat <<EOF
{
    "caption": "$escaped_caption",
    "scheduled_publish_time": "$scheduled_at",
    "restrict_publish_to": ["$platform"]
}
EOF
)
    
    response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/posts" \
        -H "Authorization: $AUTH" \
        -H "Content-Type: application/json" \
        -d "$payload")
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n -1)
    
    if [ "$http_code" = "201" ] || [ "$http_code" = "200" ]; then
        echo "  ✓ Success: $(echo "$body" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)"
    else
        echo "  ✗ Failed ($http_code): $body"
    fi
    echo ""
}

# Post 1: Monday 10:00 UTC - Twitter - Format 1: Stop paying
schedule_post "Stop paying for video downloaders.

Just use lux:
\`\`\`bash
brew install lux
lux https://youtube.com/watch?v=xxx
\`\`\`
31K stars. Free. Open source." "twitter" 0 "10:00" 1

# Post 2: Monday 13:00 UTC - Twitter - Format 2: Somebody built this
schedule_post "Somebody built a terminal UI for git that makes GitHub Desktop look like a toy.

lazygit — 80K stars. Free.

\`\`\`bash
brew install lazygit
\`\`\`" "twitter" 0 "13:00" 2

# Post 3: Tuesday 10:00 UTC - LinkedIn - Developer workflow
schedule_post "The terminal tool I use every day for developer workflow:

fd — a faster, user-friendly alternative to find.

43K stars. Written in Rust. Instant results.

\`\`\`bash
brew install fd
fd \"pattern\" /path
\`\`\`

It replaced find completely for me. The syntax highlighting and smart defaults make it feel like find but designed for humans, not scripts.

What's the one terminal tool you'd never give up?" "linkedIn" 1 "10:00" 3

# Post 4: Tuesday 16:00 UTC - LinkedIn - Terminal productivity (Format 4: Why is nobody talking about this)
schedule_post "Why is nobody talking about this?

bat — a cat clone with syntax highlighting, git integration, and automatic paging.

59K stars. Replaced cat for me completely.

\`\`\`bash
brew install bat
bat file.py
\`\`\`

The git integration alone is worth it — modified lines show in the margin. Plus it auto-pages when output is long. Small tool, massive quality of life improvement.

Sometimes the best tools are the ones that just replace what you already use, but better." "linkedIn" 1 "16:00" 4

# Post 5: Wednesday 10:00 UTC - Twitter - Coding agent (Format 3: Can't believe this exists)
schedule_post "I can't believe this exists in 2026:

A terminal tool that uses LLM to debug your code.

clerkie-cli — 100 stars and growing.

\`\`\`bash
npm install -g clerkie-cli
\`\`\`

Open source just dropped." "twitter" 2 "10:00" 5

# Post 6: Thursday 10:00 UTC - LinkedIn - Terminal productivity (Format 11: This terminal tool saved me hours)
schedule_post "This terminal tool saved me hours:

ast-grep — structural code search and rewrite.

15K stars. Find patterns in code, not just text.

\`\`\`bash
brew install ast-grep
sg pattern -l js
\`\`\`

Unlike grep, it understands code structure. Search for \"function calls with 3 arguments\" or \"async functions without try-catch\" — it parses the AST.

For refactoring across large codebases, it's a game changer. One command does what used to take hours of manual search-and-replace.

What's the most time-saving terminal tool in your workflow?" "linkedIn" 3 "10:00" 6

# Post 7: Thursday 16:00 UTC - LinkedIn - More terminal productivity (Format 12: Most underrated)
schedule_post "The most underrated terminal tool:

cheat.sh — the only cheat sheet you need.

41K stars. Access from any terminal:

\`\`\`bash
curl cheat.sh/tar
\`\`\`

Works for any command, any language. No install needed — just curl. Community-maintained examples that are actually useful.

I use it daily. \`curl cheat.sh/python/decorator\` or \`curl cheat.sh/docker/compose\` — instant examples without leaving the terminal.

What's your go-to for quick reference?" "linkedIn" 3 "16:00" 7

# Post 8: Friday 10:00 UTC - Twitter - Open source tool (Format 6: Free alternative)
schedule_post "Free alternative to Postman:

wuzz — interactive CLI for HTTP inspection.

10K stars. No signup. No cloud. Just terminal.

\`\`\`bash
go install github.com/asciimoo/wuzz@latest
\`\`\`" "twitter" 4 "10:00" 8

echo "All posts scheduled!"