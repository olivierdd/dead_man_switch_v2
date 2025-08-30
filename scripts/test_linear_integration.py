#!/usr/bin/env python3
"""
Linear Integration Test Script

This script helps test and troubleshoot the Linear.app integration with GitHub.
"""

import os
import sys
import requests
import json
from pathlib import Path


def print_status(message, status="INFO"):
    """Print a formatted status message"""
    colors = {
        "INFO": "\033[94m",    # Blue
        "SUCCESS": "\033[92m",  # Green
        "WARNING": "\033[93m",  # Yellow
        "ERROR": "\033[91m",   # Red
    }
    reset = "\033[0m"

    if status in colors:
        print(f"{colors[status]}[{status}]{reset} {message}")
    else:
        print(f"[{status}] {message}")


def check_linear_webhook():
    """Check if Linear webhook is configured in GitHub"""
    print_status("Checking Linear webhook configuration...")

    # This would require GitHub API access
    print_status("To check webhook configuration:", "WARNING")
    print("1. Go to: https://github.com/olivierdd/dead_man_switch_v2/settings/hooks")
    print("2. Look for Linear webhook")
    print("3. Check webhook delivery status")

    return True


def test_linear_references():
    """Test Linear issue reference formats"""
    print_status("Testing Linear issue reference formats...")

    # Common Linear reference formats
    reference_formats = [
        "DEV-16",           # Basic format
        "DEV-16, DEV-17",   # Multiple issues
        "Closes DEV-16",    # Explicit close
        "Fixes DEV-16",     # Fix reference
        "Resolves DEV-16",  # Resolve reference
    ]

    print("Linear supports these reference formats:")
    for fmt in reference_formats:
        print(f"  • {fmt}")

    return True


def check_commit_message_format():
    """Check if our commit message follows Linear's expected format"""
    print_status("Checking commit message format...")

    # Get the last commit message
    try:
        import subprocess
        result = subprocess.run(
            ["git", "log", "-1", "--pretty=format:%B"],
            capture_output=True,
            text=True,
            cwd="."
        )

        if result.returncode == 0:
            commit_msg = result.stdout.strip()
            print("Last commit message:")
            print("-" * 50)
            print(commit_msg)
            print("-" * 50)

            # Check for Linear references
            if "DEV-" in commit_msg:
                print_status(
                    "✅ Linear issue references found in commit message", "SUCCESS")
                return True
            else:
                print_status("❌ No Linear issue references found", "ERROR")
                return False
        else:
            print_status("❌ Could not retrieve commit message", "ERROR")
            return False

    except Exception as e:
        print_status(f"❌ Error checking commit message: {e}", "ERROR")
        return False


def provide_setup_instructions():
    """Provide setup instructions for Linear integration"""
    print_status("Linear Integration Setup Instructions:", "INFO")
    print("=" * 60)

    print("\n1. **Connect Linear to GitHub:**")
    print("   • Go to Linear.app → Settings → Integrations → GitHub")
    print("   • Connect repository: olivierdd/dead_man_switch_v2")
    print("   • Enable: Auto-link issues, Create branches, Sync labels")
    print("   • ⚠️  IMPORTANT: Enable 'Auto-close issues on merge'")

    print("\n2. **Verify Webhook Configuration:**")
    print("   • Go to GitHub → Repository → Settings → Webhooks")
    print("   • Look for Linear webhook")
    print("   • Check webhook delivery status")

    print("\n3. **Test Integration:**")
    print("   • Create a test issue in Linear")
    print("   • Reference it in a commit: 'Fixes LINEAR-123'")
    print("   • Push to GitHub and check if it auto-closes")

    print("\n4. **Manual Issue Closure (if webhook fails):**")
    print("   • Go to Linear → Issues")
    print("   • Find DEV-16, DEV-17, DEV-18, DEV-19, DEV-20, DEV-21")
    print("   • Move them to 'Done' state")
    print("   • Add comment: 'Resolved in commit 570e217'")


def main():
    """Main function"""
    print("🔗 Linear Integration Test & Troubleshooting")
    print("=" * 60)

    # Check if we're in the right directory
    if not Path(".git").exists():
        print_status(
            "❌ Please run this script from the git repository root", "ERROR")
        sys.exit(1)

    # Run checks
    webhook_ok = check_linear_webhook()
    format_ok = test_linear_references()
    commit_ok = check_commit_message_format()

    print("\n" + "=" * 60)

    if commit_ok:
        print_status("✅ Commit message format is correct", "SUCCESS")
    else:
        print_status("❌ Commit message needs Linear references", "ERROR")

    print("\n" + "=" * 60)
    provide_setup_instructions()

    print("\n" + "=" * 60)
    print_status("Next steps:", "INFO")
    print("1. Follow the setup instructions above")
    print("2. Test with a new issue and commit")
    print("3. If issues still don't auto-close, manually move them to 'Done'")

    return 0


if __name__ == "__main__":
    sys.exit(main())
