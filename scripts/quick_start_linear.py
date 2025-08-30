#!/usr/bin/env python3
"""
Quick Start Script for Linear.app Integration

This script will help you get started with the Linear integration by:
1. Checking prerequisites
2. Guiding you through Linear setup
3. Testing the integration
4. Syncing your first tasks

Run this script to begin your Linear integration journey!
"""

import os
import sys
import subprocess
from pathlib import Path
import json

# Global variable to store project root path
PROJECT_ROOT = None


def print_header(title):
    """Print a formatted header"""
    print("\n" + "=" * 60)
    print(f" {title}")
    print("=" * 60)


def print_step(step_num, title, description=""):
    """Print a formatted step"""
    print(f"\n{step_num}. {title}")
    if description:
        print(f"   {description}")


def check_prerequisites():
    """Check if all prerequisites are met"""
    print_header("PREREQUISITES CHECK")

    # Check Python version
    python_version = sys.version_info
    if python_version.major < 3 or (python_version.major == 3 and python_version.minor < 8):
        print("❌ Python 3.8+ is required")
        return False
    print(
        f"✅ Python {python_version.major}.{python_version.minor}.{python_version.micro}")

    # Check if we're in the right directory and find the project root
    current_dir = Path.cwd()
    project_root = None

    # Check if we're in the project root (has secret-safe subdirectory)
    if Path("secret-safe").exists():
        project_root = current_dir
        print("✅ Running from project root directory")
    # Check if we're inside the secret-safe directory
    elif current_dir.name == "secret-safe" and Path("..").exists():
        project_root = current_dir.parent
        print("✅ Running from secret-safe directory, found project root")
    else:
        print("❌ Please run this script from either:")
        print("   - Project root directory (where secret-safe/ folder is located)")
        print("   - secret-safe/ directory")
        return False

    # Check if linear.json exists
    linear_json_path = project_root / "secret-safe" / "linear.json"
    if not linear_json_path.exists():
        print(f"❌ linear.json configuration not found at {linear_json_path}")
        return False
    print("✅ Linear configuration found")

    # Check if linear_service.py exists
    linear_service_path = project_root / \
        "secret-safe" / "scripts" / "linear_service.py"
    if not linear_service_path.exists():
        print(f"❌ linear_service.py not found at {linear_service_path}")
        return False
    print("✅ Linear service script found")

    # Store project root for later use
    global PROJECT_ROOT
    PROJECT_ROOT = project_root

    return True


def install_dependencies():
    """Install required Python dependencies"""
    print_header("INSTALLING DEPENDENCIES")

    try:
        subprocess.run([
            sys.executable, "-m", "pip", "install",
            "requests", "python-dotenv"
        ], check=True, capture_output=True)
        print("✅ Dependencies installed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install dependencies: {e}")
        return False


def guide_linear_setup():
    """Guide user through Linear setup"""
    print_header("LINEAR.APP SETUP GUIDE")

    print("""
To set up Linear.app for your project, follow these steps:

1. Go to https://linear.app and sign up/sign in
2. Create a new organization called "Secret Safe"
3. Create a new project with key "SS" and name "Secret Safe - Digital Dead Man's Switch"
4. Create a team called "Development" with key "DEV"
5. Set up the workflow states: Backlog → To Do → In Progress → In Review → Testing → Done
6. Create the labels and epics as defined in your linear.json configuration
7. Connect your GitHub repository: olivierdd/dead_man_switch_v2
8. Get your API key from Linear → Settings → API → Create Key

Once you've completed these steps, you'll need your Linear API key to continue.
""")

    api_key = input(
        "\nEnter your Linear API key (or press Enter to skip for now): ").strip()

    if api_key:
        # Save to .env file
        env_file = PROJECT_ROOT / "secret-safe" / ".env"
        if not env_file.exists():
            env_file.write_text("")

        with open(env_file, "a") as f:
            f.write(f"\nLINEAR_API_KEY={api_key}\n")
            f.write("LINEAR_TEAM_KEY=DEV\n")
            f.write("LINEAR_PROJECT_KEY=SS\n")

        print("✅ API key saved to .env file")
        return True
    else:
        print(
            "⚠️  API key not provided. You'll need to set it later to test the integration.")
        return False


