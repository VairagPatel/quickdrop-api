# QuickDrop API - Quick Start Guide

## ✅ Implementation Complete!

All 7 files have been generated and TypeScript compilation is successful.

---

## 🚀 Start the Server

```bash
npm run dev
```

Server will run at: **http://localhost:3000**

---

## 📋 What Was Generated

### Core Files
1. ✅ **lib/supabase.ts** - Supabase client
2. ✅ **types/index.ts** - TypeScript interfaces (User, Product, Rider, Order, OrderItem)
3. ✅ **middleware.ts** - JWT authentication for protected routes

### API Routes
4. ✅ **app/api/orders/route.ts** - GET all orders, POST new order
5. ✅ **app/api/orders/[id]/route.ts** - GET one order, PATCH status
6. ✅ **app/api/products/route.ts** - GET all products, PATCH stock
7. ✅ **app/api/riders/route.ts** - GET all riders with active order count

---

## 🔒 Protected Routes (Require JWT)

These routes need `Authorization: Bearer <token>` header:
- `/api/orders` (GET, POST)
- `/api/orders/:id` (GET, PATCH)
- `/api/riders` (GET)

---

## 🌐 Public Routes (No Auth Required)

- `/api/products` (GET, PATCH)

---

## 📡 Test the API

### 1. Test Public Endpoint (No Auth)
```bash
curl http://localhost:3000/api/products
```

### 2. Test Protected Endpoint (With Auth)
```bash
curl http://localhost:3000/api/orders \
  -H "Authorization: Bearer your-jwt-token-here"
```

### 3. Create an Order
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-jwt-token-here" \
  -d '{
    "customer_id": "customer-uuid",
    "area": "Downtown",
    "items": [
      {"product_id": "product-uuid", "quantity": 2, "price": 5.99}
    ]
  }'
```

### 4. Update Order Status
```bash
curl -X PATCH http://localhost:3000/api/orders/order-uuid \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-jwt-token-here" \
  -d '{"status": "dispatched"}'
```

### 5. Update Product Stock
```bash
curl -X PATCH http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{"id": "product-uuid", "stock": 50}'
```

---

## 🗄️ Database Setup

Create these tables in your Supabase database:

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'store_manager', 'rider', 'customer')),
  phone TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  emoji TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES users(id),
  rider_id UUID REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'pending',
  total DECIMAL(10,2) NOT NULL,
  area TEXT NOT NULL,
  eta INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Order items table
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_rider ON orders(rider_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_users_role ON users(role);
```

---

## 🔑 Environment Variables

Your `.env.local` file should have:

```env
NEXT_PUBLIC_SUPABASE_URL=https://ljikevceqdvfdomxhnxq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📊 API Response Examples

### Success Response
```json
{
  "orders": [
    {
      "id": "uuid",
      "customer_id": "uuid",
      "status": "pending",
      "total": 18.48,
      "area": "Downtown",
      "customer": {
        "id": "uuid",
        "name": "John Doe",
        "email": "john@example.com"
      }
    }
  ]
}
```

### Error Response
```json
{
  "error": "Missing required fields: customer_id, area, items (array)"
}
```

---

## 🎯 Order Status Flow

```
pending → picking → dispatched → delivered
              ↓
          cancelled
```

Valid status values:
- `pending` - Order placed, waiting to be picked
- `picking` - Store is preparing the order
- `dispatched` - Rider is on the way
- `delivered` - Order completed
- `cancelled` - Order cancelled

---

## 🔧 Common Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

---

## ✨ Features Implemented

✅ **TypeScript Strict Mode** - Full type safety  
✅ **CORS Headers** - All routes support cross-origin requests  
✅ **JWT Middleware** - Protected routes require authentication  
✅ **Error Handling** - Try/catch on all routes  
✅ **Input Validation** - Required fields checked  
✅ **Relational Queries** - Joins for customer/rider data  
✅ **Transaction Safety** - Rollback on failures  
✅ **Proper Status Codes** - RESTful responses  

---

## 📝 Next Steps

1. ✅ **Files Generated** - All 7 files created
2. ✅ **TypeScript Compiled** - No errors
3. 🔄 **Create Database Tables** - Run SQL in Supabase
4. 🔄 **Insert Sample Data** - Add test users, products
5. 🔄 **Test Endpoints** - Use curl or Postman
6. 🔄 **Generate JWT Tokens** - For testing protected routes
7. 🔄 **Connect Frontend** - Mobile/web apps

---

## 🆘 Troubleshooting

### "Missing Supabase environment variables"
- Check `.env.local` exists
- Verify both `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set
- Restart dev server after changing env vars

### "Unauthorized: Missing or invalid authorization header"
- Add `Authorization: Bearer <token>` header to protected routes
- Ensure token has 3 parts separated by dots (JWT format)

### "Error: relation does not exist"
- Create database tables in Supabase
- Run the SQL schema provided above

---

## 📚 Documentation

- **IMPLEMENTATION_SUMMARY.md** - Detailed file descriptions
- **API_EXAMPLES.http** - Ready-to-use HTTP requests
- **SETUP_COMPLETE.md** - Full setup guide with NextAuth

---

**🎊 Your QuickDrop API is ready!**

Start the server with `npm run dev` and begin testing your endpoints.
