#!/usr/bin/env python3
"""
Secret Safe Setup Verification Script

This script verifies that all required dependencies are properly installed
and the development environment is ready.
"""

import sys
import subprocess
import importlib
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


def check_python_package(package_name, import_name=None):
    """Check if a Python package is installed"""
    if import_name is None:
        import_name = package_name

    try:
        importlib.import_module(import_name)
        print_status(f"✅ {package_name} - OK", "SUCCESS")
        return True
    except ImportError:
        print_status(f"❌ {package_name} - NOT FOUND", "ERROR")
        return False


def check_node_package(package_name):
    """Check if a Node.js package is installed"""
    try:
        result = subprocess.run(
            ["npm", "list", package_name],
            capture_output=True,
            text=True,
            cwd="apps/web"
        )
        if result.returncode == 0:
            print_status(f"✅ {package_name} - OK", "SUCCESS")
            return True
        else:
            print_status(f"❌ {package_name} - NOT FOUND", "ERROR")
            return False
    except FileNotFoundError:
        print_status(
            f"⚠️  npm not found - cannot check {package_name}", "WARNING")
        return False


def check_file_exists(file_path, description):
    """Check if a file exists"""
    if Path(file_path).exists():
        print_status(f"✅ {description} - OK", "SUCCESS")
        return True
    else:
        print_status(f"❌ {description} - NOT FOUND", "ERROR")
        return False


def main():
    """Main verification function"""
    print("🔐 Secret Safe Setup Verification")
    print("=" * 50)

    # Check if we're in the right directory
    if not Path("setup.sh").exists():
        print_status(
            "❌ Please run this script from the secret-safe directory", "ERROR")
        sys.exit(1)

    print_status("Checking Python dependencies...")

    # Core Python packages
    python_packages = [
        ("fastapi", "fastapi"),
        ("uvicorn", "uvicorn"),
        ("sqlmodel", "sqlmodel"),
        ("structlog", "structlog"),
        ("pydantic", "pydantic"),
        ("pydantic-settings", "pydantic_settings"),
        ("authlib", "authlib"),
        ("python-jose", "jose"),
        ("passlib", "passlib"),
        ("celery", "celery"),
        ("redis", "redis"),
        ("web3", "web3"),
        ("ipfshttpclient", "ipfshttpclient"),
    ]

    python_ok = True
    for package, import_name in python_packages:
        if not check_python_package(package, import_name):
            python_ok = False

    print()
    print_status("Checking Node.js dependencies...")

    # Core Node.js packages
    node_packages = [
        "next",
        "react",
        "react-dom",
        "@radix-ui/react-slot",
        "class-variance-authority",
        "clsx",
        "tailwind-merge",
        "three",
        "zustand",
    ]

    node_ok = True
    for package in node_packages:
        if not check_node_package(package):
            node_ok = False

    print()
    print_status("Checking project structure...")

    # Project files
    project_files = [
        ("apps/api/requirements.txt", "Backend requirements.txt"),
        ("apps/web/package.json", "Frontend package.json"),
        ("apps/api/app/main_simple.py", "Simplified backend entry point"),
        ("apps/web/app/layout.tsx", "Frontend layout"),
        ("apps/web/styles/globals.css", "Frontend global CSS"),
    ]

    structure_ok = True
    for file_path, description in project_files:
        if not check_file_exists(file_path, description):
            structure_ok = False

    print()
    print_status("Checking environment files...")

    # Environment files
    env_files = [
        ("apps/api/.env", "Backend environment file"),
        ("apps/web/.env.local", "Frontend environment file"),
    ]

    env_ok = True
    for file_path, description in env_files:
        if not check_file_exists(file_path, description):
            print_status(
                f"⚠️  {description} - NOT FOUND (will be created by setup.sh)", "WARNING")
            env_ok = False

    print()
    print("=" * 50)

    if python_ok and node_ok and structure_ok:
        print_status(
            "🎉 All checks passed! Your development environment is ready.", "SUCCESS")
        print()
        print("Next steps:")
        print("1. Start the backend: cd apps/api && uvicorn app.main_simple:app --reload --host 0.0.0.0 --port 8000")
        print("2. Start the frontend: cd apps/web && npm run dev")
        print("3. Open http://localhost:3000 in your browser")
        return 0
    else:
        print_status(
            "❌ Some checks failed. Please fix the issues above.", "ERROR")
        print()
        print("To fix dependency issues, run:")
        print("cd secret-safe && ./setup.sh")
        return 1


if __name__ == "__main__":
    sys.exit(main())
