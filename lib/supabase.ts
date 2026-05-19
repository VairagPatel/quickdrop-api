import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// TypeScript interfaces
export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  image_url?: string;
  created_at?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'customer' | 'rider' | 'admin';
  created_at?: string;
}

export interface Order {
  id: string;
  customer_id: string;
  rider_id?: string;
  status: 'pending' | 'picking' | 'dispatched' | 'delivered';
  total_amount: number;
  delivery_address: string;
  created_at?: string;
  updated_at?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  created_at?: string;
}

export interface OrderWithDetails extends Order {
  customer_name?: string;
  rider_name?: string;
  items_count?: number;
  order_items?: (OrderItem & { product?: Product })[];
}

export interface RiderWithStats extends User {
  active_order_count?: number;
}
