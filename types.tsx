export enum UserRole {
  STUDENT = 'student',
  STAFF = 'staff',
  VENDOR = 'vendor',
  ADMIN = 'admin'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  status: 'active' | 'suspended';
  joinedDate: string;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  image: string;
  rating: number;
  stock: number;
  sellerId: string;
  condition?: 'New' | 'Like New' | 'Used - Good' | 'Used - Fair';
  contactPhone?: string;
  status: 'pending' | 'approved' | 'rejected';
  reportCount?: number;
  views?: number;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'completed' | 'cancelled' | 'return_requested' | 'returned';
  date: string; // CreatedAt
  deliveredAt?: string;
}

export interface SalesData {
  name: string;
  sales: number;
  revenue: number;
}

export interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  participants: string[];
  messages: Message[];
  productId?: string;
  updatedAt: string;
}

export interface Dispute {
  id: string;
  reporterId: string;
  targetId: string; // ID of product or user being reported
  targetType: 'product' | 'user';
  reason: string;
  status: 'open' | 'resolved' | 'dismissed';
  date: string;
}