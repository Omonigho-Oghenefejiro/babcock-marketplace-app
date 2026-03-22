import { createRequire } from 'module';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const require = createRequire(import.meta.url);
const supportRoutesPath = require.resolve('./supportRoutes.js');

const loadRouter = () => {
  delete require.cache[supportRoutesPath];
  return require('./supportRoutes.js');
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

describe('server supportRoutes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete require.cache[supportRoutesPath];
  });

  it('returns static help resources', () => {
    const router = loadRouter();
    const handler = getRouteHandler(router, 'get', '/resources');
    const req: any = {};
    const res = createRes();

    handler(req, res);

    expect(res.json).toHaveBeenCalledTimes(1);
    const payload = res.json.mock.calls[0][0];
    expect(Array.isArray(payload)).toBe(true);
    expect(payload).toHaveLength(3);
    expect(payload[0]).toMatchObject({
      id: 'help-1',
      title: 'How to buy and checkout',
      url: '/help/buying',
    });
  });

  it('validates support ticket payload before creation', () => {
    const router = loadRouter();
    const handler = getRouteHandler(router, 'post', '/tickets');
    const req: any = {
      user: { userId: 'u-1', role: 'user' },
      body: { subject: '', message: 'Need help' },
    };
    const res = createRes();

    handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'subject and message are required' });
  });

  it('creates ticket and returns requester tickets only for non-admin users', () => {
    const router = loadRouter();
    const createHandler = getRouteHandler(router, 'post', '/tickets');
    const listHandler = getRouteHandler(router, 'get', '/tickets');

    const userReq: any = {
      user: { userId: 'student-1', role: 'user' },
      body: { subject: 'Payment issue', message: 'My payment is pending' },
    };
    const userRes = createRes();
    createHandler(userReq, userRes);

    expect(userRes.status).toHaveBeenCalledWith(201);
    const created = userRes.json.mock.calls[0][0];
    expect(created.message).toBe('Support ticket created');
    expect(created.ticket).toMatchObject({
      userId: 'student-1',
      subject: 'Payment issue',
      message: 'My payment is pending',
      status: 'open',
    });
    expect(created.ticket.id).toMatch(/^ticket-/);

    const secondReq: any = {
      user: { userId: 'student-2', role: 'user' },
      body: { subject: 'Delivery issue', message: 'Order delayed' },
    };
    const secondRes = createRes();
    createHandler(secondReq, secondRes);

    const listReq: any = { user: { userId: 'student-1', role: 'user' } };
    const listRes = createRes();
    listHandler(listReq, listRes);

    const mine = listRes.json.mock.calls[0][0];
    expect(mine).toHaveLength(1);
    expect(mine[0].userId).toBe('student-1');
    expect(mine[0].subject).toBe('Payment issue');
  });

  it('returns all tickets for admin users', () => {
    const router = loadRouter();
    const createHandler = getRouteHandler(router, 'post', '/tickets');
    const listHandler = getRouteHandler(router, 'get', '/tickets');

    createHandler(
      {
        user: { userId: 'a-user', role: 'user' },
        body: { subject: 'A', message: 'A message' },
      },
      createRes()
    );
    createHandler(
      {
        user: { userId: 'b-user', role: 'user' },
        body: { subject: 'B', message: 'B message' },
      },
      createRes()
    );

    const adminRes = createRes();
    listHandler({ user: { userId: 'admin-1', role: 'admin' } }, adminRes);

    const allTickets = adminRes.json.mock.calls[0][0];
    expect(allTickets).toHaveLength(2);
    expect(allTickets.map((ticket: any) => ticket.subject).sort()).toEqual(['A', 'B']);
  });
});
