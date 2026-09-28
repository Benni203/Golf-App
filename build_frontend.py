#!/usr/bin/env python3
"""
BirdieTrack Frontend Build & Sync Script
Syncs index.html and js/ modules to www/ for Cordova / Capacitor / PWA parity,
and validates JavaScript syntax.
"""

import os
import sys
import shutil
import filecmp
import subprocess

EXPECTED_MODULES = [
    "data.js",
    "state.js",
    "api.js",
    "whs.js",
    "auth.js",
    "storage.js",
    "dashboard.js",
    "rounds.js",
    "clubs.js",
    "tournaments.js",
    "scorecard.js",
    "calculator.js",
    "rangefinder.js",
    "analytics.js",
    "social.js",
    "app.js"
]

def main():
    repo_root = os.path.dirname(os.path.abspath(__file__))
    js_dir = os.path.join(repo_root, "js")
    www_dir = os.path.join(repo_root, "www")
    www_js_dir = os.path.join(www_dir, "js")
    index_html = os.path.join(repo_root, "index.html")
    www_index_html = os.path.join(www_dir, "index.html")

    print("🚀 [build_frontend] Starting frontend build and parity sync...")

    # 1. Check all modules exist in js/
    missing = []
    for mod in EXPECTED_MODULES:
        p = os.path.join(js_dir, mod)
        if not os.path.isfile(p) or os.path.getsize(p) == 0:
            missing.append(mod)

    if missing:
        print(f"❌ Error: Missing or empty modules in js/: {missing}", file=sys.stderr)
        sys.exit(1)

    print(f"✅ Verified all {len(EXPECTED_MODULES)} modules exist in js/.")

    # 2. Syntax check with node if available
    node_path = shutil.which("node")
    if node_path:
        print("🔍 Checking JavaScript syntax with node -c...")
        for mod in EXPECTED_MODULES:
            mod_path = os.path.join(js_dir, mod)
            res = subprocess.run([node_path, "-c", mod_path], capture_output=True, text=True)
            if res.returncode != 0:
                print(f"❌ Syntax error in {mod}:\n{res.stderr}", file=sys.stderr)
                sys.exit(1)
        print("✅ All JS modules passed syntax validation.")
    else:
        print("⚠️ Node.js not detected; skipped node -c syntax check.")

    # 3. Ensure www and www/js directories exist
    os.makedirs(www_js_dir, exist_ok=True)

    # 4. Sync index.html -> www/index.html
    shutil.copy2(index_html, www_index_html)
    if not filecmp.cmp(index_html, www_index_html, shallow=False):
        print("❌ Error: index.html and www/index.html do not match after copy!", file=sys.stderr)
        sys.exit(1)
    print("✅ Synced index.html -> www/index.html (100% parity).")

    # 5. Sync js/ -> www/js/
    for mod in EXPECTED_MODULES:
        src = os.path.join(js_dir, mod)
        dst = os.path.join(www_js_dir, mod)
        shutil.copy2(src, dst)
        if not filecmp.cmp(src, dst, shallow=False):
            print(f"❌ Error: {src} and {dst} do not match after copy!", file=sys.stderr)
            sys.exit(1)

    print(f"✅ Synced {len(EXPECTED_MODULES)} modules from js/ -> www/js/ (100% parity).")
    print("🎉 Frontend build and sync completed successfully!\n")

if __name__ == "__main__":
    main()
