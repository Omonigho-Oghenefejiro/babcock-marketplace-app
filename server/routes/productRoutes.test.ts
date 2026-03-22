import { createRequire } from 'module';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const require = createRequire(import.meta.url);
const productRoutesPath = require.resolve('./productRoutes.js');

const loadRouter = () => {
  delete require.cache[productRoutesPath];
  return require('./productRoutes.js');
};

const getRouteHandler = (
  router: any,
  method: 'get' | 'post' | 'put' | 'patch' | 'delete',
  path: string
) => {
  const layer = router.stack.find(
    (entry: any) => entry.route && entry.route.path === path && entry.route.methods[method]
  );
  if (!layer) {
    throw new Error(`Route not found: ${method.toUpperCase()} ${path}`);
  }
  return layer.route.stack[layer.route.stack.length - 1].handle;
};

const createRes = () => {
  const res: any = {};
  res.status = vi.fn(() => res);
  res.json = vi.fn(() => res);
  return res;
};

const createProductListChain = (result: any, rejectErr?: Error) => {
  const chain: any = {
    populate: vi.fn(() => chain),
    skip: vi.fn(() => chain),
    limit: vi.fn(() => chain),
    sort: rejectErr ? vi.fn().mockRejectedValue(rejectErr) : vi.fn().mockResolvedValue(result),
  };
  return chain;
};

const createMineChain = (result: any, rejectErr?: Error) => {
  const chain: any = {
    populate: vi.fn(() => chain),
    sort: rejectErr ? vi.fn().mockRejectedValue(rejectErr) : vi.fn().mockResolvedValue(result),
  };
  return chain;
};

