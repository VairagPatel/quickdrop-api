import { NextRequest, NextResponse } from 'next/server';
import { supabase, Order, OrderItem } from '@/lib/supabase';

// CORS headers
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers });
}

// GET: Fetch all orders with customer name, rider name, items count
export async function GET(request: NextRequest) {
  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        *,
        customer:users!customer_id(name),
        rider:users!rider_id(name),
        order_items(id)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400, headers }
      );
    }

    // Transform the data to include customer_name, rider_name, items_count
    const transformedOrders = orders?.map((order: any) => ({
      ...order,
      customer_name: order.customer?.name || 'Unknown',
      rider_name: order.rider?.name || 'Unassigned',
      items_count: order.order_items?.length || 0,
      customer: undefined,
      rider: undefined,
      order_items: undefined,
    }));

    return NextResponse.json(
      { orders: transformedOrders },
      { status: 200, headers }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500, headers }
    );
  }
}

// POST: Create new order, insert order_items, return order with id
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customer_id,
      rider_id,
      delivery_address,
      items, // Array of { product_id, quantity, price }
    } = body;

    // Validate required fields
    if (!customer_id || !delivery_address || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: customer_id, delivery_address, items' },
        { status: 400, headers }
      );
    }

    // Calculate total amount
    const total_amount = items.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    );

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_id,
        rider_id: rider_id || null,
        status: 'pending',
        total_amount,
        delivery_address,
      })
      .select()
      .single();

    if (orderError) {
      return NextResponse.json(
        { error: orderError.message },
        { status: 400, headers }
      );
    }

    // Create order items
    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price,
    }));

    const { data: createdItems, error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)
      .select();

    if (itemsError) {
      // Rollback: delete the order if items creation fails
      await supabase.from('orders').delete().eq('id', order.id);
      return NextResponse.json(
        { error: itemsError.message },
        { status: 400, headers }
      );
    }

    // Update product stock
    for (const item of items) {
      const { error: stockError } = await supabase.rpc('decrement_stock', {
        product_id: item.product_id,
        quantity: item.quantity,
      });

      if (stockError) {
        console.error('Stock update error:', stockError);
      }
    }

    return NextResponse.json(
      {
        order: {
          ...order,
          order_items: createdItems,
        },
      },
      { status: 201, headers }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500, headers }
    );
  }
}
