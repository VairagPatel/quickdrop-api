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

// GET: Fetch single order with all items and product details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        customer:users!customer_id(id, name, email, phone),
        rider:users!rider_id(id, name, email, phone),
        order_items(
          *,
          product:products(*)
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 404, headers }
      );
    }

    return NextResponse.json(
      { order },
      { status: 200, headers }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500, headers }
    );
  }
}

// PATCH: Update order status (pending→picking→dispatched→delivered)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { status, rider_id } = body;

    // Validate status
    const validStatuses = ['pending', 'picking', 'dispatched', 'delivered'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400, headers }
      );
    }

    // Build update object
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (status) {
      updateData.status = status;
    }

    if (rider_id !== undefined) {
      updateData.rider_id = rider_id;
    }

    // Update order
    const { data: order, error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        customer:users!customer_id(name),
        rider:users!rider_id(name)
      `)
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400, headers }
      );
    }

    return NextResponse.json(
      { order },
      { status: 200, headers }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500, headers }
    );
  }
}
