import mongoose from 'mongoose';
import { createRequire } from 'module';
import { describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);
const Order = require('./Order.js');

describe('server Order model', () => {
  it('applies defaults for payment and fulfillment fields', () => {
    const doc = new Order({
      buyer: new mongoose.Types.ObjectId(),
      items: [
        {
          product: new mongoose.Types.ObjectId(),
          quantity: 2,
          price: 1500,
        },
      ],
      totalAmount: 3000,
    });

    expect(doc.discountAmount).toBe(0);
    expect(doc.paymentStatus).toBe('pending');
    expect(doc.deliveryMethod).toBe('pickup');
    expect(doc.status).toBe('pending');
    expect(doc.createdAt).toBeInstanceOf(Date);
    expect(doc.validateSync()).toBeUndefined();
  });

  it('enforces required and enum constraints', () => {
    const missingRequired = new Order({});
    const missingErr = missingRequired.validateSync();

    expect(missingErr?.errors.buyer).toBeTruthy();
    expect(missingErr?.errors.totalAmount).toBeTruthy();

    const invalidEnum = new Order({
      buyer: new mongoose.Types.ObjectId(),
      totalAmount: 100,
      paymentStatus: 'unknown',
      deliveryMethod: 'mail',
      status: 'queued',
    });
    const enumErr = invalidEnum.validateSync();

    expect(enumErr?.errors.paymentStatus).toBeTruthy();
    expect(enumErr?.errors.deliveryMethod).toBeTruthy();
    expect(enumErr?.errors.status).toBeTruthy();
  });
});
