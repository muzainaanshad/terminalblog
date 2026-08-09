#!/usr/bin/env python3
"""
TerminalBlog Analytics ETL Pipeline
====================================
Pulls data from Google Search Console + GA4 + Bing into local SQLite.
Run daily via cron or manually.

Usage:
    python scripts/analytics-etl.py              # Full ETL
    python scripts/analytics-etl.py --gsc        # Search Console only
    python scripts/analytics-etl.py --ga4        # GA4 only
    python scripts/analytics-etl.py --report     # Print report
"""
import json
import sqlite3
import sys
from datetime import datetime, timedelta
from pathlib import Path

CONFIG_DIR = Path.home() / ".terminalblog"
CONFIG_FILE = CONFIG_DIR / "config.json"
DB_FILE = CONFIG_DIR / "analytics.db"


def get_config():
    with open(CONFIG_FILE) as f:
        return json.load(f)


def get_gsc_service():
    from google.oauth2 import service_account
    from googleapiclient.discovery import build
    
    config = get_config()
    creds = service_account.Credentials.from_service_account_file(
        config["google"]["credentials_file"],
        scopes=["https://www.googleapis.com/auth/webmasters.readonly"],
    )
    return build("searchconsole", "v1", credentials=creds)


def get_ga4_service():
    from google.oauth2 import service_account
    from googleapiclient.discovery import build
    
    config = get_config()
    creds = service_account.Credentials.from_service_account_file(
        config["google"]["credentials_file"],
        scopes=["https://www.googleapis.com/auth/analytics.readonly"],
    )
    return build("analyticsdata", "v1beta", credentials=creds)


def init_db():
    conn = sqlite3.connect(str(DB_FILE))
    c = conn.cursor()
    
    c.execute("""CREATE TABLE IF NOT EXISTS gsc_daily (
        date TEXT,
        queries_total INTEGER,
        clicks_total INTEGER,
        impressions_total INTEGER,
        ctr_avg REAL,
        position_avg REAL,
        UNIQUE(date)
    )""")
    
    c.execute("""CREATE TABLE IF NOT EXISTS gsc_queries (
        date TEXT,
        query TEXT,
        clicks INTEGER,
        impressions INTEGER,
        ctr REAL,
        position REAL,
        UNIQUE(date, query)
    )""")
    
    c.execute("""CREATE TABLE IF NOT EXISTS gsc_pages (
        date TEXT,
        page TEXT,
        clicks INTEGER,
        impressions INTEGER,
        ctr REAL,
        position REAL,
        UNIQUE(date, page)
    )""")
    
    c.execute("""CREATE TABLE IF NOT EXISTS ga4_daily (
        date TEXT,
        users INTEGER,
        sessions INTEGER,
        pageviews INTEGER,
        bounce_rate REAL,
        avg_session_duration REAL,
        UNIQUE(date)
    )""")
    
    c.execute("""CREATE TABLE IF NOT EXISTS ga4_pages (
        date TEXT,
        page_path TEXT,
        page_title TEXT,
        views INTEGER,
        UNIQUE(date, page_path)
    )""")
    
    c.execute("""CREATE TABLE IF NOT EXISTS ga4_sources (
        date TEXT,
        source TEXT,
        medium TEXT,
        sessions INTEGER,
        UNIQUE(date, source, medium)
    )""")
    
    conn.commit()
    return conn


