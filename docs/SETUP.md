# Secret Safe - Development Setup Guide

This guide will walk you through setting up the Secret Safe development environment from scratch.

## 🎯 Prerequisites

Before you begin, ensure you have the following installed:

### Required Software
- **Git** (2.30+) - [Download](https://git-scm.com/)
- **Node.js** (18.17+) - [Download](https://nodejs.org/)
- **Python** (3.11+) - [Download](https://www.python.org/)
- **Conda** (recommended) or **venv** - [Download](https://docs.conda.io/)

### Optional but Recommended
- **VS Code** or **Cursor** - [Download](https://code.visualstudio.com/)
- **PostgreSQL** (for local development) - [Download](https://www.postgresql.org/)
- **Redis** (for local development) - [Download](https://redis.io/)

## 🚀 Quick Setup (Automated)

The fastest way to get started is using our setup script:

```bash
# Clone the repository
git clone https://github.com/yourusername/secret-safe.git
cd secret-safe

# Make setup script executable and run it
chmod +x setup.sh
./setup.sh
```

The script will:
- ✅ Check prerequisites
- ✅ Set up Python environment
- ✅ Install dependencies
- ✅ Create environment files
- ✅ Verify installation

## 🔧 Manual Setup

If you prefer to set up manually or need to troubleshoot, follow these steps:

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/secret-safe.git
cd secret-safe
```

### 2. Set Up Python Environment

#### Using Conda (Recommended)

```bash
# Create and activate conda environment
conda create -n my_dmswitch python=3.11
conda activate my_dmswitch

# Verify Python version
python --version  # Should show Python 3.11.x
```

#### Using venv (Alternative)

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Verify Python version
python --version  # Should show Python 3.11.x
```

### 3. Install Python Dependencies

```bash
# Navigate to backend directory
cd apps/api

# Install Python dependencies
pip install -r requirements.txt

# Verify installation
python -c "import fastapi, sqlmodel, uvicorn; print('✅ Backend dependencies installed')"
```

### 4. Install Node.js Dependencies

```bash
# Navigate to frontend directory
cd ../web

# Install Node.js dependencies
npm install

# Verify installation
npm run build
```

### 5. Set Up Environment Variables

#### Backend Environment

```bash
# Navigate to backend directory
cd ../api

# Copy example environment file
cp env.example .env

# Edit .env file with your configuration
nano .env  # or use your preferred editor
```

**Required Backend Variables:**
```bash
# App Configuration
APP_NAME=Secret Safe
APP_VERSION=1.0.0
DEBUG=true

# Server Configuration
SERVER_HOST=0.0.0.0
SERVER_PORT=8000

# Security
SECRET_KEY=your-super-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Database (Supabase)
DATABASE_URL=postgresql://username:password@host:port/database
DATABASE_URL_TEST=postgresql://username:password@host:port/database_test

# Redis
REDIS_URL=redis://localhost:6379

# Email (SendGrid)
SENDGRID_API_KEY=your-sendgrid-api-key
FROM_EMAIL=noreply@yoursecretissafe.com

# Blockchain
IPFS_API_URL=http://localhost:5001
ARWEAVE_URL=https://arweave.net
```

#### Frontend Environment

```bash
# Navigate to frontend directory
cd ../web

# Copy example environment file
cp env.example .env.local

# Edit .env.local file with your configuration
nano .env.local  # or use your preferred editor
```

**Required Frontend Variables:**
```bash
# App Configuration
NEXT_PUBLIC_APP_NAME=Secret Safe
NEXT_PUBLIC_APP_VERSION=1.0.0

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# NextAuth
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000

# External Services
NEXT_PUBLIC_SENDGRID_API_KEY=your-sendgrid-api-key
NEXT_PUBLIC_IPFS_API_URL=http://localhost:5001
```

### 6. Set Up Local Services (Optional)

#### PostgreSQL (Local Development)

```bash
# Install PostgreSQL (macOS with Homebrew)
brew install postgresql
brew services start postgresql

# Create database
createdb secret_safe_dev
createdb secret_safe_test

# Update .env with local database URLs
DATABASE_URL=postgresql://localhost/secret_safe_dev
DATABASE_URL_TEST=postgresql://localhost/secret_safe_test
```

#### Redis (Local Development)

```bash
# Install Redis (macOS with Homebrew)
brew install redis
brew services start redis

# Verify Redis is running
redis-cli ping  # Should return PONG
```

#### IPFS (Local Development)

```bash
# Install IPFS (macOS with Homebrew)
brew install ipfs

# Initialize IPFS
ipfs init

# Start IPFS daemon
ipfs daemon &

# Verify IPFS is running
ipfs id  # Should show node information
```

## 🧪 Verify Installation

### 1. Backend Verification

```bash
# Navigate to backend directory
cd apps/api

# Start the development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Expected Output:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [12345] using StatReload
INFO:     Started server process [12346]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

**Test the API:**
```bash
# In another terminal
curl http://localhost:8000/health
# Should return: {"status": "healthy"}
```

### 2. Frontend Verification

```bash
# Navigate to frontend directory
cd ../web

# Start the development server
npm run dev
```

**Expected Output:**
```
> secret-safe@0.1.0 dev
> next dev

  ▲ Next.js 14.x.x
  - Local:        http://localhost:3000
  - Network:      http://192.168.1.x:3000
```

**Test the Frontend:**
- Open [http://localhost:3000](http://localhost:3000) in your browser
- You should see the Secret Safe landing page with the particle background

### 3. Database Verification

```bash
# Navigate to backend directory
cd ../api

# Test database connection
python -c "
from app.config import settings
from sqlmodel import create_engine
engine = create_engine(settings.DATABASE_URL)
print('✅ Database connection successful')
"
```

## 🐛 Troubleshooting

### Common Issues

#### Python Environment Issues

```bash
# If conda environment not found
conda env list  # List all environments
conda activate my_dmswitch  # Activate correct environment

# If Python version is wrong
conda install python=3.11  # Install correct Python version
```

#### Dependency Installation Issues

```bash
# Clear pip cache
pip cache purge

# Upgrade pip
pip install --upgrade pip

# Install with verbose output
pip install -v -r requirements.txt
```

#### Node.js Issues

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Port Conflicts

```bash
# Check what's using port 8000
lsof -i :8000

# Check what's using port 3000
lsof -i :3000

# Kill process if needed
kill -9 <PID>
```

#### Database Connection Issues

```bash
# Test PostgreSQL connection
psql -h localhost -U username -d secret_safe_dev

# Check PostgreSQL status
brew services list | grep postgresql

# Restart PostgreSQL if needed
brew services restart postgresql
```

### Getting Help

1. **Check the logs** for detailed error messages
2. **Verify environment variables** are set correctly
3. **Check service status** (PostgreSQL, Redis, IPFS)
4. **Open an issue** on GitHub with error details
5. **Ask in discussions** for community help

## 🚀 Next Steps

After successful setup:

1. **Read the [Architecture Documentation](ARCHITECTURE.md)**
2. **Explore the [API Documentation](API.md)**
3. **Review [Security Guidelines](SECURITY.md)**
4. **Set up your IDE** with recommended extensions
5. **Run the test suite** to verify everything works
6. **Start developing!** 🎉

## 📚 Additional Resources

- [Architecture Overview](ARCHITECTURE.md)
- [API Reference](API.md)
- [Database Schema](DATABASE.md)
- [Security Guidelines](SECURITY.md)
- [Contributing Guidelines](../CONTRIBUTING.md)

---

*Happy coding! 🚀*

