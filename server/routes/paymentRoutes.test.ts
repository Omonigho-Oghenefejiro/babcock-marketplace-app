import { createRequire } from 'module';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const require = createRequire(import.meta.url);
const paymentRoutesPath = require.resolve('./paymentRoutes.js');

const loadRouter = () => {
  delete require.cache[paymentRoutesPath];
  return require('./paymentRoutes.js');
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

describe('server paymentRoutes', () => {
  let axios: any;
  let Order: any;
  let Product: any;

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    delete require.cache[paymentRoutesPath];

    axios = require('axios');
    Order = require('../models/Order.js');
    Product = require('../models/Product.js');
    process.env.PAYSTACK_SECRET_KEY = 'paystack-secret';
  });

  it('rejects payment initialization without items', async () => {
    const router = loadRouter();
    const initialize = getRouteHandler(router, 'post', '/initialize');
    const req: any = { user: { userId: 'u-1' }, body: { items: [] } };
    const res = createRes();

    await initialize(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'At least one item is required for payment initialization' });
  });

  it('rejects payment initialization with invalid item payloads', async () => {
    const router = loadRouter();
    const initialize = getRouteHandler(router, 'post', '/initialize');
    const req: any = {
      user: { userId: 'u-1' },
      body: { items: [{ productId: 'p-1', quantity: -1 }] },
    };
    const res = createRes();

    await initialize(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Each item must include a valid product and quantity' });
  });

  it('returns 404 when one or more products are missing during initialization', async () => {
    const router = loadRouter();
    const initialize = getRouteHandler(router, 'post', '/initialize');
    vi.spyOn(Product, 'find').mockResolvedValue([{ _id: 'p-1', quantity: 2, inStock: true, title: 'Book' }] as any);

    const req: any = {
      user: { userId: 'u-1' },
      body: {
        items: [
          { productId: 'p-1', quantity: 1 },
          { productId: 'p-2', quantity: 1 },
        ],
      },
    };
    const res = createRes();

    await initialize(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'One or more products were not found' });
  });

  it('rejects initialization when requested quantity exceeds stock', async () => {
    const router = loadRouter();
    const initialize = getRouteHandler(router, 'post', '/initialize');
    vi.spyOn(Product, 'find').mockResolvedValue([
      { _id: 'p-3', quantity: 1, inStock: true, title: 'Lamp', price: 1000 },
    ] as any);

    const req: any = {
      user: { userId: 'u-1' },
      body: {
        items: [{ productId: 'p-3', quantity: 2 }],
      },
    };
    const res = createRes();

    await initialize(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Lamp has only 1 unit left' });
  });

  it('uses plural unit wording when initialization quantity exceeds stock above 1', async () => {
    const router = loadRouter();
    const initialize = getRouteHandler(router, 'post', '/initialize');
    vi.spyOn(Product, 'find').mockResolvedValue([
      { _id: 'p-3b', quantity: 2, inStock: true, title: 'Fan', price: 1000 },
    ] as any);

    const req: any = {
      user: { userId: 'u-1' },
      body: {
        items: [{ productId: 'p-3b', quantity: 3 }],
      },
    };
    const res = createRes();

    await initialize(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Fan has only 2 units left' });
  });

  it('rejects initialization when product is out of stock via fallback branch', async () => {
    const router = loadRouter();
    const initialize = getRouteHandler(router, 'post', '/initialize');
    vi.spyOn(Product, 'find').mockResolvedValue([
      { _id: 'p-4', quantity: Number.NaN, inStock: false, title: 'Kettle', price: 4000 },
    ] as any);

    const req: any = {
      user: { userId: 'u-1' },
      body: {
        items: [{ productId: 'p-4', quantity: 1 }],
      },
    };
    const res = createRes();

    await initialize(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Kettle is out of stock' });
  });

  it('rejects initialization when email is missing after item validation', async () => {
    const router = loadRouter();
    const initialize = getRouteHandler(router, 'post', '/initialize');
    vi.spyOn(Product, 'find').mockResolvedValue([
      { _id: 'p-5', quantity: 3, inStock: true, title: 'Bedding', price: 5000 },
    ] as any);

    const req: any = {
      user: { userId: 'u-1' },
      body: {
        items: [{ product: 'p-5', quantity: 1 }],
      },
    };
    const res = createRes();

    await initialize(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Valid email and amount are required' });
  });

  it('uses quantity default and promo fallback when optional fields are omitted', async () => {
    const router = loadRouter();
    const initialize = getRouteHandler(router, 'post', '/initialize');

    vi.spyOn(Product, 'find').mockResolvedValue([
      { _id: 'p-defaults', quantity: Number.NaN, inStock: true, title: 'Notebook', price: 2000 },
    ] as any);
    vi.spyOn(axios, 'post').mockResolvedValue({
      data: { data: { authorization_url: 'https://paystack.test/defaults' } },
    });
    const saveSpy = vi.spyOn(Order.prototype, 'save').mockResolvedValue(undefined as any);

    const req: any = {
      user: { userId: 'u-1' },
      body: {
        items: [{ productId: 'p-defaults' }],
        email: 'buyer@babcock.edu.ng',
      },
    };
    const res = createRes();

    await initialize(req, res);

    expect(saveSpy).toHaveBeenCalledTimes(2);
    const createdOrder: any = saveSpy.mock.instances[0];
    expect(createdOrder.items[0].quantity).toBe(1);
    expect(createdOrder.promoCode).toBeUndefined();
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ paymentUrl: 'https://paystack.test/defaults' })
    );
  });

  it('uses product price fallback and rejects non-positive totals', async () => {
    const router = loadRouter();
    const initialize = getRouteHandler(router, 'post', '/initialize');

    vi.spyOn(Product, 'find').mockResolvedValue([
      { _id: 'p-no-price', quantity: 3, inStock: true, title: 'Unknown Price Item' },
    ] as any);

    const req: any = {
      user: { userId: 'u-1' },
      body: {
        items: [{ productId: 'p-no-price', quantity: 1 }],
        email: 'buyer@babcock.edu.ng',
      },
    };
    const res = createRes();

    await initialize(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Valid email and amount are required' });
  });

  it('initializes payment and returns authorization url', async () => {
    const router = loadRouter();
    const initialize = getRouteHandler(router, 'post', '/initialize');

    vi.spyOn(Product, 'find').mockResolvedValue([
      { _id: 'p-6', quantity: 5, inStock: true, title: 'Calculator', price: 10000 },
    ] as any);
    vi.spyOn(axios, 'post').mockResolvedValue({
      data: {
        data: {
          authorization_url: 'https://paystack.test/authorize',
        },
      },
    });
    const saveSpy = vi.spyOn(Order.prototype, 'save').mockResolvedValue(undefined as any);

    const req: any = {
      user: { userId: 'u-1' },
      body: {
        items: [{ id: 'p-6', quantity: 1 }],
        email: 'buyer@babcock.edu.ng',
        promoCode: 'campus5',
      },
    };
    const res = createRes();

    await initialize(req, res);

    expect(saveSpy).toHaveBeenCalledTimes(2);
    expect(axios.post).toHaveBeenCalledWith(
      'https://api.paystack.co/transaction/initialize',
      expect.objectContaining({ email: 'buyer@babcock.edu.ng', amount: 950000 }),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer paystack-secret' }),
      })
    );
    const payload = res.json.mock.calls[0][0];
    expect(payload.message).toBe('Payment initialized');
    expect(payload.paymentUrl).toBe('https://paystack.test/authorize');
    expect(payload.reference).toContain('-');
  });

  it('returns 500 when initialization throws', async () => {
    const router = loadRouter();
    const initialize = getRouteHandler(router, 'post', '/initialize');
    vi.spyOn(Product, 'find').mockRejectedValue(new Error('init failed'));

    const req: any = {
      user: { userId: 'u-1' },
      body: { items: [{ productId: 'p-1', quantity: 1 }], email: 'buyer@babcock.edu.ng' },
    };
    const res = createRes();

    await initialize(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'init failed' });
  });

  it('returns 404 when verify succeeds but no order matches payment reference', async () => {
    const router = loadRouter();
    const verify = getRouteHandler(router, 'get', '/verify/:reference');

    vi.spyOn(axios, 'get').mockResolvedValue({ data: { data: { status: 'success' } } });
    const populate = vi.fn().mockResolvedValue(null);
    vi.spyOn(Order, 'findOne').mockReturnValue({ populate } as any);

    const req: any = { params: { reference: 'ref-404' } };
    const res = createRes();

    await verify(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Order not found for payment reference' });
  });

  it('returns already verified response when order payment is already completed', async () => {
    const router = loadRouter();
    const verify = getRouteHandler(router, 'get', '/verify/:reference');

    vi.spyOn(axios, 'get').mockResolvedValue({ data: { data: { status: 'success' } } });
    const orderDoc = { paymentStatus: 'completed', items: [{ quantity: 1 }] };
    const populate = vi.fn().mockResolvedValue(orderDoc);
    vi.spyOn(Order, 'findOne').mockReturnValue({ populate } as any);

    const req: any = { params: { reference: 'ref-done' } };
    const res = createRes();

    await verify(req, res);

    expect(res.json).toHaveBeenCalledWith({
      message: 'Payment already verified',
      paymentStatus: 'completed',
      order: orderDoc,
    });
  });

  it('returns 400 when verify succeeds but order has no items', async () => {
    const router = loadRouter();
    const verify = getRouteHandler(router, 'get', '/verify/:reference');

    vi.spyOn(axios, 'get').mockResolvedValue({ data: { data: { status: 'success' } } });
    const orderDoc = { paymentStatus: 'pending', items: [] };
    const populate = vi.fn().mockResolvedValue(orderDoc);
    vi.spyOn(Order, 'findOne').mockReturnValue({ populate } as any);

    const req: any = { params: { reference: 'ref-empty' } };
    const res = createRes();

    await verify(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Order has no items to fulfill' });
  });

  it('returns 404 when a product in verified order cannot be found', async () => {
    const router = loadRouter();
    const verify = getRouteHandler(router, 'get', '/verify/:reference');

    vi.spyOn(axios, 'get').mockResolvedValue({ data: { data: { status: 'success' } } });
    const orderDoc: any = {
      paymentStatus: 'pending',
      status: 'pending',
      items: [{ product: 'missing-product', quantity: 1 }],
    };
    orderDoc.save = vi.fn().mockResolvedValue(undefined);
    orderDoc.populate = vi.fn().mockResolvedValue(orderDoc);
    const populate = vi.fn().mockResolvedValue(orderDoc);
    vi.spyOn(Order, 'findOne').mockReturnValue({ populate } as any);
    vi.spyOn(Product, 'findById').mockResolvedValue(null);

    const req: any = { params: { reference: 'ref-missing-product' } };
    const res = createRes();

    await verify(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'A purchased product could not be found' });
  });

  it('returns 400 when verified order quantity exceeds available product stock', async () => {
    const router = loadRouter();
    const verify = getRouteHandler(router, 'get', '/verify/:reference');

    vi.spyOn(axios, 'get').mockResolvedValue({ data: { data: { status: 'success' } } });
    const orderDoc: any = {
      paymentStatus: 'pending',
      status: 'pending',
      items: [{ product: 'p-low-stock', quantity: 2 }],
    };
    orderDoc.save = vi.fn().mockResolvedValue(undefined);
    orderDoc.populate = vi.fn().mockResolvedValue(orderDoc);
    const populate = vi.fn().mockResolvedValue(orderDoc);
    vi.spyOn(Order, 'findOne').mockReturnValue({ populate } as any);
    vi.spyOn(Product, 'findById').mockResolvedValue({ title: 'Headphones', quantity: 1, inStock: true, save: vi.fn() } as any);

    const req: any = { params: { reference: 'ref-low-stock' } };
    const res = createRes();

    await verify(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Headphones is no longer available in requested quantity' });
  });

  it('confirms payment, decrements stock, and promotes pending order status', async () => {
    const router = loadRouter();
    const verify = getRouteHandler(router, 'get', '/verify/:reference');

    vi.spyOn(axios, 'get').mockResolvedValue({ data: { data: { status: 'success' } } });
    const productDoc: any = {
      _id: 'p-ok',
      title: 'Notebook',
      quantity: 3,
      inStock: true,
      save: vi.fn().mockResolvedValue(undefined),
    };
    const orderDoc: any = {
      paymentStatus: 'pending',
      status: 'pending',
      items: [{ product: productDoc, quantity: 2 }],
      save: vi.fn().mockResolvedValue(undefined),
      populate: vi.fn().mockResolvedValue(undefined),
    };
    const populate = vi.fn().mockResolvedValue(orderDoc);
    vi.spyOn(Order, 'findOne').mockReturnValue({ populate } as any);

    const req: any = { params: { reference: 'ref-success' } };
    const res = createRes();

    await verify(req, res);

    expect(productDoc.quantity).toBe(1);
    expect(productDoc.inStock).toBe(true);
    expect(productDoc.save).toHaveBeenCalledTimes(1);
    expect(orderDoc.paymentStatus).toBe('completed');
    expect(orderDoc.status).toBe('processing');
    expect(orderDoc.save).toHaveBeenCalledTimes(1);
    expect(orderDoc.populate).toHaveBeenCalledWith('items.product');
    expect(res.json).toHaveBeenCalledWith({
      message: 'Payment verified and order confirmed',
      paymentStatus: 'completed',
      order: orderDoc,
    });
  });

  it('handles verify fallback quantity math and preserves non-pending status', async () => {
    const router = loadRouter();
    const verify = getRouteHandler(router, 'get', '/verify/:reference');

    vi.spyOn(axios, 'get').mockResolvedValue({ data: { data: { status: 'success' } } });
    const productDoc: any = {
      _id: 'p-fallback-verify',
      title: 'Fallback Product',
      quantity: undefined,
      inStock: true,
      save: vi.fn().mockResolvedValue(undefined),
    };
    const orderDoc: any = {
      paymentStatus: 'pending',
      status: 'shipped',
      items: [{ product: productDoc, quantity: undefined }],
      save: vi.fn().mockResolvedValue(undefined),
      populate: vi.fn().mockResolvedValue(undefined),
    };
    const populate = vi.fn().mockResolvedValue(orderDoc);
    vi.spyOn(Order, 'findOne').mockReturnValue({ populate } as any);

    const req: any = { params: { reference: 'ref-fallback-math' } };
    const res = createRes();

    await verify(req, res);

    expect(productDoc.quantity).toBe(0);
    expect(productDoc.inStock).toBe(false);
    expect(orderDoc.status).toBe('shipped');
    expect(orderDoc.paymentStatus).toBe('completed');
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Payment verified and order confirmed' })
    );
  });

  it('covers verify fallback branch when product is marked out of stock', async () => {
    const router = loadRouter();
    const verify = getRouteHandler(router, 'get', '/verify/:reference');

    vi.spyOn(axios, 'get').mockResolvedValue({ data: { data: { status: 'success' } } });
    const orderDoc: any = {
      paymentStatus: 'pending',
      status: 'pending',
      items: [{ product: 'p-fallback-false', quantity: 1 }],
      save: vi.fn().mockResolvedValue(undefined),
      populate: vi.fn().mockResolvedValue(undefined),
    };
    const populate = vi.fn().mockResolvedValue(orderDoc);
    vi.spyOn(Order, 'findOne').mockReturnValue({ populate } as any);
    vi.spyOn(Product, 'findById').mockResolvedValue({
      title: 'Out Item',
      quantity: undefined,
      inStock: false,
      save: vi.fn().mockResolvedValue(undefined),
    } as any);

    const req: any = { params: { reference: 'ref-fallback-false' } };
    const res = createRes();

    await verify(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Out Item is no longer available in requested quantity' });
  });

  it('returns verification failed when provider status is not success', async () => {
    const router = loadRouter();
    const verify = getRouteHandler(router, 'get', '/verify/:reference');
    vi.spyOn(axios, 'get').mockResolvedValue({ data: { data: { status: 'failed' } } });

    const req: any = { params: { reference: 'ref-failed' } };
    const res = createRes();

    await verify(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Payment verification failed' });
  });

  it('returns 500 when verify throws', async () => {
    const router = loadRouter();
    const verify = getRouteHandler(router, 'get', '/verify/:reference');
    vi.spyOn(axios, 'get').mockRejectedValue(new Error('verify error'));

    const req: any = { params: { reference: 'ref-error' } };
    const res = createRes();

    await verify(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'verify error' });
  });

  it('returns 404 for missing order on /order/:orderId', async () => {
    const router = loadRouter();
    const getOrder = getRouteHandler(router, 'get', '/order/:orderId');
    const populate = vi.fn().mockResolvedValue(null);
    vi.spyOn(Order, 'findById').mockReturnValue({ populate } as any);

    const req: any = { params: { orderId: 'missing' }, user: { userId: 'u-1', role: 'user' } };
    const res = createRes();

    await getOrder(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Order not found' });
  });

  it('returns 403 for unauthorized buyer on /order/:orderId', async () => {
    const router = loadRouter();
    const getOrder = getRouteHandler(router, 'get', '/order/:orderId');
    const orderDoc = { buyer: 'other-user' };
    const populate = vi.fn().mockResolvedValue(orderDoc);
    vi.spyOn(Order, 'findById').mockReturnValue({ populate } as any);

    const req: any = { params: { orderId: 'o-1' }, user: { userId: 'u-1', role: 'user' } };
    const res = createRes();

    await getOrder(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Not authorized' });
  });

  it('returns order data for admin users on /order/:orderId', async () => {
    const router = loadRouter();
    const getOrder = getRouteHandler(router, 'get', '/order/:orderId');
    const orderDoc = { _id: 'o-1', buyer: 'other-user', items: [] };
    const populate = vi.fn().mockResolvedValue(orderDoc);
    vi.spyOn(Order, 'findById').mockReturnValue({ populate } as any);

    const req: any = { params: { orderId: 'o-1' }, user: { userId: 'admin-id', role: 'admin' } };
    const res = createRes();

    await getOrder(req, res);

    expect(res.json).toHaveBeenCalledWith(orderDoc);
  });

  it('returns 500 when /order/:orderId throws', async () => {
    const router = loadRouter();
    const getOrder = getRouteHandler(router, 'get', '/order/:orderId');
    vi.spyOn(Order, 'findById').mockImplementation(() => {
      throw new Error('order route error');
    });

    const req: any = { params: { orderId: 'o-err' }, user: { userId: 'u-1', role: 'user' } };
    const res = createRes();

    await getOrder(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'order route error' });
  });
});
