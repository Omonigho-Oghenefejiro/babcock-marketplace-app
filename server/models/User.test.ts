import bcrypt from 'bcryptjs';
import { createRequire } from 'module';
import { describe, expect, it, vi } from 'vitest';

const require = createRequire(import.meta.url);
const User = require('./User.js');

const getSavePreHook = () => {
  const pres = (User.schema as any).s.hooks._pres.get('save') as Array<{ fn: Function }>;
  const passwordHook = pres.find((entry) => String(entry.fn).includes("isModified('password')"));
  return passwordHook?.fn;
};

describe('server User model', () => {
  it('applies schema defaults and validates required fields', () => {
    const valid = new User({
      fullName: 'Ada Student',
      email: 'ada@babcock.edu.ng',
      password: 'plain-password',
    });

    expect(valid.campusRole).toBe('student');
    expect(valid.role).toBe('user');
    expect(valid.isVerified).toBe(false);
    expect(Array.isArray(valid.wishlist)).toBe(true);
    expect(Array.isArray(valid.cart)).toBe(true);
    expect(Array.isArray(valid.refreshTokens)).toBe(true);
    expect(valid.createdAt).toBeInstanceOf(Date);
    expect(valid.validateSync()).toBeUndefined();

    const missing = new User({});
    const missingErr = missing.validateSync();

    expect(missingErr?.errors.fullName).toBeTruthy();
    expect(missingErr?.errors.email).toBeTruthy();
    expect(missingErr?.errors.password).toBeFalsy();
  });

  it('returns early from pre-save hook when password is unchanged', async () => {
    const savePreHook = getSavePreHook();
    expect(savePreHook).toBeTypeOf('function');
    const next = vi.fn();
    const context = {
      password: 'keep-this-password',
      isModified: vi.fn(() => false),
    };

    await savePreHook.call(context, next);

    expect(context.password).toBe('keep-this-password');
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('hashes password in pre-save hook when password is modified', async () => {
    const savePreHook = getSavePreHook();
    expect(savePreHook).toBeTypeOf('function');
    const next = vi.fn();
    const context = {
      password: 'new-password',
      isModified: vi.fn(() => true),
    };

    await savePreHook.call(context, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(context.password).not.toBe('new-password');
    await expect(bcrypt.compare('new-password', context.password)).resolves.toBe(true);
  });

  it('compares entered password with stored hash via matchPassword', async () => {
    const hashed = await bcrypt.hash('correct-password', 10);
    const matchPassword = (User.schema.methods as any).matchPassword as (enteredPassword: string) => Promise<boolean>;

    await expect(matchPassword.call({ password: hashed }, 'correct-password')).resolves.toBe(true);
    await expect(matchPassword.call({ password: hashed }, 'wrong-password')).resolves.toBe(false);
  });
});
