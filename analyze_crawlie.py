import json

with open(r'C:\Users\muzai\terminalblog\tmp\crawlie-report.json', 'r') as f:
    data = json.load(f)

issues = []
for page in data['pages']:
    url = page['url']
    status = page.get('status', 0)
    
    # Broken links (404s)
    if status >= 400:
        issues.append({'type': 'broken_link', 'url': url, 'status': status})
    
    # Missing meta description
    if not page.get('metaDescription') or page.get('metaDescription', '').strip() == '':
        issues.append({'type': 'missing_meta_description', 'url': url})
    
    # Missing alt text on images
    if page.get('imagesMissingAlt', 0) > 0:
        issues.append({'type': 'missing_alt_text', 'url': url, 'count': page['imagesMissingAlt']})
    
    # Thin content (< 600 words for articles)
    if '/blog/' in url and '/tag/' not in url and url != 'https://terminalblog.com/blog' and '/tool/' not in url and '/leaderboard' not in url:
        word_count = page.get('wordCount', 0) or page.get('preRenderWordCount', 0)
        if word_count < 600:
            issues.append({'type': 'thin_content', 'url': url, 'word_count': word_count})
    
    # Missing structured data
    if '/blog/' in url and '/tag/' not in url and url != 'https://terminalblog.com/blog' and '/tool/' not in url:
        schema_types = page.get('schemaTypes', [])
        if not schema_types or len(schema_types) == 0:
            issues.append({'type': 'missing_structured_data', 'url': url})
    
    # GEO score low
    geo = page.get('geo', {})
    if geo.get('score', 100) < 70 and '/blog/' in url and '/tag/' not in url:
        issues.append({'type': 'low_geo_score', 'url': url, 'score': geo.get('score'), 'details': geo})

print(f"Total pages: {len(data['pages'])}")
print(f"Total issues found: {len(issues)}")

from collections import Counter
type_counts = Counter(i['type'] for i in issues)
print("\nIssues by type:")
for t, c in type_counts.most_common():
    print(f"  {t}: {c}")

for t in ['broken_link', 'missing_meta_description', 'missing_alt_text', 'thin_content', 'missing_structured_data', 'low_geo_score']:
    type_issues = [i for i in issues if i['type'] == t]
    if type_issues:
        print(f"\n--- {t} ({len(type_issues)}) ---")
        for i in type_issues[:10]:
            print(f"  {i['url']} - {i.get('status', i.get('count', i.get('word_count', i.get('score', ''))))}")