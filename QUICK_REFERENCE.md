# QuickDrop API - Quick Reference Card

## 🚀 Start Server
```bash
npm run dev
```
Server runs at: **http://localhost:3000**

---

## 📋 Environment Variables (.env.local)
```env
NEXT_PUBLIC_SUPABASE_URL=https://ljikevceqdvfdomxhnxq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXTAUTH_SECRET=quickdrop_super_secret_key_2026_production_ready_random_string_xyz123
NEXTAUTH_URL=http://localhost:3000
```

---

## 🔐 Authentication Endpoints (Public)

### Register User
```http
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "customer"  // admin | store_manager | rider | customer
}
```

### Login
```http
POST /api/auth/signin
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Logout
```http
POST /api/auth/signout
```

---

## 🛒 Orders API (Protected)

### Get All Orders
```http
GET /api/orders
```
Returns: Orders with customer name, rider name, items count

### Create Order
```http
POST /api/orders
{
  "customer_id": "uuid",
  "area": "Downtown",
  "items": [
    { "product_id": "uuid", "quantity": 2, "price": 5.99 }
  ]
}
```

### Get Single Order
```http
GET /api/orders/{id}
```
Returns: Order with full details, items, and product info

### Update Order Status
```http
PATCH /api/orders/{id}
{
  "status": "picking"  // pending | picking | dispatched | delivered | cancelled
}
```

### Assign Rider
```http
PATCH /api/orders/{id}
{
  "rider_id": "uuid"
}
```

---

## 📦 Products API (Protected)

### Get All Products
```http
GET /api/products
```
Returns: Products grouped by category

### Get Products by Category
```http
GET /api/products?category=Fruits
```

### Update Stock (Direct)
```http
PATCH /api/products
{
  "id": "uuid",
  "stock": 50
}
```

### Increment Stock
```http
PATCH /api/products
{
  "product_id": "uuid",
  "stock": 10,
  "operation": "increment"
}
```

### Decrement Stock
```http
PATCH /api/products
{
  "product_id": "uuid",
  "stock": 5,
  "operation": "decrement"
}
```

---

## 🏍️ Riders API (Protected)

### Get All Riders
```http
GET /api/riders
```
Returns: All riders with active order count

---

## 📊 Response Formats

### Success Response
```json
{
  "data": { ... },
  "message": "Success message"
}
```

### Error Response
```json
{
  "error": "Error message",
  "details": "Detailed error info"
}
```

---

## 🔒 Protected Routes
These routes require authentication (NextAuth session):
- `/api/orders/*`
- `/api/products/*`
- `/api/riders/*`

Middleware automatically checks for valid session token.

---

## 📁 Project Structure
```
quickdrop-api/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/route.ts  # NextAuth handler
│   │   │   └── register/route.ts       # User registration
│   │   ├── orders/
│   │   │   ├── route.ts                # List/Create orders
│   │   │   └── [id]/route.ts           # Get/Update order
│   │   ├── products/route.ts           # Products CRUD
│   │   └── riders/route.ts             # Riders list
├── lib/
│   └── supabase.ts                     # Supabase client
├── types/
│   ├── index.ts                        # Type definitions
│   └── next-auth.d.ts                  # NextAuth types
├── middleware.ts                       # Route protection
└── .env.local                          # Environment variables
```

---

## 🗄️ Database Tables

### users
- id (UUID, PK)
- name (TEXT)
- email (TEXT, UNIQUE)
- password_hash (TEXT)
- role (TEXT)
- phone (TEXT)
- created_at (TIMESTAMP)

### products
- id (UUID, PK)
- name (TEXT)
- category (TEXT)
- price (DECIMAL)
- stock (INTEGER)
- emoji (TEXT)

### orders
- id (UUID, PK)
- customer_id (UUID, FK → users)
- rider_id (UUID, FK → users)
- status (TEXT)
- total (DECIMAL)
- area (TEXT)
- eta (INTEGER)
- created_at (TIMESTAMP)

### order_items
- id (UUID, PK)
- order_id (UUID, FK → orders)
- product_id (UUID, FK → products)
- quantity (INTEGER)
- price (DECIMAL)

---

## 🔧 Common Commands

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

---

## 🧪 Testing with curl

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"test123","role":"customer"}'

# Get products (after login)
curl http://localhost:3000/api/products \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"
```

---

## 📝 Status Codes

- **200** - Success
- **201** - Created
- **400** - Bad Request
- **401** - Unauthorized
- **404** - Not Found
- **409** - Conflict (duplicate)
- **500** - Server Error

---

## 🎯 Order Status Flow

```
pending → picking → dispatched → delivered
                 ↓
              cancelled
```

---

## 👥 User Roles

1. **customer** - Place orders, view own orders
2. **rider** - Accept deliveries, update order status
3. **store_manager** - Manage products, assign riders
4. **admin** - Full access to all resources

---

## 🔗 Useful Links

- Next.js Docs: https://nextjs.org/docs
- NextAuth.js: https://next-auth.js.org
- Supabase: https://supabase.com/docs
- TypeScript: https://www.typescriptlang.org/docs

---

**Need help?** Check `SETUP_COMPLETE.md` for detailed documentation or `API_EXAMPLES.http` for request examples.
