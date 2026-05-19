import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { supabase } from '@/lib/supabase';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, role } = body;

    // Validate required fields
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email, password, role' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Validate role
    const validRoles = ['admin', 'store_manager', 'rider', 'customer'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be: admin, store_manager, rider, or customer' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409, headers: corsHeaders }
      );
    }

    // Hash password with bcrypt (10 rounds)
    const password_hash = await bcrypt.hash(password, 10);

    // Insert user into Supabase users table
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        name,
        email,
        password_hash,
        role,
      })
      .select('id, name, email, role, created_at')
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json(
        { error: 'Failed to create user', details: error.message },
        { status: 500, headers: corsHeaders }
      );
    }

    // Return user without password_hash
    return NextResponse.json(
      { user: newUser, message: 'User registered successfully' },
      { status: 201, headers: corsHeaders }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}
