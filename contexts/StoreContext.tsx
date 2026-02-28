import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { User, Product, CartItem, Order, Review, Conversation, Dispute } from '../types';
import API from '../services/api';
import { useToast } from './ToastContext';

interface StoreContextType {
  user: User | null;
  allUsers: User[];
  products: Product[];
  cart: CartItem[];
  wishlist: Product[];
  orders: Order[];
  reviews: Review[];
  conversations: Conversation[];
  disputes: Dispute[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  refreshConversations: () => Promise<void>;
  login: (email: string, password?: string) => Promise<void>;
  register: (fullName: string, email: string, password: string, phone: string, profileImage?: string, username?: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => Promise<void>;
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  refreshCart: () => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (productId: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  toggleWishlist: (product: Product) => Promise<void>;
  checkout: () => Promise<void>;
  addReview: (productId: string, rating: number, comment: string) => Promise<void>;
  sendMessage: (receiverId: string, content: string, productId?: string) => Promise<void>;
  markAsRead: (conversationId: string) => Promise<void>;
  updateUserStatus: (userId: string, status: 'active' | 'suspended') => void;
  impersonateUser: (userId: string) => void;
  updateProductStatus: (productId: string, status: 'approved' | 'rejected') => Promise<void>;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
  requestReturn: (orderId: string) => Promise<void>;
  updateDisputeStatus: (id: string, status: 'resolved' | 'dismissed') => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const apiOrigin = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');

const getAverageRating = (ratings: unknown): number => {
  if (typeof ratings === 'number') return ratings;
  if (Array.isArray(ratings)) {
    const values = ratings
      .map((entry) => {
        if (typeof entry === 'number') return entry;
        if (entry && typeof entry === 'object' && 'rating' in entry) {
          return Number((entry as { rating?: unknown }).rating);
        }
        return Number(entry);
      })
      .filter((value) => Number.isFinite(value));
    if (!values.length) return 0;
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }
  const asNumber = Number(ratings);
  return Number.isFinite(asNumber) ? asNumber : 0;
};

const normalizeUser = (user: User | Record<string, any>): User => ({
  id: (user as any).id || (user as any)._id,
  username: (user as any).username,
  name: (user as any).fullName || (user as any).name || 'User',
  fullName: (user as any).fullName || (user as any).name,
  email: (user as any).email,
  phone: (user as any).phone,
  campusRole: (user as any).campusRole,
  role: (user as any).role || 'user',
  isVerified: (user as any).isVerified ?? false,
  avatar: (user as any).profileImage || (user as any).avatar,
  profileImage: (user as any).profileImage || (user as any).avatar,
  ratings: (user as any).ratings,
});

const normalizeProduct = (product: Product | Record<string, any>): Product => {
  const seller = normalizeUser(product.seller || {});
  const productId = (product as any).id || (product as any)._id;
  const rawImages = Array.isArray((product as any).images)
    ? (product as any).images
    : (product as any).images
      ? [(product as any).images]
      : (product as any).image
        ? [(product as any).image]
        : [];
  const images = rawImages
    .map((img: unknown) => {
      if (typeof img === 'string') return img;
      if (img && typeof img === 'object' && 'url' in (img as Record<string, unknown>)) {
        return String((img as Record<string, unknown>).url || '');
      }
      return '';
    })
    .filter(Boolean)
    .map((img: string) => {
      if (img.startsWith('http') || img.startsWith('data:')) return img;
      const normalized = img.startsWith('/') ? img : `/${img}`;
      return `${apiOrigin}${normalized}`;
    });
  const ratingEntries = Array.isArray((product as any).ratings)
    ? (product as any).ratings
    : Array.isArray((product as any).reviews)
      ? (product as any).reviews
      : [];
  const reviews: Review[] = ratingEntries
    .map((entry: any, index: number) => ({
      id: entry?._id || `${productId}-${entry?.userId?._id || entry?.userId || index}`,
      productId,
      userId: String(entry?.userId?._id || entry?.userId || ''),
      userName: entry?.userId?.fullName || entry?.userName || 'Verified Buyer',
      rating: Number(entry?.rating || 0),
      comment: String(entry?.review || entry?.comment || ''),
      date: entry?.createdAt ? new Date(entry.createdAt).toLocaleDateString() : undefined,
    }))
    .filter((entry: Review) => Number.isFinite(entry.rating) && entry.rating > 0);
  const rawQuantity = Number((product as any).quantity);
  const quantity = Number.isFinite(rawQuantity) && rawQuantity >= 0
    ? Math.floor(rawQuantity)
    : ((product as any).inStock === false ? 0 : 1);
  const inStock = quantity > 0 && (product as any).inStock !== false;
  return {
    ...(product as Product),
    id: productId,
    seller,
    images,
    quantity,
    inStock,
    ratings: getAverageRating(ratingEntries),
    reviews,
  };
};

const normalizeOrderItem = (item: any): CartItem => {
  const product = item?.product || item?.productId || {};
  const productId = product?._id || product?.id || item?.product || item?.productId;
  const title = product?.title || item?.title || 'Item';
  const category = product?.category || item?.category || 'Others';
  const images = Array.isArray(product?.images)
    ? product.images
    : Array.isArray(item?.images)
      ? item.images
      : [];
  const quantity = Number(item?.quantity || 1);
  const price = Number(item?.price || product?.price || 0);
  const stockCount = Number(product?.quantity);

  return {
    id: String(productId || ''),
    title,
    price,
    quantity,
    images,
    category,
    stock: Number.isFinite(stockCount) ? stockCount : (product?.inStock === false ? 0 : 1),
  };
};

const normalizeOrder = (order: any): Order => {
  const itemsSource = Array.isArray(order?.items)
    ? order.items
    : Array.isArray(order?.orderItems)
      ? order.orderItems
      : [];
  const items = itemsSource.map(normalizeOrderItem);
  const totalAmount = Number(order?.totalAmount ?? order?.totalPrice ?? order?.total ?? 0);

  return {
    id: order?._id || order?.id,
    userId: String(order?.buyer?._id || order?.buyer || order?.userId || ''),
    items,
    total: totalAmount,
    totalPrice: totalAmount,
    totalAmount,
    paymentStatus: order?.paymentStatus,
    status: order?.status || 'pending',
    date: order?.createdAt || order?.date || new Date().toISOString(),
    createdAt: order?.createdAt,
    deliveredAt: order?.deliveredAt,
  };
};

const normalizeCartItem = (item: any): CartItem => {
  const product = item?.productId || {};
  const stockCount = Number(product.quantity);
  return {
    id: product._id || product.id || item.productId,
    title: product.title || item.title || 'Item',
    price: Number(product.price || item.price || 0),
    quantity: Number(item.quantity || 1),
    images: Array.isArray(product.images) ? product.images : item.images || [],
    category: product.category || item.category || 'Others',
    stock: Number.isFinite(stockCount) ? stockCount : (product.inStock === false ? 0 : 1),
  };
};

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { addToast } = useToast();
  
  // -- Auth State --
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = sessionStorage.getItem('user') || localStorage.getItem('user');
    const savedToken = sessionStorage.getItem('token') || localStorage.getItem('token');
    if (savedUser && savedToken) {
      return JSON.parse(savedUser);
    }
    return null;
  });

  // -- Data State --
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const reviews = products.flatMap((product) => Array.isArray(product.reviews) ? product.reviews : []);

  const [searchQuery, setSearchQuery] = useState('');

  // -- Effects --
  useEffect(() => {
    if (!user) {
      setAllUsers([]);
    }
  }, [user]);

  const fetchProducts = useCallback(async () => {
    const readProducts = (payload: any) => {
      if (Array.isArray(payload)) return payload;
      if (Array.isArray(payload?.products)) return payload.products;
      return [];
    };

    try {
      if (user?.role === 'admin') {
        const { data } = await API.get('/admin/products');
        const incoming = readProducts(data);
        setProducts(incoming.map(normalizeProduct));
        return;
      }

      const { data } = await API.get('/products');
      const incoming = readProducts(data);
      setProducts(incoming.map(normalizeProduct));
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Failed to load products.';
      setProducts([]);
      addToast(msg, 'error');
    }
  }, [addToast, user]);

  const fetchOrders = useCallback(async () => {
    if (!user) return;
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    if (!token) {
      setOrders([]);
      return;
    }
    try {
      const { data } = await API.get('/orders/myorders');
      const incoming = Array.isArray(data) ? data : [];
      setOrders(incoming.map(normalizeOrder));
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Failed to load orders.';
      setOrders([]);
      addToast(msg, 'error');
    }
  }, [user, addToast]);

  const fetchConversations = useCallback(async () => {
    if (!user) return;
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    if (!token) {
      setConversations([]);
      return;
    }
    try {
      const { data } = await API.get('/messages');
      setConversations(data);
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Failed to load messages.';
      setConversations([]);
      addToast(msg, 'error');
    }
  }, [user, addToast]);

  const refreshConversations = useCallback(async () => {
    await fetchConversations();
  }, [fetchConversations]);

  const fetchUsers = useCallback(async () => {
    if (!user || user.role !== 'admin') return;
    try {
      const { data } = await API.get('/admin/users');
      const incoming = Array.isArray(data) ? data : [];
      setAllUsers(incoming.map(normalizeUser));
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Failed to load users.';
      setAllUsers([]);
      addToast(msg, 'error');
    }
  }, [user, addToast]);

  const fetchCart = useCallback(async (options?: { silent?: boolean }) => {
    if (!user) return;
    try {
      const { data } = await API.get('/cart');
      const incoming = Array.isArray(data) ? data : [];
      setCart(incoming.map(normalizeCartItem));
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Failed to load cart.';
      setCart([]);
      if (!options?.silent) {
        addToast(msg, 'error');
      }
    }
  }, [user, addToast]);

  const refreshCart = useCallback(async () => {
    await fetchCart({ silent: true });
  }, [fetchCart]);

  const fetchWishlist = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await API.get('/users/wishlist');
      const incoming = Array.isArray(data) ? data : [];
      setWishlist(incoming.map(normalizeProduct));
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Failed to load wishlist.';
      setWishlist([]);
      addToast(msg, 'error');
    }
  }, [user, addToast]);

  // Initial Load
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Auth Dependent Loads
  useEffect(() => {
    if (user) {
      fetchOrders();
      fetchConversations();
      fetchCart();
      fetchWishlist();
      if (user.role === 'admin') {
        fetchUsers();
      }
      const interval = setInterval(fetchConversations, 10000);
      return () => clearInterval(interval);
    }
    setOrders([]);
    setConversations([]);
    setAllUsers([]);
    setCart([]);
    setWishlist([]);
  }, [user, fetchOrders, fetchConversations, fetchUsers, fetchCart, fetchWishlist]);

  // -- Actions --

  const login = async (email: string, password: string = 'password123') => {
    try {
      const { data } = await API.post('/auth/login', { email, password });
      if (data.token) {
        sessionStorage.setItem('token', data.token);
        localStorage.removeItem('token');
      }
      if (data.refreshToken) {
        sessionStorage.setItem('refreshToken', data.refreshToken);
        localStorage.removeItem('refreshToken');
      }
      const mappedUser = normalizeUser(data.user || data);
      setUser(mappedUser);
      sessionStorage.setItem('user', JSON.stringify(mappedUser));
      localStorage.removeItem('user');
      addToast(`Welcome back, ${mappedUser.name}!`);
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Login failed. Please try again.';
      addToast(msg, 'error');
      throw error;
    }
  };

  const register = async (fullName: string, email: string, password: string, phone: string, profileImage?: string, username?: string) => {
    try {
      const { data } = await API.post('/auth/register', { fullName, email, password, phone, profileImage, username });
      if (data.token && data.user) {
        sessionStorage.setItem('token', data.token);
        localStorage.removeItem('token');
        if (data.refreshToken) {
          sessionStorage.setItem('refreshToken', data.refreshToken);
          localStorage.removeItem('refreshToken');
        }
        const mappedUser = normalizeUser(data.user || data);
        setUser(mappedUser);
        sessionStorage.setItem('user', JSON.stringify(mappedUser));
        localStorage.removeItem('user');
        addToast(`Account created! Welcome, ${mappedUser.name}!`);
        return;
      }

      addToast(data?.message || 'Registration successful. Verify your email before logging in.', 'info');
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Registration failed. Please try again.';
      addToast(msg, 'error');
      throw error;
    }
  };

  const logout = () => {
    const refreshToken = sessionStorage.getItem('refreshToken') || localStorage.getItem('refreshToken');
    if (refreshToken) {
      API.post('/auth/logout', { refreshToken }).catch(() => undefined);
    }

    setUser(null);
    setCart([]);
    setWishlist([]);
    setConversations([]);
    setOrders([]);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('refreshToken');
    addToast('Logged out successfully', 'info');
  };

  const updateUser = async (updates: Partial<User>) => {
    try {
      const payload = {
        fullName: updates.fullName || updates.name,
        phone: updates.phone,
        profileImage: updates.profileImage || updates.avatar,
        campusRole: updates.campusRole,
      };
      const { data } = await API.put('/users/profile', payload);
      const mappedUser = normalizeUser(data.user || data);
      setUser(mappedUser);
      sessionStorage.setItem('user', JSON.stringify(mappedUser));
      localStorage.removeItem('user');
      setAllUsers(prev => prev.map(u => u.id === mappedUser.id ? { ...u, ...mappedUser } : u));
      addToast('Profile updated successfully');
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Failed to update profile.';
      addToast(msg, 'error');
      throw error;
    }
  };

  const addToCart = async (product: Product, quantity: number = 1) => {
    if (user?.role === 'admin') {
      addToast('Admins cannot shop.', 'error');
      return;
    }
    try {
      await API.post('/cart/add', { productId: product.id, quantity });
      await fetchCart();
      addToast(`${product.title} added to cart`);
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Failed to add to cart.';
      addToast(msg, 'error');
      throw error;
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    try {
      const currentQty = cart.find((item) => item.id === productId)?.quantity || 0;

      if (quantity <= 0) {
        await API.post('/cart/remove', { productId });
      } else if (quantity > currentQty) {
        await API.post('/cart/add', { productId, quantity: quantity - currentQty });
      } else {
        await API.post('/cart/remove', { productId });
        await API.post('/cart/add', { productId, quantity });
      }

      await fetchCart();
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Failed to update cart.';
      addToast(msg, 'error');
      throw error;
    }
  };

  const removeFromCart = async (productId: string) => {
    try {
      await API.post('/cart/remove', { productId });
      await fetchCart();
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Failed to remove from cart.';
      addToast(msg, 'error');
      throw error;
    }
  };

  const clearCart = async () => {
    try {
      await Promise.all(cart.map((item) => API.post('/cart/remove', { productId: item.id })));
      setCart([]);
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Failed to clear cart.';
      addToast(msg, 'error');
      throw error;
    }
  };

  const addProduct = async (product: Product) => {
    try {
      const payload = {
        ...product,
        images: product.images || [],
      };
      const { data } = await API.post('/products', payload);
      const created = data?.product || data;
      if (created?.isApproved) {
        setProducts(prev => [normalizeProduct(created), ...prev]);
        addToast('Product listed successfully!');
      } else {
        addToast('Listing submitted. It will appear after admin approval.', 'info');
      }
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Failed to list product.';
      addToast(msg, 'error');
      throw error;
    }
  };

  const updateProduct = async (productId: string, updates: Partial<Product>) => {
    try {
      const { data } = await API.put(`/products/${productId}`, updates);
      const updated = data?.product || data;
      setProducts(prev => prev.map(p => p.id === productId ? normalizeProduct(updated) : p));
      addToast('Product updated');
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Failed to update product.';
      addToast(msg, 'error');
      throw error;
    }
  };

  const deleteProduct = async (productId: string) => {
    try {
      await API.delete(`/products/${productId}`);
      setProducts(prev => prev.filter(p => p.id !== productId));
      addToast('Product deleted');
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Failed to delete product.';
      addToast(msg, 'error');
      throw error;
    }
  };

  const toggleWishlist = async (product: Product) => {
    try {
      const { data } = await API.post('/users/wishlist/toggle', { productId: product.id });
      const incoming = Array.isArray(data?.wishlist) ? data.wishlist : [];
      setWishlist(incoming.map(normalizeProduct));
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Failed to update wishlist.';
      addToast(msg, 'error');
      throw error;
    }
  };

  const checkout = async () => {
    if (!user) return;
    try {
      const orderData = {
        orderItems: cart.map(item => ({
            product: item.id,
            title: item.title,
          image: item.images?.[0] || '',
            price: item.price,
            quantity: item.quantity
        })),
        itemsPrice: cart.reduce((acc, item) => acc + item.price * item.quantity, 0),
        taxPrice: 500,
        totalPrice: cart.reduce((acc, item) => acc + item.price * item.quantity, 0) + 500,
      };

      await API.post('/orders', orderData);
      await clearCart();
      addToast('Order placed successfully!');
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Failed to place order.';
      addToast(msg, 'error');
    }
  };

  const addReview = async (productId: string, rating: number, comment: string) => {
    if (!user) return;
    try {
      const { data } = await API.post(`/products/${productId}/rating`, { rating, review: comment });
      const updated = data?.product || data;
      setProducts(prev => prev.map(p => p.id === productId ? normalizeProduct(updated) : p));
      addToast('Review submitted!');
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Failed to submit review.';
      addToast(msg, 'error');
      throw error;
    }
  };

  const sendMessage = async (receiverId: string, content: string, productId?: string) => {
    if (!user) return;
    try {
      await API.post('/messages', { receiverId, content, productId });
      await fetchConversations();
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Failed to send message.';
      addToast(msg, 'error');
      throw error;
    }
  };

  const markAsRead = async (conversationId: string) => {
    try {
      await API.put(`/messages/conversation/${conversationId}/read`);
      setConversations(prev => prev.map(c => {
        if (c.id === conversationId) {
          return {
            ...c,
            messages: c.messages.map(m => ({ ...m, read: true }))
          };
        }
        return c;
      }));
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Failed to mark messages as read.';
      addToast(msg, 'error');
      throw error;
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      const { data } = await API.put(`/orders/${orderId}/status`, { status });
      setOrders(prev => prev.map(o => o.id === orderId ? normalizeOrder(data) : o));
      addToast(`Order updated to ${status}`);
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Failed to update order.';
      addToast(msg, 'error');
      throw error;
    }
  };

  const requestReturn = async (orderId: string) => {
    try {
        const { data } = await API.post(`/orders/${orderId}/return`);
        setOrders(prev => prev.map(o => o.id === orderId ? normalizeOrder(data) : o));
        addToast('Return requested successfully. We will review it shortly.');
    } catch (error: any) {
        const msg = error.response?.data?.message || 'Failed to request return';
        addToast(msg, 'error');
    }
  };

  const updateUserStatus = (userId: string, status: 'active' | 'suspended') => {
    setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, status } : u));
    addToast(`User ${status === 'active' ? 'activated' : 'suspended'}`);
  };

  const impersonateUser = (userId: string) => {
    const targetUser = allUsers.find(u => u.id === userId);
    if (targetUser) {
        setUser(targetUser);
      sessionStorage.setItem('user', JSON.stringify(targetUser));
      localStorage.removeItem('user');
        addToast(`Now impersonating ${targetUser.name}`);
        // Refresh page/state will happen automatically due to routing or use a reload if needed
        window.location.href = '/'; 
    }
  };

  const updateProductStatus = async (productId: string, status: 'approved' | 'rejected') => {
    try {
      if (status === 'approved') {
        const { data } = await API.put(`/admin/products/${productId}/approve`);
        const updated = data?.product || data;
        setProducts(prev => prev.map(p => p.id === productId ? normalizeProduct(updated) : p));
      } else {
        await API.delete(`/admin/products/${productId}/reject`);
        setProducts(prev => prev.filter(p => p.id !== productId));
      }
      addToast(`Product ${status}`);
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Failed to update product status.';
      addToast(msg, 'error');
      throw error;
    }
  };

  const updateDisputeStatus = (id: string, status: 'resolved' | 'dismissed') => {
    setDisputes(prev => prev.map(d => d.id === id ? { ...d, status } : d));
    addToast(`Dispute marked as ${status}`);
  };

  return (
    <StoreContext.Provider value={{
      user, allUsers, products, cart, wishlist, orders, reviews, conversations, disputes, searchQuery, setSearchQuery,
      refreshConversations,
      login, register, logout, updateUser, addToCart, refreshCart, updateQuantity, removeFromCart, clearCart,
      addProduct, updateProduct, deleteProduct, toggleWishlist, checkout, addReview,
      sendMessage, markAsRead, updateUserStatus, impersonateUser, updateProductStatus,
      updateOrderStatus, updateDisputeStatus, requestReturn
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within StoreProvider");
  return context;
};
