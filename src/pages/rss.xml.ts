import { getCollection } from 'astro:content';
import { SITE_TITLE, SITE_DESCRIPTION } from '../consts';

export async function GET() {
  const posts = (await getCollection('blog'))
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
    .slice(0, 50);

  const items = posts.map(post => `
    <entry>
      <id>https://terminalblog.com/blog/${post.id}/</id>
      <title><![CDATA[${post.data.title}]]></title>
      <link href="https://terminalblog.com/blog/${post.id}/" />
      <published>${new Date(post.data.pubDate).toISOString()}</published>
      <updated>${new Date(post.data.updatedDate || post.data.pubDate).toISOString()}</updated>
      <summary type="html"><![CDATA[${post.data.description || ''}]]></summary>
      <author><name>Anshad</name></author>
      ${(post.data.tags || []).map(t => `<category term="${t}" />`).join('\n      ')}
    </entry>
  `).join('\n');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${SITE_TITLE}</title>
  <subtitle>${SITE_DESCRIPTION}</subtitle>
  <link href="https://terminalblog.com/rss.xml" rel="self" />
  <link href="https://terminalblog.com/" />
  <updated>${new Date(posts[0]?.data.pubDate || Date.now()).toISOString()}</updated>
  <id>https://terminalblog.com/</id>
  <author>
    <name>Anshad</name>
  </author>
  <icon>https://terminalblog.com/favicon.svg</icon>
  ${items}
</feed>`;

  return new Response(rss, {
    headers: { 'Content-Type': 'application/atom+xml; charset=utf-8' },
  });
}
