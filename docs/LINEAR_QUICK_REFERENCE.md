# Linear.app Quick Reference

## 🚀 Quick Setup Checklist

- [ ] Create Linear.app account at [linear.app](https://linear.app)
- [ ] Create "Secret Safe" organization
- [ ] Set up "Development" team (key: DEV)
- [ ] Configure 6 workflow states (Backlog → Done)
- [ ] Create 25 labels (Role, Priority, Component, Platform, Type)
- [ ] Connect GitHub repository: `olivierdd/dead_man_switch_v2`
- [ ] Create 5 initial epics
- [ ] Set up first sprint

## 🏷️ Label Quick Reference

### Role Labels
- `Role: Admin` (Purple) - Admin functionality
- `Role: Writer` (Blue) - Writer functionality  
- `Role: Reader` (Green) - Reader functionality
- `Role: All` (Gray) - All roles

### Priority Labels
- `Priority: Critical` (Red) - Critical items
- `Priority: High` (Orange) - High priority
- `Priority: Medium` (Yellow) - Medium priority
- `Priority: Low` (Green) - Low priority

### Component Labels
- `Component: Frontend` (Blue) - UI components
- `Component: Backend` (Purple) - API functionality
- `Component: Database` (Green) - Data models
- `Component: Auth` (Yellow) - Security
- `Component: UI/UX` (Pink) - Design system

## 🔄 Workflow States

1. **Backlog** (#94A3B8) - Ideas and future features
2. **To Do** (#3B82F6) - Ready to be worked on
3. **In Progress** (#F59E0B) - Currently being developed
4. **In Review** (#8B5CF6) - Ready for code review
5. **Testing** (#10B981) - Being tested
6. **Done** (#059669) - Completed and deployed

## 📋 Epic Quick Reference

1. **Role System Foundation** - Core RBAC system
2. **Admin Features** - Admin dashboard & management
3. **Writer Features** - Message creation & management
4. **Reader Features** - Content access & sharing
5. **UI/UX System** - Design system & components

## 🔗 GitHub Integration

- **Repository**: `olivierdd/dead_man_switch_v2`
- **Auto-link issues**: ✅ Enabled
- **Create branches**: ✅ Enabled
- **Sync labels**: ✅ Enabled

## 📝 Issue Template

```
Title: [Brief, action-oriented title]
Description: [Detailed description of the work]

Labels:
- Role: [Admin/Writer/Reader/All]
- Component: [Frontend/Backend/Database/Auth/UI/UX]
- Priority: [Critical/High/Medium/Low]
- Type: [Feature/Bug/Enhancement/Research/Security]

Epic: [Epic name]

Acceptance Criteria:
- [ ] [Specific deliverable]
- [ ] [Specific deliverable]

Estimate: [X] points
```

## 🎯 Sprint Planning

### Sprint 1: Foundation (Week 1-2)
- User authentication system
- Basic role management
- Project setup & configuration

### Sprint 2: Core Features (Week 3-4)
- Admin dashboard
- Message creation system
- Basic UI components

### Sprint 3: Enhancement (Week 5-6)
- User management
- Message sharing
- Advanced UI features

## 🔧 Useful Commands

```bash
# Run Linear setup guide
python scripts/setup_linear.py

# View Linear configuration
cat linear.json

# Check Linear integration docs
cat docs/LINEAR_INTEGRATION.md
```

## 📊 Metrics to Track

- **Velocity**: Issues completed per sprint
- **Cycle Time**: Time from start to completion
- **Lead Time**: Time from creation to completion
- **Bug Rate**: Percentage of bugs vs. features

## 🆘 Quick Help

- **Linear.app**: [linear.app](https://linear.app)
- **Documentation**: [docs.linear.app](https://docs.linear.app)
- **Support**: [support.linear.app](https://support.linear.app)
- **Project Docs**: `docs/LINEAR_INTEGRATION.md`

---

*Keep this reference handy during Linear.app setup and daily use! 🚀*
