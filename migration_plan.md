# Migration from Supabase Auth to Backend Auth

## Current State
- Frontend uses Supabase Auth for registration/login
- Database has `user` table (singular) 
- Supabase handles authentication

## Target State
- Frontend uses your FastAPI backend for authentication
- Backend handles JWT tokens, password hashing, user management
- Full control over authentication flow

## Migration Steps

### 1. Update Frontend API Configuration
- Change `NEXT_PUBLIC_API_URL` to point to your backend
- Update `AuthAPI` to use your backend endpoints

### 2. Backend Endpoints to Use
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login  
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### 3. Database Migration
- Your backend expects `users` table (plural)
- Need to rename `user` table to `users` in Supabase
- Or update backend to use `user` table

### 4. Environment Variables
- Remove Supabase Auth variables
- Add backend API URL
- Configure CORS for your domain

## Benefits
- ✅ No email validation restrictions
- ✅ Full control over authentication
- ✅ Better security with your JWT implementation
- ✅ Role-based access control
- ✅ Audit logging and session management
- ✅ Consistent architecture

## Implementation
1. Update frontend to use backend API
2. Deploy backend to Vercel or separate service
3. Update database table name
4. Test authentication flow
5. Remove Supabase Auth dependency
