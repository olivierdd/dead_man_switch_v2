# Contributing to Secret Safe

Thank you for your interest in contributing to Secret Safe! This document provides guidelines and information for contributors.

## 🎯 Project Goals

Secret Safe aims to provide a privacy-first, secure, and reliable digital dead man's switch service. Our core principles are:

- **Privacy First**: Zero-knowledge architecture where we can't read user messages
- **Security**: Military-grade encryption and comprehensive security measures
- **Reliability**: Messages are delivered even if our company dissolves
- **Accessibility**: Role-based access control for different user types
- **User Experience**: Beautiful, intuitive interface with glassmorphic design

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Python 3.11+
- Git
- Conda (recommended) or virtual environment

### Setup Development Environment

1. **Fork and clone the repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/secret-safe.git
   cd secret-safe
   ```

2. **Run the setup script:**
   ```bash
   ./setup.sh
   ```

3. **Verify installation:**
   ```bash
   # Frontend
   cd apps/web && npm run dev
   
   # Backend
   cd ../api && uvicorn app.main:app --reload
   ```

## 🔧 Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

**Branch naming conventions:**
- `feature/feature-name` - New features
- `bugfix/bug-description` - Bug fixes
- `hotfix/urgent-fix` - Critical fixes
- `docs/documentation-update` - Documentation changes
- `refactor/code-improvement` - Code refactoring

### 2. Make Your Changes

Follow these guidelines:

#### Frontend (Next.js/React)
- Use TypeScript for all new code
- Follow the established component patterns
- Implement proper role-based access control
- Use Tailwind CSS with custom glassmorphic classes
- Add Three.js effects where appropriate

#### Backend (FastAPI/Python)
- Use type hints for all functions
- Follow FastAPI best practices
- Implement proper error handling
- Add comprehensive logging
- Respect role-based permissions

#### Database Models
- Use SQLModel for all database models
- Add proper indexes for performance
- Include audit fields where appropriate
- Document relationships clearly

### 3. Testing

**Frontend Testing:**
```bash
cd apps/web
npm run test          # Run all tests
npm run test:watch    # Watch mode
npm run lint          # Linting
npm run type-check    # TypeScript checks
```

**Backend Testing:**
```bash
cd apps/api
pytest                # Run all tests
pytest --cov=app     # With coverage
pytest -v            # Verbose output
```

**Test Coverage Requirements:**
- Frontend: Minimum 80% coverage
- Backend: Minimum 85% coverage
- Critical paths: 100% coverage

### 4. Commit Your Changes

```bash
git add .
git commit -m "feat: add user authentication system

- Implement JWT-based authentication
- Add role-based access control
- Include comprehensive test coverage
- Update API documentation

Closes #123"
```

**Commit Message Format:**
```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Code style changes
- `refactor` - Code refactoring
- `test` - Test additions/changes
- `chore` - Maintenance tasks

### 5. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

## 📋 Pull Request Guidelines

### Before Submitting

- [ ] Code follows project style guidelines
- [ ] All tests pass
- [ ] Code coverage meets requirements
- [ ] Documentation is updated
- [ ] No security vulnerabilities introduced
- [ ] Role-based access control is properly implemented

### Pull Request Template

Use the provided [PR template](.github/pull_request_template.md) and fill out all sections.

### Review Process

1. **Automated Checks**: CI/CD pipeline runs tests and security scans
2. **Code Review**: At least one maintainer must approve
3. **Security Review**: Security-sensitive changes require additional review
4. **Final Approval**: Maintainer merges after all checks pass

## 🏗️ Architecture Guidelines

### Role-Based Access Control

All features must respect the established role hierarchy:
- **Reader**: Access to shared content only
- **Writer**: Create and manage messages
- **Admin**: Full system access and user management

### Security Principles

- **Zero-Knowledge**: Never store unencrypted user data
- **Principle of Least Privilege**: Users get minimum required access
- **Defense in Depth**: Multiple security layers
- **Audit Logging**: Track all system activities

### Code Quality Standards

- **Type Safety**: Use TypeScript/Python type hints
- **Error Handling**: Comprehensive error handling and logging
- **Performance**: Optimize for user experience
- **Accessibility**: Follow WCAG 2.1 guidelines

## 🧪 Testing Guidelines

### Unit Tests

- Test all business logic functions
- Mock external dependencies
- Test edge cases and error conditions
- Maintain high test coverage

### Integration Tests

- Test API endpoints with different user roles
- Test database operations
- Test authentication flows
- Test role-based access control

### End-to-End Tests

- Test complete user workflows
- Test cross-browser compatibility
- Test mobile responsiveness
- Test accessibility features

## 📚 Documentation

### Code Documentation

- Document all public APIs
- Include usage examples
- Document security considerations
- Keep documentation up-to-date

### User Documentation

- Clear setup instructions
- Feature explanations
- Troubleshooting guides
- Security best practices

## 🔒 Security Guidelines

### Reporting Security Issues

**DO NOT** create public issues for security vulnerabilities. Instead:

1. Email: security@yoursecretissafe.com
2. Use [GitHub Security Advisories](https://github.com/yourusername/secret-safe/security/advisories)
3. Allow time for response before public disclosure

### Security Best Practices

- Never commit secrets or API keys
- Use environment variables for configuration
- Validate all user inputs
- Implement proper authentication
- Use HTTPS in production
- Regular security audits

## 🌟 Recognition

Contributors are recognized in several ways:

- **Contributors List**: Added to project contributors
- **Release Notes**: Mentioned in release announcements
- **Documentation**: Credit in relevant documentation
- **Community**: Recognition in community channels

## 📞 Getting Help

### Questions and Discussions

- [GitHub Discussions](https://github.com/yourusername/secret-safe/discussions)
- [Community Discord](https://discord.gg/secret-safe)
- [Email Support](mailto:support@yoursecretissafe.com)

### Development Issues

- [GitHub Issues](https://github.com/yourusername/secret-safe/issues)
- [Project Wiki](https://github.com/yourusername/secret-safe/wiki)
- [Architecture Documentation](docs/ARCHITECTURE.md)

## 🎉 Thank You!

Thank you for contributing to Secret Safe! Your contributions help make digital inheritance more secure and accessible for everyone.

---

**Remember**: Every contribution, no matter how small, makes a difference! 🚀
