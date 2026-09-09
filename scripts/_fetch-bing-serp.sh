#!/bin/bash
# Fetch Bing RSS for 10 target queries
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36"
BASE="https://www.bing.com/search?format=rss&setlang=en&cc=US&q="
queries=(
"hermes+agent+v0.19.0+password+manager"
"claude+code+vs+hermes+agent"
"ai+coding+agent+security+checklist"
"mimo+code+vs+opencode"
"opencode+vs+oh+my+pi"
"deepagents+code+auto+mode"
"hermes+agent+deep+dive"
"coding+agent+reviews+2026"
"best+ai+coding+agents"
"hermes+agent+api+key+security"
)
DIR="/c/Users/muzai/terminalblog/.tmp-serp"
mkdir -p "$DIR"
: > "$DIR/status.txt"
i=1
for q in "${queries[@]}"; do
  curl -s -A "$UA" --compressed --max-time 40 "$BASE$q" -o "$DIR/bing_rss_$i.xml"
  echo "q$i: $(wc -c < "$DIR/bing_rss_$i.xml" 2>/dev/null) bytes" >> "$DIR/status.txt"
  i=$((i+1))
  sleep 2
done
echo "ALLDONE $(date +%H:%M:%S)" >> "$DIR/status.txt"