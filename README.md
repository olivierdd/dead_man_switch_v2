# 🔐 Secret Safe - Your Secret Is Safe With Us

**Privacy-first digital dead man's switch service with role-based access control**

[![CI/CD Pipeline](https://github.com/yourusername/secret-safe/workflows/CI/CD%20Pipeline/badge.svg)](https://github.com/yourusername/secret-safe/actions)
[![Security Scan](https://github.com/yourusername/secret-safe/workflows/Security%20Scan/badge.svg)](https://github.com/yourusername/secret-safe/actions)
[![Code Quality](https://github.com/yourusername/secret-safe/workflows/Code%20Quality/badge.svg)](https://github.com/yourusername/secret-safe/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🚀 Project Overview

"Your Secret Is Safe With Us" is a privacy-first digital dead man's switch service that enables users to securely store and conditionally release messages to designated recipients based on predefined triggers, primarily user inactivity. The platform addresses critical needs in digital inheritance, emergency planning, and business continuity while ensuring message delivery even in the event of company dissolution through blockchain backup technology.

## 🏗️ Architecture

- **Frontend**: Next.js 14 with React 18, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: FastAPI with Python 3.11+, SQLModel, Authlib
- **Database**: PostgreSQL via Supabase Cloud
- **Infrastructure**: Vercel hosting, GitHub Actions CI/CD
- **Authentication**: OAuth 2.0 with role-based access control
- **UI/UX**: Glassmorphic design with Three.js particle effects

## 👥 User Roles

- **Admin**: Full system access, user management, analytics
- **Writer**: Create and manage messages, check-in system
- **Reader**: Access shared messages, read receipts

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Python 3.11+
- Conda environment
- Git

### Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/secret-safe.git
   cd secret-safe
   ```

2. **Setup environment:**
   ```bash
   # Run the automated setup script
   ./setup.sh
   
   # Or manually:
   conda activate my_dmswitch
   
   # Install backend dependencies
   cd apps/api
   pip install -r requirements.txt
   
   # Install frontend dependencies
   cd ../web
   npm install
   ```

3. **Environment configuration:**
   ```bash
   # Frontend
   cp apps/web/env.example apps/web/.env.local
   # Edit .env.local with your configuration
   
   # Backend
   cp apps/api/env.example apps/api/.env
   # Edit .env with your configuration
   ```

4. **Verify setup:**
   ```bash
   # Run the verification script to check all dependencies
   python verify_setup.py
   ```

5. **Start development servers:**
   ```bash
   # Frontend (Next.js)
   cd apps/web
   npm run dev
   
   # Backend (FastAPI) - Use simplified version for now
   cd ../../apps/api
   uvicorn app.main_simple:app --reload --host 0.0.0.0 --port 8000
   ```

6. **Open your browser:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

## 🛠️ Development Tools

### Setup and Verification
- **`setup.sh`** - Automated setup script for the entire development environment
- **`verify_setup.py`** - Python script to verify all dependencies and project structure
- **`TROUBLESHOOTING.md`** - Comprehensive guide for common issues and solutions

### Quick Commands
```bash
# Setup everything
./setup.sh

# Verify installation
python verify_setup.py

# Start backend (simplified)
cd apps/api && uvicorn app.main_simple:app --reload --host 0.0.0.0 --port 8000

# Start frontend
cd apps/web && npm run dev
```

## 📁 Project Structure

```
secret-safe/
├── .github/                    # GitHub workflows and templates
│   ├── workflows/             # CI/CD pipelines
│   └── ISSUE_TEMPLATE/        # Issue templates
├── apps/
│   ├── web/                   # Next.js frontend
│   │   ├── app/              # App Router structure
│   │   ├── components/       # React components
│   │   ├── lib/             # Utilities and helpers
│   │   └── styles/          # Tailwind configuration
│   └── api/                  # FastAPI backend
│       ├── app/             # Application logic
│       ├── migrations/      # Database migrations
│       └── tests/           # API tests
├── packages/                  # Shared packages
├── docs/                     # Documentation
└── supabase/                 # Database configuration
```

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guidelines](CONTRIBUTING.md) before submitting pull requests.

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch:**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Run tests:**
   ```bash
   # Frontend tests
   cd apps/web && npm test
   
   # Backend tests
   cd ../api && pytest
   ```
5. **Commit your changes:**
   ```bash
   git commit -m 'Add amazing feature'
   ```
6. **Push to the branch:**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

### Issue Templates

We provide issue templates for:
- 🐛 [Bug Reports](.github/ISSUE_TEMPLATE/bug_report.md)
- 💡 [Feature Requests](.github/ISSUE_TEMPLATE/feature_request.md)

### Pull Request Template

All pull requests should follow our [PR template](.github/pull_request_template.md).

## 🧪 Testing

### Frontend Testing
```bash
cd apps/web
npm run test          # Run tests
npm run test:watch    # Run tests in watch mode
npm run lint          # Run linting
npm run type-check    # Run TypeScript checks
```

### Backend Testing
```bash
cd apps/api
pytest                # Run all tests
pytest -v            # Verbose output
pytest --cov=app     # With coverage
pytest -k "test_name" # Run specific test
```

## 🔐 Security

- **Zero-Knowledge Architecture**: We can't read your messages
- **Client-Side Encryption**: AES-256 encryption before transmission
- **Role-Based Access Control**: Granular permissions for different user types
- **Audit Logging**: Comprehensive tracking of all system activities
- **Security Headers**: Protection against common web vulnerabilities

## 📊 CI/CD Pipeline

Our GitHub Actions workflow includes:
- ✅ Automated testing (Frontend & Backend)
- 🔒 Security scanning with Trivy
- 📈 Code quality analysis with SonarCloud
- 🚀 Automated deployment to Vercel
- 📱 Slack notifications for deployments

## 🌐 Deployment

### Frontend (Vercel)
- Automatic deployment on push to `main`
- Preview deployments for pull requests
- Edge functions and CDN optimization

### Backend (Vercel)
- Serverless API deployment
- Automatic scaling
- Global edge network

## 📚 Documentation

- [API Documentation](http://localhost:8000/docs) (when running locally)
- [Architecture Overview](docs/ARCHITECTURE.md)
- [Security Guide](docs/SECURITY.md)
- [Deployment Guide](docs/DEPLOYMENT.md)

## 🏷️ Versioning

We use [Semantic Versioning](http://semver.org/) for releases:
- `MAJOR.MINOR.PATCH`
- Breaking changes increment MAJOR
- New features increment MINOR
- Bug fixes increment PATCH

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with ❤️ using modern web technologies
- Powered by [Cursor AI](https://cursor.sh/) for rapid development
- Inspired by the need for secure digital inheritance solutions

## 📞 Support

- 📧 Email: support@yoursecretissafe.com
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/secret-safe/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/yourusername/secret-safe/discussions)
- 📖 Wiki: [GitHub Wiki](https://github.com/yourusername/secret-safe/wiki)

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=yourusername/secret-safe&type=Date)](https://star-history.com/#yourusername/secret-safe&Date)

---

**Made with ❤️ by the Secret Safe Team**

[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/yourusername/secret-safe)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)
