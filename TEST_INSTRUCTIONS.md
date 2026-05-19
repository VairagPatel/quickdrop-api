# QuickDrop API - Testing Instructions

## ⚠️ Important: Database Setup Required

The authentication tests are failing because the database schema hasn't been created yet.

---

## 🗄️ Step 1: Create Database Schema

### Option A: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project: https://supabase.com/dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy the entire contents of `DATABASE_SETUP.sql`
5. Paste into the SQL editor
6. Click **Run** or press `Ctrl+Enter`
7. Wait for "Database setup complete!" message

### Option B: Using Supabase CLI

```bash
supabase db push
```

---

## ✅ Step 2: Verify Database Setup

After running the SQL script, verify the tables were created:

```sql
-- Run this in Supabase SQL Editor
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'products', 'orders', 'order_items');
```

You should see all 4 tables listed.

---

## 🧪 Step 3: Run Authentication Tests

### Method 1: PowerShell Script (Automated)

```powershell
cd d:\QuickDrop\quickdrop-api
powershell -ExecutionPolicy Bypass -File test-auth.ps1
```

### Method 2: Manual curl Commands

```bash
# 1. Register an admin user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test Admin\",\"email\":\"admin@test.com\",\"password\":\"admin123\",\"role\":\"admin\"}"

# Expected Response:
# {
#   "user": {
#     "id": "uuid-here",
#     "name": "Test Admin",
#     "email": "admin@test.com",
#     "role": "admin",
#     "created_at": "2026-05-20T..."
#   },
#   "message": "User registered successfully"
# }

# 2. Register a customer
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"John Customer\",\"email\":\"john@test.com\",\"password\":\"john123\",\"role\":\"customer\"}"

# 3. Register a rider
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Mike Rider\",\"email\":\"mike@test.com\",\"password\":\"mike123\",\"role\":\"rider\"}"

# 4. Try duplicate email (should fail with 409)
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Duplicate\",\"email\":\"admin@test.com\",\"password\":\"test123\",\"role\":\"customer\"}"

# Expected Response:
# {"error":"User with this email already exists"}

# 5. Try invalid role (should fail with 400)
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Invalid\",\"email\":\"invalid@test.com\",\"password\":\"test123\",\"role\":\"superuser\"}"

# Expected Response:
# {"error":"Invalid role. Must be: admin, store_manager, rider, or customer"}

# 6. Get CSRF token
curl http://localhost:3000/api/auth/csrf

# 7. Get auth providers
curl http://localhost:3000/api/auth/providers

# 8. Check session (should be empty)
curl http://localhost:3000/api/auth/session

# 9. Try to access protected route without auth (should fail with 401)
curl http://localhost:3000/api/orders

# Expected Response:
# {"error":"Unauthorized: Authentication required"}
```

### Method 3: VS Code REST Client (Best for Login Testing)

1. Install **REST Client** extension in VS Code
2. Open `AUTH_EXAMPLES.http`
3. Click **Send Request** above each request
4. Session cookies are automatically managed

---

## 🔐 Step 4: Test Login Flow

**Note:** NextAuth login requires browser session cookies, which are difficult to test with curl.

### Using VS Code REST Client:

1. Open `AUTH_EXAMPLES.http`
2. Find the "Sign In" section
3. Click **Send Request** on the login endpoint
4. Session cookie will be automatically stored
5. Subsequent requests will include the cookie

### Using Postman:

1. Import the requests from `AUTH_EXAMPLES.http`
2. Enable **Cookie Management** in Postman settings
3. Send POST request to `/api/auth/callback/credentials`
4. Cookies will be automatically stored
5. Test protected routes

### Using Browser (Easiest):

1. Create a simple login page or use Postman
2. POST to `http://localhost:3000/api/auth/callback/credentials`
3. Body: `email=admin@test.com&password=admin123`
4. Session cookie will be set automatically
5. Access protected routes in the same browser session

---

## 📊 Expected Test Results

### ✅ Successful Tests:

| Test | Expected Result |
|------|----------------|
| Register admin | 201 Created, returns user object |
| Register customer | 201 Created, returns user object |
| Register rider | 201 Created, returns user object |
| Duplicate email | 409 Conflict, error message |
| Invalid role | 400 Bad Request, error message |
| Missing fields | 400 Bad Request, error message |
| Get CSRF token | 200 OK, returns token |
| Get providers | 200 OK, returns credentials provider |
| Get session (not logged in) | 200 OK, empty object |
| Access protected route (no auth) | 401 Unauthorized |

### 🔐 After Login:

| Test | Expected Result |
|------|----------------|
| Get session | 200 OK, returns user with id and role |
| Access /api/orders | 200 OK, returns orders array |
| Access /api/products | 200 OK, returns products array |
| Access /api/riders | 200 OK, returns riders array |
| Logout | 200 OK, session cleared |

---

## 🐛 Troubleshooting

### Error: "Could not find the 'password_hash' column"
**Solution:** Run `DATABASE_SETUP.sql` in Supabase SQL Editor

### Error: "Missing Supabase environment variables"
**Solution:** Check `.env.local` has `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Error: "Invalid credentials" on login
**Solution:** 
1. Verify user exists: `SELECT * FROM users WHERE email = 'admin@test.com';`
2. Check password was hashed during registration
3. Ensure bcrypt is installed: `npm install bcrypt`

### Error: "Unauthorized" on protected routes
**Solution:**
1. Login first to get session cookie
2. Verify session: `GET /api/auth/session`
3. Check middleware is not blocking the route

### Error: 500 Internal Server Error
**Solution:**
1. Check server logs in terminal
2. Verify database connection
3. Check Supabase credentials in `.env.local`

---

## 📝 Verify Database Data

After running tests, check the database:

```sql
-- Check registered users
SELECT id, name, email, role, created_at 
FROM users 
ORDER BY created_at DESC;

-- Check products
SELECT id, name, category, price, stock 
FROM products 
ORDER BY category, name;

-- Check if password_hash exists (should not show actual hash)
SELECT id, name, email, role, 
       CASE WHEN password_hash IS NOT NULL THEN 'SET' ELSE 'NULL' END as password_status
FROM users;
```

---

## 🎯 Complete Test Workflow

```bash
# 1. Ensure server is running
npm run dev

# 2. Create database schema (in Supabase SQL Editor)
# Run DATABASE_SETUP.sql

# 3. Run automated tests
powershell -ExecutionPolicy Bypass -File test-auth.ps1

# 4. Test login with VS Code REST Client
# Open AUTH_EXAMPLES.http and test login flow

# 5. Verify in database
# Check Supabase dashboard for registered users
```

---

## 📚 Additional Resources

- **NEXTAUTH_SETUP.md** - Complete NextAuth documentation
- **AUTH_EXAMPLES.http** - All HTTP request examples
- **COMPLETE_AUTH_SUMMARY.md** - Implementation summary
- **DATABASE_SETUP.sql** - Database schema script

---

## ✨ Next Steps After Successful Tests

1. ✅ Database schema created
2. ✅ Users can register
3. ✅ Users can login
4. ✅ Protected routes work
5. 🔄 Build frontend login/register forms
6. 🔄 Implement role-based UI
7. 🔄 Add password reset functionality
8. 🔄 Deploy to production

---

**🎊 Once the database is set up, all tests should pass!**

Run `DATABASE_SETUP.sql` in Supabase and then re-run the tests.
