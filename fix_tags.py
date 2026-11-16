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

    if 'tags: "' in content and "tags: [" not in content:
        match = re.match(r"^---\n(.*?)\n---", content, re.DOTALL)
        if match:
            fm = match.group(1)
            lines = fm.split("\n")
            new_lines = []
            for line in lines:
                if line.strip().startswith('tags: "['):
                    tags_match = re.match(r'(tags: )"(.*)"', line.strip())
                    if tags_match:
                        array_str = tags_match.group(2)
                        array_str = array_str.replace('\\"', '"').replace("\\\\", "\\")
                        try:
                            tags_list = yaml.safe_load("[" + array_str + "]")
                            if isinstance(tags_list, list):
                                new_lines.append("tags: " + str(tags_list).replace("'", '"'))
                                fixed += 1
                                continue
                        except:
                            pass
                new_lines.append(line)
            if len(new_lines) == len(lines):
                continue
            new_fm = "\n".join(new_lines)
            content = content.replace("---\n" + fm + "\n---", "---\n" + new_fm + "\n---", 1)
            with open(path, "w", encoding="utf-8") as f:
                f.write(content)

print(f"Fixed {fixed} files")