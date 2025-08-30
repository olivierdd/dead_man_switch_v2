# Linear.app + Cursor Integration Guide

**Goal**: Create a seamless integration between Linear.app and Cursor that enables bidirectional task management, automatic issue creation, and Linear-driven development workflows.

---

## 🎯 Integration Overview

This integration will transform your development workflow by:
1. **Syncing all project tasks** from your current TODO system to Linear
2. **Automating task completion** updates in Linear when work is done in Cursor
3. **Generating intelligent context summaries** for completed work
4. **Creating new Linear issues** automatically for discovered tasks
5. **Making Linear the single source of truth** for project management

---

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Cursor IDE    │◄──►│  Linear Service  │◄──►│   Linear.app    │
│                 │    │                  │    │                 │
│ • Task Display  │    │ • API Client     │    │ • Issue Mgmt    │
│ • Completion    │    │ • Sync Logic     │    │ • Workflows     │
│ • New Tasks     │    │ • Context Gen    │    │ • Epics/Sprints │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

---

## 📋 Phase 1: Linear Project Setup & Initial Sync

### 1.1 Create Linear.app Organization and Project

**Manual Setup Steps:**
1. Go to [linear.app](https://linear.app)
2. Create organization: "Secret Safe"
3. Create project: "Secret Safe - Digital Dead Man's Switch" (key: SS)
4. Set up team: "Development" (key: DEV)

**Automated Setup:**
```bash
# Run the existing setup script
cd secret-safe
python scripts/setup_linear.py
```

### 1.2 Configure Workflows, Labels, and Epics

**Workflow States:**
- Backlog → To Do → In Progress → In Review → Testing → Done

**Labels (25 total):**
- Role: Admin, Writer, Reader, All
- Priority: Critical, High, Medium, Low
- Component: Frontend, Backend, Database, Auth, UI/UX
- Platform: Vercel, Supabase, GitHub
- Type: Feature, Bug, Enhancement, Research, Security

**Epics:**
1. Role System Foundation
2. Admin Features
3. Writer Features
4. Reader Features
5. UI/UX System

### 1.3 GitHub Repository Integration

**Enable in Linear:**
- Auto-link issues
- Create branches from issues
- Sync labels
- Webhook setup

**Verify in GitHub:**
- Go to repository settings → Webhooks
- Confirm Linear webhook is active

### 1.4 Create Linear API Integration Service

**File:** `secret-safe/scripts/linear_service.py`

```python
#!/usr/bin/env python3
"""
Linear.app API Integration Service

This service handles all communication between the project and Linear.app,
including issue creation, updates, and synchronization.
"""

import os
import json
import requests
from typing import Dict, List, Optional, Any
from datetime import datetime
import logging

class LinearService:
    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.getenv('LINEAR_API_KEY')
        self.base_url = 'https://api.linear.app/graphql'
        self.headers = {
            'Authorization': f'Bearer {self.api_key}',
            'Content-Type': 'application/json'
        }
        
    def create_issue(self, title: str, description: str, team_key: str = 'DEV',
                     labels: List[str] = None, epic_id: str = None) -> Dict:
        """Create a new Linear issue"""
        # Implementation here
        
    def update_issue(self, issue_id: str, **kwargs) -> Dict:
        """Update an existing Linear issue"""
        # Implementation here
        
    def sync_todo_to_linear(self, todo_file: str = 'TODO.json') -> List[Dict]:
        """Sync all TODO items to Linear issues"""
        # Implementation here
        
    def generate_context_summary(self, completed_work: str) -> str:
        """Generate intelligent summary of completed work"""
        # Implementation here
```

---

## 🔄 Phase 2: Project Task Synchronization

### 2.1 Sync Authentication System Tasks

**Current Status from `tasks-prd-complete-authentication-system.md`:**

**Completed Tasks (Mark as Done in Linear):**
- ✅ Task 1.0: Fix JWT Implementation and Backend Authentication
- ✅ Task 2.0: Implement Frontend Authentication Components
- ✅ Task 2.10: Form Validation System

**Pending Tasks (Create Linear Issues):**
- Task 3.0: Integrate Email Verification System
- Task 4.0: Add Security Features and Testing
- Task 5.0: Deploy and Monitor Authentication System

**Sync Command:**
```bash
cd secret-safe
python scripts/linear_service.py --sync-auth-tasks
```

### 2.2 Create Linear Issues for All Project Components

**Backend API Tasks:**
- Database schema updates
- API endpoint implementations
- Middleware development
- Testing setup

**Frontend Web App Tasks:**
- Component development
- State management
- Routing implementation
- UI/UX improvements

**Database & Infrastructure:**
- Migration scripts
- Environment configuration
- Deployment automation
- Monitoring setup

### 2.3 Organize Tasks into Linear Epics and Sprints

**Epic Mapping:**
- **Role System Foundation**: Authentication, user management, permissions
- **Admin Features**: Admin dashboard, user management, system overview
- **Writer Features**: Message creation, editing, management
- **Reader Features**: Content viewing, access control, sharing
- **UI/UX System**: Design system, components, animations

**Sprint Planning:**
- **Sprint 1**: Authentication foundation (2 weeks)
- **Sprint 2**: Core features (2 weeks)
- **Sprint 3**: Security & testing (2 weeks)
- **Sprint 4**: Deployment & monitoring (1 week)

---

## 🤖 Phase 3: Cursor-Linear Automation

### 3.1 Create Cursor Extension for Linear Integration

**Extension Structure:**
```
secret-safe/extensions/cursor-linear/
├── package.json
├── src/
│   ├── extension.ts
│   ├── linearClient.ts
│   ├── taskSync.ts
│   └── contextGenerator.ts
├── README.md
└── .vscodeignore
```

**Key Features:**
- Task completion detection
- Automatic Linear updates
- Context summary generation
- New issue creation
- Sprint planning integration

### 3.2 Implement Task Completion Sync

**Automation Triggers:**
- File save with completion markers
- Git commit messages
- Manual completion commands
- Test completion events

**Update Logic:**
```typescript
// When task is completed in Cursor
async function syncTaskCompletion(taskId: string, completionData: any) {
    // Update Linear issue status to "Done"
    // Add completion comment with context summary
    // Update time tracking and metrics
    // Link to commit/PR if applicable
}
```

### 3.3 Add Context Summary Generation

**Summary Components:**
- Files modified
- Key changes made
- Dependencies affected
- Testing performed
- Deployment notes
- Next steps identified

**AI-Powered Generation:**
```typescript
async function generateContextSummary(completedWork: string): Promise<string> {
    // Use AI to analyze completed work
    // Extract key insights and changes
    // Format for Linear issue updates
    // Include relevant file paths and line numbers
}
```

### 3.4 Create New Issue Automation

**Discovery Triggers:**
- New TODO comments in code
- Error handling needs
- Performance issues
- Security concerns
- User feedback

**Issue Creation Logic:**
```typescript
async function createNewIssue(discovery: TaskDiscovery): Promise<string> {
    // Analyze discovery context
    // Determine appropriate labels and epic
    // Set priority based on impact
    // Create Linear issue
    // Link to relevant code/files
}
```

---

## 🚀 Phase 4: Linear-Driven Development Workflow

### 4.1 Set Up Linear as Primary Task Source

**Cursor Configuration:**
```json
// .vscode/settings.json
{
    "linear.integration.enabled": true,
    "linear.team.key": "DEV",
    "linear.autoSync": true,
    "linear.showNextTasks": true,
    "linear.sprintPlanning": true
}
```

**Task Display:**
- Show next 5 tasks from current sprint
- Display task details and acceptance criteria
- Link to Linear issue for full context
- Show time estimates and dependencies

### 4.2 Implement Sprint Planning Integration

**Sprint Workflow:**
1. **Planning**: Pull tasks from Linear sprint into Cursor
2. **Development**: Work on tasks with automatic status updates
3. **Review**: Move completed tasks to "In Review"
4. **Testing**: Move to "Testing" after review
5. **Done**: Automatically mark as complete

**Sprint Commands:**
```bash
# Start new sprint
cursor linear sprint start

# Show current sprint tasks
cursor linear sprint tasks

# Complete current task
cursor linear task complete

# Move to next task
cursor linear task next
```

### 4.3 Add Progress Tracking and Metrics

**Key Metrics:**
- **Velocity**: Points completed per sprint
- **Cycle Time**: Time from start to completion
- **Lead Time**: Time from creation to completion
- **Bug Rate**: Percentage of bugs vs. features

**Tracking Implementation:**
```typescript
class ProgressTracker {
    async trackTaskProgress(taskId: string, progress: ProgressData) {
        // Update Linear issue progress
        // Calculate metrics
        // Update sprint velocity
        // Generate progress reports
    }
}
```

### 4.4 Create Development Workflow Automation

**Branch Management:**
- Auto-create feature branches from Linear issues
- Link branches to issues automatically
- Update issue status on branch creation

**PR Integration:**
- Link PRs to Linear issues
- Auto-update issue status on merge
- Include context summaries in PR descriptions

**Deployment Tracking:**
- Update issue status on deployment
- Link to deployment logs
- Track deployment success/failure

---

## 🧪 Phase 5: Testing and Validation

### 5.1 Test Linear API Integration

**Test Cases:**
- Issue creation, reading, updating, deletion
- Label and epic management
- Team and workflow operations
- Error handling and rate limiting

**Test Commands:**
```bash
# Test API connectivity
python scripts/test_linear_integration.py

# Test issue operations
python scripts/test_linear_service.py --test-issues

# Test sync functionality
python scripts/test_linear_service.py --test-sync
```

### 5.2 Test Cursor Extension Functionality

**Extension Testing:**
- Task completion detection
- Linear updates
- Context generation
- New issue creation
- Sprint integration

**Test Scenarios:**
- Complete a task manually
- Add TODO comment for new issue
- Switch between tasks
- Update sprint progress

### 5.3 Validate Bidirectional Sync

**Sync Validation:**
- Changes in Linear reflect in Cursor
- Changes in Cursor update Linear
- No data loss or duplication
- Proper conflict resolution

**Test Commands:**
```bash
# Test bidirectional sync
cursor linear sync test

# Validate data integrity
cursor linear sync validate

# Test conflict resolution
cursor linear sync conflicts
```

### 5.4 Performance and Reliability Testing

**Performance Tests:**
- API response times
- Sync operation speed
- Memory usage
- CPU utilization

**Reliability Tests:**
- Network failure handling
- API rate limit handling
- Error recovery
- Data consistency

---

## 🚀 Getting Started

### Immediate Next Steps

1. **Run Linear Setup:**
   ```bash
   cd secret-safe
   python scripts/setup_linear.py
   ```

2. **Create Linear Project:**
   - Follow setup guide to create organization and project
   - Configure workflows, labels, and epics
   - Connect GitHub repository

3. **Get Linear API Key:**
   - Go to Linear → Settings → API
   - Create personal API key
   - Add to environment variables

4. **Test Basic Integration:**
   ```bash
   python scripts/test_linear_integration.py
   ```

### Environment Setup

**Required Environment Variables:**
```bash
# .env
LINEAR_API_KEY=your_linear_api_key_here
LINEAR_TEAM_KEY=DEV
LINEAR_PROJECT_KEY=SS
```

**Install Dependencies:**
```bash
cd secret-safe/scripts
pip install requests python-dotenv
```

---

## 📊 Success Metrics

### Integration Success
- ✅ All project tasks synced to Linear
- ✅ Bidirectional sync working reliably
- ✅ Context summaries generated automatically
- ✅ New issues created automatically
- ✅ Linear driving development workflow

### Development Efficiency
- 📈 20% reduction in task management overhead
- 📈 15% improvement in development velocity
- 📈 25% better context preservation
- 📈 30% faster issue creation and tracking

---

## 🆘 Troubleshooting

### Common Issues

**Linear API Connection:**
- Verify API key is correct
- Check API key permissions
- Ensure network connectivity
- Verify Linear service status

**Sync Issues:**
- Check webhook configuration
- Verify GitHub integration
- Review API rate limits
- Check error logs

**Extension Problems:**
- Restart Cursor/VS Code
- Check extension logs
- Verify configuration
- Update extension version

### Getting Help

- **Linear Support**: [support.linear.app](https://support.linear.app)
- **Linear API Docs**: [docs.linear.app/api](https://docs.linear.app/api)
- **Project Issues**: Check GitHub issues
- **Integration Logs**: Review service logs

---

## 🎯 End Goal

After completing this integration, you'll have:

1. **Single Source of Truth**: Linear manages all project tasks
2. **Automated Workflow**: Cursor automatically updates Linear
3. **Intelligent Context**: AI-generated summaries preserve knowledge
4. **Seamless Integration**: Development and project management unified
5. **Data-Driven Insights**: Metrics and analytics for continuous improvement

**The result**: A development workflow where Linear drives what comes next, Cursor automatically tracks progress, and nothing gets forgotten or lost in context.

---

*Ready to transform your development workflow? Let's start with Phase 1! 🚀*
