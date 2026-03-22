import { act, cleanup, render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { StoreProvider, useStore } from './StoreContext';
import type { Product, User } from '../types';

const storeMocks = vi.hoisted(() => ({
  addToast: vi.fn(),
  apiGet: vi.fn(),
  apiPost: vi.fn(),
  apiPut: vi.fn(),
  apiDelete: vi.fn(),
}));

vi.mock('./ToastContext', () => ({
  useToast: () => ({ addToast: storeMocks.addToast }),
}));

vi.mock('../services/api', () => ({
  default: {
    get: storeMocks.apiGet,
    post: storeMocks.apiPost,
    put: storeMocks.apiPut,
    delete: storeMocks.apiDelete,
  },
}));

type RawRecord = Record<string, any>;

interface MockState {
  users: RawRecord[];
  products: RawRecord[];
  adminProducts: RawRecord[];
  cart: RawRecord[];
  orders: RawRecord[];
  wishlist: RawRecord[];
  conversations: RawRecord[];
}

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value));

const createMockState = (): MockState => {
  const adminUser = {
    _id: 'u1',
    username: 'admin',
    fullName: 'Admin User',
    email: 'admin@babcock.edu.ng',
    phone: '09010000000',
    campusRole: 'staff',
    role: 'admin',
    isVerified: true,
    profileImage: '/uploads/admin.png',
  };

  const buyerUser = {
    _id: 'u2',
    username: 'buyer',
    fullName: 'Buyer User',
    email: 'buyer@babcock.edu.ng',
    phone: '09020000000',
    campusRole: 'student',
    role: 'user',
    isVerified: true,
    profileImage: '/uploads/buyer.png',
  };

  const productOne = {
    _id: 'p1',
    title: 'Laptop',
    description: 'Fast and reliable',
    price: 1200,
    category: 'Electronics',
    images: [{ url: '/uploads/laptop.png' }],
    seller: buyerUser,
    condition: 'Good',
    quantity: 3,
    inStock: true,
    ratings: [
      {
        userId: buyerUser,
        rating: 4,
        review: 'Solid item',
        createdAt: '2025-01-01T00:00:00.000Z',
      },
    ],
  };

  const productTwo = {
    _id: 'p2',
    title: 'Desk Chair',
    description: 'Comfortable chair',
    price: 180,
    category: 'Furniture',
    image: 'uploads/chair.png',
    seller: buyerUser,
    condition: 'Fair',
    quantity: 0,
    inStock: false,
    reviews: [
      {
        userId: adminUser,
        rating: 5,
        comment: 'Great value',
      },
    ],
  };

  return {
    users: [adminUser, buyerUser],
    products: [productOne, productTwo],
    adminProducts: [clone(productOne), clone(productTwo)],
    cart: [
      {
        productId: {
          _id: 'p1',
          title: 'Laptop',
          price: 1200,
          category: 'Electronics',
          images: ['/uploads/laptop.png'],
          quantity: 3,
          inStock: true,
        },
        quantity: 1,
      },
    ],
    orders: [
      {
        _id: 'o1',
        buyer: 'u2',
        orderItems: [
          {
            productId: {
              _id: 'p1',
              title: 'Laptop',
              category: 'Electronics',
              images: ['/uploads/laptop.png'],
              quantity: 3,
            },
            quantity: 1,
            price: 1200,
          },
        ],
        totalPrice: 1200,
        status: 'pending',
        createdAt: '2025-02-01T00:00:00.000Z',
      },
    ],
    wishlist: [clone(productTwo)],
    conversations: [
      {
        id: 'c1',
        participants: ['u1', 'u2'],
        updatedAt: '2025-02-10T00:00:00.000Z',
        messages: [
          {
            id: 'm1',
            senderId: 'u2',
            content: 'Hello there',
            timestamp: '2025-02-10T00:00:00.000Z',
            read: false,
          },
        ],
      },
    ],
  };
};

let state: MockState;
let latestStore: ReturnType<typeof useStore> | null = null;

const getRawProductId = (product: RawRecord): string => String(product?._id || product?.id || '');

