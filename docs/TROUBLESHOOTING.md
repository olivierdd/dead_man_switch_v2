# Troubleshooting Guide

This guide documents common issues encountered during setup and development, along with their solutions.

## 🐍 Python Backend Issues

### ModuleNotFoundError: No module named 'structlog'

**Problem**: The backend fails to start because `structlog` is not installed.

**Solution**: Install the missing dependencies:
```bash
cd secret-safe/apps/api
pip install -r requirements.txt
```

**Prevention**: Always run the setup script from the `secret-safe` directory to ensure proper dependency installation.

### ModuleNotFoundError: No module named 'jwt'

**Problem**: JWT-related functionality fails because the `PyJWT` package is missing.

**Solution**: Install PyJWT:
```bash
pip install PyJWT
```

**Note**: This should be included in `requirements.txt` but may need manual installation in some cases.

### ipfshttpclient Version Issues

**Problem**: `ipfshttpclient==0.8.0` cannot be found.

**Solution**: Use the alpha version that's available:
```bash
pip install ipfshttpclient==0.8.0a2
```

**Note**: This is already specified in our `requirements.txt`.

### PydanticUndefinedAnnotation Errors

**Problem**: Complex model dependencies cause import errors when starting the full backend.

**Solution**: Use the simplified backend entry point temporarily:
```bash
uvicorn app.main_simple:app --reload --host 0.0.0.0 --port 8000
```

**Long-term fix**: Resolve circular imports and forward references in the model files.

### Port Already in Use

**Problem**: `ERROR: [Errno 48] Address already in use` when starting the backend.

**Solution**: Find and kill the process using the port:
```bash
# Find the process
lsof -ti:8000

# Kill it
pkill -f uvicorn
# or
kill -9 <PID>
```

## 🌐 Frontend Issues

### Module not found: Can't resolve './globals.css'

**Problem**: CSS import path is incorrect in the layout file.

**Solution**: Update the import path in `apps/web/app/layout.tsx`:
```tsx
// Change from:
import './globals.css'

// To:
import '../styles/globals.css'
```

### Module not found: Can't resolve '@radix-ui/react-slot'

**Problem**: Missing npm packages for UI components.

**Solution**: Install the missing packages:
```bash
cd secret-safe/apps/web
npm install @radix-ui/react-slot class-variance-authority clsx tailwind-merge
```

### Next.js Config Warnings

**Problem**: Warnings about deprecated or unrecognized configuration options.

**Solution**: Update `next.config.js` to remove deprecated options:
```js
// Remove these deprecated options:
// experimental.appDir: true  // Deprecated in Next.js 14
// env.CUSTOM_KEY: "value"   // Unnecessary
```

## 🔧 Environment Issues

### Conda Environment Not Found

**Problem**: `EnvironmentNameNotFound: Could not find conda environment: my_dmswicth`

**Solution**: 
1. Check for typos in environment name
2. List available environments: `conda info --envs`
3. Create the environment if it doesn't exist: `conda create -n my_dmswitch python=3.11`

### Wrong Working Directory

**Problem**: Scripts fail because they're run from the wrong directory.

**Solution**: Always run setup scripts from the `secret-safe` directory:
```bash
cd secret-safe
./setup.sh
```

## 🚀 Server Launch Issues

### Backend Won't Start

**Problem**: Backend process appears to start but isn't accessible.

**Solution**:
1. Check if the process is actually running: `ps aux | grep uvicorn`
2. Verify the correct working directory: `cd secret-safe/apps/api`
3. Check for import errors in the terminal output
4. Use the simplified backend: `uvicorn app.main_simple:app --reload`

### Frontend Won't Load

**Problem**: Frontend shows errors or won't start.

**Solution**:
1. Check if all npm packages are installed: `npm install`
2. Verify the CSS import paths are correct
3. Check for TypeScript compilation errors
4. Clear npm cache: `npm cache clean --force`

## 📋 Dependency Management

### Version Conflicts

**Problem**: Package version conflicts between different parts of the project.

**Solution**:
1. Use the exact versions specified in `requirements.txt` and `package.json`
2. Avoid mixing global and local package installations
3. Use virtual environments (conda) for Python dependencies

### Missing Dependencies

**Problem**: Some packages are not installed despite being in requirements files.

**Solution**:
1. Always run `pip install -r requirements.txt` from the correct directory
2. Check for network or permission issues
3. Install problematic packages manually if needed

## 🆘 Getting Help

If you encounter an issue not covered here:

1. **Check the logs**: Look at terminal output for error messages
2. **Verify versions**: Ensure you're using the versions specified in requirements files
3. **Check directory structure**: Make sure you're running commands from the correct location
4. **Search the codebase**: Look for similar issues in the project files
5. **Check dependencies**: Verify all required packages are installed

## 🔄 Quick Recovery Commands

```bash
# Reset everything and start fresh
cd secret-safe
./setup.sh

# If setup.sh fails, manual recovery:
cd apps/api
pip install -r requirements.txt
cd ../web
npm install

# Start servers
cd ../api && uvicorn app.main_simple:app --reload --host 0.0.0.0 --port 8000
cd ../web && npm run dev
```

## 📝 Prevention Tips

1. **Always run setup from the correct directory** (`secret-safe`)
2. **Use the conda environment** (`my_dmswitch`)
3. **Check terminal output** for error messages
4. **Verify file paths** before running commands
5. **Keep dependencies up to date** with the requirements files
6. **Use the simplified backend** (`main_simple.py`) until model issues are resolved
