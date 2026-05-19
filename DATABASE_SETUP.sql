-- QuickDrop Database Schema Setup
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (be careful in production!)
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'store_manager', 'rider', 'customer')),
  phone TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  emoji TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES users(id) ON DELETE SET NULL,
  rider_id UUID REFERENCES users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'picking', 'dispatched', 'delivered', 'cancelled')),
  total DECIMAL(10,2) NOT NULL,
  area TEXT NOT NULL,
  eta INTEGER DEFAULT 10,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create order_items table
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price DECIMAL(10,2) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_rider ON orders(rider_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);
CREATE INDEX idx_products_category ON products(category);

-- Insert sample products
INSERT INTO products (name, category, price, stock, emoji) VALUES
  ('Apples', 'Fruits', 4.99, 100, '🍎'),
  ('Bananas', 'Fruits', 2.99, 150, '🍌'),
  ('Oranges', 'Fruits', 5.99, 80, '🍊'),
  ('Milk', 'Dairy', 3.49, 50, '🥛'),
  ('Cheese', 'Dairy', 6.99, 40, '🧀'),
  ('Yogurt', 'Dairy', 4.49, 60, '🥛'),
  ('Bread', 'Bakery', 2.99, 70, '🍞'),
  ('Croissant', 'Bakery', 3.99, 30, '🥐'),
  ('Bagels', 'Bakery', 4.99, 45, '🥯'),
  ('Chicken', 'Meat', 12.99, 25, '🍗'),
  ('Beef', 'Meat', 15.99, 20, '🥩'),
  ('Fish', 'Seafood', 18.99, 15, '🐟'),
  ('Shrimp', 'Seafood', 22.99, 10, '🦐'),
  ('Tomatoes', 'Vegetables', 3.99, 90, '🍅'),
  ('Lettuce', 'Vegetables', 2.49, 85, '🥬'),
  ('Carrots', 'Vegetables', 2.99, 95, '🥕'),
  ('Potatoes', 'Vegetables', 3.49, 100, '🥔'),
  ('Onions', 'Vegetables', 2.79, 110, '🧅'),
  ('Eggs', 'Dairy', 5.99, 75, '🥚'),
  ('Butter', 'Dairy', 4.99, 55, '🧈');

-- Create a function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to auto-update updated_at on orders
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions (adjust as needed for your setup)
-- These are for the anon role - adjust based on your security requirements
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Create policies (basic examples - customize for your needs)
CREATE POLICY "Allow public read access to products" ON products
    FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to read users" ON users
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert to users (for registration)" ON users
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated users to read orders" ON orders
    FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to create orders" ON orders
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update orders" ON orders
    FOR UPDATE USING (true);

CREATE POLICY "Allow authenticated users to read order_items" ON order_items
    FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to create order_items" ON order_items
    FOR INSERT WITH CHECK (true);

-- Display summary
SELECT 'Database setup complete!' as status;
SELECT 'Users table created with password_hash column' as info;
SELECT COUNT(*) || ' products inserted' as products FROM products;
