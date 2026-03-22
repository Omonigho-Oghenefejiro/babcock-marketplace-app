import { afterEach, describe, expect, it } from 'vitest';
import { getSafeInternalRedirectPath, isAllowedExternalRedirectUrl } from './redirect';

const originalAllowlist = import.meta.env.VITE_REDIRECT_ALLOWLIST;

afterEach(() => {
  import.meta.env.VITE_REDIRECT_ALLOWLIST = originalAllowlist;
});

describe('isAllowedExternalRedirectUrl', () => {
  it('allows checkout.paystack.com by default', () => {
    expect(isAllowedExternalRedirectUrl('https://checkout.paystack.com/pay/abc')).toBe(true);
  });

  it('allows configured origins from env allowlist', () => {
    import.meta.env.VITE_REDIRECT_ALLOWLIST = 'https://example.com, https://demo.app';

    expect(isAllowedExternalRedirectUrl('https://example.com/success')).toBe(true);
    expect(isAllowedExternalRedirectUrl('https://demo.app/ok')).toBe(true);
  });

  it('rejects malformed urls and unknown origins', () => {
    expect(isAllowedExternalRedirectUrl('not-a-url')).toBe(false);
    expect(isAllowedExternalRedirectUrl('https://evil.com/redirect')).toBe(false);
  });
});

describe('getSafeInternalRedirectPath', () => {
  it('returns fallback for non-string and blank values', () => {
    expect(getSafeInternalRedirectPath(undefined, '/login')).toBe('/login');
    expect(getSafeInternalRedirectPath('   ', '/register')).toBe('/register');
  });

  it('returns fallback for external/protocol-relative paths', () => {
    expect(getSafeInternalRedirectPath('https://example.com', '/')).toBe('/');
    expect(getSafeInternalRedirectPath('//malicious', '/dashboard')).toBe('/dashboard');
  });

  it('allows known internal paths and product prefix routes', () => {
    expect(getSafeInternalRedirectPath('/shop?tab=latest')).toBe('/shop?tab=latest');
    expect(getSafeInternalRedirectPath('/product/123?ref=home')).toBe('/product/123?ref=home');
  });

  it('falls back for paths not in allowlist', () => {
    expect(getSafeInternalRedirectPath('/unknown/path', '/wishlist')).toBe('/wishlist');
  });
});