const findProductById = (productId: string): RawRecord | undefined => (
  state.products.find((entry) => getRawProductId(entry) === productId)
    || state.adminProducts.find((entry) => getRawProductId(entry) === productId)
);

const installApiMocks = () => {
  storeMocks.apiGet.mockImplementation(async (url: string) => {
    if (url === '/products') {
      return { data: { products: clone(state.products) } };
    }

    if (url === '/admin/products') {
      return { data: clone(state.adminProducts) };
    }

    if (url === '/orders/myorders') {
      return { data: clone(state.orders) };
    }

    if (url === '/messages') {
      return { data: clone(state.conversations) };
    }

    if (url === '/cart') {
      return { data: clone(state.cart) };
    }

    if (url === '/users/wishlist') {
      return { data: clone(state.wishlist) };
    }

    if (url === '/admin/users') {
      return { data: clone(state.users) };
    }

    throw new Error(`Unhandled GET ${url}`);
  });

  storeMocks.apiPost.mockImplementation(async (url: string, payload?: RawRecord) => {
    if (url === '/auth/login') {
      return {
        data: {
          token: 'token-login',
          refreshToken: 'refresh-login',
          user: clone(state.users[1]),
        },
      };
    }

    if (url === '/auth/register') {
      return {
        data: {
          token: 'token-register',
          refreshToken: 'refresh-register',
          user: clone(state.users[1]),
        },
      };
    }

    if (url === '/auth/logout') {
      return { data: { success: true } };
    }

    if (url === '/cart/add') {
      const productId = String(payload?.productId || '');
      const quantity = Number(payload?.quantity || 1);
      const product = findProductById(productId);

      if (product) {
        const existing = state.cart.find((entry) => getRawProductId(entry.productId || {}) === productId);
        if (existing) {
          existing.quantity += quantity;
        } else {
          state.cart.push({ productId: clone(product), quantity });
        }
      }

      return { data: { success: true } };
    }

    if (url === '/cart/remove') {
      const productId = String(payload?.productId || '');
      state.cart = state.cart.filter((entry) => getRawProductId(entry.productId || {}) !== productId);
      return { data: { success: true } };
    }

    if (url === '/products') {
      const created = {
        ...(payload || {}),
        _id: payload?.id || `p${state.products.length + 10}`,
        seller: payload?.seller || state.users[1],
        ratings: payload?.ratings || [],
        reviews: payload?.reviews || [],
        images: payload?.images || [],
      };

      state.products.unshift(clone(created));
      state.adminProducts.unshift(clone(created));

      return { data: { product: clone(created) } };
    }

    if (url === '/users/wishlist/toggle') {
      const productId = String(payload?.productId || '');
      const exists = state.wishlist.some((entry) => getRawProductId(entry) === productId);

      if (exists) {
        state.wishlist = state.wishlist.filter((entry) => getRawProductId(entry) !== productId);
      } else {
        const product = findProductById(productId);
        if (product) {
          state.wishlist.push(clone(product));
        }
      }

      return { data: { wishlist: clone(state.wishlist) } };
    }

    if (url === '/orders') {
      const created = {
        _id: `o${state.orders.length + 1}`,
        buyer: 'u2',
        orderItems: payload?.orderItems || [],
        totalPrice: payload?.totalPrice || 0,
        status: 'pending',
        createdAt: '2025-03-01T00:00:00.000Z',
      };
      state.orders.unshift(created);
      return { data: clone(created) };
    }

    const ratingMatch = url.match(/^\/products\/([^/]+)\/rating$/);
    if (ratingMatch) {
      const productId = ratingMatch[1];
      const product = findProductById(productId);

      if (product) {
        const nextRatings = Array.isArray(product.ratings) ? product.ratings : [];
        nextRatings.push({
          userId: state.users[1],
          rating: Number(payload?.rating || 0),
          review: String(payload?.review || ''),
          createdAt: '2025-03-02T00:00:00.000Z',
        });
        product.ratings = nextRatings;
      }

      return { data: { product: clone(product) } };
    }

    if (url === '/messages') {
      const receiverId = String(payload?.receiverId || '');
      const conversation = state.conversations.find((entry) => entry.participants.includes(receiverId));

      if (conversation) {
        conversation.messages.push({
          id: `m${conversation.messages.length + 1}`,
          senderId: 'u2',
          content: String(payload?.content || ''),
          timestamp: '2025-03-03T00:00:00.000Z',
          read: false,
        });
        conversation.updatedAt = '2025-03-03T00:00:00.000Z';
      }

      return { data: { success: true } };
    }

    const returnMatch = url.match(/^\/orders\/([^/]+)\/return$/);
    if (returnMatch) {
      const orderId = returnMatch[1];
      const order = state.orders.find((entry) => String(entry._id || entry.id) === orderId);
      if (order) {
        order.status = 'return_requested';
      }
      return { data: clone(order) };
    }

    throw new Error(`Unhandled POST ${url}`);
  });

  storeMocks.apiPut.mockImplementation(async (url: string, payload?: RawRecord) => {
    if (url === '/users/profile') {
      const user = state.users.find((entry) => entry._id === 'u2') || state.users[0];
      if (payload?.fullName) user.fullName = payload.fullName;
      if (payload?.phone) user.phone = payload.phone;
      if (payload?.profileImage) user.profileImage = payload.profileImage;
      if (payload?.campusRole) user.campusRole = payload.campusRole;
      return { data: { user: clone(user) } };
    }

    const productMatch = url.match(/^\/products\/([^/]+)$/);
    if (productMatch) {
      const productId = productMatch[1];
      state.products = state.products.map((entry) => (
        getRawProductId(entry) === productId
          ? { ...entry, ...(payload || {}) }
          : entry
      ));
      state.adminProducts = state.adminProducts.map((entry) => (
        getRawProductId(entry) === productId
          ? { ...entry, ...(payload || {}) }
          : entry
      ));
      const updated = findProductById(productId);
      return { data: { product: clone(updated) } };
    }

    const markReadMatch = url.match(/^\/messages\/conversation\/([^/]+)\/read$/);
    if (markReadMatch) {
      const conversationId = markReadMatch[1];
      state.conversations = state.conversations.map((entry) => (
        entry.id === conversationId
          ? {
            ...entry,
            messages: entry.messages.map((message: RawRecord) => ({ ...message, read: true })),
          }
          : entry
      ));
      return { data: { success: true } };
    }

    const orderStatusMatch = url.match(/^\/orders\/([^/]+)\/status$/);
    if (orderStatusMatch) {
      const orderId = orderStatusMatch[1];
      state.orders = state.orders.map((entry) => (
        String(entry._id || entry.id) === orderId
          ? { ...entry, status: payload?.status || entry.status }
          : entry
      ));
      const updated = state.orders.find((entry) => String(entry._id || entry.id) === orderId);
      return { data: clone(updated) };
    }

    const approveMatch = url.match(/^\/admin\/products\/([^/]+)\/approve$/);
    if (approveMatch) {
      const productId = approveMatch[1];
      state.products = state.products.map((entry) => (
        getRawProductId(entry) === productId
          ? { ...entry, isApproved: true }
          : entry
      ));
      state.adminProducts = state.adminProducts.map((entry) => (
        getRawProductId(entry) === productId
          ? { ...entry, isApproved: true }
          : entry
      ));
      const updated = findProductById(productId);
      return { data: { product: clone(updated) } };
    }

    throw new Error(`Unhandled PUT ${url}`);
  });

  storeMocks.apiDelete.mockImplementation(async (url: string) => {
    const productMatch = url.match(/^\/products\/([^/]+)$/);
    if (productMatch) {
      const productId = productMatch[1];
      state.products = state.products.filter((entry) => getRawProductId(entry) !== productId);
      state.adminProducts = state.adminProducts.filter((entry) => getRawProductId(entry) !== productId);
      return { data: { success: true } };
    }

    const rejectMatch = url.match(/^\/admin\/products\/([^/]+)\/reject$/);
    if (rejectMatch) {
      const productId = rejectMatch[1];
      state.products = state.products.filter((entry) => getRawProductId(entry) !== productId);
      state.adminProducts = state.adminProducts.filter((entry) => getRawProductId(entry) !== productId);
      return { data: { success: true } };
    }

    throw new Error(`Unhandled DELETE ${url}`);
  });
};

