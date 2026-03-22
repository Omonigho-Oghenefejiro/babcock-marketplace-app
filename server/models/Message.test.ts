import mongoose from 'mongoose';
import { createRequire } from 'module';
import { describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);
const Message = require('./Message.js');

describe('server Message model', () => {
  it('sets defaults and validates a minimal valid message', () => {
    const doc = new Message({
      sender: new mongoose.Types.ObjectId(),
      receiver: new mongoose.Types.ObjectId(),
      content: 'Hello from test',
    });

    expect(doc.isRead).toBe(false);
    expect(Array.isArray(doc.attachments)).toBe(true);
    expect(doc.createdAt).toBeInstanceOf(Date);
    expect(doc.validateSync()).toBeUndefined();
  });

  it('requires sender, receiver, and content fields', () => {
    const doc = new Message({});
    const err = doc.validateSync();

    expect(err?.errors.sender).toBeTruthy();
    expect(err?.errors.receiver).toBeTruthy();
    expect(err?.errors.content).toBeTruthy();
  });
});
