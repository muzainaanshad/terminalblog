#!/usr/bin/env python3
"""
Submit terminalblog articles to the Google Search Console Indexing API.

Usage:
  python scripts/gsc-index-submit.py --recent-days 7
  python scripts/gsc-index-submit.py --url https://terminalblog.com/blog/foo/
  python scripts/gsc-index-submit.py --all
  python scripts/gsc-index-submit.py --recent-days 7 --dry-run

Scans src/content/blog/*.mdx, builds public URLs, and calls
Indexing API urlNotifications.publish for posts whose pubDate or
updatedDate falls inside the lookback window. New posts get
URL_PUBLISHED; updates get URL_UPDATED. A state file (tmp/gsc-index-state.json)
tracks submitted URLs so a URL is only submitted once per publish/update
(force re-submission with --force). Respects the 200 URLs/day quota.

Requires: credentials/gsc-service-account.json with a service account
that (a) has the Indexing API enabled in its GCP project and
(b) is added as a Search Console user on terminalblog.com.
"""
import argparse
import datetime
import glob
import json
import logging
import os
import re
import sys
import time

import google.auth.transport.requests
import google.oauth2.service_account
import googleapiclient.discovery
import googleapiclient.errors

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KEY_FILE = os.path.join(ROOT, "credentials", "gsc-service-account.json")
BLOG_DIR = os.path.join(ROOT, "src", "content", "blog")
BASE_URL = "https://terminalblog.com"
INDEXING_SCOPE = "https://www.googleapis.com/auth/indexing"
DAILY_QUOTA = 200
STATE_PATH = os.path.join(ROOT, "tmp", "gsc-index-state.json")
LOG_PATH = os.path.join(ROOT, "tmp", "gsc-index-submit.log")

log = logging.getLogger("gsc-index-submit")


def setup_logging():
    os.makedirs(os.path.dirname(LOG_PATH), exist_ok=True)
    handlers = [logging.FileHandler(LOG_PATH, encoding="utf-8"), logging.StreamHandler()]
    logging.basicConfig(level=logging.INFO, handlers=handlers, format="%(asctime)s %(levelname)s %(message)s")


def slug_to_url(slug: str) -> str:
    return f"{BASE_URL}/blog/{slug}/"


def first_date(text: str, key: str):
    m = re.search(key + r':\s*["\']?(\d{4}-\d{2}-\d{2})', text)
    return datetime.date.fromisoformat(m.group(1)) if m else None


def scan_recent(days: int) -> list:
    cutoff = datetime.date.today() - datetime.timedelta(days=days)
    out = []
    for path in glob.glob(os.path.join(BLOG_DIR, "*.mdx")):
        with open(path, encoding="utf-8") as f:
            text = f.read()
        pub = first_date(text, "pubDate")
        upd = first_date(text, "updatedDate")
        slug = os.path.basename(path)[: -len(".mdx")]
        url = slug_to_url(slug)
        # The Indexing API only supports URL_UPDATED (covers new + updated)
        # and URL_REMOVED. New posts use URL_UPDATED too.
        if (pub and pub >= cutoff) or (upd and upd >= cutoff):
            out.append({"url": url, "slug": slug, "type": "URL_UPDATED",
                        "pub": str(pub) if pub else None, "upd": str(upd) if upd else None})
    seen, result = set(), []
    for r in sorted(out, key=lambda r: str(r["pub"] or r["upd"])):
        if r["url"] not in seen:
            seen.add(r["url"])
            result.append(r)
    return result


def scan_all() -> list:
    out = []
    for path in glob.glob(os.path.join(BLOG_DIR, "*.mdx")):
        with open(path, encoding="utf-8") as f:
            text = f.read()
        pub = first_date(text, "pubDate")
        slug = os.path.basename(path)[: -len(".mdx")]
        out.append({"url": slug_to_url(slug), "slug": slug, "type": "URL_UPDATED",
                    "pub": str(pub) if pub else None, "upd": None})
    return out


