import { createRequire } from 'module';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const require = createRequire(import.meta.url);
const cartRoutesPath = require.resolve('./cartRoutes.js');

const loadRouter = () => {
  delete require.cache[cartRoutesPath];
  return require('./cartRoutes.js');
};

const getRouteHandler = (router: any, method: 'get' | 'post', path: string) => {
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

describe('server cartRoutes', () => {
  let User: any;
  let Product: any;

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    delete require.cache[cartRoutesPath];
    User = require('../models/User.js');
    Product = require('../models/Product.js');
  });

  it('rejects add-to-cart requests without product id', async () => {
    const router = loadRouter();
    const addHandler = getRouteHandler(router, 'post', '/add');
    const req: any = { user: { userId: 'u-1' }, body: { quantity: 1 } };
    const res = createRes();

    await addHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Product ID is required' });
  });

  it('rejects add-to-cart requests with invalid quantity', async () => {
    const router = loadRouter();
    const addHandler = getRouteHandler(router, 'post', '/add');
    const req: any = { user: { userId: 'u-1' }, body: { productId: 'p-1', quantity: -1 } };
    const res = createRes();

    await addHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Quantity must be at least 1' });
  });

  it('returns 404 when product does not exist', async () => {
    const router = loadRouter();
    const addHandler = getRouteHandler(router, 'post', '/add');
    vi.spyOn(Product, 'findById').mockResolvedValue(null);

    const req: any = { user: { userId: 'u-1' }, body: { productId: 'missing-product', quantity: 1 } };
    const res = createRes();

    await addHandler(req, res);

    expect(Product.findById).toHaveBeenCalledWith('missing-product');
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Product not found' });
  });

  it('rejects out-of-stock products', async () => {
    const router = loadRouter();
    const addHandler = getRouteHandler(router, 'post', '/add');
    vi.spyOn(Product, 'findById').mockResolvedValue({ quantity: 0, inStock: true, title: 'Notebook' });

    const req: any = { user: { userId: 'u-1' }, body: { productId: 'p-1', quantity: 1 } };
    const res = createRes();

    await addHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'This item is out of stock' });
  });

  it('rejects adding a new cart item when requested quantity exceeds available stock', async () => {
    const router = loadRouter();
    const addHandler = getRouteHandler(router, 'post', '/add');

    vi.spyOn(Product, 'findById').mockResolvedValue({
      quantity: Number.NaN,
      inStock: true,
      title: 'Scientific Calculator',
    });
    vi.spyOn(User, 'findById').mockResolvedValue({
      cart: [],
      save: vi.fn(),
    });

    const req: any = { user: { userId: 'u-1' }, body: { productId: 'p-1', quantity: 2 } };
    const res = createRes();

    await addHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Only 1 unit available for this item' });
  });

  it('adds a new item to cart when stock allows', async () => {
    const router = loadRouter();
    const addHandler = getRouteHandler(router, 'post', '/add');

    const userDoc: any = {
      cart: [],
      save: vi.fn().mockResolvedValue(undefined),
    };
    vi.spyOn(Product, 'findById').mockResolvedValue({
      quantity: 3,
      inStock: true,
      title: 'Desk Lamp',
    });
    vi.spyOn(User, 'findById').mockResolvedValue(userDoc);

    const req: any = { user: { userId: 'u-1' }, body: { productId: 'p-3', quantity: 2 } };
    const res = createRes();

    await addHandler(req, res);

    expect(userDoc.cart).toHaveLength(1);
    expect(userDoc.cart[0]).toMatchObject({ productId: 'p-3', quantity: 2 });
    expect(userDoc.save).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({ message: 'Item added to cart', cart: userDoc.cart });
  });

  it('uses default quantity of 1 when quantity is omitted', async () => {
    const router = loadRouter();
    const addHandler = getRouteHandler(router, 'post', '/add');

    const userDoc: any = {
      cart: [],
      save: vi.fn().mockResolvedValue(undefined),
    };
    vi.spyOn(Product, 'findById').mockResolvedValue({
      quantity: 4,
      inStock: true,
      title: 'Notebook',
    });
    vi.spyOn(User, 'findById').mockResolvedValue(userDoc);

    const req: any = { user: { userId: 'u-1' }, body: { productId: 'p-default' } };
    const res = createRes();

    await addHandler(req, res);

    expect(userDoc.cart[0]).toMatchObject({ productId: 'p-default', quantity: 1 });
    expect(res.json).toHaveBeenCalledWith({ message: 'Item added to cart', cart: userDoc.cart });
  });

  it('uses fallback stock branch and rejects when inStock is false with non-finite quantity', async () => {
    const router = loadRouter();
    const addHandler = getRouteHandler(router, 'post', '/add');

    vi.spyOn(Product, 'findById').mockResolvedValue({
      quantity: Number.NaN,
      inStock: false,
      title: 'Unavailable Item',
    });

    const req: any = { user: { userId: 'u-1' }, body: { productId: 'p-fallback', quantity: 1 } };
    const res = createRes();

    await addHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'This item is out of stock' });
  });

  it('rejects increasing existing cart quantity beyond stock', async () => {
    const router = loadRouter();
    const addHandler = getRouteHandler(router, 'post', '/add');

    const existingItem = { productId: { toString: () => 'p-9' }, quantity: 2 };
    const userDoc: any = {
      cart: [existingItem],
      save: vi.fn().mockResolvedValue(undefined),
    };
    vi.spyOn(Product, 'findById').mockResolvedValue({
      quantity: 2,
      inStock: true,
      title: 'Wireless Earbuds',
    });
    vi.spyOn(User, 'findById').mockResolvedValue(userDoc);

    const req: any = { user: { userId: 'u-1' }, body: { productId: 'p-9', quantity: 1 } };
    const res = createRes();

    await addHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Only 2 units available for this item' });
    expect(userDoc.save).not.toHaveBeenCalled();
  });

  it('uses singular unit wording when existing-item stock limit is 1', async () => {
    const router = loadRouter();
    const addHandler = getRouteHandler(router, 'post', '/add');

    const existingItem = { productId: { toString: () => 'p-singular-existing' }, quantity: 1 };
    const userDoc: any = {
      cart: [existingItem],
      save: vi.fn().mockResolvedValue(undefined),
    };
    vi.spyOn(Product, 'findById').mockResolvedValue({
      quantity: 1,
      inStock: true,
      title: 'Single Unit Item',
    });
    vi.spyOn(User, 'findById').mockResolvedValue(userDoc);

    const req: any = {
      user: { userId: 'u-1' },
      body: { productId: 'p-singular-existing', quantity: 1 },
    };
    const res = createRes();

    await addHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Only 1 unit available for this item' });
  });

  it('uses plural unit wording when new-item stock limit is greater than 1', async () => {
    const router = loadRouter();
    const addHandler = getRouteHandler(router, 'post', '/add');

    const userDoc: any = {
      cart: [],
      save: vi.fn().mockResolvedValue(undefined),
    };
    vi.spyOn(Product, 'findById').mockResolvedValue({
      quantity: 2,
      inStock: true,
      title: 'Two Unit Item',
    });
    vi.spyOn(User, 'findById').mockResolvedValue(userDoc);

    const req: any = { user: { userId: 'u-1' }, body: { productId: 'p-plural-new', quantity: 3 } };
    const res = createRes();

    await addHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Only 2 units available for this item' });
  });

  it('updates existing cart quantity when stock allows', async () => {
    const router = loadRouter();
    const addHandler = getRouteHandler(router, 'post', '/add');

    const existingItem = { productId: { toString: () => 'p-10' }, quantity: 2 };
    const userDoc: any = {
      cart: [existingItem],
      save: vi.fn().mockResolvedValue(undefined),
    };
    vi.spyOn(Product, 'findById').mockResolvedValue({
      quantity: 5,
      inStock: true,
      title: 'Textbook',
    });
    vi.spyOn(User, 'findById').mockResolvedValue(userDoc);

    const req: any = { user: { userId: 'u-1' }, body: { productId: 'p-10', quantity: 1 } };
    const res = createRes();

    await addHandler(req, res);

    expect(existingItem.quantity).toBe(3);
    expect(userDoc.save).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({ message: 'Item added to cart', cart: userDoc.cart });
  });

  it('returns 500 when add-to-cart throws', async () => {
    const router = loadRouter();
    const addHandler = getRouteHandler(router, 'post', '/add');
    vi.spyOn(Product, 'findById').mockRejectedValue(new Error('db failure'));

    const req: any = { user: { userId: 'u-1' }, body: { productId: 'p-1', quantity: 1 } };
    const res = createRes();

    await addHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'db failure' });
  });

  it('removes item from cart and saves user', async () => {
    const router = loadRouter();
    const removeHandler = getRouteHandler(router, 'post', '/remove');

    const userDoc: any = {
      cart: [
        { productId: { toString: () => 'keep-me' }, quantity: 1 },
        { productId: { toString: () => 'remove-me' }, quantity: 2 },
      ],
      save: vi.fn().mockResolvedValue(undefined),
    };
    vi.spyOn(User, 'findById').mockResolvedValue(userDoc);

    const req: any = { user: { userId: 'u-1' }, body: { productId: 'remove-me' } };
    const res = createRes();

    await removeHandler(req, res);

    expect(userDoc.cart).toHaveLength(1);
    expect(userDoc.cart[0].productId.toString()).toBe('keep-me');
    expect(userDoc.save).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({ message: 'Item removed from cart', cart: userDoc.cart });
  });

  it('returns 500 when remove-from-cart throws', async () => {
    const router = loadRouter();
    const removeHandler = getRouteHandler(router, 'post', '/remove');
    vi.spyOn(User, 'findById').mockRejectedValue(new Error('remove error'));

    const req: any = { user: { userId: 'u-1' }, body: { productId: 'x' } };
    const res = createRes();

    await removeHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'remove error' });
  });

  it('returns populated cart for current user', async () => {
    const router = loadRouter();
    const getHandler = getRouteHandler(router, 'get', '/');

    const userDoc = {
      cart: [{ productId: { title: 'Notebook' }, quantity: 2 }],
    };
    const populate = vi.fn().mockResolvedValue(userDoc);
    vi.spyOn(User, 'findById').mockReturnValue({ populate } as any);

    const req: any = { user: { userId: 'u-1' } };
    const res = createRes();

    await getHandler(req, res);

    expect(populate).toHaveBeenCalledWith('cart.productId');
    expect(res.json).toHaveBeenCalledWith(userDoc.cart);
  });

  it('returns 500 when get-cart throws', async () => {
    const router = loadRouter();
    const getHandler = getRouteHandler(router, 'get', '/');
    vi.spyOn(User, 'findById').mockImplementation(() => {
      throw new Error('get cart failed');
    });

    const req: any = { user: { userId: 'u-1' } };
    const res = createRes();

    await getHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'get cart failed' });
  });
});
