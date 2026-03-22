import jwt from 'jsonwebtoken';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const loadAuthTokens = async () => {
  const mod = await import('./authTokens.js');
  return (mod.default ?? mod) as any;
};

describe('server authTokens utils', () => {
  const originalJwtSecret = process.env.JWT_SECRET;
  const originalRefreshDays = process.env.REFRESH_TOKEN_EXPIRES_DAYS;
  const originalMaxRefresh = process.env.MAX_REFRESH_TOKENS_PER_USER;

  beforeEach(() => {
    vi.resetModules();
    process.env.JWT_SECRET = 'unit-test-secret';
    delete process.env.REFRESH_TOKEN_EXPIRES_DAYS;
    delete process.env.MAX_REFRESH_TOKENS_PER_USER;
  });

  afterEach(() => {
    process.env.JWT_SECRET = originalJwtSecret;
    process.env.REFRESH_TOKEN_EXPIRES_DAYS = originalRefreshDays;
    process.env.MAX_REFRESH_TOKENS_PER_USER = originalMaxRefresh;
  });

  it('creates a signed access token with expected claims and expiry metadata', async () => {
    const authTokens = await loadAuthTokens();

    const token = authTokens.createAccessToken({ userId: 'u-1', role: 'admin' });
    const payload = jwt.verify(token, 'unit-test-secret') as any;

    expect(payload.userId).toBe('u-1');
    expect(payload.role).toBe('admin');
    expect(authTokens.ACCESS_TOKEN_EXPIRES_IN).toBe('7d');
  });

  it('creates refresh tokens and hashes them deterministically', async () => {
    const authTokens = await loadAuthTokens();

    const refreshToken = authTokens.createRefreshToken();
    expect(refreshToken).toMatch(/^[a-f0-9]{128}$/);

    const hashA = authTokens.hashRefreshToken('same-token');
    const hashB = authTokens.hashRefreshToken('same-token');
    const hashC = authTokens.hashRefreshToken('different-token');

    expect(hashA).toHaveLength(64);
    expect(hashA).toBe(hashB);
    expect(hashA).not.toBe(hashC);
  });

  it('calculates refresh expiry date from configured duration', async () => {
    process.env.REFRESH_TOKEN_EXPIRES_DAYS = '10';
    vi.resetModules();
    const authTokens = await loadAuthTokens();

    const before = Date.now();
    const expiry = authTokens.getRefreshTokenExpiryDate().getTime();
    const after = Date.now();
    const tenDaysMs = 10 * 24 * 60 * 60 * 1000;

    expect(expiry).toBeGreaterThanOrEqual(before + tenDaysMs - 2000);
    expect(expiry).toBeLessThanOrEqual(after + tenDaysMs + 2000);
  });

  it('prunes expired tokens and keeps newest valid entries up to max size', async () => {
    process.env.MAX_REFRESH_TOKENS_PER_USER = '2';
    vi.resetModules();
    const authTokens = await loadAuthTokens();

    const now = Date.now();
    const tokens = [
      {
        id: 'old-valid',
        createdAt: new Date(now - 60_000).toISOString(),
        expiresAt: new Date(now + 60_000).toISOString(),
      },
      {
        id: 'newest-valid',
        createdAt: new Date(now - 1_000).toISOString(),
        expiresAt: new Date(now + 60_000).toISOString(),
      },
      {
        id: 'expired',
        createdAt: new Date(now - 500).toISOString(),
        expiresAt: new Date(now - 100).toISOString(),
      },
      {
        id: 'second-newest-valid',
        createdAt: new Date(now - 2_000).toISOString(),
        expiresAt: new Date(now + 60_000).toISOString(),
      },
    ];

    const pruned = authTokens.pruneRefreshTokens(tokens);

    expect(pruned).toHaveLength(2);
    expect(pruned.map((entry: any) => entry.id)).toEqual(['newest-valid', 'second-newest-valid']);
  });
});