#!/bin/bash

# Secret Safe Development Environment Setup Script

echo "🔐 Setting up Secret Safe development environment..."

# Check if conda is available
if ! command -v conda &> /dev/null; then
    echo "❌ Conda is not installed. Please install Anaconda or Miniconda first."
    exit 1
fi

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Prerequisites check passed"

# Activate conda environment
echo "🐍 Activating conda environment..."
source $(conda info --base)/etc/profile.d/conda.sh
conda activate my_dmswitch

if [ $? -ne 0 ]; then
    echo "❌ Failed to activate conda environment 'my_dmswitch'"
    exit 1
fi

echo "✅ Conda environment activated"

# Install Python dependencies
echo "🐍 Installing Python dependencies..."
cd apps/api
pip install -r requirements.txt

if [ $? -ne 0 ]; then
    echo "❌ Failed to install Python dependencies"
    exit 1
fi

echo "✅ Python dependencies installed"

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
cd ../web
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install Node.js dependencies"
    exit 1
fi

echo "✅ Node.js dependencies installed"

# Create environment files
echo "⚙️ Creating environment configuration files..."

# Frontend environment
if [ ! -f .env.local ]; then
    cp env.example .env.local
    echo "✅ Created .env.local (frontend)"
else
    echo "ℹ️ .env.local already exists (frontend)"
fi

# Backend environment
cd ../../apps/api
if [ ! -f .env ]; then
    cp env.example .env
    echo "✅ Created .env (backend)"
else
    echo "ℹ️ .env already exists (backend)"
fi

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Edit environment files with your configuration:"
echo "   - Frontend: apps/web/.env.local"
echo "   - Backend: apps/api/.env"
echo ""
echo "2. Start the development servers:"
echo "   - Frontend: cd apps/web && npm run dev"
echo "   - Backend: cd apps/api && uvicorn app.main:app --reload"
echo ""
echo "3. Open your browser:"
echo "   - Frontend: http://localhost:3000"
echo "   - Backend API: http://localhost:8000"
echo "   - API Docs: http://localhost:8000/docs"
echo ""
echo "Happy coding! 🔐✨"
