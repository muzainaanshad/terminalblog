import os
import re
import yaml

blog_dir = r"C:\Users\muzai\terminalblog\src\content\blog"
files = [f for f in os.listdir(blog_dir) if f.endswith(".mdx")]

fixed = 0
errors = 0

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
    except Exception as e:
        # Try to fix common issues manually
        # The issue is tags like - \"\\\"security\\\"\" which should be - "security"
        lines = fm.split("\n")
        new_lines = []
        for line in lines:
            # Fix tag lines with double-escaped quotes
            if re.match(r'\s*-\s*".*\\\\".*"', line):
                # Fix: - \"\\\"security\\\"\" -> - "security"
                line = re.sub(r'(-\s*")(\\\\.*)(")', lambda m: m.group(1) + m.group(2).replace('\\"', '"').replace("\\\\", "\\") + m.group(3), line)
            new_lines.append(line)
        
        fixed_fm = "\n".join(new_lines)
        try:
            fm_data = yaml.safe_load(fixed_fm)
        except:
            errors += 1
            continue
        
        # Write back fixed version
        new_fm = yaml.dump(fm_data, default_flow_style=False, sort_keys=False, allow_unicode=True).strip()
        content = content.replace("---\n" + fm + "\n---", "---\n" + new_fm + "\n---", 1)
        with open(path, "w", encoding="utf-8") as f:
            f.write(content)
        fixed += 1
        continue
    
    # Check if tags need fixing
    if fm_data and 'tags' in fm_data:
        tags = fm_data['tags']
        if isinstance(tags, list):
            fixed_tags = []
            needs_fix = False
            for tag in tags:
                if isinstance(tag, str):
                    # Check for literal backslash-quote sequences that shouldn't be there
                    # The parsed tag might be \"security\" (literal backslash quote)
                    if tag.startswith('\\"') and tag.endswith('\\"'):
                        fixed_tag = tag[1:-1]  # Remove the literal backslash-quotes
                        fixed_tags.append(fixed_tag)
                        needs_fix = True
                    elif '\\"' in tag or "\\'" in tag:
                        fixed_tag = tag.replace('\\"', '"').replace("\\'", "'")
                        fixed_tag = fixed_tag.replace('\\\\', '\\')
                        fixed_tags.append(fixed_tag)
                        needs_fix = True
                    else:
                        fixed_tags.append(tag)
                else:
                    fixed_tags.append(tag)
            
            if needs_fix:
                fm_data['tags'] = fixed_tags
                new_fm = yaml.dump(fm_data, default_flow_style=False, sort_keys=False, allow_unicode=True).strip()
                content = content.replace("---\n" + fm + "\n---", "---\n" + new_fm + "\n---", 1)
                with open(path, "w", encoding="utf-8") as f:
                    f.write(content)
                fixed += 1

print(f"Fixed {fixed} files, {errors} errors")