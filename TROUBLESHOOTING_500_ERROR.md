# Troubleshooting 500 Error on Login

## Current Issue
Getting a 500 Internal Server Error when trying to log in via `/api/auth/callback/credentials`

## Most Likely Causes

### 1. Missing Test Users in Database ⚠️ **MOST LIKELY**
The database might not have any users to authenticate against.

**Solution:**
```bash
# Step 1: Generate SQL with proper bcrypt hashes
cd quickdrop-api
node create-test-users.js > test-users.sql

# Step 2: Go to Supabase Dashboard
# - Open your project: https://supabase.com/dashboard
# - Go to SQL Editor
# - Paste the contents of test-users.sql
# - Click "Run"

# Step 3: Verify users were created
# Run this query in SQL Editor:
SELECT name, email, role FROM users WHERE email LIKE '%@test.com';
```

### 2. Missing Environment Variables on Vercel
The Supabase credentials might not be set on Vercel.

**Solution:**
```bash
# Go to Vercel Dashboard
# Project Settings > Environment Variables
# Add these variables:

NEXT_PUBLIC_SUPABASE_URL=https://ljikevceqdvfdomxhnxq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqaWtldmNlcWR2ZmRvbXhobnhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxODc2NjcsImV4cCI6MjA5NDc2MzY2N30.HfHMG0nVo20pw2sF6Y6smCL68-Hf9rIJ69ibvopkO6A
NEXTAUTH_SECRET=quickdrop_super_secret_key_2026_production_ready_random_string_xyz123
NEXTAUTH_URL=https://quickdrop-api.vercel.app

# Then redeploy
```

### 3. Supabase RLS (Row Level Security) Blocking Access
The database policies might be too restrictive.

**Solution:**
```sql
-- Run in Supabase SQL Editor
-- Temporarily disable RLS for testing (NOT for production!)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Or update the policy to allow anon access:
DROP POLICY IF EXISTS "Allow authenticated users to read users" ON users;
CREATE POLICY "Allow anon read access to users" ON users
    FOR SELECT USING (true);
```

### 4. bcrypt Module Not Installed on Vercel
The bcrypt package might not be building correctly on Vercel.

**Solution:**
Check `package.json` has bcrypt:
```json
{
  "dependencies": {
    "bcrypt": "^5.1.1"
  }
}
```

If issues persist, try using `bcryptjs` instead (pure JavaScript, no native dependencies):
```bash
npm uninstall bcrypt
npm install bcryptjs
```

Then update `lib/auth.ts`:
```typescript
import bcrypt from 'bcryptjs'; // Change this line
```

## Debugging Steps

### Step 1: Check Vercel Logs
```bash
# View real-time logs
vercel logs quickdrop-api --follow

# Or check in Vercel Dashboard:
# Project > Deployments > [Latest] > Runtime Logs
```

Look for error messages like:
- "Missing Supabase environment variables"
- "Supabase query error"
- "Auth error"

### Step 2: Test Supabase Connection
Create a test endpoint to verify Supabase is working:

```typescript
// app/api/test-db/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('email, role')
      .limit(5);

    if (error) throw error;

    return NextResponse.json({ 
      success: true, 
      users: data,
      count: data?.length || 0 
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
```

Then visit: `https://quickdrop-api.vercel.app/api/test-db`

### Step 3: Test Registration Endpoint
Try creating a user via the registration endpoint:

```bash
curl -X POST https://quickdrop-api.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "customer"
  }'
```

### Step 4: Enable NextAuth Debug Mode
Already added in the code. Check Vercel logs for detailed auth flow messages.

## Quick Fix Checklist

- [ ] Run `create-test-users.js` and add users to Supabase
- [ ] Verify environment variables are set on Vercel
- [ ] Check Vercel deployment logs for specific errors
- [ ] Test `/api/test-db` endpoint to verify Supabase connection
- [ ] Try registering a new user via `/api/auth/register`
- [ ] Check Supabase RLS policies aren't blocking access
- [ ] Redeploy after making changes

## Test Credentials (After Adding Users)

```
Email: customer@test.com
Password: password123
Role: customer

Email: rider@test.com
Password: password123
Role: rider

Email: manager@test.com
Password: password123
Role: store_manager

Email: admin@test.com
Password: password123
Role: admin
```

## Still Not Working?

1. **Check Supabase Dashboard**:
   - Go to Table Editor > users
   - Verify users exist
   - Check password_hash column has values

2. **Test locally first**:
   ```bash
   cd quickdrop-api
   npm run dev
   # Try logging in at http://localhost:3000
   ```

3. **Check Network Tab**:
   - Open browser DevTools > Network
   - Look at the 500 response body for error details
   - Check request payload is correct

4. **Verify bcrypt is working**:
   ```bash
   node -e "const bcrypt = require('bcrypt'); bcrypt.hash('test', 10).then(console.log)"
   ```

## Next Steps After Fix

Once login works:
1. Test all user roles (customer, rider, manager, admin)
2. Test protected endpoints
3. Verify session persistence
4. Test logout functionality
