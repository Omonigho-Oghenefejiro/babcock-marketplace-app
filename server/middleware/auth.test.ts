import jwt from 'jsonwebtoken';
import { createRequire } from 'module';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const require = createRequire(import.meta.url);
const authMiddlewarePath = require.resolve('./auth.js');

vi.mock('../models/User', () => ({
  default: {
    findById: vi.fn(),
  },
}));

const loadAuthMiddleware = () => {
  delete require.cache[authMiddlewarePath];
  return require('./auth.js') as any;
};

const createRes = () => {
  const res: any = {};
  res.status = vi.fn(() => res);
  res.json = vi.fn(() => res);
  return res;
};

describe('server auth middleware', () => {
  const originalJwtSecret = process.env.JWT_SECRET;

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env.JWT_SECRET = 'middleware-secret';
  });

  afterEach(() => {
    process.env.JWT_SECRET = originalJwtSecret;
  });

  it('returns 401 when authorization header is missing', () => {
    const auth = loadAuthMiddleware();

    const req: any = {
      header: vi.fn(() => undefined),
    };
    const res = createRes();
    const next = vi.fn();

    auth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'No token, authorization denied' });
    expect(next).not.toHaveBeenCalled();
  });

  it('verifies bearer token, sets req.user, and calls next', async () => {
    vi.resetModules();
    vi.clearAllMocks();

    const UserMock = { findById: vi.fn().mockReturnValue({ select: vi.fn().mockResolvedValue({ isVerified: true }) }) };
    vi.doMock('../models/User', () => ({ default: UserMock }));

    const auth = loadAuthMiddleware();
    const token = jwt.sign({ userId: 'u-1', role: 'admin' }, 'middleware-secret');

    const req: any = {
      header: vi.fn(() => `Bearer ${token}`),
    };
    const res = createRes();
    const next = vi.fn();

    await auth(req, res, next);

    expect(req.user).toEqual(expect.objectContaining({ userId: 'u-1', role: 'admin' }));
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('returns 401 when token verification throws', () => {
    const auth = loadAuthMiddleware();

    const req: any = {
      header: vi.fn(() => 'Bearer bad-token'),
    };
    const res = createRes();
    const next = vi.fn();

    auth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Token is not valid' });
    expect(next).not.toHaveBeenCalled();
  });
});
