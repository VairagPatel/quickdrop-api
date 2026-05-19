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

// GET: Fetch all users where role = 'rider' with their active order count
export async function GET(request: NextRequest) {
  try {
    const { data: riders, error } = await supabase
      .from('users')
      .select(`
        *,
        orders!rider_id(id, status)
      `)
      .eq('role', 'rider')
      .order('name', { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400, headers }
      );
    }

    // Transform data to include active order count
    const ridersWithStats = riders?.map((rider: any) => {
      const activeOrders = rider.orders?.filter(
        (order: any) =>
          order.status === 'pending' ||
          order.status === 'picking' ||
          order.status === 'dispatched'
      );

      return {
        id: rider.id,
        email: rider.email,
        name: rider.name,
        phone: rider.phone,
        role: rider.role,
        created_at: rider.created_at,
        active_order_count: activeOrders?.length || 0,
      };
    });

    return NextResponse.json(
      { riders: ridersWithStats },
      { status: 200, headers }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500, headers }
    );
  }
}
