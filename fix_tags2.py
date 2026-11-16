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
    lines = fm.split("\n")
    new_lines = []
    in_tags = False
    tags_indent = 0
    tags_list = []
    
    i = 0
    while i < len(lines):
        line = lines[i]
        stripped = line.strip()
        
        if stripped == "tags:":
            in_tags = True
            tags_indent = len(line) - len(line.lstrip())
            new_lines.append(line)
            i += 1
            continue
        
        if in_tags:
            # Check if this line is part of the tags array
            if line.startswith(" " * (tags_indent + 2)) and stripped.startswith("-"):
                # Extract tag value
                tag_match = re.match(r'\s*-\s*"(.*)"', line)
                if tag_match:
                    tag_val = tag_match.group(1)
                    # Unescape double backslashes
                    tag_val = tag_val.replace('\\\\"', '"').replace('\\\\', '\\')
                    tags_list.append(tag_val)
                i += 1
                continue
            else:
                # End of tags array
                in_tags = False
                if tags_list:
                    # Replace the tags array
                    new_lines = [l for l in new_lines if not l.strip().startswith("-") and l.strip() != "tags:"]
                    new_lines.append("tags: " + str(tags_list).replace("'", '"'))
                    fixed += 1
                # Don't increment i, process this line normally
                continue
        
        new_lines.append(line)
        i += 1
    
    # Handle case where tags array goes to end of frontmatter
    if in_tags and tags_list:
        new_lines = [l for l in new_lines if not l.strip().startswith("-") and l.strip() != "tags:"]
        new_lines.append("tags: " + str(tags_list).replace("'", '"'))
        fixed += 1
    
    new_fm = "\n".join(new_lines)
    if new_fm != fm:
        content = content.replace("---\n" + fm + "\n---", "---\n" + new_fm + "\n---", 1)
        with open(path, "w", encoding="utf-8") as f:
            f.write(content)

print(f"Fixed {fixed} files")