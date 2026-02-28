import { describe, expect, it } from 'vitest';
import { getMessagesPollInterval } from './messaging';

describe('getMessagesPollInterval', () => {
  it('returns null when user is not authenticated', () => {
    expect(
      getMessagesPollInterval({
        isAuthenticated: false,
        isPageVisible: true,
        hasActiveConversation: true,
      }),
    ).toBeNull();
  });

  it('returns null when page is not visible', () => {
    expect(
      getMessagesPollInterval({
        isAuthenticated: true,
        isPageVisible: false,
        hasActiveConversation: true,
      }),
    ).toBeNull();
  });

  it('uses fast polling when an active conversation is open', () => {
    expect(
      getMessagesPollInterval({
        isAuthenticated: true,
        isPageVisible: true,
        hasActiveConversation: true,
      }),
    ).toBe(1500);
  });

  it('uses slower polling when no conversation is selected', () => {
    expect(
      getMessagesPollInterval({
        isAuthenticated: true,
        isPageVisible: true,
        hasActiveConversation: false,
      }),
    ).toBe(5000);
  });
});
