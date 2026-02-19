import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { User, Product, CartItem, UserRole, UserRoles, Order, Review, Conversation, Message, Dispute } from '../types';
import API from '../services/api';
import { useToast } from './ToastContext';
import { MOCK_DISPUTES, PRODUCTS, MOCK_USER, EXTRA_USERS, MOCK_ADMIN, MOCK_CONVERSATIONS } from '../services/mockData';

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
  login: (email: string, password?: string, role?: UserRole) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  addToCart: (product: Product, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  addProduct: (product: Product) => void;
  updateProduct: (productId: string, updates: Partial<Product>) => void;
  deleteProduct: (productId: string) => void;
  toggleWishlist: (product: Product) => void;
  checkout: () => void;
  addReview: (productId: string, rating: number, comment: string) => void;
  sendMessage: (receiverId: string, content: string, productId?: string) => void;
  markAsRead: (conversationId: string) => void;
  updateUserStatus: (userId: string, status: 'active' | 'suspended') => void;
  impersonateUser: (userId: string) => void;
  updateProductStatus: (productId: string, status: 'approved' | 'rejected') => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  requestReturn: (orderId: string) => Promise<void>;
  updateDisputeStatus: (id: string, status: 'resolved' | 'dismissed') => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { addToast } = useToast();
  
  // -- Auth State --
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    // Only restore user if we also have a token (or it's a mock user)
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      // If no token and not a mock user ID, clear state
      if (!savedToken && !parsed.id?.startsWith('u-') && !['1001', '1002', '101', '102'].includes(parsed.id)) {
        localStorage.removeItem('user');
        return null;
      }
      return parsed;
    }
    return null;
  });

  // -- Data State --
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  // Initialize with ALL mock users so Admin dashboard is populated
  const [allUsers, setAllUsers] = useState<User[]>([...EXTRA_USERS, MOCK_USER, MOCK_ADMIN]); 
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    // Load saved conversations from localStorage for demo mode
    const saved = localStorage.getItem('conversations');
    return saved ? JSON.parse(saved) : [];
  });
  
  // -- Client-side persist State --
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [wishlist, setWishlist] = useState<Product[]>(() => {
    const saved = localStorage.getItem('wishlist');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [reviews, setReviews] = useState<Review[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>(MOCK_DISPUTES);

  const [searchQuery, setSearchQuery] = useState('');

  // -- Effects --
  useEffect(() => { localStorage.setItem('cart', JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem('wishlist', JSON.stringify(wishlist)); }, [wishlist]);
  // Persist conversations to localStorage for demo mode (when no token)
  useEffect(() => { 
    const token = localStorage.getItem('token');
    if (!token && conversations.length > 0 && user) {
      // Merge with existing conversations from other users
      const saved = localStorage.getItem('conversations');
      const existingConversations: Conversation[] = saved ? JSON.parse(saved) : [];
      // Remove current user's old conversations and add new ones
      const otherUsersConversations = existingConversations.filter(c => 
        !c.participants?.includes(user.id)
      );
      const allConversations = [...otherUsersConversations, ...conversations];
      localStorage.setItem('conversations', JSON.stringify(allConversations)); 
    }
  }, [conversations, user]);

  const fetchProducts = useCallback(async () => {
    try {
      const { data } = await API.get('/products');
      // Backend returns { products, total, pages, currentPage }
      setProducts(data.products || data || PRODUCTS);
    } catch (error) {
      console.warn("Backend unreachable, loading mock products.");
      // Fallback to Mock Data if empty or error
      setProducts(PRODUCTS);
      if (user) addToast("Offline Mode: Using local data", "info");
    }
  }, [addToast, user]);

  const fetchOrders = useCallback(async () => {
    if (!user) return;
    const token = localStorage.getItem('token');
    if (!token) {
      // No token means we're in demo mode - just use empty orders
      setOrders([]);
      return;
    }
    try {
      const { data } = await API.get('/orders/myorders');
      setOrders(data);
    } catch (error) {
      console.warn("Backend unreachable, clearing orders.");
      setOrders([]); 
    }
  }, [user]);

  const fetchConversations = useCallback(async () => {
    if (!user) return;
    const token = localStorage.getItem('token');
    if (!token) {
      // No token means we're in demo mode - load from localStorage if available
      const saved = localStorage.getItem('conversations');
      if (saved) {
        const savedConversations: Conversation[] = JSON.parse(saved);
        // Filter conversations for current user
        const userConversations = savedConversations.filter(c => 
          c.participants?.includes(user.id)
        );
        if (userConversations.length > 0) {
          setConversations(userConversations);
        }
      }
      return;
    }
    try {
      const { data } = await API.get('/messages');
      setConversations(data);
    } catch (error) {
      console.warn("Backend unreachable, loading from localStorage.");
      // In case of error, try localStorage first
      const saved = localStorage.getItem('conversations');
      if (saved) {
        const savedConversations: Conversation[] = JSON.parse(saved);
        const userConversations = savedConversations.filter(c => 
          c.participants?.includes(user.id)
        );
        setConversations(userConversations);
      } else {
        setConversations(MOCK_CONVERSATIONS);
      }
    }
  }, [user]);

  // Initial Load
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Auth Dependent Loads
  useEffect(() => {
    if (user) {
      fetchOrders();
      fetchConversations();
      // Poll for messages every 10 seconds
      const interval = setInterval(fetchConversations, 10000);
      return () => clearInterval(interval);
    } else {
      setOrders([]);
      setConversations([]);
    }
  }, [user, fetchOrders, fetchConversations]);

  // -- Actions --

  const login = async (email: string, password: string = 'password123', role?: UserRole) => {
    try {
      const { data } = await API.post('/auth/login', { email, password });
      // Backend returns { token, user }
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      const userData = data.user || data;
      // Map backend user format to frontend format
      const mappedUser = {
        id: userData.id || userData._id,
        name: userData.fullName || userData.name,
        email: userData.email,
        role: userData.role || 'student',
        avatar: userData.profileImage || userData.avatar || 'https://placehold.co/100x100/e2e8f0/1e293b?text=User'
      };
      setUser(mappedUser);
      localStorage.setItem('user', JSON.stringify(mappedUser));
      addToast(`Welcome back, ${mappedUser.name}!`);
    } catch (error: any) {
       // Attempt Register as fallback for demo
       try {
         const { data } = await API.post('/auth/register', { 
            fullName: email.split('@')[0], 
            email, 
            password: password || 'password123',
            phone: '08000000000'
         });
         // Backend returns { token, user }
         if (data.token) {
           localStorage.setItem('token', data.token);
         }
         const userData = data.user || data;
         const mappedUser = {
           id: userData.id || userData._id,
           name: userData.fullName || userData.name,
           email: userData.email,
           role: userData.role || 'student',
           avatar: userData.profileImage || userData.avatar || 'https://placehold.co/100x100/e2e8f0/1e293b?text=User'
         };
         setUser(mappedUser);
         localStorage.setItem('user', JSON.stringify(mappedUser));
         addToast(`Account created! Welcome, ${mappedUser.name}!`);
       } catch (regError) {
         console.warn("Backend unreachable, using mock login.");
         // Mock Login Fallback
         const mockUser = MOCK_USER.email === email ? MOCK_USER : 
                          MOCK_ADMIN.email === email ? MOCK_ADMIN :
                          allUsers.find(u => u.email === email) || 
                          { ...MOCK_USER, id: `u-${Date.now()}`, email, name: email.split('@')[0], role: role || 'user' as UserRole };
         
         setUser(mockUser);
         localStorage.setItem('user', JSON.stringify(mockUser));
         addToast(`Demo Mode: Welcome, ${mockUser.name}!`, 'info');
       }
    }
  };

  const logout = () => {
    setUser(null);
    setCart([]);
    setWishlist([]);
    setConversations([]);
    setOrders([]);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    // Don't clear conversations from localStorage - they persist per user ID
    addToast('Logged out successfully', 'info');
  };

  const updateUser = (updates: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...updates } : null);
    setAllUsers(prev => prev.map(u => u.id === user?.id ? { ...u, ...updates } : u));
    addToast('Profile updated successfully');
  };

  const addToCart = (product: Product, quantity: number = 1) => {
    if (user?.role === 'admin') {
      addToast('Admins cannot shop.', 'error');
      return;
    }
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item);
      }
      addToast(`${product.title} added to cart`);
      return [...prev, { ...product, quantity }];
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setCart(prev => prev.map(item => item.id === productId ? { ...item, quantity: Math.max(1, quantity) } : item));
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const clearCart = () => setCart([]);

  const addProduct = async (product: Product) => {
    try {
      let imageUrl = product.images?.[0] || '';
      if (imageUrl && imageUrl.startsWith('data:')) {
          const res = await fetch(imageUrl);
          const blob = await res.blob();
          const formData = new FormData();
          formData.append('image', blob, 'product.jpg');
          
          const uploadRes = await API.post('/upload', formData, {
              headers: { 'Content-Type': 'multipart/form-data' }
          });
          imageUrl = uploadRes.data.url;
      }

      const { data } = await API.post('/products', { ...product, image: imageUrl });
      setProducts(prev => [data, ...prev]);
      addToast('Product listed successfully!');
    } catch (error) {
      console.warn("Backend unavailable, adding locally");
      setProducts(prev => [product, ...prev]);
      addToast('Product listed (Demo Mode)');
    }
  };

  const updateProduct = (productId: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, ...updates } : p));
    addToast('Product updated');
  };

  const deleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    addToast('Product deleted');
  };

  const toggleWishlist = (product: Product) => {
    setWishlist(prev => {
      const exists = prev.find(p => p.id === product.id);
      return exists ? prev.filter(p => p.id !== product.id) : [...prev, product];
    });
  };

  const checkout = async () => {
    if (!user) return;
    try {
      const orderData = {
        orderItems: cart.map(item => ({
            product: item.id,
            title: item.title,
            image: item.image,
            price: item.price,
            quantity: item.quantity
        })),
        itemsPrice: cart.reduce((acc, item) => acc + item.price * item.quantity, 0),
        taxPrice: 500,
        totalPrice: cart.reduce((acc, item) => acc + item.price * item.quantity, 0) + 500,
      };

      await API.post('/orders', orderData);
      setCart([]);
      addToast('Order placed successfully!');
    } catch (error) {
      setCart([]);
      addToast('Order placed (Demo Mode)!', 'success');
    }
  };

  const addReview = (productId: string, rating: number, comment: string) => {
    if (!user) return;
    const newReview: Review = {
        id: `r-${Date.now()}`,
        productId,
        userId: user.id,
        userName: user.name,
        rating,
        comment,
        date: new Date().toLocaleDateString()
    };
    
    setReviews(prev => [newReview, ...prev]);
    
    // Update product rating
    setProducts(prev => prev.map(p => {
        if (p.id === productId) {
             // Calculate new average
             const productReviews = [newReview, ...reviews.filter(r => r.productId === productId)];
             const total = productReviews.reduce((sum, r) => sum + r.rating, 0);
             const avg = Math.round((total / productReviews.length) * 10) / 10;
             return { ...p, rating: avg };
        }
        return p;
    }));
    
    addToast('Review submitted!');
  };

  const sendMessage = async (receiverId: string, content: string, productId?: string) => {
    if (!user) return;
    
    try {
        await API.post('/messages', { receiverId, content, productId });
        fetchConversations();
    } catch (error) {
        // Fallback for demo: Update local state
        setConversations(prev => {
            const existing = prev.find(c => 
              c.participants.includes(user.id) && 
              c.participants.includes(receiverId) && 
              (!productId || c.productId === productId)
            );
            const newMessage = {
                id: `m-${Date.now()}`,
                senderId: user.id,
                content,
                timestamp: new Date().toISOString(),
                read: false
            };

            if (existing) {
                return prev.map(c => c.id === existing.id ? {
                    ...c,
                    messages: [...c.messages, newMessage],
                    updatedAt: new Date().toISOString()
                } : c);
            }
            return [...prev, {
                id: `c-${Date.now()}`,
                participants: [user.id, receiverId],
                messages: [newMessage],
                productId,
                updatedAt: new Date().toISOString()
            }];
        });
        // addToast('Message sent (Demo Mode)', 'success');
    }
  };

  const markAsRead = async (conversationId: string) => {
    try {
        await API.put(`/messages/${conversationId}/read`);
        setConversations(prev => prev.map(c => {
            if (c.id === conversationId) {
                return {
                    ...c,
                    messages: c.messages.map(m => ({ ...m, read: true }))
                };
            }
            return c;
        }));
    } catch (error) {
        setConversations(prev => prev.map(c => {
            if (c.id === conversationId) {
                return {
                    ...c,
                    messages: c.messages.map(m => ({ ...m, read: true }))
                };
            }
            return c;
        }));
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
        const { data } = await API.put(`/orders/${orderId}/status`, { status });
        setOrders(prev => prev.map(o => o.id === orderId ? data : o));
        addToast(`Order updated to ${status}`);
    } catch (error) {
        // Fallback for demo
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status, deliveredAt: status === 'completed' ? new Date().toISOString() : o.deliveredAt } : o));
        addToast(`Order updated (Demo Mode)`);
    }
  };

  const requestReturn = async (orderId: string) => {
    try {
        const { data } = await API.post(`/orders/${orderId}/return`);
        setOrders(prev => prev.map(o => o.id === orderId ? data : o));
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
        localStorage.setItem('user', JSON.stringify(targetUser));
        addToast(`Now impersonating ${targetUser.name}`);
        // Refresh page/state will happen automatically due to routing or use a reload if needed
        window.location.href = '/'; 
    }
  };

  const updateProductStatus = (productId: string, status: 'approved' | 'rejected') => {
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, status } : p));
    addToast(`Product ${status}`);
  };

  const updateDisputeStatus = (id: string, status: 'resolved' | 'dismissed') => {
    setDisputes(prev => prev.map(d => d.id === id ? { ...d, status } : d));
    addToast(`Dispute marked as ${status}`);
  };

  return (
    <StoreContext.Provider value={{
      user, allUsers, products, cart, wishlist, orders, reviews, conversations, disputes, searchQuery, setSearchQuery,
      login, logout, updateUser, addToCart, updateQuantity, removeFromCart, clearCart,
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
