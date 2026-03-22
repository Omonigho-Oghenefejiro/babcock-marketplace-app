import { describe, expect, it, vi } from 'vitest';

const loadAdminCheck = async () => {
  const mod = await import('./adminCheck.js');
  return (mod.default ?? mod) as any;
};

const createRes = () => {
  const res: any = {};
  res.status = vi.fn(() => res);
  res.json = vi.fn(() => res);
  return res;
};

describe('server adminCheck middleware', () => {
  it('calls next for admin users', async () => {
    const adminCheck = await loadAdminCheck();
    const req: any = { user: { role: 'admin' } };
    const res = createRes();
    const next = vi.fn();

    adminCheck(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('returns 403 for authenticated non-admin users', async () => {
    const adminCheck = await loadAdminCheck();
    const req: any = { user: { role: 'user' } };
    const res = createRes();
    const next = vi.fn();

    adminCheck(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Not authorized as admin' });
  });

  it('returns 403 when req.user is missing', async () => {
    const adminCheck = await loadAdminCheck();
    const req: any = {};
    const res = createRes();
    const next = vi.fn();

    adminCheck(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Not authorized as admin' });
  });
});
