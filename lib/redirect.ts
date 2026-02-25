const INTERNAL_REDIRECT_ALLOWLIST = [
  '/',
  '/shop',
  '/cart',
  '/wishlist',
  '/login',
  '/register',
  '/messages',
  '/sell',
  '/dashboard',
  '/admin',
  '/pay',
  '/payment/callback',
];

const INTERNAL_REDIRECT_PREFIX_ALLOWLIST = ['/product/'];

const DEFAULT_EXTERNAL_REDIRECT_ORIGINS = ['https://checkout.paystack.com'];

const getExternalAllowlist = () => {
  const configuredOrigins = (import.meta.env.VITE_REDIRECT_ALLOWLIST || '')
    .split(',')
    .map((origin: string) => origin.trim())
    .filter(Boolean);

  return [...new Set([...DEFAULT_EXTERNAL_REDIRECT_ORIGINS, ...configuredOrigins])];
};

export const isAllowedExternalRedirectUrl = (targetUrl: string) => {
  try {
    const parsed = new URL(targetUrl);
    return getExternalAllowlist().includes(parsed.origin);
  } catch {
    return false;
  }
};

export const getSafeInternalRedirectPath = (candidate: unknown, fallback = '/') => {
  if (typeof candidate !== 'string' || !candidate.trim()) {
    return fallback;
  }

  if (!candidate.startsWith('/') || candidate.startsWith('//')) {
    return fallback;
  }

  const [pathOnly] = candidate.split('?');

  if (INTERNAL_REDIRECT_ALLOWLIST.includes(pathOnly)) {
    return candidate;
  }

  const isAllowedByPrefix = INTERNAL_REDIRECT_PREFIX_ALLOWLIST.some(prefix => pathOnly.startsWith(prefix));
  return isAllowedByPrefix ? candidate : fallback;
};
