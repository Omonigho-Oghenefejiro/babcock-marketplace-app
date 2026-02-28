// types.tsx
export type UserRole = 'user' | 'seller' | 'admin';
// Also export as a const object for easier access

export const UserRoles = {
  USER: 'user' as UserRole,
  SELLER: 'seller' as UserRole,
  ADMIN: 'admin' as UserRole
};

export interface User {
  id: string;
  username?: string;
  name: string;           // Add this
  fullName?: string;      // Keep this if used
  email: string;
  phone?: string;
  campusRole?: 'student' | 'staff' | 'vendor' | 'other';
  role: UserRole;
  isVerified: boolean;
  avatar?: string;        // Add this
  profileImage?: string;  // Keep this if used
  ratings?: number;
  createdAt?: string;
}




export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  images: string[];
  seller: User;
  condition: 'New' | 'Like New' | 'Good' | 'Fair';
  inStock: boolean;
  quantity?: number;
  ratings: number;
  reviews: Review[];
  isApproved?: boolean;
  createdAt?: string;
}

export interface Review {
  id?: string;
  productId: string;
  userId: string;
  userName?: string;
  rating: number;
  comment: string;
  date?: string;
}

export interface CartItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  images: string[];
  category: string;
  stock: number;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  totalPrice?: number;
  totalAmount?: number;
  paymentStatus?: 'pending' | 'completed' | 'failed';
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'completed' | 'cancelled' | 'return_requested' | 'returned';
  date: string;
  createdAt?: string;
  deliveredAt?: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderName?: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  participants: string[];
  messages: Message[];
  productId?: string;
  productTitle?: string;
  updatedAt: string;
}

export interface Dispute {
  id: string;
  reporterId: string;
  targetId: string;
  targetType: 'product' | 'user';
  reason: string;
  status: 'open' | 'resolved' | 'dismissed';
  date: string;
}