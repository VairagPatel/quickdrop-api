import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// GET: Fetch all riders with active order count
export async function GET(request: NextRequest) {
  try {
    // Fetch all users where role = 'rider'
    const { data: riders, error: ridersError } = await supabase
      .from('users')
      .select('id, name, email, phone, created_at')
      .eq('role', 'rider')
      .order('name', { ascending: true });

    if (ridersError) {
      return NextResponse.json(
        { error: ridersError.message },
        { status: 400, headers: corsHeaders }
      );
    }

    // For each rider, count their active (non-delivered) orders
    const ridersWithOrderCount = await Promise.all(
      riders.map(async (rider) => {
        const { count, error: countError } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('rider_id', rider.id)
          .in('status', ['pending', 'picking', 'dispatched']);

        if (countError) {
          console.error(`Count error for rider ${rider.id}:`, countError);
          return { ...rider, active_order_count: 0 };
        }

        return { ...rider, active_order_count: count || 0 };
      })
    );

    return NextResponse.json(
      { riders: ridersWithOrderCount },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}
