import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// GET: Fetch all orders with customer and rider details
export async function GET(request: NextRequest) {
  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        *,
        customer:users!customer_id(id, name, email, phone),
        rider:users!rider_id(id, name, email, phone)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { orders },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}

// POST: Create new order with items
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customer_id, area, items } = body;

    // Validate required fields
    if (!customer_id || !area || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: customer_id, area, items (array)' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Calculate total from items
    const total = items.reduce((sum: number, item: any) => {
      return sum + (item.price * item.quantity);
    }, 0);

    // Insert order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_id,
        area,
        total,
        status: 'pending',
        eta: 10,
      })
      .select()
      .single();

    if (orderError) {
      return NextResponse.json(
        { error: orderError.message },
        { status: 400, headers: corsHeaders }
      );
    }

    // Insert order items
    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price,
    }));

    const { data: insertedItems, error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)
      .select();

    if (itemsError) {
      // Rollback: delete the order
      await supabase.from('orders').delete().eq('id', order.id);
      return NextResponse.json(
        { error: itemsError.message },
        { status: 400, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { order: { ...order, items: insertedItems } },
      { status: 201, headers: corsHeaders }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}