describe('server productRoutes', () => {
  let Product: any;
  let Order: any;

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    delete require.cache[productRoutesPath];
    Product = require('../models/Product.js');
    Order = require('../models/Order.js');
  });

  it('lists products with category/search/in-stock filters and pagination', async () => {
    const router = loadRouter();
    const handler = getRouteHandler(router, 'get', '/');

    const rows = [{ _id: 'p-1' }];
    const chain = createProductListChain(rows);
    const findSpy = vi.spyOn(Product, 'find').mockReturnValue(chain);
    const countSpy = vi.spyOn(Product, 'countDocuments').mockResolvedValue(15);

    const req: any = {
      query: {
        category: 'Books',
        search: 'lamp',
        availability: 'in-stock',
        page: 2,
        limit: 5,
      },
    };
    const res = createRes();

    await handler(req, res);

    const queryArg = findSpy.mock.calls[0][0];
    expect(queryArg).toEqual({
      isApproved: { $ne: false },
      isActive: { $ne: false },
      category: 'Books',
      $or: [
        { title: { $regex: 'lamp', $options: 'i' } },
        { description: { $regex: 'lamp', $options: 'i' } },
      ],
      quantity: { $gt: 0 },
      inStock: true,
    });

    expect(chain.skip).toHaveBeenCalledWith(5);
    expect(chain.limit).toHaveBeenCalledWith(5);
    expect(chain.sort).toHaveBeenCalledWith({ createdAt: -1 });
    expect(countSpy).toHaveBeenCalledWith(queryArg);
    expect(res.json).toHaveBeenCalledWith({
      products: rows,
      total: 15,
      pages: 3,
      currentPage: 2,
    });
  });

  it('applies out-of-stock filter branch', async () => {
    const router = loadRouter();
    const handler = getRouteHandler(router, 'get', '/');

    const chain = createProductListChain([]);
    const findSpy = vi.spyOn(Product, 'find').mockReturnValue(chain);
    vi.spyOn(Product, 'countDocuments').mockResolvedValue(0);

    const req: any = {
      query: {
        search: 'desk',
        availability: 'out-of-stock',
      },
    };
    const res = createRes();

    await handler(req, res);

    const queryArg = findSpy.mock.calls[0][0];
    expect(queryArg.$or).toEqual([{ inStock: false }, { quantity: { $lte: 0 } }]);
    expect(queryArg).not.toHaveProperty('inStock', true);
    expect(res.json).toHaveBeenCalledWith({
      products: [],
      total: 0,
      pages: 0,
      currentPage: 1,
    });
  });

  it('returns 500 when listing products fails', async () => {
    const router = loadRouter();
    const handler = getRouteHandler(router, 'get', '/');

    vi.spyOn(Product, 'find').mockReturnValue(createProductListChain([], new Error('list failed')));

    const req: any = { query: {} };
    const res = createRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'list failed' });
  });

  it('returns listings for current user from GET /mine', async () => {
    const router = loadRouter();
    const handler = getRouteHandler(router, 'get', '/mine');

    const mine = [{ _id: 'p-1' }, { _id: 'p-2' }];
    const chain = createMineChain(mine);
    const findSpy = vi.spyOn(Product, 'find').mockReturnValue(chain);

    const req: any = { user: { userId: 'u-1' } };
    const res = createRes();

    await handler(req, res);

    expect(findSpy).toHaveBeenCalledWith({ seller: 'u-1' });
    expect(chain.populate).toHaveBeenCalledWith('seller', 'fullName email phone');
    expect(chain.sort).toHaveBeenCalledWith({ createdAt: -1 });
    expect(res.json).toHaveBeenCalledWith(mine);
  });

  it('returns 500 when GET /mine fails', async () => {
    const router = loadRouter();
    const handler = getRouteHandler(router, 'get', '/mine');

    vi.spyOn(Product, 'find').mockReturnValue(createMineChain([], new Error('mine failed')));

    const req: any = { user: { userId: 'u-1' } };
    const res = createRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'mine failed' });
  });

  it('returns a product by id', async () => {
    const router = loadRouter();
    const handler = getRouteHandler(router, 'get', '/:id');

    const doc = { _id: 'p-9' };
    const chain: any = { populate: vi.fn() };
    chain.populate.mockReturnValueOnce(chain).mockResolvedValueOnce(doc);

    vi.spyOn(Product, 'findById').mockReturnValue(chain);

    const req: any = { params: { id: 'p-9' } };
    const res = createRes();

    await handler(req, res);

    expect(chain.populate).toHaveBeenNthCalledWith(1, 'seller', 'fullName email phone');
    expect(chain.populate).toHaveBeenNthCalledWith(2, 'ratings.userId', 'fullName profileImage');
    expect(res.json).toHaveBeenCalledWith(doc);
  });

  it('returns 404 when product id is missing', async () => {
    const router = loadRouter();
    const handler = getRouteHandler(router, 'get', '/:id');

    const chain: any = { populate: vi.fn() };
    chain.populate.mockReturnValueOnce(chain).mockResolvedValueOnce(null);
    vi.spyOn(Product, 'findById').mockReturnValue(chain);

    const req: any = { params: { id: 'missing' } };
    const res = createRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Product not found' });
  });

  it('returns 500 when GET /:id fails', async () => {
    const router = loadRouter();
    const handler = getRouteHandler(router, 'get', '/:id');

    vi.spyOn(Product, 'findById').mockImplementation(() => {
      throw new Error('single failed');
    });

    const req: any = { params: { id: 'p-1' } };
    const res = createRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'single failed' });
  });

  it('creates product with floored quantity', async () => {
    const router = loadRouter();
    const handler = getRouteHandler(router, 'post', '/');

    const sellerId = '507f191e810c19729de860aa';
    const saveSpy = vi.spyOn(Product.prototype, 'save').mockResolvedValue(undefined as any);

    const req: any = {
      user: { userId: sellerId },
      body: {
        title: 'Desk Lamp',
        description: 'Bright lamp',
        price: 5000,
        category: 'Electronics',
        images: ['a.jpg'],
        condition: 'Good',
        quantity: 3.8,
      },
    };
    const res = createRes();

    await handler(req, res);

    expect(saveSpy).toHaveBeenCalledTimes(1);
    const doc = saveSpy.mock.instances[0] as any;
    expect(doc.quantity).toBe(3);
    expect(doc.inStock).toBe(true);
    expect(doc.isActive).toBe(true);
    expect(String(doc.seller)).toBe(sellerId);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Product submitted successfully', product: expect.any(Object) })
    );
  });

  it('defaults quantity to 1 when invalid', async () => {
    const router = loadRouter();
    const handler = getRouteHandler(router, 'post', '/');

    const saveSpy = vi.spyOn(Product.prototype, 'save').mockResolvedValue(undefined as any);

    const req: any = {
      user: { userId: '507f191e810c19729de860ab' },
      body: {
        title: 'Notebook',
        description: 'A notebook',
        price: 900,
        category: 'Books',
        quantity: 'not-a-number',
      },
    };
    const res = createRes();

    await handler(req, res);

    const doc = saveSpy.mock.instances[0] as any;
    expect(doc.quantity).toBe(1);
    expect(doc.inStock).toBe(true);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('returns 500 when creating product fails', async () => {
    const router = loadRouter();
    const handler = getRouteHandler(router, 'post', '/');

    vi.spyOn(Product.prototype, 'save').mockRejectedValue(new Error('create failed'));

    const req: any = {
      user: { userId: 'u-1' },
      body: { title: 'x', description: 'y', price: 1, category: 'Books' },
    };
    const res = createRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'create failed' });
  });

  it('returns 404 when updating a missing product', async () => {
    const router = loadRouter();
    const handler = getRouteHandler(router, 'put', '/:id');

    vi.spyOn(Product, 'findById').mockResolvedValue(null);

    const req: any = { params: { id: 'missing' }, user: { userId: 'u-1' }, body: {} };
    const res = createRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Product not found' });
  });

  it('returns 403 when updating a product not owned by user', async () => {
    const router = loadRouter();
    const handler = getRouteHandler(router, 'put', '/:id');

    vi.spyOn(Product, 'findById').mockResolvedValue({
      seller: { toString: () => 'seller-2' },
      save: vi.fn(),
    } as any);

    const req: any = { params: { id: 'p-1' }, user: { userId: 'seller-1' }, body: { title: 'Updated' } };
    const res = createRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Not authorized' });
  });

  it('updates product for the owner', async () => {
    const router = loadRouter();
    const handler = getRouteHandler(router, 'put', '/:id');

    const product: any = {
      seller: { toString: () => 'seller-1' },
      title: 'Old',
      save: vi.fn().mockResolvedValue(undefined),
    };
    vi.spyOn(Product, 'findById').mockResolvedValue(product);

    const req: any = {
      params: { id: 'p-1' },
      user: { userId: 'seller-1' },
      body: { title: 'Updated title', quantity: 6 },
    };
    const res = createRes();

    await handler(req, res);

    expect(product.title).toBe('Updated title');
    expect(product.quantity).toBe(6);
    expect(product.save).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({ message: 'Product updated', product });
  });

  it('returns 500 when update throws', async () => {
    const router = loadRouter();
    const handler = getRouteHandler(router, 'put', '/:id');

    vi.spyOn(Product, 'findById').mockRejectedValue(new Error('update failed'));

    const req: any = { params: { id: 'p-1' }, user: { userId: 'seller-1' }, body: {} };
    const res = createRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'update failed' });
  });

  it('returns 404 when toggling active state for missing product', async () => {
    const router = loadRouter();
    const handler = getRouteHandler(router, 'patch', '/:id/active');

    vi.spyOn(Product, 'findById').mockResolvedValue(null);

    const req: any = { params: { id: 'missing' }, user: { userId: 'u-1', role: 'user' }, body: { isActive: true } };
    const res = createRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Product not found' });
  });

  it('returns 403 when non-owner non-admin toggles active state', async () => {
    const router = loadRouter();
    const handler = getRouteHandler(router, 'patch', '/:id/active');

    vi.spyOn(Product, 'findById').mockResolvedValue({
      seller: { toString: () => 'seller-2' },
      save: vi.fn(),
    } as any);

    const req: any = {
      params: { id: 'p-1' },
      user: { userId: 'seller-1', role: 'user' },
      body: { isActive: false },
    };
    const res = createRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Not authorized' });
  });

  it('toggles active state for owner and admin branches', async () => {
    const router = loadRouter();
    const handler = getRouteHandler(router, 'patch', '/:id/active');

    const ownerProduct: any = {
      seller: { toString: () => 'seller-1' },
      isActive: false,
      save: vi.fn().mockResolvedValue(undefined),
    };
    const adminProduct: any = {
      seller: { toString: () => 'seller-2' },
      isActive: true,
      save: vi.fn().mockResolvedValue(undefined),
    };

    const findSpy = vi
      .spyOn(Product, 'findById')
      .mockResolvedValueOnce(ownerProduct)
      .mockResolvedValueOnce(adminProduct);

    const ownerReq: any = {
      params: { id: 'p-owner' },
      user: { userId: 'seller-1', role: 'user' },
      body: { isActive: true },
    };
    const ownerRes = createRes();
    await handler(ownerReq, ownerRes);

    expect(findSpy).toHaveBeenNthCalledWith(1, 'p-owner');
    expect(ownerProduct.isActive).toBe(true);
    expect(ownerProduct.save).toHaveBeenCalledTimes(1);
    expect(ownerRes.json).toHaveBeenCalledWith({ message: 'Product enabled', product: ownerProduct });

    const adminReq: any = {
      params: { id: 'p-admin' },
      user: { userId: 'admin-1', role: 'admin' },
      body: { isActive: false },
    };
    const adminRes = createRes();
    await handler(adminReq, adminRes);

    expect(findSpy).toHaveBeenNthCalledWith(2, 'p-admin');
    expect(adminProduct.isActive).toBe(false);
    expect(adminProduct.save).toHaveBeenCalledTimes(1);
    expect(adminRes.json).toHaveBeenCalledWith({ message: 'Product disabled', product: adminProduct });
  });

  it('returns 500 when active toggle throws', async () => {
    const router = loadRouter();
    const handler = getRouteHandler(router, 'patch', '/:id/active');

    vi.spyOn(Product, 'findById').mockRejectedValue(new Error('toggle failed'));

    const req: any = {
      params: { id: 'p-1' },
      user: { userId: 'seller-1', role: 'user' },
      body: { isActive: true },
    };
    const res = createRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'toggle failed' });
  });

  it('returns 404 when deleting a missing product', async () => {
    const router = loadRouter();
    const handler = getRouteHandler(router, 'delete', '/:id');

    vi.spyOn(Product, 'findById').mockResolvedValue(null);

    const req: any = { params: { id: 'missing' }, user: { userId: 'u-1', role: 'user' } };
    const res = createRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Product not found' });
  });

  it('returns 403 when deleting product without ownership/admin role', async () => {
    const router = loadRouter();
    const handler = getRouteHandler(router, 'delete', '/:id');

    vi.spyOn(Product, 'findById').mockResolvedValue({ seller: { toString: () => 'seller-2' } } as any);

    const req: any = { params: { id: 'p-1' }, user: { userId: 'seller-1', role: 'user' } };
    const res = createRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Not authorized' });
  });

  it('deletes product for admin and returns success', async () => {
    const router = loadRouter();
    const handler = getRouteHandler(router, 'delete', '/:id');

    vi.spyOn(Product, 'findById').mockResolvedValue({ seller: { toString: () => 'seller-2' } } as any);
    const deleteSpy = vi.spyOn(Product, 'findByIdAndDelete').mockResolvedValue({} as any);

    const req: any = { params: { id: 'p-1' }, user: { userId: 'admin-1', role: 'admin' } };
    const res = createRes();

    await handler(req, res);

    expect(deleteSpy).toHaveBeenCalledWith('p-1');
    expect(res.json).toHaveBeenCalledWith({ message: 'Product deleted' });
  });

  it('returns 500 when delete throws', async () => {
    const router = loadRouter();
    const handler = getRouteHandler(router, 'delete', '/:id');

    vi.spyOn(Product, 'findById').mockRejectedValue(new Error('delete failed'));

    const req: any = { params: { id: 'p-1' }, user: { userId: 'seller-1', role: 'user' } };
    const res = createRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'delete failed' });
  });

  it('validates rating range before processing', async () => {
    const router = loadRouter();
    const handler = getRouteHandler(router, 'post', '/:id/rating');

    const req: any = {
      params: { id: 'p-1' },
      user: { userId: 'buyer-1' },
      body: { rating: 6, review: 'x' },
    };
    const res = createRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Rating must be between 1 and 5' });
  });

  it('returns 404 when rating target product is missing', async () => {
    const router = loadRouter();
    const handler = getRouteHandler(router, 'post', '/:id/rating');

    vi.spyOn(Product, 'findById').mockResolvedValue(null);

    const req: any = {
      params: { id: 'p-missing' },
      user: { userId: 'buyer-1' },
      body: { rating: 4 },
    };
    const res = createRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Product not found' });
  });

  it('blocks seller from reviewing own listing', async () => {
    const router = loadRouter();
    const handler = getRouteHandler(router, 'post', '/:id/rating');

    vi.spyOn(Product, 'findById').mockResolvedValue({ seller: 'seller-1', ratings: [] } as any);

    const req: any = {
      params: { id: 'p-1' },
      user: { userId: 'seller-1' },
      body: { rating: 4 },
    };
    const res = createRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'You cannot review your own listing' });
  });

  it('requires completed purchase before allowing rating', async () => {
    const router = loadRouter();
    const handler = getRouteHandler(router, 'post', '/:id/rating');

    const product = { _id: 'p-1', seller: 'seller-1', ratings: [] };
    vi.spyOn(Product, 'findById').mockResolvedValue(product as any);
    const findOrderSpy = vi.spyOn(Order, 'findOne').mockResolvedValue(null);

    const req: any = {
      params: { id: 'p-1' },
      user: { userId: 'buyer-1' },
      body: { rating: 4, review: 'Good' },
    };
    const res = createRes();

    await handler(req, res);

    expect(findOrderSpy).toHaveBeenCalledWith({
      buyer: 'buyer-1',
      paymentStatus: 'completed',
      status: { $ne: 'cancelled' },
      'items.product': 'p-1',
    });
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Only buyers who purchased this item can rate it' });
  });

  it('updates existing rating and normalizes reviewImages', async () => {
    const router = loadRouter();
    const handler = getRouteHandler(router, 'post', '/:id/rating');

    const existing = {
      userId: 'buyer-1',
      rating: 2,
      review: 'old',
      reviewImages: ['old.png'],
      createdAt: new Date('2020-01-01T00:00:00.000Z'),
    };

    const product: any = {
      _id: 'p-1',
      seller: 'seller-1',
      ratings: [existing],
      save: vi.fn().mockResolvedValue(undefined),
    };

    vi.spyOn(Product, 'findById').mockResolvedValue(product);
    vi.spyOn(Order, 'findOne').mockResolvedValue({ _id: 'o-1' } as any);

    const req: any = {
      params: { id: 'p-1' },
      user: { userId: 'buyer-1' },
      body: { rating: '5', review: 'Updated review', reviewImages: 'not-array' },
    };
    const res = createRes();

    await handler(req, res);

    expect(existing.rating).toBe(5);
    expect(existing.review).toBe('Updated review');
    expect(existing.reviewImages).toEqual([]);
    expect(existing.createdAt).toBeInstanceOf(Date);
    expect(product.save).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({ message: 'Rating added', product });
  });

  it('adds a new rating entry when user has no existing review', async () => {
    const router = loadRouter();
    const handler = getRouteHandler(router, 'post', '/:id/rating');

    const product: any = {
      _id: 'p-2',
      seller: 'seller-1',
      ratings: [],
      save: vi.fn().mockResolvedValue(undefined),
    };

    vi.spyOn(Product, 'findById').mockResolvedValue(product);
    vi.spyOn(Order, 'findOne').mockResolvedValue({ _id: 'o-2' } as any);

    const req: any = {
      params: { id: 'p-2' },
      user: { userId: 'buyer-2' },
      body: { rating: 4, review: 'Solid product', reviewImages: ['one.jpg'] },
    };
    const res = createRes();

    await handler(req, res);

    expect(product.ratings).toHaveLength(1);
    expect(product.ratings[0]).toMatchObject({
      userId: 'buyer-2',
      rating: 4,
      review: 'Solid product',
      reviewImages: ['one.jpg'],
    });
    expect(product.save).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({ message: 'Rating added', product });
  });

  it('normalizes reviewImages to an empty array for new ratings', async () => {
    const router = loadRouter();
    const handler = getRouteHandler(router, 'post', '/:id/rating');

    const product: any = {
      _id: 'p-3',
      seller: 'seller-1',
      ratings: [],
      save: vi.fn().mockResolvedValue(undefined),
    };

    vi.spyOn(Product, 'findById').mockResolvedValue(product);
    vi.spyOn(Order, 'findOne').mockResolvedValue({ _id: 'o-3' } as any);

    const req: any = {
      params: { id: 'p-3' },
      user: { userId: 'buyer-3' },
      body: { rating: 3, review: 'Okay', reviewImages: 'invalid-shape' },
    };
    const res = createRes();

    await handler(req, res);

    expect(product.ratings).toHaveLength(1);
    expect(product.ratings[0].reviewImages).toEqual([]);
    expect(product.save).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({ message: 'Rating added', product });
  });

  it('returns 500 when rating flow throws', async () => {
    const router = loadRouter();
    const handler = getRouteHandler(router, 'post', '/:id/rating');

    vi.spyOn(Product, 'findById').mockRejectedValue(new Error('rating failed'));

    const req: any = {
      params: { id: 'p-1' },
      user: { userId: 'buyer-1' },
      body: { rating: 5 },
    };
    const res = createRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'rating failed' });
  });
});
