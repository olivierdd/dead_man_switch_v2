# Linear.app Integration Guide

This guide will help you integrate your Secret Safe project with Linear.app for project management and issue tracking.

## 🎯 What is Linear.app?

Linear is a modern project management tool designed for software teams. It provides:
- **Issue Tracking**: Create, organize, and track issues
- **Project Management**: Manage projects, sprints, and releases
- **Team Collaboration**: Assign work, track progress, and collaborate
- **GitHub Integration**: Seamless integration with your GitHub repository
- **Workflow Automation**: Custom workflows and automation rules

## 🚀 Setting Up Linear.app Integration

### Step 1: Create Linear.app Account

1. Go to [linear.app](https://linear.app)
2. Sign up with your GitHub account (recommended for seamless integration)
3. Complete your profile setup

### Step 2: Create Your Organization

1. Click "Create Organization"
2. Name: `Secret Safe`
3. URL: `secret-safe` (or your preferred slug)
4. Choose your plan (Free plan is sufficient to start)

### Step 3: Set Up Your Team

1. **Team Name**: `Development`
2. **Team Key**: `DEV`
3. **Description**: Core development team for Secret Safe

### Step 4: Configure Workflows

Set up the following workflow states:

| State | Description | Color |
|-------|-------------|-------|
| **Backlog** | Ideas and future features | #94A3B8 |
| **To Do** | Ready to be worked on | #3B82F6 |
| **In Progress** | Currently being developed | #F59E0B |
| **In Review** | Ready for code review | #8B5CF6 |
| **Testing** | Being tested | #10B981 |
| **Done** | Completed and deployed | #059669 |

### Step 5: Create Labels

Set up the following label categories:

#### Role-Based Labels
- **Role: Admin** (#8B5CF6) - Admin role functionality
- **Role: Writer** (#3B82F6) - Writer role functionality  
- **Role: Reader** (#10B981) - Reader role functionality
- **Role: All** (#6B7280) - Functionality for all roles

#### Priority Labels
- **Priority: Critical** (#DC2626) - Critical priority items
- **Priority: High** (#EA580C) - High priority items
- **Priority: Medium** (#D97706) - Medium priority items
- **Priority: Low** (#059669) - Low priority items

#### Component Labels
- **Component: Frontend** (#3B82F6) - Frontend/UI components
- **Component: Backend** (#8B5CF6) - Backend/API functionality
- **Component: Database** (#10B981) - Database and data models
- **Component: Auth** (#F59E0B) - Authentication and security
- **Component: UI/UX** (#EC4899) - User interface and experience

#### Platform Labels
- **Platform: Vercel** (#000000) - Vercel deployment and hosting
- **Platform: Supabase** (#3ECF8E) - Supabase database and auth
- **Platform: GitHub** (#181717) - GitHub repository and CI/CD

#### Type Labels
- **Type: Feature** (#3B82F6) - New feature implementation
- **Type: Bug** (#DC2626) - Bug fixes and issues
- **Type: Enhancement** (#10B981) - Improvements to existing features
- **Type: Research** (#8B5CF6) - Research and investigation
- **Type: Security** (#F59E0B) - Security-related items

### Step 6: Set Up GitHub Integration

1. **Connect GitHub Repository**:
   - Go to Settings → Integrations → GitHub
   - Click "Connect Repository"
   - Select `olivierdd/dead_man_switch_v2`
   - Enable the following options:
     - ✅ Auto-link issues
     - ✅ Create branches from issues
     - ✅ Sync labels

2. **Configure Webhooks**:
   - Linear will automatically set up webhooks
   - Verify webhook delivery in GitHub repository settings

### Step 7: Create Initial Epics

Set up the following epics to organize your work:

#### 1. Role System Foundation
- **Description**: Implement core role-based access control system
- **Labels**: Component: Auth, Component: Database, Priority: Critical
- **Issues**: Authentication system, role management, permissions

#### 2. Admin Features
- **Description**: Admin dashboard and user management functionality
- **Labels**: Role: Admin, Component: Frontend, Component: Backend, Priority: High
- **Issues**: Admin dashboard, user management, system overview

#### 3. Writer Features
- **Description**: Message creation and management for Writers
- **Labels**: Role: Writer, Component: Frontend, Component: Backend, Priority: High
- **Issues**: Message creation, editing, management interface

#### 4. Reader Features
- **Description**: Shared content access for Readers
- **Labels**: Role: Reader, Component: Frontend, Component: Backend, Priority: Medium
- **Issues**: Content viewing, access control, sharing

#### 5. UI/UX System
- **Description**: Glassmorphic design system with Three.js particles
- **Labels**: Component: UI/UX, Component: Frontend, Priority: High
- **Issues**: Design system, component library, animations

## 🔄 Workflow Integration

### Issue Creation Workflow

1. **Create Issue**: Use Linear's issue creation form
2. **Add Labels**: Apply relevant role, component, and priority labels
3. **Assign to Epic**: Link to appropriate epic for organization
4. **Set Estimate**: Add time estimates if using sprints
5. **Create Branch**: Use Linear's "Create Branch" feature for development

### Development Workflow

1. **Start Work**: Move issue to "In Progress"
2. **Create Branch**: Linear will create a branch from the issue
3. **Development**: Work on the feature/bug fix
4. **Code Review**: Move to "In Review" when ready
5. **Testing**: Move to "Testing" after review
6. **Deployment**: Move to "Done" when deployed

### GitHub Integration Features

- **Automatic Linking**: Issues automatically link to PRs and commits
- **Branch Creation**: Create feature branches directly from Linear issues
- **Label Sync**: GitHub labels automatically sync with Linear
- **Status Updates**: Linear updates when PRs are merged/closed

## 📋 Creating Your First Issues

### Example Issue: User Authentication System

```
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
```

### Example Issue: Admin Dashboard UI

```
Title: Create admin dashboard interface
Description: Build the admin dashboard for user and system management

Labels:
- Role: Admin
- Component: Frontend
- Component: UI/UX
- Priority: High
- Type: Feature

Epic: Admin Features

Acceptance Criteria:
- [ ] User list view with pagination
- [ ] User role management interface
- [ ] System overview dashboard
- [ ] Audit log viewer
- [ ] User suspension controls
- [ ] Responsive design for mobile
- [ ] Dark theme support
- [ ] Accessibility compliance

Estimate: 12 points
```

## 🎨 Linear.app Best Practices

### Issue Management
- **Clear Titles**: Use descriptive, action-oriented titles
- **Detailed Descriptions**: Include context, requirements, and acceptance criteria
- **Proper Labeling**: Use labels consistently for easy filtering and organization
- **Epic Organization**: Group related issues under epics for better organization

### Workflow Management
- **Regular Updates**: Keep issue status current as work progresses
- **Estimate Accuracy**: Provide realistic time estimates for planning
- **Dependencies**: Mark issues that depend on others
- **Sprint Planning**: Use sprints for time-boxed development cycles

### Team Collaboration
- **Assignees**: Clearly assign work to team members
- **Comments**: Use comments for discussions and updates
- **Mentions**: @mention team members when needed
- **Status Updates**: Regular status updates on progress

## 🔧 Advanced Configuration

### Custom Fields
Consider adding custom fields for:
- **Security Level**: Low, Medium, High, Critical
- **Testing Requirements**: Unit, Integration, E2E
- **Deployment Target**: Development, Staging, Production
- **Review Required**: Yes, No

### Automation Rules
Set up automation for:
- **Auto-assignment**: Assign issues based on labels
- **Status Updates**: Automatic status changes based on GitHub events
- **Notification Rules**: Notify team members of important changes
- **Sprint Management**: Automatic sprint assignment and planning

### Integrations
Additional integrations to consider:
- **Slack**: Notifications and updates
- **Discord**: Team communication
- **Email**: Digest reports and notifications
- **Calendar**: Sprint planning and deadlines

## 📊 Monitoring and Metrics

### Key Metrics to Track
- **Issue Velocity**: Issues completed per sprint
- **Cycle Time**: Time from start to completion
- **Lead Time**: Time from creation to completion
- **Bug Rate**: Percentage of bugs vs. features
- **Team Capacity**: Available work capacity per sprint

### Reports and Dashboards
- **Sprint Reports**: Track sprint progress and completion
- **Team Performance**: Monitor individual and team productivity
- **Project Health**: Overall project status and progress
- **Release Planning**: Plan and track releases

## 🆘 Troubleshooting

### Common Issues

#### GitHub Integration Not Working
- Check webhook configuration in GitHub
- Verify repository permissions
- Ensure Linear has access to the repository

#### Labels Not Syncing
- Check label naming conventions
- Verify GitHub integration settings
- Manually sync labels if needed

#### Issues Not Linking
- Check issue titles and descriptions
- Verify GitHub integration is active
- Use manual linking if automatic fails

### Getting Help
- **Linear Support**: [support.linear.app](https://support.linear.app)
- **Documentation**: [docs.linear.app](https://docs.linear.app)
- **Community**: [community.linear.app](https://community.linear.app)

## 🚀 Next Steps

After setting up Linear.app:

1. **Create Your First Epic**: Start with "Role System Foundation"
2. **Add Initial Issues**: Create issues for your current development phase
3. **Set Up Sprints**: Plan your first development sprint
4. **Invite Team Members**: Add collaborators to your Linear organization
5. **Customize Workflows**: Adjust workflows based on your team's needs

## 📚 Additional Resources

- [Linear.app Documentation](https://docs.linear.app)
- [Linear.app Blog](https://linear.app/blog)
- [Linear.app Community](https://community.linear.app)
- [GitHub Integration Guide](https://docs.linear.app/github)

---

*Happy project managing! 🚀*

