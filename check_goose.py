import json
data = json.load(open('goose_releases.json'))
print(len(data))
for r in data:
    print(r.get('tag_name'), r.get('published_at'), r.get('name'))