#!/usr/bin/env python3
"""
Test the FastAPI backend locally before deployment
"""

import requests
import json
import os
import sys

# Add the API directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'apps', 'api'))

def test_backend_endpoints():
    """Test backend endpoints locally"""
    
    # Backend URL (assuming it's running on port 8000)
    base_url = "http://localhost:8000"
    
    print("🧪 Testing FastAPI Backend Locally")
    print("=" * 50)
    
    # Test 1: Health check
    print("\n1. Testing health endpoint...")
    try:
        response = requests.get(f"{base_url}/health")
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.json()}")
    except Exception as e:
        print(f"   ❌ Error: {e}")
        print("   Make sure the backend is running: cd apps/api && python -m uvicorn app.main:app --reload")
        return False
    
    # Test 2: Test endpoint
    print("\n2. Testing test endpoint...")
    try:
        response = requests.get(f"{base_url}/test")
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.json()}")
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False
    
    # Test 3: Auth endpoints (without database)
    print("\n3. Testing auth endpoints...")
    
    # Test registration endpoint structure
    try:
        response = requests.post(f"{base_url}/api/auth/register", 
                               json={
                                   "email": "test@example.com",
                                   "password": "TestPassword123!",
                                   "first_name": "Test",
                                   "last_name": "User",
                                   "display_name": "Test User"
                               })
        print(f"   Registration Status: {response.status_code}")
        if response.status_code != 200:
            print(f"   Response: {response.text}")
    except Exception as e:
        print(f"   ❌ Registration Error: {e}")
    
    # Test login endpoint structure
    try:
        response = requests.post(f"{base_url}/api/auth/login",
                               data={
                                   "username": "test@example.com",
                                   "password": "TestPassword123!"
                               })
        print(f"   Login Status: {response.status_code}")
        if response.status_code != 200:
            print(f"   Response: {response.text}")
    except Exception as e:
        print(f"   ❌ Login Error: {e}")
    
    print("\n✅ Backend testing complete!")
    print("\nNext steps:")
    print("1. Fix any database connection issues")
    print("2. Deploy to Vercel")
    print("3. Update frontend to use backend API")
    
    return True

if __name__ == "__main__":
    test_backend_endpoints()
