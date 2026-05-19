# NextAuth.js Authentication - Complete Setup

## ✅ All Files Generated Successfully

Complete NextAuth.js authentication system for QuickDrop API with role-based access control.

---

## 📁 Files Created

### 1. **lib/auth.ts**
Central authentication configuration file.

**Features:**
- ✅ CredentialsProvider with email + password
- ✅ Queries Supabase users table
- ✅ bcrypt password verification
- ✅ JWT callbacks (adds id + role to token)
- ✅ Session callbacks (adds id + role to session)
- ✅ Custom sign-in page: `/login`
- ✅ `getCurrentUser()` helper function
- ✅ `getAuthOptions()` export for route handlers

**Usage in Route Handlers:**
```typescript
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // user.id, user.email, user.role available
}
```

---

### 2. **app/api/auth/[...nextauth]/route.ts**
NextAuth.js API route handler.

**Endpoints:**
- `POST /api/auth/signin` - Login
- `POST /api/auth/signout` - Logout
- `GET /api/auth/session` - Get current session
- `GET /api/auth/csrf` - CSRF token
- `GET /api/auth/providers` - Available providers

**Features:**
- Uses centralized `authOptions` from `lib/auth.ts`
- Handles all NextAuth.js authentication flows
- JWT-based sessions

---

### 3. **app/api/auth/register/route.ts**
User registration endpoint.