def test_integration():
    """Test the Linear integration"""
    print_header("TESTING LINEAR INTEGRATION")

    # Check if API key is available
    if not os.getenv('LINEAR_API_KEY'):
        print("❌ LINEAR_API_KEY not found in environment")
        print("Please set your API key and try again")
        return False

    try:
        # Test the API connection
        result = subprocess.run([
            sys.executable, str(PROJECT_ROOT / "secret-safe" /
                                "scripts" / "linear_service.py"), "--test-api"
        ], check=True, capture_output=True, text=True, cwd=PROJECT_ROOT)

        if "Linear API connection successful" in result.stdout:
            print("✅ Linear API connection successful!")
            return True
        else:
            print("❌ Linear API connection failed")
            print(result.stdout)
            return False

    except subprocess.CalledProcessError as e:
        print(f"❌ Integration test failed: {e}")
        print(e.stderr)
        return False


def sync_initial_tasks():
    """Sync initial tasks to Linear"""
    print_header("SYNCING INITIAL TASKS")

    try:
        # Sync the main integration plan
        result = subprocess.run([
            sys.executable, str(PROJECT_ROOT / "secret-safe" /
                                "scripts" / "linear_service.py"), "--sync-auth-tasks"
        ], check=True, capture_output=True, text=True, cwd=PROJECT_ROOT)

        print("✅ Initial task sync completed!")
        print("\nSynced tasks:")

        # Show what was synced
        with open(PROJECT_ROOT / "TODO.json", "r") as f:
            todo_data = json.load(f)

        for task in todo_data.get('todo', []):
            if task.get('linear_issue'):
                print(f"  - {task['linear_issue']}: {task['title']}")

        return True

    except subprocess.CalledProcessError as e:
        print(f"❌ Task sync failed: {e}")
        print(e.stderr)
        return False


def show_next_steps():
    """Show next steps for the user"""
    print_header("NEXT STEPS")

    print("""
🎉 Congratulations! You've successfully started your Linear integration!

Here's what to do next:

1. **Review Your Linear Project**:
   - Go to linear.app and check your project
   - Verify that tasks were created correctly
   - Review labels, epics, and workflow states

2. **Continue with Phase 2**:
   - Sync remaining project tasks
   - Organize tasks into sprints
   - Set up task dependencies

3. **Build the Cursor Extension**:
   - Create the VS Code/Cursor extension
   - Implement automatic task sync
   - Add context summary generation

4. **Test the Workflow**:
   - Complete a task in Cursor
   - Verify it updates in Linear
   - Test new issue creation

5. **Read the Documentation**:
   - docs/LINEAR_CURSOR_INTEGRATION.md
   - docs/LINEAR_INTEGRATION.md
   - docs/LINEAR_QUICK_REFERENCE.md

**Useful Commands**:
- Test API: python secret-safe/scripts/linear_service.py --test-api
- List issues: python secret-safe/scripts/linear_service.py --list-issues
- Create issue: python secret-safe/scripts/linear_service.py --create-issue "Title" "Description"
- Sync tasks: python secret-safe/scripts/linear_service.py --sync-auth-tasks

**Need Help?**
- Check the troubleshooting section in the documentation
- Review the Linear.app support resources
- Check the integration logs for errors

Happy coding with Linear! 🚀
""")


def main():
    """Main function"""
    print_header("LINEAR.APP INTEGRATION QUICK START")

    print("""
This script will help you get started with integrating Linear.app with your Cursor workflow.

The integration will enable:
✅ Automatic task synchronization
✅ Context preservation
✅ Linear-driven development
✅ Automated issue creation
✅ Progress tracking and metrics
""")

    # Check prerequisites
    if not check_prerequisites():
        print("\n❌ Prerequisites not met. Please fix the issues above and try again.")
        return

    # Install dependencies
    if not install_dependencies():
        print("\n❌ Failed to install dependencies. Please install manually and try again.")
        return

    # Guide through Linear setup
    if not guide_linear_setup():
        print("\n⚠️  Linear setup not completed. You can continue later.")

    # Test integration if API key is available
    if os.getenv('LINEAR_API_KEY'):
        if test_integration():
            # Sync initial tasks
            if sync_initial_tasks():
                show_next_steps()
            else:
                print("\n❌ Failed to sync initial tasks. Check the errors above.")
        else:
            print("\n❌ Integration test failed. Please check your API key and try again.")
    else:
        print("\n⚠️  Skipping integration test - no API key available.")
        print("Set your LINEAR_API_KEY and run the test manually:")
        print("python secret-safe/scripts/linear_service.py --test-api")


if __name__ == "__main__":
    main()
