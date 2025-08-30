#!/usr/bin/env python3
"""
Linear.app API Integration Service

This service handles all communication between the project and Linear.app,
including issue creation, updates, and synchronization.

Usage:
    python linear_service.py --sync-auth-tasks
    python linear_service.py --create-issue "Title" "Description"
    python linear_service.py --list-issues
    python linear_service.py --test-api
"""

import os
import json
import requests
import argparse
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime
from pathlib import Path
import sys
from dotenv import load_dotenv

# Add parent directory to path for imports
sys.path.append(str(Path(__file__).parent.parent))

# Load environment variables from .env file
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class LinearService:
    """Linear.app API integration service"""

    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.getenv('LINEAR_API_KEY')
        if not self.api_key:
            raise ValueError("LINEAR_API_KEY environment variable is required")

        self.base_url = 'https://api.linear.app/graphql'
        self.headers = {
            'Authorization': self.api_key,
            'Content-Type': 'application/json'
        }

        # Cache for team, labels, and epics
        self._team_cache = None
        self._labels_cache = None
        self._epics_cache = None
        self._workflow_cache = None

    def _make_graphql_request(self, query: str, variables: Dict = None) -> Dict:
        """Make a GraphQL request to Linear API"""
        try:
            response = requests.post(
                self.base_url,
                headers=self.headers,
                json={
                    'query': query,
                    'variables': variables or {}
                },
                timeout=30
            )
            response.raise_for_status()

            data = response.json()
            if 'errors' in data:
                logger.error(f"GraphQL errors: {data['errors']}")
                raise Exception(f"GraphQL errors: {data['errors']}")

            return data['data']

        except requests.exceptions.RequestException as e:
            logger.error(f"API request failed: {e}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error: {e}")
            raise

    def get_team(self, team_key: str = 'DEV') -> Optional[Dict]:
        """Get team information"""
        if self._team_cache and self._team_cache['key'] == team_key:
            return self._team_cache

        query = """
        query GetTeam($key: String!) {
            team(key: $key) {
                id
                key
                name
                description
            }
        }
        """

        data = self._make_graphql_request(query, {'key': team_key})
        if data and data.get('team'):
            self._team_cache = data['team']
            return data['team']
        return None

    def get_labels(self) -> List[Dict]:
        """Get all labels"""
        if self._labels_cache:
            return self._labels_cache

        query = """
        query GetLabels {
            issueLabels(first: 100) {
                nodes {
                    id
                    name
                    color
                    description
                }
            }
        }
        """

        data = self._make_graphql_request(query)
        if data and data.get('issueLabels'):
            self._labels_cache = data['issueLabels']['nodes']
            return data['issueLabels']['nodes']
        return []

    def get_epics(self) -> List[Dict]:
        """Get all epics"""
        if self._epics_cache:
            return self._epics_cache

        query = """
        query GetEpics {
            epics(first: 100) {
                nodes {
                    id
                    name
                    description
                    state
                }
            }
        }
        """

        data = self._make_graphql_request(query)
        if data and data.get('epics'):
            self._epics_cache = data['epics']['nodes']
            return data['epics']['nodes']
        return []

    def get_workflow_states(self) -> List[Dict]:
        """Get all workflow states"""
        if self._workflow_cache:
            return self._workflow_cache

        query = """
        query GetWorkflowStates {
            workflowStates(first: 100) {
                nodes {
                    id
                    name
                    type
                    color
                    description
                }
            }
        }
        """

        data = self._make_graphql_request(query)
        if data and data.get('workflowStates'):
            self._workflow_cache = data['workflowStates']['nodes']
            return data['workflowStates']['nodes']
        return []

    def find_label_by_name(self, label_name: str) -> Optional[Dict]:
        """Find a label by name"""
        labels = self.get_labels()
        for label in labels:
            if label['name'] == label_name:
                return label
        return None

    def find_epic_by_name(self, epic_name: str) -> Optional[Dict]:
        """Find an epic by name"""
        epics = self.get_epics()
        for epic in epics:
            if epic['name'] == epic_name:
                return epic
        return None

    def find_workflow_state_by_name(self, state_name: str) -> Optional[Dict]:
        """Find a workflow state by name"""
        states = self.get_workflow_states()
        for state in states:
            if state['name'] == state_name:
                return state
        return None

    def create_issue(self, title: str, description: str, team_key: str = 'DEV',
                     labels: List[str] = None, epic_name: str = None,
                     priority: int = 2, estimate: int = None) -> Dict:
        """Create a new Linear issue"""

        # Get team
        team = self.get_team(team_key)
        if not team:
            raise Exception(f"Team {team_key} not found")

        # Get workflow state (default to "To Do")
        workflow_state = self.find_workflow_state_by_name("To Do")
        if not workflow_state:
            raise Exception("Workflow state 'To Do' not found")

        # Prepare labels
        label_ids = []
        if labels:
            for label_name in labels:
                label = self.find_label_by_name(label_name)
                if label:
                    label_ids.append(label['id'])

        # Prepare epic
        epic_id = None
        if epic_name:
            epic = self.find_epic_by_name(epic_name)
            if epic:
                epic_id = epic['id']

        # Create issue
        query = """
        mutation CreateIssue($input: IssueCreateInput!) {
            issueCreate(input: $input) {
                success
                issue {
                    id
                    title
                    description
                    identifier
                    url
                }
                errors {
                    message
                }
            }
        }
        """

        variables = {
            'input': {
                'title': title,
                'description': description,
                'teamId': team['id'],
                'stateId': workflow_state['id'],
                'priority': priority,
                'estimate': estimate
            }
        }

        if label_ids:
            variables['input']['labelIds'] = label_ids
        if epic_id:
            variables['input']['epicId'] = epic_id

        data = self._make_graphql_request(query, variables)

        if data and data.get('issueCreate', {}).get('success'):
            issue = data['issueCreate']['issue']
            logger.info(
                f"Created issue: {issue['identifier']} - {issue['title']}")
            return issue
        else:
            errors = data.get('issueCreate', {}).get('errors', [])
            error_msg = "; ".join([e['message'] for e in errors])
            raise Exception(f"Failed to create issue: {error_msg}")

    def update_issue(self, issue_id: str, **kwargs) -> Dict:
        """Update an existing Linear issue"""

        # Map kwargs to Linear fields
        field_mapping = {
            'title': 'title',
            'description': 'description',
            'priority': 'priority',
            'estimate': 'estimate',
            'state_name': 'stateId',
            'epic_name': 'epicId',
            'labels': 'labelIds'
        }

        update_input = {}

        for key, value in kwargs.items():
            if key in field_mapping:
                linear_field = field_mapping[key]

                if key == 'state_name':
                    state = self.find_workflow_state_by_name(value)
                    if state:
                        update_input[linear_field] = state['id']
                elif key == 'epic_name':
                    epic = self.find_epic_by_name(value)
                    if epic:
                        update_input[linear_field] = epic['id']
                elif key == 'labels':
                    label_ids = []
                    for label_name in value:
                        label = self.find_label_by_name(label_name)
                        if label:
                            label_ids.append(label['id'])
                    if label_ids:
                        update_input[linear_field] = label_ids
                else:
                    update_input[linear_field] = value

        if not update_input:
            logger.warning("No valid fields to update")
            return {}

        query = """
        mutation UpdateIssue($id: String!, $input: IssueUpdateInput!) {
            issueUpdate(id: $id, input: $input) {
                success
                issue {
                    id
                    title
                    description
                    identifier
                    url
                }
                errors {
                    message
                }
            }
        }
        """

        variables = {
            'id': issue_id,
            'input': update_input
        }

        data = self._make_graphql_request(query, variables)

        if data and data.get('issueUpdate', {}).get('success'):
            issue = data['issueUpdate']['issue']
            logger.info(f"Updated issue: {issue['identifier']}")
            return issue
        else:
            errors = data.get('issueUpdate', {}).get('errors', [])
            error_msg = "; ".join([e['message'] for e in errors])
            raise Exception(f"Failed to update issue: {error_msg}")

    def get_issues(self, team_key: str = 'DEV', state_name: str = None) -> List[Dict]:
        """Get issues for a team"""

        team = self.get_team(team_key)
        if not team:
            raise Exception(f"Team {team_key} not found")

        # Build filter
        filters = {
            'teamId': {'eq': team['id']}
        }

        if state_name:
            state = self.find_workflow_state_by_name(state_name)
            if state:
                filters['stateId'] = {'eq': state['id']}

        query = """
        query GetIssues($filter: IssueFilter) {
            issues(first: 100, filter: $filter) {
                nodes {
                    id
                    title
                    description
                    identifier
                    url
                    state {
                        name
                        color
                    }
                    priority
                    estimate
                    labels {
                        nodes {
                            name
                            color
                        }
                    }
                    epic {
                        name
                    }
                }
            }
        }
        """

        variables = {'filter': filters}
        data = self._make_graphql_request(query, variables)

        if data and data.get('issues'):
            return data['issues']['nodes']
        return []

    def sync_todo_to_linear(self, todo_file: str = 'TODO.json') -> List[Dict]:
        """Sync all TODO items to Linear issues"""

        todo_path = Path(__file__).parent.parent / todo_file
        if not todo_path.exists():
            logger.error(f"TODO file not found: {todo_path}")
            return []

        with open(todo_path, 'r') as f:
            todo_data = json.load(f)

        created_issues = []

        # Process main tasks
        for task in todo_data.get('todo', []):
            try:
                # Determine labels based on task content
                labels = self._determine_labels(task)

                # Determine epic based on task category
                epic_name = self._determine_epic(task)

                # Create issue
                issue = self.create_issue(
                    title=task['title'],
                    description=task['description'],
                    labels=labels,
                    epic_name=epic_name,
                    priority=self._determine_priority(
                        task.get('priority', 'Medium')),
                    estimate=task.get('estimated_hours', 1)
                )

                created_issues.append(issue)

                # Update TODO with Linear issue ID
                task['linear_issue'] = issue['identifier']

            except Exception as e:
                logger.error(
                    f"Failed to create issue for task '{task['title']}': {e}")

        # Save updated TODO with Linear issue IDs
        with open(todo_path, 'w') as f:
            json.dump(todo_data, f, indent=2)

        logger.info(f"Created {len(created_issues)} Linear issues")
        return created_issues

    def _determine_labels(self, task: Dict) -> List[str]:
        """Determine appropriate labels for a task"""
        labels = []

        # Add role-based labels
        if 'role' in task.get('title', '').lower():
            if 'admin' in task.get('title', '').lower():
                labels.append('Role: Admin')
            elif 'writer' in task.get('title', '').lower():
                labels.append('Role: Writer')
            elif 'reader' in task.get('title', '').lower():
                labels.append('Role: Reader')
            else:
                labels.append('Role: All')

        # Add component labels
        title_lower = task.get('title', '').lower()
        if any(word in title_lower for word in ['frontend', 'ui', 'component', 'react']):
            labels.append('Component: Frontend')
        elif any(word in title_lower for word in ['backend', 'api', 'fastapi', 'python']):
            labels.append('Component: Backend')
        elif any(word in title_lower for word in ['database', 'model', 'schema']):
            labels.append('Component: Database')
        elif any(word in title_lower for word in ['auth', 'security', 'jwt']):
            labels.append('Component: Auth')
        elif any(word in title_lower for word in ['design', 'ux', 'ui']):
            labels.append('Component: UI/UX')

        # Add type labels
        if 'bug' in title_lower or 'fix' in title_lower:
            labels.append('Type: Bug')
        elif 'feature' in title_lower or 'implement' in title_lower:
            labels.append('Type: Feature')
        elif 'test' in title_lower or 'testing' in title_lower:
            labels.append('Type: Enhancement')
        else:
            labels.append('Type: Feature')

        # Add priority labels
        priority = task.get('priority', 'Medium')
        if priority == 'Critical':
            labels.append('Priority: Critical')
        elif priority == 'High':
            labels.append('Priority: High')
        elif priority == 'Low':
            labels.append('Priority: Low')
        else:
            labels.append('Priority: Medium')

        return labels

    def _determine_epic(self, task: Dict) -> Optional[str]:
        """Determine appropriate epic for a task"""
        title_lower = task.get('title', '').lower()

        if any(word in title_lower for word in ['auth', 'jwt', 'login', 'register', 'user']):
            return 'Role System Foundation'
        elif any(word in title_lower for word in ['admin', 'dashboard', 'management']):
            return 'Admin Features'
        elif any(word in title_lower for word in ['writer', 'message', 'create', 'edit']):
            return 'Writer Features'
        elif any(word in title_lower for word in ['reader', 'view', 'access', 'share']):
            return 'Reader Features'
        elif any(word in title_lower for word in ['ui', 'ux', 'design', 'component', 'animation']):
            return 'UI/UX System'

        return None

    def _determine_priority(self, priority: str) -> int:
        """Convert priority string to Linear priority number"""
        priority_map = {
            'Critical': 0,
            'High': 1,
            'Medium': 2,
            'Low': 3,
            'No priority': 4
        }
        return priority_map.get(priority, 2)

    def generate_context_summary(self, completed_work: str) -> str:
        """Generate intelligent summary of completed work"""
        # This would integrate with AI service for intelligent summaries
        # For now, return a formatted summary
        return f"""
## Work Completed Summary

**Completion Date**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

**Work Description**:
{completed_work}

**Key Changes Made**:
- [To be populated by AI analysis]

**Files Modified**:
- [To be populated by git analysis]

**Testing Performed**:
- [To be populated by test results]

**Next Steps**:
- [To be populated by task analysis]
"""

    def test_api_connection(self) -> bool:
        """Test Linear API connection"""
        try:
            # Try to get teams
            teams_query = """
            query GetTeams {
                teams(first: 1) {
                    nodes {
                        id
                        key
                        name
                    }
                }
            }
            """

            data = self._make_graphql_request(teams_query)
            if data and data.get('teams'):
                logger.info("✅ Linear API connection successful")
                return True
            else:
                logger.error("❌ Linear API connection failed - no teams found")
                return False

        except Exception as e:
            logger.error(f"❌ Linear API connection failed: {e}")
            return False


