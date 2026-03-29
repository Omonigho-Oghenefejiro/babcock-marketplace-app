import { createRequire } from 'module';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const require = createRequire(import.meta.url);
const messageRoutesPath = require.resolve('./messageRoutes.js');

const loadRouter = () => {
  delete require.cache[messageRoutesPath];
  return require('./messageRoutes.js');
};

const getRouteHandler = (router: any, method: 'get' | 'post' | 'put', path: string) => {
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

const createFindChain = (result: any, rejectErr?: Error) => {
  const chain: any = {
    populate: vi.fn(() => chain),
    sort: rejectErr ? vi.fn().mockRejectedValue(rejectErr) : vi.fn().mockResolvedValue(result),
  };
  return chain;
};

describe('server messageRoutes', () => {
  let Message: any;
  let Product: any;

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    delete require.cache[messageRoutesPath];
    Message = require('../models/Message.js');
    Product = require('../models/Product.js');
  });

  it('returns grouped conversations for current user', async () => {
    const router = loadRouter();
    const handler = getRouteHandler(router, 'get', '/');

    const messages = [
      {
        _id: 'm-2',
        sender: { _id: { toString: () => 'u-2' } },
        receiver: { _id: { toString: () => 'u-1' } },
        product: null,
        content: 'latest plain message',
        attachments: null,
        createdAt: new Date('2025-01-01T10:05:00.000Z'),
        isRead: false,
      },
      {
        _id: 'm-1',
        sender: { _id: { toString: () => 'u-1' } },
        receiver: { _id: { toString: () => 'u-2' } },
        product: null,
        content: 'older plain message',
        attachments: ['a.png'],
        createdAt: new Date('2025-01-01T10:00:00.000Z'),
        isRead: true,
      },
      {
        _id: 'm-3',
        sender: { _id: { toString: () => 'u-3' } },
        receiver: { _id: { toString: () => 'u-1' } },
        product: { _id: 'p-9' },
        content: 'product conversation',
        attachments: ['proof.pdf'],
        createdAt: new Date('2025-01-01T09:00:00.000Z'),
        isRead: false,
      },
    ];

    const findSpy = vi.spyOn(Message, 'find').mockReturnValue(createFindChain(messages));

    const req: any = { user: { userId: 'u-1' } };
    const res = createRes();

    await handler(req, res);

    expect(findSpy).toHaveBeenCalledWith({
      $or: [{ sender: 'u-1' }, { receiver: 'u-1' }],
    });

    const payload = res.json.mock.calls[0][0];
    expect(payload).toHaveLength(2);

    const plainConversation = payload.find((entry: any) => entry.id === 'u-2');
    expect(plainConversation).toBeTruthy();
    expect(plainConversation.messages).toHaveLength(2);
    expect(plainConversation.messages[0].id).toBe('m-1');
    expect(plainConversation.messages[0].attachments).toEqual(['a.png']);
    expect(plainConversation.messages[1].id).toBe('m-2');
    expect(plainConversation.messages[1].attachments).toEqual([]);

    const productConversation = payload.find((entry: any) => entry.id === 'u-3-p-9');
    expect(productConversation).toBeTruthy();
    expect(productConversation.productId).toBe('p-9');
    expect(productConversation.messages[0].senderId).toBe('u-3');
  });

  it('returns 500 when listing conversations fails', async () => {
    const router = loadRouter();
    const handler = getRouteHandler(router, 'get', '/');

    vi.spyOn(Message, 'find').mockReturnValue(createFindChain([], new Error('conversation failure')));

    const req: any = { user: { userId: 'u-1' } };
    const res = createRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'conversation failure' });
  });

  it('sends a message from POST / with normalized attachments', async () => {
    const router = loadRouter();
    const handler = getRouteHandler(router, 'post', '/');

    const senderId = '507f191e810c19729de860ea';
    const receiverId = '507f191e810c19729de860eb';
    const productId = '507f191e810c19729de860ec';

    const saveSpy = vi.spyOn(Message.prototype, 'save').mockImplementation(function (this: any) {
      return Promise.resolve(this);
    });
    const populateSpy = vi.spyOn(Message.prototype, 'populate').mockResolvedValue(undefined as any);
    vi.spyOn(Product, 'findById').mockReturnValue({
      select: vi.fn().mockResolvedValue({ seller: receiverId }),
    } as any);

    const req: any = {
      user: { userId: senderId },
      body: {
        receiverId,
        productId,
        content: 'hello',
        attachments: 'not-array',
      },
    };
    const res = createRes();

    await handler(req, res);

    expect(saveSpy).toHaveBeenCalledTimes(1);
    expect(populateSpy).toHaveBeenCalledWith('sender', 'fullName profileImage');
    expect(populateSpy).toHaveBeenCalledWith('receiver', 'fullName profileImage');
    expect(res.status).toHaveBeenCalledWith(201);
    const payload = res.json.mock.calls[0][0];
    expect(payload.data.content).toBe('hello');
    expect(payload.data.attachments).toEqual([]);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Message sent',
        data: expect.any(Object),
      })
    );
  });

  it('returns 500 when POST / send fails', async () => {
    const router = loadRouter();
    const handler = getRouteHandler(router, 'post', '/');

    vi.spyOn(Product, 'findById').mockReturnValue({
      select: vi.fn().mockResolvedValue({ seller: 'u-2' }),
    } as any);
    vi.spyOn(Message.prototype, 'save').mockRejectedValue(new Error('send failed'));

    const req: any = {
      user: { userId: 'u-1' },
      body: {
        receiverId: 'u-2',
        productId: 'p-1',
        content: 'hello',
      },
    };
    const res = createRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'send failed' });
  });

  it('validates empty receiverIds for bulk messaging', async () => {
    const router = loadRouter();
    const handler = getRouteHandler(router, 'post', '/bulk');

    const req: any = { user: { userId: 'u-1' }, body: { receiverIds: [] } };
    const res = createRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'receiverIds must be a non-empty array' });
  });

  it('creates bulk messages and returns created count', async () => {
    const router = loadRouter();
    const handler = getRouteHandler(router, 'post', '/bulk');

    const insertManySpy = vi.spyOn(Message, 'insertMany').mockResolvedValue([{}, {}] as any);

    const req: any = {
      user: { userId: 'u-1' },
      body: {
        receiverIds: ['u-2', 'u-3'],
        productId: 'p-5',
        content: 'bulk note',
        attachments: 'fallback-array',
      },
    };
    const res = createRes();

    await handler(req, res);

    expect(insertManySpy).toHaveBeenCalledWith([
      {
        sender: 'u-1',
        receiver: 'u-2',
        product: 'p-5',
        content: 'bulk note',
        attachments: [],
      },
      {
        sender: 'u-1',
        receiver: 'u-3',
        product: 'p-5',
        content: 'bulk note',
        attachments: [],
      },
    ]);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ message: 'Messages sent', count: 2 });
  });

  it('returns 500 when bulk insert fails', async () => {
    const router = loadRouter();
    const handler = getRouteHandler(router, 'post', '/bulk');

    vi.spyOn(Message, 'insertMany').mockRejectedValue(new Error('bulk failed'));

    const req: any = {
      user: { userId: 'u-1' },
      body: {
        receiverIds: ['u-2'],
        content: 'x',
      },
    };
    const res = createRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'bulk failed' });
  });

  it('sends a legacy /send message and handles errors', async () => {
    const router = loadRouter();
    const handler = getRouteHandler(router, 'post', '/send');

    const saveSpy = vi.spyOn(Message.prototype, 'save').mockResolvedValue(undefined as any);
    vi.spyOn(Message.prototype, 'populate').mockResolvedValue(undefined as any);

    const req: any = {
      user: { userId: 'u-1' },
      body: {
        receiverId: 'u-2',
        content: 'legacy',
        attachments: ['doc.pdf'],
      },
    };
    const res = createRes();

    await handler(req, res);

    const createdDoc = saveSpy.mock.instances[0] as any;
    expect(createdDoc.attachments).toEqual(['doc.pdf']);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Message sent',
      })
    );

    saveSpy.mockRejectedValueOnce(new Error('legacy failed'));
    const resFail = createRes();

    await handler(req, resFail);

    expect(resFail.status).toHaveBeenCalledWith(500);
    expect(resFail.json).toHaveBeenCalledWith({ message: 'legacy failed' });
  });

  it('returns conversation messages between users', async () => {
    const router = loadRouter();
    const handler = getRouteHandler(router, 'get', '/conversation/:userId');

    const conversation = [{ _id: 'm-1' }];
    const findSpy = vi.spyOn(Message, 'find').mockReturnValue(createFindChain(conversation));

    const req: any = { user: { userId: 'u-1' }, params: { userId: 'u-2' } };
    const res = createRes();

    await handler(req, res);

    expect(findSpy).toHaveBeenCalledWith({
      $or: [
        { sender: 'u-1', receiver: 'u-2' },
        { sender: 'u-2', receiver: 'u-1' },
      ],
    });
    expect(res.json).toHaveBeenCalledWith(conversation);
  });

  it('returns 500 when fetching a conversation fails', async () => {
    const router = loadRouter();
    const handler = getRouteHandler(router, 'get', '/conversation/:userId');

    vi.spyOn(Message, 'find').mockReturnValue(createFindChain([], new Error('conversation fetch failed')));

    const req: any = { user: { userId: 'u-1' }, params: { userId: 'u-2' } };
    const res = createRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'conversation fetch failed' });
  });

  it('marks conversation as read with invalid-id and product/no-product branches', async () => {
    const router = loadRouter();
    const handler = getRouteHandler(router, 'put', '/conversation/:conversationId/read');

    const invalidReq: any = { user: { userId: 'u-1' }, params: { conversationId: '-p-1' } };
    const invalidRes = createRes();

    await handler(invalidReq, invalidRes);

    expect(invalidRes.status).toHaveBeenCalledWith(400);
    expect(invalidRes.json).toHaveBeenCalledWith({ message: 'Invalid conversation id' });

    const updateManySpy = vi.spyOn(Message, 'updateMany')
      .mockResolvedValueOnce({ modifiedCount: 3 } as any)
      .mockResolvedValueOnce({} as any)
      .mockRejectedValueOnce(new Error('mark failed'));

    const productReq: any = { user: { userId: 'u-1' }, params: { conversationId: 'u2-p5' } };
    const productRes = createRes();
    await handler(productReq, productRes);

    expect(updateManySpy).toHaveBeenNthCalledWith(1, {
      sender: 'u2',
      receiver: 'u-1',
      product: 'p5',
    }, { isRead: true });
    expect(productRes.json).toHaveBeenCalledWith({
      message: 'Conversation marked as read',
      modifiedCount: 3,
    });

    const noProductReq: any = { user: { userId: 'u-1' }, params: { conversationId: 'u2' } };
    const noProductRes = createRes();
    await handler(noProductReq, noProductRes);

    expect(updateManySpy).toHaveBeenNthCalledWith(2, {
      sender: 'u2',
      receiver: 'u-1',
      $or: [{ product: { $exists: false } }, { product: null }],
    }, { isRead: true });
    expect(noProductRes.json).toHaveBeenCalledWith({
      message: 'Conversation marked as read',
      modifiedCount: 0,
    });

    const errorReq: any = { user: { userId: 'u-1' }, params: { conversationId: 'u2-p9' } };
    const errorRes = createRes();
    await handler(errorReq, errorRes);

    expect(errorRes.status).toHaveBeenCalledWith(500);
    expect(errorRes.json).toHaveBeenCalledWith({ message: 'mark failed' });
  });

  it('marks a single message as read and handles failures', async () => {
    const router = loadRouter();
    const handler = getRouteHandler(router, 'put', '/:id/read');

    const updatedDoc = { _id: 'm-1', isRead: true };
    const updateSpy = vi.spyOn(Message, 'findByIdAndUpdate')
      .mockResolvedValueOnce(updatedDoc as any)
      .mockRejectedValueOnce(new Error('single mark failed'));

    const req: any = { params: { id: 'm-1' } };
    const res = createRes();

    await handler(req, res);

    expect(updateSpy).toHaveBeenCalledWith('m-1', { isRead: true }, { new: true });
    expect(res.json).toHaveBeenCalledWith(updatedDoc);

    const resFail = createRes();
    await handler(req, resFail);

    expect(resFail.status).toHaveBeenCalledWith(500);
    expect(resFail.json).toHaveBeenCalledWith({ message: 'single mark failed' });
  });
});
