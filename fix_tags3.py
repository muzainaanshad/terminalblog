import os
import re
import yaml

blog_dir = r"C:\Users\muzai\terminalblog\src\content\blog"
files = [f for f in os.listdir(blog_dir) if f.endswith(".mdx")]

fixed = 0
for fname in files:
    path = os.path.join(blog_dir, fname)
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    # Parse frontmatter
    match = re.match(r"^---\n(.*?)\n---", content, re.DOTALL)
    if not match:
        continue
    
    fm = match.group(1)
    
    # Try to parse as YAML
    try:
        fm_data = yaml.safe_load(fm)
        if fm_data and 'tags' in fm_data:
            tags = fm_data['tags']
            if isinstance(tags, list):
                # Check if tags have double-escaped quotes
                fixed_tags = []
                needs_fix = False
                for tag in tags:
                    if isinstance(tag, str) and '\\"' in tag:
                        # Double escaped - fix it
                        fixed_tag = tag.replace('\\"', '"').replace('\\\\', '\\')
                        fixed_tags.append(fixed_tag)
                        needs_fix = True
                    else:
                        fixed_tags.append(tag)
                
                if needs_fix:
                    fm_data['tags'] = fixed_tags
                    # Dump back to YAML
                    new_fm = yaml.dump(fm_data, default_flow_style=False, sort_keys=False, allow_unicode=True).strip()
                    content = content.replace("---\n" + fm + "\n---", "---\n" + new_fm + "\n---", 1)
                    with open(path, "w", encoding="utf-8") as f:
                        f.write(content)
                    fixed += 1
    except:
        pass

print(f"Fixed {fixed} files")