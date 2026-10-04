import json
data = json.load(open('goose_releases.json'))
print(len(data))
for r in data[:5]:
    print(r.get('tag_name'), r.get('published_at'))