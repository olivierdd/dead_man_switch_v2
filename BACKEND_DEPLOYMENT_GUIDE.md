# Backend Deployment Guide

## Deploy FastAPI Backend to Vercel

### 1. Environment Variables to Set in Vercel

Go to your Vercel project settings and add these environment variables:

```bash
# Application
APP_NAME=Secret Safe API
VERSION=0.1.0
DEBUG=false
ENVIRONMENT=production

# Security (IMPORTANT: Change this!)
SECRET_KEY=your-production-secret-key-change-this-to-something-secure
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# CORS - Add your frontend domain
ALLOWED_ORIGINS=["https://forevr.cc", "https://www.forevr.cc"]
ALLOWED_HOSTS=["forevr.cc", "www.forevr.cc"]

# Database - Use your Supabase database
DATABASE_URL=postgresql://postgres:[password]@[host]:5432/postgres
SUPABASE_URL=https://odpabwxukvuuykeujcss.supabase.co
SUPABASE_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Email (optional for now)
SENDGRID_API_KEY=your-sendgrid-api-key
FROM_EMAIL=noreply@forevr.cc

# Rate Limiting
RATE_LIMIT_PER_MINUTE=60
AUTH_LOGIN_RATE_LIMIT_PER_MINUTE=5
AUTH_REGISTER_RATE_LIMIT_PER_MINUTE=3
AUTH_PASSWORD_RESET_RATE_LIMIT_PER_MINUTE=2
AUTH_VERIFICATION_RATE_LIMIT_PER_MINUTE=5
API_RATE_LIMIT_PER_MINUTE=100
API_RATE_LIMIT_PER_HOUR=1000
```

### 2. Database Table Name Issue

Your backend expects a `users` table (plural), but Supabase has `user` (singular).

**Option A: Rename table in Supabase**
```sql
ALTER TABLE "user" RENAME TO "users";
```

**Option B: Update backend to use `user` table**
- Change all references from `users` to `user` in your backend code

### 3. Deploy Steps

1. **Create new Vercel project** for the backend
2. **Connect to your GitHub repo**
3. **Set root directory** to `apps/api`
4. **Add environment variables** (see above)
5. **Deploy**

### 4. Test Backend

Once deployed, test these endpoints:
- `GET https://your-backend.vercel.app/health`
- `GET https://your-backend.vercel.app/test`
- `POST https://your-backend.vercel.app/api/auth/register`

### 5. Update Frontend

After backend is deployed, update frontend to use backend API instead of Supabase Auth.

## Benefits of This Approach

✅ **Full control** over authentication
✅ **No email validation restrictions**
✅ **Better security** with your JWT implementation
✅ **Role-based access control**
✅ **Audit logging** and session management
✅ **Consistent architecture**
