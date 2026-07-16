const fs = require("fs"), path = require("path");
const BLOG = path.join(process.cwd(), "src/content/blog");
const slug = process.argv[2] || "real-cost-of-ai-coding-agents";
const content = fs.readFileSync(path.join(BLOG, slug + ".mdx"), "utf8");
const m = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
const fm = m[1];
const fields = {};
for (const line of fm.split(/\r?\n/)) {
  const mm = line.match(/^(\w+):\s*"([^"]*)"$/);
  if (mm) fields[mm[1]] = mm[2];
  const arr = line.match(/^tags:\s*\[(.*)\]$/);
  if (arr) fields.tags = arr[1].split(",").map(s => s.trim().replace(/"/g, ""));
}
const body = content.slice(m[0].length).trim();
let tags = (fields.tags || ["ai"])
  .map(t => t.toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 25))
  .filter(Boolean);
if (!tags.includes("terminalblog")) tags.push("terminalblog");
tags = tags.slice(0, 4);
const article = {
  title: fields.title,
  published: true,
  canonical_url: `https://terminalblog.com/blog/${slug}/`,
  description: fields.description,
  body_markdown: body,
  tags,
};
(async () => {
  const r = await fetch("https://dev.to/api/articles", {
    method: "POST",
    headers: { "api-key": "9Kw5MgKzMvJ2g1G8TCUoR3un", "Content-Type": "application/json" },
    body: JSON.stringify({ article }),
  });
  const txt = await r.text();
  console.log("STATUS", r.status);
  console.log("BODY", txt.slice(0, 700));
  if (r.status >= 200 && r.status < 300) {
    const j = JSON.parse(txt);
    console.log("URL", j.url);
  }
})();
