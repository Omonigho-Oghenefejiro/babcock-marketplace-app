import { describe, expect, it } from 'vitest';
import { hasUserPurchasedProduct } from './reviews';
import { Order } from '../types';

const buildOrder = (partial: Partial<Order>): Order => ({
  id: 'order-1',
  userId: 'user-1',
  items: [],
  total: 0,
  status: 'pending',
  date: new Date().toISOString(),
  ...partial,
});

describe('hasUserPurchasedProduct', () => {
  it('returns false for empty orders', () => {
    expect(hasUserPurchasedProduct([], 'prod-1')).toBe(false);
  });

  it('returns false for unpaid orders', () => {
    const orders: Order[] = [
      buildOrder({
        paymentStatus: 'pending',
        status: 'processing',
        items: [{ id: 'prod-1', title: 'A', price: 100, quantity: 1, images: [], category: 'Others', stock: 1 }],
      }),
    ];

    expect(hasUserPurchasedProduct(orders, 'prod-1')).toBe(false);
  });

  it('returns false for cancelled orders', () => {
    const orders: Order[] = [
      buildOrder({
        paymentStatus: 'completed',
        status: 'cancelled',
        items: [{ id: 'prod-1', title: 'A', price: 100, quantity: 1, images: [], category: 'Others', stock: 1 }],
      }),
    ];

    expect(hasUserPurchasedProduct(orders, 'prod-1')).toBe(false);
  });

  it('returns true when completed order contains the product', () => {
    const orders: Order[] = [
      buildOrder({
        paymentStatus: 'completed',
        status: 'processing',
        items: [{ id: 'prod-1', title: 'A', price: 100, quantity: 1, images: [], category: 'Others', stock: 1 }],
      }),
    ];

    expect(hasUserPurchasedProduct(orders, 'prod-1')).toBe(true);
  });
});
