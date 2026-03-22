import { createRequire } from 'module';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const require = createRequire(import.meta.url);
const seedScriptPath = require.resolve('./seedData.js');

const loadSeedScript = () => {
  delete require.cache[seedScriptPath];
  return require('./seedData.js');
};

const mockProcessExit = () => {
  let resolveExit!: (code: number | undefined) => void;
  const exited = new Promise<number | undefined>((resolve) => {
    resolveExit = resolve;
  });

  const exitSpy = vi.spyOn(process, 'exit').mockImplementation(((code?: number) => {
    resolveExit(code);
    return undefined as never;
  }) as any);

  return { exitSpy, exited };
};

describe('server seedData script', () => {
  let mongoose: any;
  let User: any;
  let Product: any;
  let logger: any;
  let dotenv: any;

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();

    mongoose = require('mongoose');
    User = require('../models/User.js');
    Product = require('../models/Product.js');
    logger = require('../utils/logger.js');
    dotenv = require('dotenv');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete require.cache[seedScriptPath];
  });

  it('seeds users and products then exits with status 0', async () => {
    const seedUsers = [{ _id: 'seller-id' }, { _id: 'admin-id' }, { _id: 'buyer-id' }];

    const dotenvSpy = vi.spyOn(dotenv, 'config').mockReturnValue({ parsed: {} } as any);
    const connectSpy = vi.spyOn(mongoose, 'connect').mockResolvedValue(undefined);
    const userDeleteSpy = vi.spyOn(User, 'deleteMany').mockResolvedValue({} as any);
    const productDeleteSpy = vi.spyOn(Product, 'deleteMany').mockResolvedValue({} as any);
    const userInsertSpy = vi.spyOn(User, 'insertMany').mockResolvedValue(seedUsers as any);
    const productInsertSpy = vi.spyOn(Product, 'insertMany').mockResolvedValue([{ _id: 'p1' }] as any);
    const infoSpy = vi.spyOn(logger, 'info').mockImplementation(() => undefined);
    const errorSpy = vi.spyOn(logger, 'error').mockImplementation(() => undefined);
    const { exited } = mockProcessExit();

    loadSeedScript();

    const exitCode = await exited;
    expect(exitCode).toBe(0);

    expect(dotenvSpy).toHaveBeenCalledWith(
      expect.objectContaining({ path: expect.stringContaining('.env') })
    );
    expect(connectSpy).toHaveBeenCalledWith(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    expect(userDeleteSpy).toHaveBeenCalledWith({});
    expect(productDeleteSpy).toHaveBeenCalledWith({});

    expect(userInsertSpy).toHaveBeenCalledTimes(1);
    expect(userInsertSpy.mock.calls[0][0]).toHaveLength(3);

    expect(productInsertSpy).toHaveBeenCalledTimes(1);
    const insertedProducts = productInsertSpy.mock.calls[0][0];
    expect(insertedProducts).toHaveLength(10);
    expect(insertedProducts.every((item: any) => item.isApproved === true)).toBe(true);
    expect(insertedProducts.every((item: any) => item.inStock === true)).toBe(true);
    expect(insertedProducts.some((item: any) => String(item.seller) === 'seller-id')).toBe(true);
    expect(insertedProducts.some((item: any) => String(item.seller) === 'buyer-id')).toBe(true);

    expect(infoSpy).toHaveBeenCalledWith('MongoDB connected for seeding');
    expect(infoSpy).toHaveBeenCalledWith('Cleared existing data');
    expect(infoSpy).toHaveBeenCalledWith('Created 3 users');
    expect(infoSpy).toHaveBeenCalledWith('Created 1 products');
    expect(infoSpy).toHaveBeenCalledWith('Database seeded successfully!');
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('logs error details and exits with status 1 when seeding fails', async () => {
    const failure = new Error('failed to connect');

    const connectSpy = vi.spyOn(mongoose, 'connect').mockRejectedValue(failure);
    const userDeleteSpy = vi.spyOn(User, 'deleteMany').mockResolvedValue({} as any);
    const productDeleteSpy = vi.spyOn(Product, 'deleteMany').mockResolvedValue({} as any);
    const errorSpy = vi.spyOn(logger, 'error').mockImplementation(() => undefined);
    const infoSpy = vi.spyOn(logger, 'info').mockImplementation(() => undefined);
    const { exited } = mockProcessExit();

    loadSeedScript();

    const exitCode = await exited;
    expect(exitCode).toBe(1);

    expect(connectSpy).toHaveBeenCalledTimes(1);
    expect(userDeleteSpy).not.toHaveBeenCalled();
    expect(productDeleteSpy).not.toHaveBeenCalled();
    expect(infoSpy).not.toHaveBeenCalledWith('Database seeded successfully!');
    expect(errorSpy).toHaveBeenCalledWith('Error seeding database', {
      error: 'failed to connect',
      stack: expect.any(String),
    });
  });
});
