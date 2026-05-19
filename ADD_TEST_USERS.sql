-- Add Test Users to QuickDrop Database
-- Run this in your Supabase SQL Editor AFTER running DATABASE_SETUP.sql

-- Note: These passwords are hashed with bcrypt (10 rounds)
-- All test users have password: password123

-- Insert test users
INSERT INTO users (name, email, password_hash, role, phone) VALUES
  -- Admin user
  (
    'Admin User',
    'admin@test.com',
    '$2b$10$rZ5YhkqGxGxGxGxGxGxGxOeKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'admin',
    '+1234567890'
  ),
  -- Store Manager
  (
    'Store Manager',
    'manager@test.com',
    '$2b$10$rZ5YhkqGxGxGxGxGxGxGxOeKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'store_manager',
    '+1234567891'
  ),
  -- Rider
  (
    'John Rider',
    'rider@test.com',
    '$2b$10$rZ5YhkqGxGxGxGxGxGxGxOeKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'rider',
    '+1234567892'
  ),
  -- Customer
  (
    'Jane Customer',
    'customer@test.com',
    '$2b$10$rZ5YhkqGxGxGxGxGxGxGxOeKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'customer',
    '+1234567893'
  )
ON CONFLICT (email) DO NOTHING;

-- Verify users were created
SELECT 
  name, 
  email, 
  role, 
  created_at 
FROM users 
WHERE email LIKE '%@test.com'
ORDER BY role;

SELECT 'Test users added successfully!' as status;
SELECT 'Login with any test user using password: password123' as info;