const toSessionUser = (rawUser: RawRecord): User => ({
  id: String(rawUser._id),
  username: rawUser.username,
  name: String(rawUser.fullName || rawUser.name),
  fullName: rawUser.fullName,
  email: String(rawUser.email),
  phone: rawUser.phone,
  campusRole: rawUser.campusRole,
  role: rawUser.role,
  isVerified: Boolean(rawUser.isVerified),
  avatar: rawUser.profileImage,
  profileImage: rawUser.profileImage,
  ratings: rawUser.ratings,
});

const setPersistedUser = (rawUser: RawRecord) => {
  sessionStorage.setItem('user', JSON.stringify(toSessionUser(rawUser)));
  sessionStorage.setItem('token', `token-${rawUser._id}`);
};

const StoreProbe = () => {
  latestStore = useStore();
  return <div data-testid="store-probe">{latestStore.user?.name || 'guest'}</div>;
};

const renderStore = () => render(
  <StoreProvider>
    <StoreProbe />
  </StoreProvider>
);

const getStore = (): ReturnType<typeof useStore> => {
  expect(latestStore).toBeTruthy();
  return latestStore as ReturnType<typeof useStore>;
};

describe('StoreContext', () => {
  beforeEach(() => {
    state = createMockState();
    latestStore = null;
    storeMocks.addToast.mockReset();
    storeMocks.apiGet.mockReset();
    storeMocks.apiPost.mockReset();
    storeMocks.apiPut.mockReset();
    storeMocks.apiDelete.mockReset();
    sessionStorage.clear();
    localStorage.clear();
    installApiMocks();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('throws when useStore is called outside provider', () => {
    const BrokenConsumer = () => {
      useStore();
      return null;
    };

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    try {
      expect(() => render(<BrokenConsumer />)).toThrowError('useStore must be used within StoreProvider');
    } finally {
      consoleErrorSpy.mockRestore();
    }
  });

  it('loads products and supports login, profile update, search and logout', async () => {
    renderStore();

    await waitFor(() => {
      expect(getStore().products.length).toBe(2);
    });

    expect(storeMocks.apiGet).toHaveBeenCalledWith('/products');
    expect(getStore().products[0].images[0]).toContain('http://localhost:5000/');

    await act(async () => {
      await getStore().login('buyer@babcock.edu.ng', 'secret-pass');
    });

    await waitFor(() => {
      expect(getStore().user?.email).toBe('buyer@babcock.edu.ng');
      expect(getStore().orders.length).toBeGreaterThan(0);
      expect(getStore().cart.length).toBeGreaterThan(0);
      expect(getStore().wishlist.length).toBeGreaterThan(0);
      expect(getStore().conversations.length).toBeGreaterThan(0);
    });

    await act(async () => {
      await getStore().updateUser({
        name: 'Updated Buyer',
        phone: '08012345678',
        campusRole: 'student',
      });
    });

    expect(getStore().user?.name).toBe('Updated Buyer');

    act(() => {
      getStore().setSearchQuery('desk lamp');
    });

    expect(getStore().searchQuery).toBe('desk lamp');
    expect(sessionStorage.getItem('token')).toBe('token-login');

    act(() => {
      getStore().logout();
    });

    expect(getStore().user).toBeNull();
    expect(sessionStorage.getItem('token')).toBeNull();
    expect(sessionStorage.getItem('user')).toBeNull();
  });

  it('handles registration branches and auth/profile errors', async () => {
    renderStore();

    await waitFor(() => {
      expect(getStore().products.length).toBeGreaterThan(0);
    });

    await act(async () => {
      await getStore().register('New User', 'new@babcock.edu.ng', 'password123', '08030000000');
    });

    expect(sessionStorage.getItem('token')).toBe('token-register');

    storeMocks.apiPost.mockResolvedValueOnce({ data: { message: 'Verify email before login.' } });

    await act(async () => {
      await getStore().register('No Token User', 'notoken@babcock.edu.ng', 'password123', '08039999999');
    });

    expect(storeMocks.addToast).toHaveBeenCalledWith('Verify email before login.', 'info');

    const loginError = { response: { data: { message: 'Bad credentials' } } };
    storeMocks.apiPost.mockRejectedValueOnce(loginError);

    await expect(getStore().login('bad@babcock.edu.ng', 'wrong')).rejects.toEqual(loginError);
    expect(storeMocks.addToast).toHaveBeenCalledWith('Bad credentials', 'error');

    const updateError = { response: { data: { message: 'Profile update failed' } } };
    storeMocks.apiPut.mockRejectedValueOnce(updateError);

    await expect(getStore().updateUser({ name: 'Will Fail' })).rejects.toEqual(updateError);
    expect(storeMocks.addToast).toHaveBeenCalledWith('Profile update failed', 'error');
  });

  it('shows toast and clears products when initial fetch fails', async () => {
    storeMocks.apiGet.mockRejectedValueOnce({ response: { data: { message: 'Products unavailable' } } });

    renderStore();

    await waitFor(() => {
      expect(storeMocks.addToast).toHaveBeenCalledWith('Products unavailable', 'error');
    });

    expect(getStore().products).toEqual([]);
  });

  it('handles shopper cart, wishlist and checkout behavior', async () => {
    setPersistedUser(state.users[1]);
    renderStore();

    await waitFor(() => {
      expect(getStore().cart.length).toBeGreaterThan(0);
    });

    const product = getStore().products[0];
    expect(product).toBeTruthy();

    await act(async () => {
      await getStore().addToCart(product, 2);
      await getStore().updateQuantity(product.id, 0);
      await getStore().addToCart(product, 1);
      await getStore().updateQuantity(product.id, 3);
      await getStore().updateQuantity(product.id, 1);
      await getStore().removeFromCart(product.id);
      await getStore().addToCart(product, 1);
      await getStore().clearCart();
    });

    expect(getStore().cart).toEqual([]);

    await act(async () => {
      await getStore().toggleWishlist(product);
    });

    expect(Array.isArray(getStore().wishlist)).toBe(true);

    await act(async () => {
      await getStore().addToCart(product, 1);
      await getStore().checkout();
    });

    expect(storeMocks.addToast).toHaveBeenCalledWith('Order placed successfully!');

    storeMocks.apiPost.mockRejectedValueOnce({ response: { data: { message: 'Checkout unavailable' } } });

    await act(async () => {
      await getStore().checkout();
    });

    expect(storeMocks.addToast).toHaveBeenCalledWith('Checkout unavailable', 'error');

    await act(async () => {
      await getStore().refreshCart();
    });
  });

  it('handles admin moderation, messaging and order workflows', async () => {
    setPersistedUser(state.users[0]);
    sessionStorage.setItem('refreshToken', 'refresh-admin');

    renderStore();

    await waitFor(() => {
      expect(getStore().allUsers.length).toBeGreaterThan(1);
      expect(getStore().orders.length).toBeGreaterThan(0);
    });

    expect(storeMocks.apiGet).toHaveBeenCalledWith('/admin/products');
    expect(storeMocks.apiGet).toHaveBeenCalledWith('/admin/users');

    const listing: Product = {
      id: 'local-lamp',
      title: 'Desk Lamp',
      description: 'Warm LED desk lamp',
      price: 99,
      category: 'Furniture',
      images: ['/uploads/lamp.png'],
      seller: getStore().user as User,
      condition: 'Good',
      inStock: true,
      quantity: 2,
      ratings: 0,
      reviews: [],
      isApproved: true,
    };

    await act(async () => {
      await getStore().addProduct(listing);
    });

    expect(getStore().products.some((entry) => entry.title === 'Desk Lamp')).toBe(true);

    storeMocks.apiPost.mockResolvedValueOnce({
      data: {
        product: {
          _id: 'p-pending',
          title: 'Pending Listing',
          description: 'Needs review',
          price: 45,
          category: 'Others',
          images: ['/uploads/pending.png'],
          seller: state.users[0],
          condition: 'Good',
          quantity: 1,
          inStock: true,
          isApproved: false,
          ratings: [],
        },
      },
    });

    await act(async () => {
      await getStore().addProduct(listing);
    });

    expect(storeMocks.addToast).toHaveBeenCalledWith('Listing submitted. It will appear after admin approval.', 'info');

    const editableId = getStore().products[0].id;

    await act(async () => {
      await getStore().updateProduct(editableId, { title: 'Renamed Product' });
      await getStore().addReview(editableId, 5, 'Excellent quality');
      await getStore().sendMessage('u2', 'Please confirm availability', editableId);
      await getStore().refreshConversations();
    });

    const conversationId = getStore().conversations[0]?.id;
    expect(conversationId).toBeTruthy();

    await act(async () => {
      await getStore().markAsRead(conversationId as string);
    });

    const readFlags = getStore().conversations[0]?.messages.map((entry) => entry.read) || [];
    expect(readFlags.every(Boolean)).toBe(true);

    const orderId = getStore().orders[0].id;

    await act(async () => {
      await getStore().updateOrderStatus(orderId, 'shipped');
      await getStore().requestReturn(orderId);
    });

    expect(getStore().orders[0].status).toBe('return_requested');

    storeMocks.apiPost.mockRejectedValueOnce({ response: { data: { message: 'Return blocked' } } });

    await act(async () => {
      await getStore().requestReturn(orderId);
    });

    expect(storeMocks.addToast).toHaveBeenCalledWith('Return blocked', 'error');

    const approveId = getStore().products[0]?.id;
    const rejectId = getStore().products[1]?.id || approveId;

    await act(async () => {
      await getStore().updateProductStatus(approveId as string, 'approved');
      await getStore().updateProductStatus(rejectId as string, 'rejected');
    });

    const moderationError = { response: { data: { message: 'Moderation failed' } } };
    storeMocks.apiPut.mockRejectedValueOnce(moderationError);

    await expect(getStore().updateProductStatus('missing-product', 'approved')).rejects.toEqual(moderationError);
    expect(storeMocks.addToast).toHaveBeenCalledWith('Moderation failed', 'error');

    if (getStore().products[0]) {
      await act(async () => {
        await getStore().deleteProduct(getStore().products[0].id);
      });
    }

    const managedUserId = getStore().allUsers.find((entry) => entry.id === 'u2')?.id || 'u2';

    act(() => {
      getStore().updateUserStatus(managedUserId, 'suspended');
      getStore().updateDisputeStatus('d-1', 'resolved');
      getStore().impersonateUser('missing-user');
    });

    const managedUser = getStore().allUsers.find((entry) => entry.id === managedUserId) as (User & { status?: string }) | undefined;
    expect(managedUser?.status).toBe('suspended');

    await act(async () => {
      await getStore().refreshCart();
    });

    act(() => {
      getStore().logout();
    });

    const postCallCount = storeMocks.apiPost.mock.calls.length;

    await act(async () => {
      await getStore().checkout();
      await getStore().addReview('p1', 3, 'No user action');
      await getStore().sendMessage('u1', 'No user action');
    });

    expect(storeMocks.apiPost.mock.calls.length).toBe(postCallCount);
  });

  it('blocks admins from adding products to cart', async () => {
    setPersistedUser(state.users[0]);
    renderStore();

    await waitFor(() => {
      expect(getStore().products.length).toBeGreaterThan(0);
    });

    const beforeCalls = storeMocks.apiPost.mock.calls.length;

    await act(async () => {
      await getStore().addToCart(getStore().products[0], 1);
    });

    expect(storeMocks.addToast).toHaveBeenCalledWith('Admins cannot shop.', 'error');
    expect(storeMocks.apiPost.mock.calls.length).toBe(beforeCalls);
  });
});