#!/usr/bin/env python3
"""
Linear.app Project Setup Script for Secret Safe

This script helps you set up your Linear.app project structure
by providing templates and guidance for creating epics, labels, and workflows.

Usage:
    python scripts/setup_linear.py

Note: This script provides templates and guidance. You'll need to manually
create the structure in Linear.app using the provided information.
"""

import json
import os
from pathlib import Path

def load_linear_config():
    """Load the Linear configuration from linear.json"""
    config_path = Path(__file__).parent.parent / "linear.json"
    with open(config_path, 'r') as f:
        return json.load(f)

def print_header(title):
    """Print a formatted header"""
    print("\n" + "=" * 60)
    print(f" {title}")
    print("=" * 60)

def print_section(title):
    """Print a formatted section header"""
    print(f"\n{title}")
    print("-" * len(title))

def print_linear_setup_guide():
    """Print the Linear.app setup guide"""
    print_header("LINEAR.APP SETUP GUIDE")
    
    print("""
This guide will help you set up your Secret Safe project in Linear.app.
Follow these steps to create your project structure.
""")

    print_section("Step 1: Create Linear.app Account")
    print("""
1. Go to https://linear.app
2. Sign up with your GitHub account (recommended)
3. Complete your profile setup
""")

    print_section("Step 2: Create Organization")
    print("""
1. Click "Create Organization"
2. Name: Secret Safe
3. URL: secret-safe (or your preferred slug)
4. Choose your plan (Free plan is sufficient to start)
""")

    print_section("Step 3: Set Up Your Team")
    print("""
1. Team Name: Development
2. Team Key: DEV
3. Description: Core development team for Secret Safe
""")

def print_workflow_setup():
    """Print workflow setup instructions"""
    print_section("Step 4: Configure Workflows")
    
    workflows = [
        ("Backlog", "Ideas and future features", "#94A3B8"),
        ("To Do", "Ready to be worked on", "#3B82F6"),
        ("In Progress", "Currently being developed", "#F59E0B"),
        ("In Review", "Ready for code review", "#8B5CF6"),
        ("Testing", "Being tested", "#10B981"),
        ("Done", "Completed and deployed", "#059669")
    ]
    
    print("Set up the following workflow states:")
    print("\n{:<15} {:<30} {:<10}".format("State", "Description", "Color"))
    print("-" * 55)
    
    for state, desc, color in workflows:
        print("{:<15} {:<30} {:<10}".format(state, desc, color))

def print_labels_setup():
    """Print labels setup instructions"""
    print_section("Step 5: Create Labels")
    
    label_categories = {
        "Role-Based Labels": [
            ("Role: Admin", "#8B5CF6", "Admin role functionality"),
            ("Role: Writer", "#3B82F6", "Writer role functionality"),
            ("Role: Reader", "#10B981", "Reader role functionality"),
            ("Role: All", "#6B7280", "Functionality for all roles")
        ],
        "Priority Labels": [
            ("Priority: Critical", "#DC2626", "Critical priority items"),
            ("Priority: High", "#EA580C", "High priority items"),
            ("Priority: Medium", "#D97706", "Medium priority items"),
            ("Priority: Low", "#059669", "Low priority items")
        ],
        "Component Labels": [
            ("Component: Frontend", "#3B82F6", "Frontend/UI components"),
            ("Component: Backend", "#8B5CF6", "Backend/API functionality"),
            ("Component: Database", "#10B981", "Database and data models"),
            ("Component: Auth", "#F59E0B", "Authentication and security"),
            ("Component: UI/UX", "#EC4899", "User interface and experience")
        ],
        "Platform Labels": [
            ("Platform: Vercel", "#000000", "Vercel deployment and hosting"),
            ("Platform: Supabase", "#3ECF8E", "Supabase database and auth"),
            ("Platform: GitHub", "#181717", "GitHub repository and CI/CD")
        ],
        "Type Labels": [
            ("Type: Feature", "#3B82F6", "New feature implementation"),
            ("Type: Bug", "#DC2626", "Bug fixes and issues"),
            ("Type: Enhancement", "#10B981", "Improvements to existing features"),
            ("Type: Research", "#8B5CF6", "Research and investigation"),
            ("Type: Security", "#F59E0B", "Security-related items")
        ]
    }
    
    for category, labels in label_categories.items():
        print(f"\n{category}:")
        for name, color, desc in labels:
            print(f"  - {name} ({color}) - {desc}")

def print_github_integration():
    """Print GitHub integration instructions"""
    print_section("Step 6: Set Up GitHub Integration")
    print("""
1. Connect GitHub Repository:
   - Go to Settings → Integrations → GitHub
   - Click "Connect Repository"
   - Select olivierdd/dead_man_switch_v2
   - Enable the following options:
     ✅ Auto-link issues
     ✅ Create branches from issues
     ✅ Sync labels

2. Configure Webhooks:
   - Linear will automatically set up webhooks
   - Verify webhook delivery in GitHub repository settings
""")