def load_state() -> dict:
    try:
        with open(STATE_PATH, encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {"sent": []}


def save_state(state: dict):
    os.makedirs(os.path.dirname(STATE_PATH), exist_ok=True)
    with open(STATE_PATH, "w", encoding="utf-8") as f:
        json.dump(state, f, indent=2)


def build_service():
    with open(KEY_FILE, encoding="utf-8") as f:
        key = json.load(f)
    creds = google.oauth2.service_account.Credentials.from_service_account_info(
        key, scopes=[INDEXING_SCOPE]
    )
    service = googleapiclient.discovery.build("indexing", "v3", credentials=creds, cache_discovery=False)
    return service


def main() -> int:
    ap = argparse.ArgumentParser(description="Submit terminalblog URLs to Google Indexing API")
    ap.add_argument("--recent-days", type=int, default=7, help="lookback window for pubDate/updatedDate")
    ap.add_argument("--url", type=str, default=None, help="submit one explicit URL (URL_UPDATED)")
    ap.add_argument("--all", action="store_true", help="submit every blog URL in sitemap order")
    ap.add_argument("--dry-run", action="store_true", help="list candidates without calling the API")
    ap.add_argument("--force", action="store_true", help="ignore the state file (re-submit everything)")
    args = ap.parse_args()

    setup_logging()

    if args.url:
        targets = [{"url": args.url, "slug": args.url.rstrip("/").split("/")[-1],
                    "type": "URL_UPDATED", "pub": None, "upd": None}]
    elif args.all:
        targets = scan_all()
        log.info("All-posts mode: %d candidates", len(targets))
    else:
        targets = scan_recent(args.recent_days)

    if not targets:
        log.info("No articles published/updated in the lookback window. Nothing to submit.")
        return 0

    log.info("Candidates (%d):", len(targets))
    for t in targets:
        log.info("  [%s] %s  (pub=%s upd=%s)", t["type"], t["url"], t.get("pub"), t.get("upd"))

    if args.dry_run:
        log.info("DRY-RUN — no API calls made.")
        return 0

    state = load_state()
    sent = set(state.get("sent", []))
    today = datetime.date.today().isoformat()
    sent_today = sum(1 for u in sent if state.get("dates", {}).get(u) == today)

    pending = [t for t in targets if args.force or t["url"] not in sent]
    available = max(0, DAILY_QUOTA - sent_today)
    log.info("Quota: %d used today, %d available. Pending after dedupe: %d",
             sent_today, available, len(pending))
    pending = pending[:available]
    if not pending:
        log.info("Nothing left to submit (quota exhausted or all already submitted).")
        return 0

    service = build_service()
    ok = fail = 0
    for t in pending:
        try:
            resp = service.urlNotifications().publish(
                body={"url": t["url"], "type": t["type"]}
            ).execute()
            meta = resp.get("urlNotificationMetadata", {})
            latest = meta.get("latestUpdate") or meta.get("latestRemove") or {}
            log.info("OK  %s %s -> notifyTime=%s", t["type"], t["url"], latest.get("notifyTime", "?"))
            ok += 1
            state.setdefault("sent", []).append(t["url"])
            state.setdefault("dates", {})[t["url"]] = today
        except googleapiclient.errors.HttpError as e:
            code = e.resp.status
            if code == 429:
                log.error("RATE LIMIT (429) at %s — stopping; quota for today is spent.", t["url"])
                break
            log.error("HTTP %s for %s: %s", code, t["url"], e)
            fail += 1
            time.sleep(1)
        except Exception as e:  # network etc.
            log.error("EXC for %s: %s", t["url"], e)
            fail += 1

    state["lastRun"] = datetime.datetime.now().isoformat()
    save_state(state)
    log.info("SUMMARY: ok=%d failed=%d total-ok=%d (quota %d/day)", ok, fail, len(state["sent"]), DAILY_QUOTA)
    return 0


if __name__ == "__main__":
    sys.exit(main())
