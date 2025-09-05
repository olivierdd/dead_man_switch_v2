"""
Vercel serverless function entry point for Secret Safe API
"""
import sys
import os

# Add the app directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'app'))

try:
    from app.main import app
    # Export the FastAPI app for Vercel
    handler = app
except Exception as e:
    print(f"Error importing app: {e}")
    import traceback
    traceback.print_exc()

    # Create a minimal fallback app
    from fastapi import FastAPI
    fallback_app = FastAPI()

    @fallback_app.get("/")
    async def fallback():
        return {"error": "Failed to load main app", "details": str(e)}

    handler = fallback_app
