import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// GET: Fetch all products ordered by category
export async function GET(request: NextRequest) {
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .order('category', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { products },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}

// PATCH: Update product stock
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, stock } = body;

    // Validate required fields
    if (!id || stock === undefined || stock === null) {
      return NextResponse.json(
        { error: 'Missing required fields: id, stock' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Validate stock is a number
    if (typeof stock !== 'number' || stock < 0) {
      return NextResponse.json(
        { error: 'Stock must be a non-negative number' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Update product stock
    const { data: product, error } = await supabase
      .from('products')
      .update({ stock })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { product },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}
