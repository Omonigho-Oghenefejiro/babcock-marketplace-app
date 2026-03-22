import { createRequire } from 'module';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const require = createRequire(import.meta.url);
const ensureDefaultAdminPath = require.resolve('./ensureDefaultAdmin.js');

const loadEnsureDefaultAdmin = () => {
  delete require.cache[ensureDefaultAdminPath];
  return require('./ensureDefaultAdmin.js') as () => Promise<void>;
};

describe('server ensureDefaultAdmin util', () => {
  let User: any;
  let logger: any;

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    User = require('../models/User.js');
    logger = require('./logger.js');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('updates existing admin credentials when account already exists', async () => {
    const existingAdmin = {
      fullName: 'Legacy Admin',
      username: 'legacy-admin',
      email: 'legacy@babcock.edu.ng',
      password: 'legacy-pass',
      role: 'user',
      isVerified: false,
      save: vi.fn().mockResolvedValue(undefined),
    };

    const findOneSpy = vi.spyOn(User, 'findOne').mockResolvedValue(existingAdmin as any);
    const infoSpy = vi.spyOn(logger, 'info').mockImplementation(() => undefined);

    const ensureDefaultAdmin = loadEnsureDefaultAdmin();
    await ensureDefaultAdmin();

    expect(findOneSpy).toHaveBeenCalledWith({
      $or: [{ username: 'admin' }, { email: 'admin@babcock.edu.ng' }],
    });
    expect(existingAdmin.fullName).toBe('Admin User');
    expect(existingAdmin.username).toBe('admin');
    expect(existingAdmin.email).toBe('admin@babcock.edu.ng');
    expect(existingAdmin.password).toBe('admin123');
    expect(existingAdmin.role).toBe('admin');
    expect(existingAdmin.isVerified).toBe(true);
    expect(existingAdmin.save).toHaveBeenCalledTimes(1);
    expect(infoSpy).not.toHaveBeenCalled();
  });

  it('creates and saves a default admin user when none exists', async () => {
    vi.spyOn(User, 'findOne').mockResolvedValue(null);
    const saveSpy = vi.spyOn(User.prototype, 'save').mockResolvedValue(undefined as any);
    const infoSpy = vi.spyOn(logger, 'info').mockImplementation(() => undefined);

    const ensureDefaultAdmin = loadEnsureDefaultAdmin();
    await ensureDefaultAdmin();

    expect(saveSpy).toHaveBeenCalledTimes(1);
    const createdDoc = saveSpy.mock.instances[0] as any;
    expect(createdDoc.fullName).toBe('Admin User');
    expect(createdDoc.username).toBe('admin');
    expect(createdDoc.email).toBe('admin@babcock.edu.ng');
    expect(createdDoc.phone).toBe('08000000000');
    expect(createdDoc.role).toBe('admin');
    expect(createdDoc.isVerified).toBe(true);
    expect(infoSpy).toHaveBeenCalledWith('Default admin account created (username: admin).');
  });

  it('logs error details when bootstrapping fails', async () => {
    vi.spyOn(User, 'findOne').mockRejectedValue(new Error('database unavailable'));
    const errorSpy = vi.spyOn(logger, 'error').mockImplementation(() => undefined);

    const ensureDefaultAdmin = loadEnsureDefaultAdmin();
    await ensureDefaultAdmin();

    expect(errorSpy).toHaveBeenCalledWith('Failed to ensure default admin account', {
      error: 'database unavailable',
    });
  });
});