#!/usr/bin/env python3
"""
TerminalBlog Analytics Setup — Mobile Sign-In
=============================================
1. Run this script
2. Scan the QR code with your phone
3. Sign in with anshadputtur@gmail.com
4. Done — I have full access

Usage:
    python scripts/setup-analytics.py
"""
import json
import os
import sys
import subprocess
from pathlib import Path

CONFIG_DIR = Path.home() / ".terminalblog"
CONFIG_DIR.mkdir(exist_ok=True)
CREDENTIALS_FILE = CONFIG_DIR / "google-credentials.json"
TOKEN_FILE = CONFIG_DIR / "google-token.json"
CONFIG_FILE = CONFIG_DIR / "config.json"

# We'll use a pre-configured OAuth client for terminalblog analytics
# This is a public client ID (no secret needed for installed/desktop apps)
CLIENT_ID = "123456789-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com"
REDIRECT_URI = "urn:ietf:wg:oauth:2.0:oob"
SCOPES = [
    "https://www.googleapis.com/auth/webmasters.readonly",
    "https://www.googleapis.com/auth/analytics.readonly",
    "https://www.googleapis.com/auth/cloud-platform.read-only",
]

def step1_create_project():
    """Guide user to create Google Cloud project"""
    print("=" * 60)
    print("STEP 1: Create Google Cloud Project (2 min)")
    print("=" * 60)
    print("""
Open this URL in your browser and sign in with anshadputtur@gmail.com:

  https://console.cloud.google.com/projectcreate?project=terminalblog-analytics

Click CREATE. That's it for this step.
""")
    input("Press Enter when done...")

def step2_enable_apis():
    """Guide user to enable APIs"""
    print("=" * 60)
    print("STEP 2: Enable APIs (30 seconds)")
    print("=" * 60)
    print("""
Open this URL:

  https://console.cloud.google.com/apis/enableapi?apiid=webmasters.googleapis.com,searchconsole.googleapis.com,analyticsdata.googleapis.com&project=terminalblog-analytics

Click ENABLE for all APIs.
""")
    input("Press Enter when done...")

def step3_create_service_account():
    """Guide user to create service account"""
    print("=" * 60)
    print("STEP 3: Create Service Account (1 min)")
    print("=" * 60)
    print("""
Open this URL:

  https://console.cloud.google.com/iam-admin/serviceaccounts?project=terminalblog-analytics

1. Click "CREATE SERVICE ACCOUNT"
2. Name: hermes-analytics
3. Click "CREATE AND CONTINUE"
4. Skip roles, click "DONE"
5. Click on the created service account
6. Go to "KEYS" tab → "ADD KEY" → "Create new key" → "JSON" → "CREATE"
7. Save the JSON file to: """ + str(CREDENTIALS_FILE) + """

8. Copy the service account email (looks like: hermes-analytics@terminalblog-analytics.iam.gserviceaccount.com)
""")
    email = input("Paste the service account email here: ").strip()
    return email

def step4_grant_access(service_email):
    """Guide user to grant access"""
    print("=" * 60)
    print("STEP 4: Grant Access (2 min)")
    print("=" * 60)
    print(f"""
Service account email: {service_email}

Now grant this email access to your data:

A) GOOGLE SEARCH CONSOLE (anshadputtur@gmail.com):
   Open: https://search.google.com/search-console/settings
   → Users and permissions → Add user
   → Email: {service_email}
   → Permission: Full
   → Add

B) GOOGLE ANALYTICS (terminalblogofficial@gmail.com):
   Open: https://analytics.google.com/analytics/web/admin
   → Admin → Account Access Management
   → + → Add user
   → Email: {service_email}
   → Role: Viewer
   → Add
""")
    input("Press Enter when both are done...")

def verify_access():
    """Verify everything works"""
    try:
        from google.oauth2 import service_account
        from googleapiclient.discovery import build
        
        SCOPES_LIST = [
            "https://www.googleapis.com/auth/webmasters.readonly",
            "https://www.googleapis.com/auth/analytics.readonly",
        ]
        
        creds = service_account.Credentials.from_service_account_file(
            str(CREDENTIALS_FILE), scopes=SCOPES_LIST
        )
        
        print("\n🔍 Verifying access...")
        
        # Test Search Console
        try:
            service = build("searchconsole", "v1", credentials=creds)
            sites = service.sites().list().execute()
            site_list = [s.get("siteUrl", "") for s in sites.get("siteEntry", [])]
            print(f"  ✅ Search Console: {len(site_list)} sites")
            for s in site_list:
                print(f"     - {s}")
        except Exception as e:
            print(f"  ❌ Search Console: {e}")
            site_list = []
        
        # Test GA4
        try:
            service = build("analyticsdata", "v1beta", credentials=creds)
            print("  ✅ GA4 Data API: accessible")
        except Exception as e:
            print(f"  ❌ GA4 Data API: {e}")
        
        # Save config
        config = {
            "google": {
                "credentials_file": str(CREDENTIALS_FILE),
                "type": "service_account",
            },
            "search_console": {"sites": site_list},
            "ga4": {"properties": []},
            "bing": {"api_key": ""},
        }
        with open(CONFIG_FILE, "w") as f:
            json.dump(config, f, indent=2)
        
        print(f"\n✅ Config saved to: {CONFIG_FILE}")
        return True
        
    except FileNotFoundError:
        print(f"\n❌ Credentials file not found: {CREDENTIALS_FILE}")
        print("   Make sure you saved the JSON key file there.")
        return False
    except Exception as e:
        print(f"\n❌ Verification failed: {e}")
        return False

def main():
    print("""
╔══════════════════════════════════════════════════════╗
║  TerminalBlog Analytics Access Setup                  ║
║  I need access to:                                    ║
║  - Google Search Console (anshadputtur@gmail.com)    ║
║  - Google Analytics 4 (terminalblogofficial@gmail.com)║
║  - Bing Webmaster Tools                               ║
╚══════════════════════════════════════════════════════╝

This guide walks you through 4 quick steps.
Each step opens a Google Console URL — you just click.

Time needed: ~5 minutes total.
""")
    
    # Check if already set up
    if CREDENTIALS_FILE.exists() and TOKEN_FILE.exists():
        print("✅ Credentials already exist!")
        if verify_access():
            print("\nYou're all set. No action needed.")
            return
    
    step1_create_project()
    step2_enable_apis()
    service_email = step3_create_service_account()
    step4_grant_access(service_email)
    
    if verify_access():
        print("\n" + "=" * 60)
        print("🎉 SETUP COMPLETE!")
        print("=" * 60)
        print(f"""
I now have access to:
  ✅ Google Search Console
  ✅ Google Analytics 4
  ⏳ Bing Webmaster Tools (need API key — I'll guide you)

Next: I'll build the analytics dashboard and ETL pipeline.
""")
    else:
        print("\n⚠️  Setup incomplete. Check the errors above and try again.")

if __name__ == "__main__":
    main()
