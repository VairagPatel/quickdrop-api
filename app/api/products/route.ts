import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// CORS headers
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers });
}

// GET: Fetch all products ordered by category
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    let query = supabase
      .from('products')
      .select('*')
      .order('category', { ascending: true })
      .order('name', { ascending: true });

    // Filter by category if provided
    if (category) {
      query = query.eq('category', category);
    }

    const { data: products, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400, headers }
      );
    }

    // Group products by category
    const groupedProducts = products?.reduce((acc: any, product: any) => {
      const category = product.category || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(product);
      return acc;
    }, {});

    return NextResponse.json(
      {
        products,
        grouped: groupedProducts,
      },
      { status: 200, headers }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500, headers }
    );
  }
}

// PATCH: Update stock quantity
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { product_id, stock, operation } = body;

    if (!product_id) {
      return NextResponse.json(
        { error: 'Missing required field: product_id' },
        { status: 400, headers }
      );
    }

    let updateData: any = {};

    if (operation === 'increment' && stock !== undefined) {
      // Increment stock
      const { data: product, error: fetchError } = await supabase
        .from('products')
        .select('stock')
        .eq('id', product_id)
        .single();

      if (fetchError) {
        return NextResponse.json(
          { error: fetchError.message },
          { status: 404, headers }
        );
      }

      updateData.stock = (product.stock || 0) + stock;
    } else if (operation === 'decrement' && stock !== undefined) {
      // Decrement stock
      const { data: product, error: fetchError } = await supabase
        .from('products')
        .select('stock')
        .eq('id', product_id)
        .single();

      if (fetchError) {
        return NextResponse.json(
          { error: fetchError.message },
          { status: 404, headers }
        );
      }

      updateData.stock = Math.max(0, (product.stock || 0) - stock);
    } else if (stock !== undefined) {
      // Set stock directly
      updateData.stock = stock;
    } else {
      return NextResponse.json(
        { error: 'Missing required field: stock' },
        { status: 400, headers }
      );
    }

    const { data: updatedProduct, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', product_id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400, headers }
      );
    }

    return NextResponse.json(
      { product: updatedProduct },
      { status: 200, headers }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500, headers }
    );
  }
}