def pull_gsc(conn, days=28):
    """Pull Search Console data for last N days"""
    print("Pulling Search Console data...")
    service = get_gsc_service()
    config = get_config()
    site_url = config["search_console"]["property_url"]
    
    end_date = datetime.utcnow().date() - timedelta(days=3)  # GSC has 2-3 day delay
    start_date = end_date - timedelta(days=days)
    
    c = conn.cursor()
    
    # Daily aggregates
    request = {
        "startDate": start_date.isoformat(),
        "endDate": end_date.isoformat(),
        "dimensions": ["date"],
        "dataState": "final",
    }
    result = service.searchanalytics().query(siteUrl=site_url, body=request).execute()
    
    daily_count = 0
    for row in result.get("rows", []):
        d = row["keys"][0]
        clicks = int(row.get("clicks", 0))
        impressions = int(row.get("impressions", 0))
        ctr = row.get("ctr", 0)
        pos = row.get("position", 0)
        c.execute(
            "INSERT OR REPLACE INTO gsc_daily VALUES (?,?,?,?,?,?)",
            (d, 0, clicks, impressions, ctr, pos),
        )
        daily_count += 1
    print(f"  Daily data: {daily_count} days")
    
    # Top queries
    request2 = {
        "startDate": start_date.isoformat(),
        "endDate": end_date.isoformat(),
        "dimensions": ["query"],
        "rowLimit": 500,
        "dataState": "final",
    }
    result2 = service.searchanalytics().query(siteUrl=site_url, body=request2).execute()
    
    query_count = 0
    for row in result2.get("rows", []):
        q = row["keys"][0]
        clicks = int(row.get("clicks", 0))
        impressions = int(row.get("impressions", 0))
        ctr = row.get("ctr", 0)
        pos = row.get("position", 0)
        # Store with end_date as the snapshot date
        c.execute(
            "INSERT OR REPLACE INTO gsc_queries VALUES (?,?,?,?,?,?)",
            (end_date.isoformat(), q, clicks, impressions, ctr, pos),
        )
        query_count += 1
    print(f"  Queries: {query_count}")
    
    # Top pages
    request3 = {
        "startDate": start_date.isoformat(),
        "endDate": end_date.isoformat(),
        "dimensions": ["page"],
        "rowLimit": 500,
        "dataState": "final",
    }
    result3 = service.searchanalytics().query(siteUrl=site_url, body=request3).execute()
    
    page_count = 0
    for row in result3.get("rows", []):
        page = row["keys"][0]
        clicks = int(row.get("clicks", 0))
        impressions = int(row.get("impressions", 0))
        ctr = row.get("ctr", 0)
        pos = row.get("position", 0)
        c.execute(
            "INSERT OR REPLACE INTO gsc_pages VALUES (?,?,?,?,?,?)",
            (end_date.isoformat(), page, clicks, impressions, ctr, pos),
        )
        page_count += 1
    print(f"  Pages: {page_count}")
    
    conn.commit()
    return daily_count, query_count, page_count


def pull_ga4(conn, days=28):
    """Pull GA4 data for last N days"""
    print("Pulling GA4 data...")
    service = get_ga4_service()
    config = get_config()
    property_id = config["ga4"]["property_id"]
    
    c = conn.cursor()
    date_range = {"startDate": f"{days}daysAgo", "endDate": "today"}
    
    # Daily metrics
    request = {
        "dateRanges": [date_range],
        "dimensions": [{"name": "date"}],
        "metrics": [
            {"name": "totalUsers"},
            {"name": "sessions"},
            {"name": "screenPageViews"},
            {"name": "bounceRate"},
            {"name": "averageSessionDuration"},
        ],
    }
    result = service.properties().runReport(property=property_id, body=request).execute()
    
    daily_count = 0
    for row in result.get("rows", []):
        d = row["dimensionValues"][0]["value"]
        users = int(row["metricValues"][0]["value"])
        sessions = int(row["metricValues"][1]["value"])
        views = int(row["metricValues"][2]["value"])
        bounce = float(row["metricValues"][3]["value"])
        duration = float(row["metricValues"][4]["value"])
        c.execute(
            "INSERT OR REPLACE INTO ga4_daily VALUES (?,?,?,?,?,?)",
            (d, users, sessions, views, bounce, duration),
        )
        daily_count += 1
    print(f"  Daily data: {daily_count} days")
    
    # Top pages
    request2 = {
        "dateRanges": [date_range],
        "dimensions": [{"name": "pagePath"}, {"name": "pageTitle"}],
        "metrics": [{"name": "screenPageViews"}],
        "orderBys": [{"metric": {"metricName": "screenPageViews"}, "desc": True}],
        "limit": 200,
    }
    result2 = service.properties().runReport(property=property_id, body=request2).execute()
    
    page_count = 0
    for row in result2.get("rows", []):
        path = row["dimensionValues"][0]["value"]
        title = row["dimensionValues"][1]["value"]
        views = int(row["metricValues"][0]["value"])
        today = datetime.utcnow().date().isoformat()
        c.execute(
            "INSERT OR REPLACE INTO ga4_pages VALUES (?,?,?,?)",
            (today, path, title, views),
        )
        page_count += 1
    print(f"  Pages: {page_count}")
    
    # Traffic sources
    request3 = {
        "dateRanges": [date_range],
        "dimensions": [{"name": "sessionSource"}, {"name": "sessionMedium"}],
        "metrics": [{"name": "sessions"}],
        "orderBys": [{"metric": {"metricName": "sessions"}, "desc": True}],
        "limit": 50,
    }
    result3 = service.properties().runReport(property=property_id, body=request3).execute()
    
    source_count = 0
    for row in result3.get("rows", []):
        source = row["dimensionValues"][0]["value"]
        medium = row["dimensionValues"][1]["value"]
        sessions = int(row["metricValues"][0]["value"])
        today = datetime.utcnow().date().isoformat()
        c.execute(
            "INSERT OR REPLACE INTO ga4_sources VALUES (?,?,?,?)",
            (today, source, medium, sessions),
        )
        source_count += 1
    print(f"  Sources: {source_count}")
    
    conn.commit()
    return daily_count, page_count, source_count


