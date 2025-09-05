"""
Simple test API endpoint for Vercel
"""
from fastapi import FastAPI

app = FastAPI()


@app.get("/")
async def root():
    return {"message": "API is working", "status": "healthy"}


@app.get("/test")
async def test():
    return {"message": "Test endpoint working", "status": "success"}


@app.get("/health")
async def health():
    return {"status": "healthy", "version": "1.0.0"}
