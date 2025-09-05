#!/usr/bin/env python3
"""
Debug script to connect to Supabase and inspect database structure
"""

import os
import sys
from supabase import create_client, Client
import json
from typing import Dict, Any

def load_env_file():
    """Load environment variables from .env file"""
    env_file = os.path.join(os.path.dirname(__file__), 'apps', 'web', '.env.local')
    if os.path.exists(env_file):
        with open(env_file, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    os.environ[key] = value
                    print(f"Loaded: {key} = {value[:20]}..." if len(value) > 20 else f"Loaded: {key} = {value}")

def connect_to_supabase() -> Client:
    """Connect to Supabase using environment variables"""
    # Try to load from .env.local first
    load_env_file()
    
    # Get environment variables
    supabase_url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
    supabase_key = os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
    
    if not supabase_url or not supabase_key:
        print("❌ Missing Supabase environment variables!")
        print("Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY")
        print("\nYou can either:")
        print("1. Set them as environment variables")
        print("2. Create a .env.local file in apps/web/ with:")
        print("   NEXT_PUBLIC_SUPABASE_URL=your_url")
        print("   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key")
        sys.exit(1)
    
    print(f"🔗 Connecting to Supabase...")
    print(f"URL: {supabase_url}")
    print(f"Key: {supabase_key[:20]}...")
    
    try:
        supabase: Client = create_client(supabase_url, supabase_key)
        print("✅ Connected to Supabase successfully!")
        return supabase
    except Exception as e:
        print(f"❌ Failed to connect to Supabase: {e}")
        sys.exit(1)

def list_tables(supabase: Client):
    """List all tables in the database"""
    print("\n📋 Listing all tables...")
    
    try:
        # Try to query information_schema to get table names
        result = supabase.rpc('get_table_names').execute()
        print("Tables found via RPC:", result.data)
    except Exception as e:
        print(f"RPC method not available: {e}")
    
    # Try to query some common tables
    common_tables = ['user', 'users', 'profiles', 'auth.users', 'public.user']
    
    for table in common_tables:
        try:
            print(f"\n🔍 Testing table: {table}")
            result = supabase.table(table).select('*').limit(1).execute()
            print(f"✅ Table '{table}' exists and is accessible")
            print(f"   Columns: {list(result.data[0].keys()) if result.data else 'No data'}")
            print(f"   Row count: {len(result.data)}")
            
            # Show sample data
            if result.data:
                print(f"   Sample data: {json.dumps(result.data[0], indent=2, default=str)}")
                
        except Exception as e:
            print(f"❌ Table '{table}' error: {e}")

def test_auth_tables(supabase: Client):
    """Test authentication-related tables"""
    print("\n🔐 Testing authentication tables...")
    
    try:
        # Test auth.users (this should always exist)
        result = supabase.table('auth.users').select('*').limit(1).execute()
        print("✅ auth.users table accessible")
        print(f"   Sample: {json.dumps(result.data[0] if result.data else {}, indent=2, default=str)}")
    except Exception as e:
        print(f"❌ auth.users error: {e}")

def test_direct_sql(supabase: Client):
    """Test direct SQL queries"""
    print("\n💾 Testing direct SQL queries...")
    
    try:
        # List all tables in public schema
        result = supabase.rpc('exec_sql', {
            'sql': """
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
            """
        }).execute()
        
        print("✅ Direct SQL query successful")
        print("Tables in public schema:", result.data)
        
    except Exception as e:
        print(f"❌ Direct SQL error: {e}")

def test_user_registration_flow(supabase: Client):
    """Test the user registration flow"""
    print("\n👤 Testing user registration flow...")
    
    try:
        # Test if we can create a test user
        test_email = "test-debug@example.com"
        
        print(f"Testing with email: {test_email}")
        
        # Try to sign up a test user
        result = supabase.auth.sign_up({
            "email": test_email,
            "password": "TestPassword123!",
            "options": {
                "data": {
                    "first_name": "Test",
                    "last_name": "User",
                    "display_name": "Test User",
                    "role": "writer"
                }
            }
        })
        
        if result.user:
            print("✅ User signup successful!")
            print(f"   User ID: {result.user.id}")
            print(f"   Email: {result.user.email}")
            
            # Check if user was created in user table
            user_result = supabase.table('user').select('*').eq('id', result.user.id).execute()
            if user_result.data:
                print("✅ User profile created in user table")
                print(f"   Profile data: {json.dumps(user_result.data[0], indent=2, default=str)}")
            else:
                print("❌ User profile NOT created in user table")
                
        else:
            print("❌ User signup failed")
            print(f"Error: {result}")
            
    except Exception as e:
        print(f"❌ User registration test error: {e}")

def main():
    """Main function"""
    print("🔍 Supabase Database Inspector")
    print("=" * 50)
    
    # Connect to Supabase
    supabase = connect_to_supabase()
    
    # List tables
    list_tables(supabase)
    
    # Test auth tables
    test_auth_tables(supabase)
    
    # Test direct SQL
    test_direct_sql(supabase)
    
    # Test user registration flow
    test_user_registration_flow(supabase)
    
    print("\n✅ Database inspection complete!")

if __name__ == "__main__":
    main()
