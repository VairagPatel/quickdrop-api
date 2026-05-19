export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'store_manager' | 'rider' | 'customer';
  phone?: string;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  emoji?: string;
  created_at?: string;
}

export interface Rider {
  id: string;
  name: string;
  email: string;
  phone?: string;
  active_order_count: number;
  created_at: string;
}

export interface Order {
  id: string;
  customer_id: string;
  rider_id?: string | null;
  status: 'pending' | 'picking' | 'dispatched' | 'delivered' | 'cancelled';
  total: number;
  area: string;
  eta?: number;
  created_at: string;
  updated_at?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
}

export interface OrderWithDetails extends Order {
  customer?: User;
  rider?: User;
  items?: (OrderItem & { product?: Product })[];
}