**POST /api/auth/register**

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "role": "customer"
}
```

**Valid Roles:**
- `admin` - Full system access
- `store_manager` - Manage products and orders
- `rider` - Delivery operations
- `customer` - Place orders

**Features:**
- ✅ Validates all required fields
- ✅ Validates role against allowed values
- ✅ Checks for duplicate email
- ✅ Hashes password with bcrypt (10 rounds)
- ✅ Inserts into Supabase users table
- ✅ Returns user without password_hash
- ✅ CORS headers enabled

**Response (Success):**
```json
{
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer",
    "created_at": "2026-05-20T..."
  },
  "message": "User registered successfully"
}
```

**Response (Error):**
```json
{
  "error": "User with this email already exists"
}
```

---

### 4. **types/next-auth.d.ts**
TypeScript type definitions for NextAuth.js.

**Extended Types:**
- `Session.user` - Added `id: string` and `role: string`
- `User` - Includes `id`, `name`, `email`, `role`
- `JWT` - Added `id: string` and `role: string`

**Usage:**
```typescript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const session = await getServerSession(authOptions);
// session.user.id - TypeScript knows this exists
// session.user.role - TypeScript knows this exists
```

---

### 5. **middleware.ts**
Route protection with NextAuth.js middleware.

**Protected Routes:**
- `/api/orders/*` - Requires authentication
- `/api/riders/*` - Requires authentication
- `/api/products/*` - Requires authentication
- `/api/admin/*` - Requires admin role

**Features:**
- ✅ Checks for valid NextAuth session
- ✅ Returns 401 if not authenticated
- ✅ Returns 403 if admin route accessed by non-admin
- ✅ CORS headers on error responses
- ✅ Redirects to `/login` for unauthenticated users

**Access Control:**
```typescript
// All authenticated users can access:
/api/orders, /api/riders, /api/products

// Only admin role can access:
/api/admin/*
```

---

## 🔐 Authentication Flow

### 1. Register a New User
```bash
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "name": "Alice Customer",
  "email": "alice@example.com",
  "password": "alice123",
  "role": "customer"
}
```

### 2. Login (Sign In)
```bash
POST http://localhost:3000/api/auth/signin/credentials
Content-Type: application/json

{
  "email": "alice@example.com",
  "password": "alice123",
  "callbackUrl": "/"
}
```

Or use NextAuth client-side:
```typescript
import { signIn } from 'next-auth/react';

await signIn('credentials', {
  email: 'alice@example.com',
  password: 'alice123',
  redirect: false,
});
```

### 3. Get Current Session
```bash
GET http://localhost:3000/api/auth/session
```

Response:
```json
{
  "user": {
    "id": "uuid",
    "name": "Alice Customer",
    "email": "alice@example.com",
    "role": "customer"
  },
  "expires": "2026-06-20T..."
}
```

### 4. Access Protected Route
After login, NextAuth sets a session cookie automatically.

```bash
GET http://localhost:3000/api/orders
# Cookie is sent automatically by browser
```

### 5. Logout (Sign Out)
```bash
POST http://localhost:3000/api/auth/signout
```

Or use NextAuth client-side:
```typescript
import { signOut } from 'next-auth/react';

await signOut({ callbackUrl: '/login' });
```

---

## 🔒 Role-Based Access Control

### User Roles

| Role | Access Level | Can Access |
|------|--------------|------------|
| **customer** | Basic | Orders (own), Products |
| **rider** | Delivery | Orders (assigned), Riders list |
| **store_manager** | Management | Orders (all), Products, Riders |
| **admin** | Full | Everything including /api/admin/* |

### Implementing Role Checks in Routes

```typescript
import { getCurrentUser } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET() {
  const user = await getCurrentUser();
  
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  // Check for specific role
  if (user.role !== 'admin') {
    return NextResponse.json(
      { error: 'Forbidden: Admin access required' },
      { status: 403 }
    );
  }
  
  // Admin-only logic here
  return NextResponse.json({ data: 'Admin data' });
}
```

---

## 🗄️ Database Schema

### users table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'store_manager', 'rider', 'customer')),
  phone TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index for faster email lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

---

## � Environment Variables

Required in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://ljikevceqdvfdomxhnxq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

NEXTAUTH_SECRET=quickdrop_super_secret_key_2026_production_ready_random_string_xyz123
NEXTAUTH_URL=http://localhost:3000
```

**Important:**
- `NEXTAUTH_SECRET` - Used to encrypt JWT tokens (keep secret!)
- `NEXTAUTH_URL` - Your app's base URL (change in production)

---

## 🧪 Testing Authentication

### Test Registration
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "test123",
    "role": "customer"
  }'
```

### Test Login (Get Session Cookie)
```bash
curl -X POST http://localhost:3000/api/auth/callback/credentials \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123"
  }' \
  -c cookies.txt
```

### Test Protected Route
```bash
curl http://localhost:3000/api/orders \
  -b cookies.txt
```

### Test Session
```bash
curl http://localhost:3000/api/auth/session \
  -b cookies.txt
```

---

## 📱 Frontend Integration

### React/Next.js Client

```typescript
'use client';

import { signIn, signOut, useSession } from 'next-auth/react';

export default function LoginForm() {
  const { data: session, status } = useSession();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await signIn('credentials', {
      email: 'user@example.com',
      password: 'password123',
      redirect: false,
    });
    
    if (result?.error) {
      console.error('Login failed:', result.error);
    } else {
      console.log('Login successful!');
    }
  };

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (session) {
    return (
      <div>
        <p>Logged in as: {session.user.email}</p>
        <p>Role: {session.user.role}</p>
        <button onClick={() => signOut()}>Sign Out</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleLogin}>
      <input type="email" name="email" required />
      <input type="password" name="password" required />
      <button type="submit">Sign In</button>
    </form>
  );
}
```

### Wrap App with SessionProvider

```typescript
// app/layout.tsx or app/providers.tsx
'use client';

import { SessionProvider } from 'next-auth/react';

export default function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
```

---

## 🔐 Security Features

✅ **Password Hashing** - bcrypt with 10 salt rounds  
✅ **JWT Sessions** - Encrypted tokens with NEXTAUTH_SECRET  
✅ **CSRF Protection** - Built into NextAuth.js  
✅ **HTTP-Only Cookies** - Session tokens not accessible via JavaScript  
✅ **Role-Based Access** - Middleware enforces permissions  
✅ **Duplicate Email Check** - Prevents multiple accounts  
✅ **Input Validation** - All fields validated before processing  

---

## 🚀 API Endpoints Summary

### Authentication Endpoints (Public)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/signin` - Login
- `POST /api/auth/signout` - Logout
- `GET /api/auth/session` - Get current session
- `GET /api/auth/csrf` - Get CSRF token

### Protected Endpoints (Require Auth)
- `GET /api/orders` - List orders
- `POST /api/orders` - Create order
- `GET /api/orders/:id` - Get order details
- `PATCH /api/orders/:id` - Update order
- `GET /api/products` - List products
- `PATCH /api/products` - Update product
- `GET /api/riders` - List riders

### Admin-Only Endpoints
- `/api/admin/*` - Admin operations (403 for non-admin)

---

## 🆘 Troubleshooting

### "Invalid credentials" on login
- Verify user exists in database
- Check password was hashed correctly during registration
- Ensure bcrypt is installed: `npm install bcrypt`

### "Unauthorized" on protected routes
- Check if user is logged in: `GET /api/auth/session`
- Verify session cookie is being sent
- Check `NEXTAUTH_SECRET` is set in `.env.local`

### "Forbidden: Admin access required"
- User role is not 'admin'
- Check user role in database
- Verify JWT token includes correct role

### Session not persisting
- Restart dev server after changing `.env.local`
- Clear browser cookies and try again
- Check `NEXTAUTH_URL` matches your app URL

---

## 📝 Next Steps

1. ✅ **Files Generated** - All 5 authentication files created
2. ✅ **Dependencies Installed** - bcrypt, next-auth ready
3. 🔄 **Create Users Table** - Run SQL in Supabase
4. 🔄 **Test Registration** - Create a test user
5. 🔄 **Test Login** - Verify authentication works
6. 🔄 **Test Protected Routes** - Access with session
7. 🔄 **Integrate Frontend** - Add login/register forms

---

## � Complete Workflow Example

```bash
# 1. Register a customer
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@test.com","password":"john123","role":"customer"}'

# 2. Login (save session cookie)
curl -X POST http://localhost:3000/api/auth/callback/credentials \
  -H "Content-Type: application/json" \
  -d '{"email":"john@test.com","password":"john123"}' \
  -c cookies.txt

# 3. Check session
curl http://localhost:3000/api/auth/session -b cookies.txt

# 4. Access protected route
curl http://localhost:3000/api/orders -b cookies.txt

# 5. Logout
curl -X POST http://localhost:3000/api/auth/signout -b cookies.txt
```

---

**🎊 NextAuth.js authentication is fully configured and ready to use!**

Start the server with `npm run dev` and test your authentication flow.
