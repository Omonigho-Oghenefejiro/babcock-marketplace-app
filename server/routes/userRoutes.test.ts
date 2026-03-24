import { createRequire } from 'module';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const require = createRequire(import.meta.url);
const userRoutesPath = require.resolve('./userRoutes.js');

const loadRouter = () => {
  delete require.cache[userRoutesPath];
  return require('./userRoutes.js');
};

const getRouteHandler = (router: any, method: 'post' | 'get' | 'put', path: string) => {
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
  res.redirect = vi.fn(() => res);
  return res;
};

describe('server userRoutes verification flow', () => {
  let User: any;
  let notificationService: any;

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env.JWT_SECRET = 'unit-test-secret';
    delete require.cache[userRoutesPath];

    User = require('../models/User.js');
    notificationService = require('../utils/notificationService.js');
  });

  it('register accepts subdomain babcock email and sends verification code', async () => {
    const sendEmailSpy = vi.spyOn(notificationService, 'sendEmail').mockResolvedValue({ sent: true });
    const findOneSpy = vi.spyOn(User, 'findOne').mockImplementation(async () => null);
    const saveSpy = vi.spyOn(User.prototype, 'save').mockImplementation(function (this: any) {
      return Promise.resolve(this);
    });

    const router = loadRouter();
    const register = getRouteHandler(router, 'post', '/register');

    const req: any = {
      body: {
        fullName: 'Test Student',
        email: 'omonigho-okoro8673@student.babcock.edu.ng',
        password: 'password123',
        phone: '08000000000',
        campusRole: 'student',
      },
    };
    const res = createRes();

    await register(req, res);

    expect(findOneSpy).toHaveBeenCalled();
    expect(saveSpy).toHaveBeenCalled();
    expect(sendEmailSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'omonigho-okoro8673@student.babcock.edu.ng',
        subject: expect.stringContaining('Verify your Babcock Marketplace account'),
        text: expect.stringContaining('/api/auth/verify-email-link?'),
      })
    );

    const createdUser = saveSpy.mock.instances[0] as any;
    expect(createdUser.isVerified).toBe(false);
    expect(createdUser.emailVerificationCode).toMatch(/^\d{6}$/);
    expect(createdUser.emailVerificationExpires).toBeInstanceOf(Date);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('Verification email sent'),
      })
    );
  });

  it('register rejects non-babcock email domains', async () => {
    const sendEmailSpy = vi.spyOn(notificationService, 'sendEmail').mockResolvedValue({ sent: true });
    const findOneSpy = vi.spyOn(User, 'findOne').mockResolvedValue(null);

    const router = loadRouter();
    const register = getRouteHandler(router, 'post', '/register');

    const req: any = {
      body: {
        fullName: 'Test User',
        email: 'test@gmail.com',
        password: 'password123',
      },
    };
    const res = createRes();

    await register(req, res);

    expect(findOneSpy).not.toHaveBeenCalled();
    expect(sendEmailSpy).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Please use a valid Babcock email address.' });
  });

  it('verify-email marks account as verified with valid code', async () => {
    const save = vi.fn().mockResolvedValue(undefined);
    const userDoc = {
      email: 'student@babcock.edu.ng',
      isVerified: false,
      emailVerificationCode: '123456',
      emailVerificationExpires: new Date(Date.now() + 60_000),
      save,
    };

    vi.spyOn(User, 'findOne').mockResolvedValue(userDoc);

    const router = loadRouter();
    const verifyEmail = getRouteHandler(router, 'post', '/verify-email');

    const req: any = {
      body: {
        email: 'student@babcock.edu.ng',
        code: '123456',
      },
    };
    const res = createRes();

    await verifyEmail(req, res);

    expect(userDoc.isVerified).toBe(true);
    expect(userDoc.emailVerificationCode).toBeUndefined();
    expect(userDoc.emailVerificationExpires).toBeUndefined();
    expect(save).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({ message: 'Email verified successfully' });
  });

  it('verify-email rejects incorrect verification codes', async () => {
    const userDoc = {
      email: 'student@babcock.edu.ng',
      isVerified: false,
      emailVerificationCode: '123456',
      emailVerificationExpires: new Date(Date.now() + 60_000),
      save: vi.fn().mockResolvedValue(undefined),
    };

    vi.spyOn(User, 'findOne').mockResolvedValue(userDoc);

    const router = loadRouter();
    const verifyEmail = getRouteHandler(router, 'post', '/verify-email');

    const req: any = {
      body: {
        email: 'student@babcock.edu.ng',
        code: '111111',
      },
    };
    const res = createRes();

    await verifyEmail(req, res);

    expect(userDoc.save).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid verification code' });
  });

  it('verify-email-link verifies account and redirects to login success', async () => {
    const save = vi.fn().mockResolvedValue(undefined);
    const userDoc = {
      email: 'student@babcock.edu.ng',
      isVerified: false,
      emailVerificationCode: '123456',
      emailVerificationExpires: new Date(Date.now() + 60_000),
      save,
    };

    vi.spyOn(User, 'findOne').mockResolvedValue(userDoc);

    const router = loadRouter();
    const verifyEmailLink = getRouteHandler(router, 'get', '/verify-email-link');

    const req: any = {
      query: {
        email: 'student@babcock.edu.ng',
        code: '123456',
      },
    };
    const res = createRes();

    await verifyEmailLink(req, res);

    expect(userDoc.isVerified).toBe(true);
    expect(userDoc.emailVerificationCode).toBeUndefined();
    expect(userDoc.emailVerificationExpires).toBeUndefined();
    expect(save).toHaveBeenCalledTimes(1);
    expect(res.redirect).toHaveBeenCalledWith(
      expect.stringContaining('/#/login?verify=success')
    );
  });

  it('verify-email-link rejects expired codes and redirects', async () => {
    const userDoc = {
      email: 'student@babcock.edu.ng',
      isVerified: false,
      emailVerificationCode: '123456',
      emailVerificationExpires: new Date(Date.now() - 60_000),
      save: vi.fn().mockResolvedValue(undefined),
    };

    vi.spyOn(User, 'findOne').mockResolvedValue(userDoc);

    const router = loadRouter();
    const verifyEmailLink = getRouteHandler(router, 'get', '/verify-email-link');

    const req: any = {
      query: {
        email: 'student@babcock.edu.ng',
        code: '123456',
      },
    };
    const res = createRes();

    await verifyEmailLink(req, res);

    expect(userDoc.save).not.toHaveBeenCalled();
    expect(res.redirect).toHaveBeenCalledWith(
      expect.stringContaining('/#/login?verify=expired')
    );
  });
});
