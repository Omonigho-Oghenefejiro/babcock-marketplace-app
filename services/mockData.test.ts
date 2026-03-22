import { describe, expect, it } from 'vitest';
import {
  EXTRA_USERS,
  MOCK_ADMIN,
  MOCK_CONVERSATIONS,
  MOCK_DISPUTES,
  MOCK_USER,
  PRODUCTS,
} from './mockData';

describe('mockData exports', () => {
  it('provides a non-empty product catalog with required fields', () => {
    expect(PRODUCTS.length).toBeGreaterThan(0);

    for (const product of PRODUCTS) {
      expect(product.id).toBeTruthy();
      expect(product.title).toBeTruthy();
      expect(product.description).toBeTruthy();
      expect(product.price).toBeGreaterThan(0);
      expect(product.images.length).toBeGreaterThan(0);
      expect(product.seller.id).toBeTruthy();
      expect(product.seller.email).toContain('@');
      expect(typeof product.inStock).toBe('boolean');
    }
  });

  it('exposes user fixtures with expected roles', () => {
    expect(MOCK_USER.role).toBe('user');
    expect(MOCK_ADMIN.role).toBe('admin');
    expect(EXTRA_USERS.length).toBeGreaterThan(0);
    expect(EXTRA_USERS.some((user) => user.role === 'seller' || user.role === 'user')).toBe(true);
  });

  it('initializes conversation and dispute fixtures as empty lists', () => {
    expect(MOCK_CONVERSATIONS).toEqual([]);
    expect(MOCK_DISPUTES).toEqual([]);
  });
});