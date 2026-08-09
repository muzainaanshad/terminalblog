#!/usr/bin/env python3
"""
404 Monitor for terminalblog.com
Fetches sitemap, checks every blog URL, reports any returning 404.
For 404s, checks git history to see if the article was deleted.
"""
import subprocess
import sys
import xml.etree.ElementTree as ET
from concurrent.futures import ThreadPoolExecutor, as_completed
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

SITE = "https://terminalblog.com"
SITEMAP_INDEX_URL = f"{SITE}/sitemap-index.xml"
HEADERS = {"User-Agent": "terminalblog-404-monitor/1.0"}
TIMEOUT = 15
MAX_WORKERS = 20

def fetch_url(url):
    req = Request(url, headers=HEADERS)
    try:
        resp = urlopen(req, timeout=TIMEOUT)
        return resp.status, resp.read().decode("utf-8", errors="replace")
    except HTTPError as e:
        return e.code, ""
    except URLError:
        return 0, ""
    except Exception:
        return 0, ""

def check_url(url):
    """Return (url, status_code)"""
    req = Request(url, method="HEAD", headers=HEADERS)
    try:
        resp = urlopen(req, timeout=TIMEOUT)
        return url, resp.status
    except HTTPError as e:
        return url, e.code
    except URLError:
        return url, 0
    except Exception:
        return url, 0

def get_blog_urls():
    """Parse sitemap index → individual sitemaps → blog URLs"""
    status, data = fetch_url(SITEMAP_INDEX_URL)
    if status != 200:
        print(f"ERROR: Sitemap index returned {status}")
        sys.exit(1)

    # Get individual sitemap URLs
    root = ET.fromstring(data)
    sitemap_urls = [loc.text for loc in root.iter("{http://www.sitemaps.org/schemas/sitemap/0.9}loc")]

    blog_urls = []
    for sm_url in sitemap_urls:
        # Only check blog sitemaps
        if "blog" not in sm_url.lower():
            continue
        sm_status, sm_data = fetch_url(sm_url)
        if sm_status != 200:
            print(f"WARNING: Sitemap {sm_url} returned {sm_status}")
            continue
        sm_root = ET.fromstring(sm_data)
        for loc in sm_root.iter("{http://www.sitemaps.org/schemas/sitemap/0.9}loc"):
            if loc.text:
                blog_urls.append(loc.text)

    # Also get all pages sitemap
    for sm_url in sitemap_urls:
        if "blog" in sm_url.lower():
            continue
        sm_status, sm_data = fetch_url(sm_url)
        if sm_status != 200:
            continue
        sm_root = ET.fromstring(sm_data)
        for loc in sm_root.iter("{http://www.sitemaps.org/schemas/sitemap/0.9}loc"):
            if loc.text:
                blog_urls.append(loc.text)

    return blog_urls

def find_deleted_file(url_path):
    """Search git log for deleted file matching this URL path"""
    try:
        # Convert URL path to possible file paths
        # e.g. /blog/some-post-2026/ -> some-post-2026.mdx, some-post-2026/index.mdx
        slug = url_path.strip("/").split("/")[-1]  # e.g. "some-post-2026"

        # Search git log for deletions matching this slug
        result = subprocess.run(
            ["git", "log", "--diff-filter=D", "--name-only", "--pretty=format:", "--",
             f"**/{slug}*"],
            capture_output=True, text=True, timeout=30,
            cwd="."
        )
        files = [f.strip() for f in result.stdout.strip().split("\n") if f.strip()]
        return files
    except Exception:
        return []

def try_restore(file_path):
    """Try to restore a deleted file from git history"""
    try:
        result = subprocess.run(
            ["git", "log", "--diff-filter=D", "--format=%H", "--", file_path],
            capture_output=True, text=True, timeout=30,
            cwd="."
        )
        commit = result.stdout.strip().split("\n")[0]
        if commit:
            # Restore from the commit before deletion
            result2 = subprocess.run(
                ["git", "checkout", f"{commit}~1", "--", file_path],
                capture_output=True, text=True, timeout=30,
                cwd="."
            )
            return result2.returncode == 0
    except Exception:
        pass
    return False

def main():
    print("Fetching sitemap URLs...")
    urls = get_blog_urls()
    print(f"Found {len(urls)} URLs to check\n")

    if not urls:
        print("ERROR: No URLs found in sitemap")
        sys.exit(1)

    # Check all URLs concurrently
    results = []
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        futures = {executor.submit(check_url, url): url for url in urls}
        done = 0
        for future in as_completed(futures):
            done += 1
            if done % 50 == 0:
                print(f"  Checked {done}/{len(urls)}...", flush=True)
            results.append(future.result())

    # Filter to broken URLs (4xx, 5xx, or connection failures)
    broken = [(url, status) for url, status in results if status >= 400 or status == 0]
    broken.sort(key=lambda x: x[0])

    if not broken:
        print("All blog URLs OK")
        sys.exit(0)

    print(f"\n{'='*60}")
    print(f"FOUND {len(broken)} BROKEN URL(S)")
    print(f"{'='*60}\n")

    for url, status in broken:
        url_path = url.replace(SITE, "")
        print(f"--- {url}")
        print(f"  Status: {status}")
        print(f"  Path: {url_path}")

        # Check git history
        deleted_files = find_deleted_file(url_path)
        if deleted_files:
            print(f"  Git: deleted file(s) found: {', '.join(deleted_files)}")
            # Try auto-restore
            restored = False
            for f in deleted_files:
                if try_restore(f):
                    print(f"  Auto-restore: SUCCESS → {f}")
                    print(f"  → Needs: git add {f} && git commit && git push && Vercel deploy")
                    restored = True
                    break
            if not restored:
                print(f"  Auto-restore: FAILED (manual check needed)")
        else:
            print(f"  Git: no deleted file found (may never have been published or URL is non-article)")
        print()

    # Summary
    print(f"{'='*60}")
    print(f"SUMMARY: {len(broken)} broken out of {len(urls)} total URLs")
    restored_count = sum(1 for url, _ in broken if find_deleted_file(url.replace(SITE, "")))
    if restored_count:
        print(f"  {restored_count} may need git commit + push to fix")
    print(f"{'='*60}")

if __name__ == "__main__":
    main()