def main():
    """Main function for command line usage"""
    parser = argparse.ArgumentParser(
        description='Linear.app API Integration Service')
    parser.add_argument('--sync-auth-tasks', action='store_true',
                        help='Sync authentication system tasks to Linear')
    parser.add_argument('--create-issue', nargs=2, metavar=('TITLE', 'DESCRIPTION'),
                        help='Create a new Linear issue')
    parser.add_argument('--list-issues', action='store_true',
                        help='List all issues for DEV team')
    parser.add_argument('--test-api', action='store_true',
                        help='Test Linear API connection')
    parser.add_argument(
        '--api-key', help='Linear API key (overrides environment variable)')

    args = parser.parse_args()

    try:
        # Initialize service
        service = LinearService(api_key=args.api_key)

        if args.test_api:
            success = service.test_api_connection()
            sys.exit(0 if success else 1)

        elif args.sync_auth_tasks:
            logger.info("Syncing authentication tasks to Linear...")
            issues = service.sync_todo_to_linear()
            logger.info(f"Synced {len(issues)} tasks to Linear")

        elif args.create_issue:
            title, description = args.create_issue
            logger.info(f"Creating issue: {title}")
            issue = service.create_issue(title, description)
            logger.info(f"Created issue: {issue['identifier']}")

        elif args.list_issues:
            logger.info("Listing issues for DEV team...")
            issues = service.get_issues()
            for issue in issues:
                print(
                    f"{issue['identifier']}: {issue['title']} ({issue['state']['name']})")

        else:
            parser.print_help()

    except Exception as e:
        logger.error(f"Error: {e}")
        sys.exit(1)


if __name__ == '__main__':
    main()
