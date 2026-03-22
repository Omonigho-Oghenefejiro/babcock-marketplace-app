import mongoose from 'mongoose';
import { createRequire } from 'module';
import { describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);
const Product = require('./Product.js');

describe('server Product model', () => {
  it('sets default listing flags and quantity values', () => {
    const doc = new Product({
      title: 'Desk Lamp',
      description: 'Study lamp with USB output',
      price: 7500,
      category: 'Electronics',
      seller: new mongoose.Types.ObjectId(),
    });

    expect(doc.condition).toBe('Good');
    expect(doc.inStock).toBe(true);
    expect(doc.quantity).toBe(1);
    expect(doc.isApproved).toBe(false);
    expect(doc.isActive).toBe(true);
    expect(doc.createdAt).toBeInstanceOf(Date);
    expect(doc.updatedAt).toBeInstanceOf(Date);
    expect(doc.validateSync()).toBeUndefined();
  });

  it('enforces required fields and enum/min constraints', () => {
    const missingRequired = new Product({});
    const missingErr = missingRequired.validateSync();

    expect(missingErr?.errors.title).toBeTruthy();
    expect(missingErr?.errors.description).toBeTruthy();
    expect(missingErr?.errors.price).toBeTruthy();
    expect(missingErr?.errors.category).toBeTruthy();
    expect(missingErr?.errors.seller).toBeTruthy();

    const invalid = new Product({
      title: 'Invalid Product',
      description: 'Should fail validation',
      price: 1,
      category: 'InvalidCategory',
      condition: 'Worn Out',
      quantity: -3,
      seller: new mongoose.Types.ObjectId(),
    });
    const invalidErr = invalid.validateSync();

    expect(invalidErr?.errors.category).toBeTruthy();
    expect(invalidErr?.errors.condition).toBeTruthy();
    expect(invalidErr?.errors.quantity).toBeTruthy();
  });
});
