#!/bin/bash
# Batch download Pexels images for terminalblog articles
set -e
PEXELS_KEY="jCw9Capz9KctQydInQYT2QhlK3fUuA0sV1Qj0uul5jWC4NdDAmu3iCON"
OUTDIR="/c/Users/muzai/seo-ai-blog/public/images"
mkdir -p "$OUTDIR"

fetch() {
  local slug="$1" query="$2"
  curl -s -H "Authorization: $PEXELS_KEY" \
    "https://api.pexels.com/v1/search?query=$query&per_page=2&orientation=landscape" | \
    python3 -c "
import sys, json
d = json.load(sys.stdin)
for p in d.get('photos', [])[:2]:
    print(p['src']['large'])
" | while read url; do
    local idx="${3:-0}"
    local f="$OUTDIR/${slug}-${idx}.jpg"
    curl -s -o "$f" "$url" && echo "  Downloaded $f"
    idx=$((idx+1))
  done
}

echo "Downloading images..."
fetch "terminal-coding" "coding+terminal+dark+green" 1
fetch "ai-agent" "artificial+intelligence+robot+cyber" 1
fetch "code-review" "code+review+programming+developer" 1
fetch "comparison" "comparison+chart+data+analytics" 1
fetch "security" "cybersecurity+lock+digital+protection" 1

echo "Done. Files:"
ls -la "$OUTDIR"/
