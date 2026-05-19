/**
 * Script to create test users with properly hashed passwords
 * Run with: node create-test-users.js
 */

const bcrypt = require('bcrypt');

async function generateTestUsers() {
  const password = 'password123';
  const saltRounds = 10;

  console.log('Generating bcrypt hashes for test users...\n');
  console.log('Password for all users: password123\n');

  const users = [
    { name: 'Admin User', email: 'admin@test.com', role: 'admin', phone: '+1234567890' },
    { name: 'Store Manager', email: 'manager@test.com', role: 'store_manager', phone: '+1234567891' },
    { name: 'John Rider', email: 'rider@test.com', role: 'rider', phone: '+1234567892' },
    { name: 'Jane Customer', email: 'customer@test.com', role: 'customer', phone: '+1234567893' },
  ];

  console.log('-- Add Test Users to QuickDrop Database');
  console.log('-- Run this in your Supabase SQL Editor\n');
  console.log('INSERT INTO users (name, email, password_hash, role, phone) VALUES');

  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    const hash = await bcrypt.hash(password, saltRounds);
    
    const comma = i < users.length - 1 ? ',' : ';';
    console.log(`  ('${user.name}', '${user.email}', '${hash}', '${user.role}', '${user.phone}')${comma}`);
  }

  console.log('\n-- Verify users were created');
  console.log("SELECT name, email, role, created_at FROM users WHERE email LIKE '%@test.com' ORDER BY role;");
  console.log('\n-- Test credentials:');
  console.log('-- Email: customer@test.com, Password: password123');
  console.log('-- Email: rider@test.com, Password: password123');
  console.log('-- Email: manager@test.com, Password: password123');
  console.log('-- Email: admin@test.com, Password: password123');
}

generateTestUsers().catch(console.error);
