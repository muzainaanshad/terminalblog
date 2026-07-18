#!/usr/bin/env python
import urllib.request, json
def get(url):
    req=urllib.request.Request(url, headers={"User-Agent":"cron"})
    return json.load(urllib.request.urlopen(req, timeout=30))
for r in ["cursor-ai/cursor","NousResearch/hermes-agent"]:
    try:
        d=get(f"https://api.github.com/repos/{r}")
        print("REPO", d.get("full_name"), "| stars:", d.get("stargazers_count"))
    except Exception as e:
        print("REPO_ERR", r, e)
# hermes releases
try:
    d=get("https://api.github.com/repos/NousResearch/hermes-agent/releases?per_page=3")
    if isinstance(d,dict):
        print("HERMES_NOTE", d.get("message"))
    else:
        for rel in d:
            print("HERMES_TAG", rel.get("tag_name"), "|", rel.get("published_at"), "|", rel.get("name"))
            print((rel.get("body") or "")[:500]); print("---")
except Exception as e:
    print("HERMES_ERR", e)
# full claude v2.1.212 body
try:
    d=get("https://api.github.com/repos/anthropics/claude-code/releases/tags/v2.1.212")
    print("CLAUDE212_BODY_FULL:")
    print(d.get("body"))
except Exception as e:
    print("CLAUDE212_ERR", e)