def print_epics_setup():
    """Print epics setup instructions"""
    print_section("Step 7: Create Initial Epics")
    
    epics = [
        {
            "name": "Role System Foundation",
            "description": "Implement core role-based access control system",
            "labels": ["Component: Auth", "Component: Database", "Priority: Critical"],
            "issues": ["Authentication system", "Role management", "Permissions"]
        },
        {
            "name": "Admin Features",
            "description": "Admin dashboard and user management functionality",
            "labels": ["Role: Admin", "Component: Frontend", "Component: Backend", "Priority: High"],
            "issues": ["Admin dashboard", "User management", "System overview"]
        },
        {
            "name": "Writer Features",
            "description": "Message creation and management for Writers",
            "labels": ["Role: Writer", "Component: Frontend", "Component: Backend", "Priority: High"],
            "issues": ["Message creation", "Editing", "Management interface"]
        },
        {
            "name": "Reader Features",
            "description": "Shared content access for Readers",
            "labels": ["Role: Reader", "Component: Frontend", "Component: Backend", "Priority: Medium"],
            "issues": ["Content viewing", "Access control", "Sharing"]
        },
        {
            "name": "UI/UX System",
            "description": "Glassmorphic design system with Three.js particles",
            "labels": ["Component: UI/UX", "Component: Frontend", "Priority: High"],
            "issues": ["Design system", "Component library", "Animations"]
        }
    ]
    
    for i, epic in enumerate(epics, 1):
        print(f"\n{i}. {epic['name']}")
        print(f"   Description: {epic['description']}")
        print(f"   Labels: {', '.join(epic['labels'])}")
        print(f"   Issues: {', '.join(epic['issues'])}")

def print_sample_issues():
    """Print sample issues for reference"""
    print_section("Sample Issues for Reference")
    
    print("""
Example Issue: User Authentication System

Title: Implement JWT-based user authentication
Description: Create a secure JWT-based authentication system for users

Labels:
- Role: All
- Component: Auth
- Component: Backend
- Priority: Critical
- Type: Feature

Epic: Role System Foundation

Acceptance Criteria:
- [ ] User registration endpoint
- [ ] User login endpoint
- [ ] JWT token generation
- [ ] Password hashing with bcrypt
- [ ] Token validation middleware
- [ ] Password reset functionality
- [ ] Email verification
- [ ] Rate limiting for auth endpoints

Estimate: 8 points
""")

def print_workflow_integration():
    """Print workflow integration instructions"""
    print_section("Workflow Integration")
    
    print("""
Issue Creation Workflow:
1. Create Issue: Use Linear's issue creation form
2. Add Labels: Apply relevant role, component, and priority labels
3. Assign to Epic: Link to appropriate epic for organization
4. Set Estimate: Add time estimates if using sprints
5. Create Branch: Use Linear's "Create Branch" feature for development

Development Workflow:
1. Start Work: Move issue to "In Progress"
2. Create Branch: Linear will create a branch from the issue
3. Development: Work on the feature/bug fix
4. Code Review: Move to "In Review" when ready
5. Testing: Move to "Testing" after review
6. Deployment: Move to "Done" when deployed
""")

def print_next_steps():
    """Print next steps after setup"""
    print_section("Next Steps After Setup")
    
    print("""
1. Create Your First Epic: Start with "Role System Foundation"
2. Add Initial Issues: Create issues for your current development phase
3. Set Up Sprints: Plan your first development sprint
4. Invite Team Members: Add collaborators to your Linear organization
5. Customize Workflows: Adjust workflows based on your team's needs

For detailed instructions, see: docs/LINEAR_INTEGRATION.md
""")

def main():
    """Main function to run the Linear.app setup guide"""
    try:
        # Load configuration
        config = load_linear_config()
        
        # Print setup guide
        print_linear_setup_guide()
        print_workflow_setup()
        print_labels_setup()
        print_github_integration()
        print_epics_setup()
        print_sample_issues()
        print_workflow_integration()
        print_next_steps()
        
        print_header("SETUP COMPLETE")
        print("""
You now have all the information needed to set up your Linear.app project!
Follow the steps above to create your project structure.

For additional help:
- Linear.app Documentation: https://docs.linear.app
- Linear.app Support: https://support.linear.app
- Project Documentation: docs/LINEAR_INTEGRATION.md
""")
        
    except FileNotFoundError:
        print("Error: linear.json configuration file not found!")
        print("Make sure you're running this script from the project root directory.")
    except Exception as e:
        print(f"Error: {e}")
        print("Please check your configuration and try again.")

if __name__ == "__main__":
    main()
