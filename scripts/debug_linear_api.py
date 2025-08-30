#!/usr/bin/env python3
"""
Debug Script for Linear API Connection Issues

This script will help diagnose why the Linear API is returning 400 errors.
"""

import os
import requests
import json
from pathlib import Path


def print_header(title):
    """Print a formatted header"""
    print("\n" + "=" * 60)
    print(f" {title}")
    print("=" * 60)


def check_api_key():
    """Check if API key is set and valid format"""
    print_header("API KEY CHECK")

    api_key = os.getenv('LINEAR_API_KEY')

    if not api_key:
        print("❌ LINEAR_API_KEY environment variable is not set")
        print("\nTo set it, run:")
        print("export LINEAR_API_KEY=your_api_key_here")
        return False

    print(f"✅ LINEAR_API_KEY is set")
    print(
        f"   Length: {len(api_key)} characters")
    print(
        f"   Format: {api_key[:10]}...{api_key[-10:] if len(api_key) > 20 else 'short'}")

    # Check if it looks like a valid Linear API key
    if not api_key.startswith('lin_api_'):
        print("⚠️  Warning: API key doesn't start with 'lin_api_'")
        print("   This might not be a valid Linear API key format")

    return True


def test_simple_request():
    """Test a very simple API request"""
    print_header("SIMPLE API REQUEST TEST")

    api_key = os.getenv('LINEAR_API_KEY')
    if not api_key:
        print("❌ No API key available")
        return False

    headers = {
        'Authorization': api_key,
        'Content-Type': 'application/json'
    }

    # Test with the simplest possible query
    query = """
    query {
        viewer {
            id
            name
            email
        }
    }
    """

    print("Testing with simple viewer query...")
    print(f"Headers: {json.dumps(headers, indent=2)}")
    print(f"Query: {query.strip()}")

    try:
        response = requests.post(
            'https://api.linear.app/graphql',
            headers=headers,
            json={'query': query},
            timeout=30
        )

        print(f"\nResponse Status: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")

        if response.status_code == 200:
            data = response.json()
            if 'errors' in data:
                print(
                    f"❌ GraphQL Errors: {json.dumps(data['errors'], indent=2)}")
                return False
            else:
                print("✅ Simple request successful!")
                print(f"Response: {json.dumps(data, indent=2)}")
                return True
        else:
            print(f"❌ HTTP Error: {response.status_code}")
            print(f"Response Body: {response.text}")
            return False

    except Exception as e:
        print(f"❌ Request failed: {e}")
        return False


def test_teams_query():
    """Test the teams query specifically"""
    print_header("TEAMS QUERY TEST")

    api_key = os.getenv('LINEAR_API_KEY')
    if not api_key:
        print("❌ No API key available")
        return False

    headers = {
        'Authorization': api_key,
        'Content-Type': 'application/json'
    }

    query = """
    query {
        teams(first: 1) {
            nodes {
                id
                key
                name
            }
        }
    }
    """

    print("Testing teams query...")

    try:
        response = requests.post(
            'https://api.linear.app/graphql',
            headers=headers,
            json={'query': query},
            timeout=30
        )

        print(f"Response Status: {response.status_code}")

        if response.status_code == 200:
            data = response.json()
            if 'errors' in data:
                print(
                    f"❌ GraphQL Errors: {json.dumps(data['errors'], indent=2)}")
                return False
            else:
                print("✅ Teams query successful!")
                teams = data.get('data', {}).get('teams', {}).get('nodes', [])
                if teams:
                    print(f"Found {len(teams)} team(s):")
                    for team in teams:
                        print(f"  - {team['key']}: {team['name']}")
                else:
                    print("No teams found")
                return True
        else:
            print(f"❌ HTTP Error: {response.status_code}")
            print(f"Response Body: {response.text}")
            return False

    except Exception as e:
        print(f"❌ Request failed: {e}")
        return False


def check_linear_project():
    """Check if you need to create the Linear project first"""
    print_header("LINEAR PROJECT SETUP CHECK")

    print("""
Before testing the API, make sure you have:

1. ✅ Created Linear.app account at https://linear.app
2. ✅ Created organization called "Secret Safe"
3. ✅ Created project with key "SS" and name "Secret Safe - Digital Dead Man's Switch"
4. ✅ Created team with key "DEV" and name "Development"
5. ✅ Generated API key from Settings → API → Create Key

If you haven't completed these steps, the API calls will fail.
""")

    # Check if we can find the project
    api_key = os.getenv('LINEAR_API_KEY')
    if not api_key:
        print("❌ No API key available to check project")
        return False

    headers = {
        'Authorization': api_key,
        'Content-Type': 'application/json'
    }

    query = """
    query {
        projects(first: 10) {
            nodes {
                id
                name
                description
                state
            }
        }
    }
    """

    try:
        response = requests.post(
            'https://api.linear.app/graphql',
            headers=headers,
            json={'query': query},
            timeout=30
        )

        if response.status_code == 200:
            data = response.json()
            if 'errors' not in data:
                projects = data.get('data', {}).get(
                    'projects', {}).get('nodes', [])
                print(f"Found {len(projects)} project(s):")
                for project in projects:
                    print(f"  - {project['name']} (ID: {project['id']})")

                # Check if our project exists by name
                ss_project = next(
                    (p for p in projects if 'secret safe' in p['name'].lower()), None)
                if ss_project:
                    print(f"✅ Found Secret Safe project: {ss_project['name']}")
                    print(f"   Project ID: {ss_project['id']}")
                    print(f"   State: {ss_project.get('state', 'Unknown')}")
                else:
                    print("❌ Secret Safe project not found")
                    print("   You need to create it in Linear.app first")
                    return False
            else:
                print(
                    f"❌ GraphQL Errors: {json.dumps(data['errors'], indent=2)}")
                return False
        else:
            print(f"❌ HTTP Error: {response.status_code}")
            print(f"Response Body: {response.text}")
            return False

    except Exception as e:
        print(f"❌ Request failed: {e}")
        return False

    return True


def main():
    """Main function"""
    print_header("LINEAR API DEBUG SCRIPT")

    print("This script will help diagnose your Linear API connection issues.")

    # Step 1: Check API key
    if not check_api_key():
        print("\n❌ API key issue detected. Please fix this first.")
        return

    # Step 2: Test simple request
    if not test_simple_request():
        print("\n❌ Simple request failed. This suggests a basic API issue.")
        return

    # Step 3: Test teams query
    if not test_teams_query():
        print("\n❌ Teams query failed. This suggests a permissions or setup issue.")
        return

    # Step 4: Check project setup
    if not check_linear_project():
        print("\n❌ Project setup issue detected.")
        return

    print_header("ALL TESTS PASSED")
    print("✅ Your Linear API connection is working correctly!")
    print("✅ You can now run the main integration scripts.")


if __name__ == "__main__":
    main()
