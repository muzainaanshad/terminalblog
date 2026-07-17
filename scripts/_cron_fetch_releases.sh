#!/usr/bin/env bash
repos=(
  "anthropics/claude-code"
  "cursor-ai/cursor"
  "openai/codex"
  "sst/opencode"
  "block/goose"
  "openclaw/openclaw"
  "gitlawb/zero"
  "NousResearch/hermes-agent"
)
for r in "${repos[@]}"; do
  echo "===== $r ====="
  # follow redirects (-L), get last 3 releases, compact fields
  curl -sL "https://api.github.com/repos/$r/releases?per_page=3" \
    | python -c "import sys,json;
try:
  data=json.load(sys.stdin)
except Exception as e:
  print('PARSE_ERR', e); sys.exit()
if isinstance(data,dict):
  print('NOTE:', data.get('message')); sys.exit()
for rel in data:
  print('TAG:', rel.get('tag_name'))
  print('NAME:', rel.get('name'))
  print('PUB:', rel.get('published_at'))
  print('PRE:', rel.get('prerelease'))
  body=(rel.get('body') or '')
  print('BODYLEN:', len(body))
  print('---BODY---')
  print(body[:2500])
  print('---END---')
"
done
