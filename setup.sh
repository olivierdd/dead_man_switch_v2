#!/bin/bash

# Secret Safe Development Environment Setup Script

echo "🔐 Setting up Secret Safe development environment..."
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if conda is available
print_status "Checking prerequisites..."
if ! command -v conda &> /dev/null; then
    print_error "Conda is not installed. Please install Anaconda or Miniconda first."
    exit 1
fi

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

print_success "Prerequisites check passed"

# Check if we're in the right directory
if [ ! -f "setup.sh" ]; then
    print_error "Please run this script from the secret-safe directory"
    exit 1
fi

# Activate conda environment
print_status "Setting up Python environment..."
source $(conda info --base)/etc/profile.d/conda.sh

# Check if environment exists, create if not
if ! conda env list | grep -q "my_dmswitch"; then
    print_warning "Conda environment 'my_dmswitch' not found. Creating it..."
    conda create -n my_dmswitch python=3.11 -y
    if [ $? -ne 0 ]; then
        print_error "Failed to create conda environment"
        exit 1
    fi
fi

# Activate environment
conda activate my_dmswitch
if [ $? -ne 0 ]; then
    print_error "Failed to activate conda environment 'my_dmswitch'"
    exit 1
fi

print_success "Conda environment activated"

# Upgrade pip to avoid compatibility issues
print_status "Upgrading pip..."
pip install --upgrade pip

# Install Python dependencies
print_status "Installing Python dependencies..."
cd apps/api

# Check if requirements.txt exists
if [ ! -f "requirements.txt" ]; then
    print_error "requirements.txt not found in apps/api directory"
    exit 1
fi

pip install -r requirements.txt
if [ $? -ne 0 ]; then
    print_error "Failed to install Python dependencies"
    print_warning "You may need to install some packages manually or check for version conflicts"
    exit 1
fi

print_success "Python dependencies installed"

# Install Node.js dependencies
print_status "Installing Node.js dependencies..."
cd ../web

# Check if package.json exists
if [ ! -f "package.json" ]; then
    print_error "package.json not found in apps/web directory"
    exit 1
fi

# Clear npm cache and install
npm cache clean --force
npm install
if [ $? -ne 0 ]; then
    print_error "Failed to install Node.js dependencies"
    print_warning "You may need to install some packages manually or check for version conflicts"
    exit 1
fi

print_success "Node.js dependencies installed"

# Create environment files
print_status "Creating environment configuration files..."

# Frontend environment
cd ../web
if [ ! -f ".env.local" ]; then
    if [ -f "env.example" ]; then
        cp env.example .env.local
        print_success "Created .env.local (frontend)"
    else
        print_warning "env.example not found for frontend"
    fi
else
    print_status ".env.local already exists (frontend)"
fi

# Backend environment
cd ../api
if [ ! -f ".env" ]; then
    if [ -f "env.example" ]; then
        cp env.example .env
        print_success "Created .env (backend)"
    else
        print_warning "env.example not found for backend"
    fi
else
    print_status ".env already exists (backend)"
fi

# Return to project root
cd ../..

echo ""
echo "🎉 Setup completed successfully!"
echo "=================================================="
echo ""
echo "Next steps:"
echo "1. Edit environment files with your configuration:"
echo "   - Frontend: apps/web/.env.local"
echo "   - Backend: apps/api/.env"
echo ""
echo "2. Start the development servers:"
echo "   - Frontend: cd apps/web && npm run dev"
echo "   - Backend: cd apps/api && uvicorn app.main_simple:app --reload"
echo ""
echo "3. Open your browser:"
echo "   - Frontend: http://localhost:3000"
echo "   - Backend API: http://localhost:8000"
echo "   - API Docs: http://localhost:8000/docs"
echo ""
echo "Note: We're using app.main_simple:app for now to bypass complex model dependencies."
echo "The full app.main:app will be available once we resolve the model issues."
echo ""
echo "Happy coding! 🔐✨"

