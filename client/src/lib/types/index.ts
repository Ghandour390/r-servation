export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: { id: number; name: string };
  images: { imageUrl: string }[];
  availableQuantity: number;
}

export interface CartItem {
  id: number;
  product: Product;
  quantity: number;
}

export interface Order {
  id: number;
  clientId: number;
  status: 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'expired';
  total: number;
  createdAt: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: number;
  productId: number;
  product: Product;
  quantity: number;
  price: number;
}