def print_report(conn):
    """Print a summary report"""
    c = conn.cursor()
    
    print("\n" + "=" * 60)
    print("TERMINALBLOG ANALYTICS REPORT")
    print("=" * 60)
    
    # GSC Summary
    print("\n--- Search Console (last 28 days) ---")
    try:
        c.execute("SELECT SUM(clicks), SUM(impressions), AVG(ctr), AVG(position) FROM gsc_daily")
        row = c.fetchone()
        if row and row[0]:
            print(f"  Total clicks: {row[0]:,}")
            print(f"  Total impressions: {row[1]:,}")
            print(f"  Avg CTR: {row[2]:.2%}")
            print(f"  Avg position: {row[3]:.1f}")
    except:
        print("  No data")
    
    # Top queries
    print("\n  Top 10 Queries:")
    try:
        c.execute("SELECT query, clicks, impressions, position FROM gsc_queries ORDER BY clicks DESC LIMIT 10")
        for row in c.fetchall():
            print(f"    [{row[1]} clicks] [pos {row[3]:.0f}] {row[0]}")
    except:
        print("    No data")
    
    # Top pages (GSC)
    print("\n  Top 10 Pages (by clicks):")
    try:
        c.execute("SELECT page, clicks, impressions, position FROM gsc_pages ORDER BY clicks DESC LIMIT 10")
        for row in c.fetchall():
            path = row[0].replace("https://terminalblog.com", "")
            print(f"    [{row[1]} clicks] [pos {row[3]:.0f}] {path}")
    except:
        print("    No data")
    
    # GA4 Summary
    print("\n--- GA4 (last 7 days) ---")
    try:
        c.execute("SELECT SUM(users), SUM(sessions), SUM(pageviews) FROM ga4_daily WHERE date >= date('now', '-7 days')")
        row = c.fetchone()
        if row and row[0]:
            print(f"  Users: {row[0]:,}")
            print(f"  Sessions: {row[1]:,}")
            print(f"  Pageviews: {row[2]:,}")
    except:
        print("  No data")
    
    # Top pages (GA4)
    print("\n  Top 10 Pages (by views):")
    try:
        c.execute("SELECT page_path, page_title, views FROM ga4_pages ORDER BY views DESC LIMIT 10")
        for row in c.fetchall():
            print(f"    [{row[2]} views] {row[0]}")
    except:
        print("    No data")
    
    # Traffic sources
    print("\n  Traffic Sources:")
    try:
        c.execute("SELECT source, medium, sessions FROM ga4_sources ORDER BY sessions DESC LIMIT 10")
        for row in c.fetchall():
            print(f"    [{row[2]} sessions] {row[0]} / {row[1]}")
    except:
        print("    No data")
    
    print("\n" + "=" * 60)


def main():
    args = sys.argv[1:]
    conn = init_db()
    
    if "--report" in args:
        print_report(conn)
    elif "--gsc" in args:
        pull_gsc(conn)
    elif "--ga4" in args:
        pull_ga4(conn)
    else:
        try:
            pull_gsc(conn)
        except Exception as e:
            print(f"GSC error: {e}")
        try:
            pull_ga4(conn)
        except Exception as e:
            print(f"GA4 error: {e}")
        print_report(conn)
    
    conn.close()


if __name__ == "__main__":
    main()
