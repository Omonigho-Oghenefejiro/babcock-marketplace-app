import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const axiosMocks = vi.hoisted(() => {
  const requestHandlers: Array<(config: any) => any> = [];
  const responseFulfilledHandlers: Array<(response: any) => any> = [];
  const responseRejectedHandlers: Array<(error: any) => Promise<any>> = [];

  const apiInstance = vi.fn((config: any) => Promise.resolve({ data: { ok: true }, config }));
  (apiInstance as any).interceptors = {
    request: {
      use: vi.fn((fulfilled: (config: any) => any) => {
        requestHandlers.push(fulfilled);
      }),
    },
    response: {
      use: vi.fn((fulfilled: (response: any) => any, rejected: (error: any) => Promise<any>) => {
        responseFulfilledHandlers.push(fulfilled);
        responseRejectedHandlers.push(rejected);
      }),
    },
  };

  const create = vi.fn(() => apiInstance as any);
  const post = vi.fn();

  return {
    apiInstance,
    create,
    post,
    requestHandlers,
    responseFulfilledHandlers,
    responseRejectedHandlers,
  };
});

vi.mock('axios', () => {
  const axios = {
    create: axiosMocks.create,
    post: axiosMocks.post,
  };

  return {
    default: axios,
    create: axiosMocks.create,
    post: axiosMocks.post,
  };
});

const createMemoryStorage = () => {
  const store = new Map<string, string>();

  return {
    getItem: vi.fn((key: string) => store.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store.set(key, value);
    }),
    removeItem: vi.fn((key: string) => {
      store.delete(key);
    }),
  };
};

const loadApi = async () => (await import('./api')).default;
const itWithTimeout = (name: string, fn: () => unknown | Promise<unknown>) => it(name, fn, 15000);

let sessionStorageMock: ReturnType<typeof createMemoryStorage>;
let localStorageMock: ReturnType<typeof createMemoryStorage>;

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();

  axiosMocks.requestHandlers.length = 0;
  axiosMocks.responseFulfilledHandlers.length = 0;
  axiosMocks.responseRejectedHandlers.length = 0;

  axiosMocks.apiInstance.mockReset();
  axiosMocks.apiInstance.mockImplementation((config: any) => Promise.resolve({ data: { ok: true }, config }));
  axiosMocks.create.mockReset();
  axiosMocks.create.mockImplementation(() => axiosMocks.apiInstance as any);
  axiosMocks.post.mockReset();

  sessionStorageMock = createMemoryStorage();
  localStorageMock = createMemoryStorage();

  vi.stubGlobal('sessionStorage', sessionStorageMock as any);
  vi.stubGlobal('localStorage', localStorageMock as any);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe('api interceptors', () => {
  itWithTimeout('falls back to localhost API base URL when env variable is empty', async () => {
    vi.stubEnv('VITE_API_BASE_URL', '');

    await loadApi();

    expect(axiosMocks.create).toHaveBeenCalledWith({
      baseURL: 'http://localhost:5000/api',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  });

  itWithTimeout('uses VITE_API_BASE_URL when provided', async () => {
    vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.test/v1');

    await loadApi();

    expect(axiosMocks.create).toHaveBeenCalledWith({
      baseURL: 'https://api.example.test/v1',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  });

  itWithTimeout('passes successful responses through unchanged', async () => {
    await loadApi();

    const responseFulfilled = axiosMocks.responseFulfilledHandlers[0];
    const response = { data: { ok: true } };

    expect(responseFulfilled(response)).toBe(response);
  });

  itWithTimeout('adds access token from session storage to outgoing requests', async () => {
    sessionStorageMock.setItem('token', 'session-token');
    await loadApi();

    const requestInterceptor = axiosMocks.requestHandlers[0];
    expect(requestInterceptor).toBeTypeOf('function');

    const config = requestInterceptor({ headers: {} });
    expect(config.headers.Authorization).toBe('Bearer session-token');
  });

  itWithTimeout('falls back to local storage token when session token is missing', async () => {
    localStorageMock.setItem('token', 'local-token');
    await loadApi();

    const requestInterceptor = axiosMocks.requestHandlers[0];
    const config = requestInterceptor({ headers: {} });
    expect(config.headers.Authorization).toBe('Bearer local-token');
  });

  itWithTimeout('rejects non-401 responses without attempting refresh', async () => {
    await loadApi();

    const responseRejected = axiosMocks.responseRejectedHandlers[0];
    const error = { response: { status: 500 }, config: { url: '/orders', headers: {} } };

    await expect(responseRejected(error)).rejects.toBe(error);
    expect(axiosMocks.post).not.toHaveBeenCalled();
  });

  itWithTimeout('clears tokens and rejects when refresh token is missing', async () => {
    sessionStorageMock.setItem('token', 'old-access');
    localStorageMock.setItem('refreshToken', '');
    await loadApi();

    const responseRejected = axiosMocks.responseRejectedHandlers[0];
    const error = { response: { status: 401 }, config: { url: '/orders', headers: {} } };

    await expect(responseRejected(error)).rejects.toBe(error);
    expect(sessionStorageMock.removeItem).toHaveBeenCalledWith('token');
    expect(sessionStorageMock.removeItem).toHaveBeenCalledWith('refreshToken');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('refreshToken');
  });

  itWithTimeout('handles 401 errors that have no request config', async () => {
    sessionStorageMock.setItem('token', 'old-access');
    await loadApi();

    const responseRejected = axiosMocks.responseRejectedHandlers[0];
    const error = { response: { status: 401 } };

    await expect(responseRejected(error)).rejects.toBe(error);
    expect(sessionStorageMock.removeItem).toHaveBeenCalledWith('token');
    expect(sessionStorageMock.removeItem).toHaveBeenCalledWith('refreshToken');
  });

  itWithTimeout('refreshes token and retries the original request after a 401', async () => {
    sessionStorageMock.setItem('refreshToken', 'refresh-1');
    axiosMocks.post.mockResolvedValueOnce({
      data: {
        token: 'next-access',
        refreshToken: 'next-refresh',
      },
    });
    axiosMocks.apiInstance.mockResolvedValueOnce({ data: { retried: true } });

    await loadApi();
    const responseRejected = axiosMocks.responseRejectedHandlers[0];

    const originalRequest: any = { url: '/orders' };
    const result = await responseRejected({ response: { status: 401 }, config: originalRequest });

    expect(axiosMocks.post).toHaveBeenCalledWith(
      'http://localhost:5000/api/auth/refresh-token',
      { refreshToken: 'refresh-1' },
      { headers: { 'Content-Type': 'application/json' } }
    );
    expect(originalRequest._retry).toBe(true);
    expect(originalRequest.headers.Authorization).toBe('Bearer next-access');
    expect(result).toEqual({ data: { retried: true } });
    expect(sessionStorageMock.setItem).toHaveBeenCalledWith('token', 'next-access');
    expect(sessionStorageMock.setItem).toHaveBeenCalledWith('refreshToken', 'next-refresh');
  });

  itWithTimeout('uses a shared refresh promise for concurrent 401 failures', async () => {
    sessionStorageMock.setItem('refreshToken', 'refresh-2');

    let resolveRefresh: ((value: any) => void) | null = null;
    axiosMocks.post.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveRefresh = resolve;
        })
    );

    axiosMocks.apiInstance.mockResolvedValue({ data: { retried: true } });

    await loadApi();
    const responseRejected = axiosMocks.responseRejectedHandlers[0];

    const req1: any = { url: '/orders', headers: {} };
    const req2: any = { url: '/cart', headers: {} };

    const promise1 = responseRejected({ response: { status: 401 }, config: req1 });
    const promise2 = responseRejected({ response: { status: 401 }, config: req2 });

    expect(axiosMocks.post).toHaveBeenCalledTimes(1);
    expect(resolveRefresh).not.toBeNull();

    resolveRefresh?.({ data: { token: 'shared-access' } });

    await Promise.all([promise1, promise2]);

    expect(req1.headers.Authorization).toBe('Bearer shared-access');
    expect(req2.headers.Authorization).toBe('Bearer shared-access');
  });

  itWithTimeout('clears tokens when refresh request fails', async () => {
    sessionStorageMock.setItem('refreshToken', 'refresh-3');
    axiosMocks.post.mockRejectedValueOnce(new Error('refresh failed'));

    await loadApi();
    const responseRejected = axiosMocks.responseRejectedHandlers[0];
    const error = { response: { status: 401 }, config: { url: '/orders', headers: {} } };

    await expect(responseRejected(error)).rejects.toBe(error);
    expect(sessionStorageMock.removeItem).toHaveBeenCalledWith('token');
    expect(sessionStorageMock.removeItem).toHaveBeenCalledWith('refreshToken');
  });

  itWithTimeout('rejects original error when refresh response has no token', async () => {
    sessionStorageMock.setItem('refreshToken', 'refresh-4');
    axiosMocks.post.mockResolvedValueOnce({ data: { refreshToken: 'new-refresh-only' } });

    await loadApi();
    const responseRejected = axiosMocks.responseRejectedHandlers[0];
    const error = { response: { status: 401 }, config: { url: '/orders', headers: {} } };

    await expect(responseRejected(error)).rejects.toBe(error);
    expect(sessionStorageMock.setItem).not.toHaveBeenCalledWith('token', expect.anything());
  });

  itWithTimeout('clears tokens and rejects when retried request throws synchronously', async () => {
    sessionStorageMock.setItem('refreshToken', 'refresh-5');
    axiosMocks.post.mockResolvedValueOnce({ data: { token: 'next-access' } });
    const syncRetryError = new Error('sync retry failed');
    axiosMocks.apiInstance.mockImplementationOnce(() => {
      throw syncRetryError;
    });

    await loadApi();
    const responseRejected = axiosMocks.responseRejectedHandlers[0];
    const error = { response: { status: 401 }, config: { url: '/orders', headers: {} } };

    await expect(responseRejected(error)).rejects.toBe(syncRetryError);
    expect(sessionStorageMock.removeItem).toHaveBeenCalledWith('token');
    expect(sessionStorageMock.removeItem).toHaveBeenCalledWith('refreshToken');
  });

  itWithTimeout('skips refresh logic for retried or refresh-token requests', async () => {
    await loadApi();
    const responseRejected = axiosMocks.responseRejectedHandlers[0];

    const retriedError = {
      response: { status: 401 },
      config: { url: '/orders', _retry: true, headers: {} },
    };
    const refreshEndpointError = {
      response: { status: 401 },
      config: { url: '/auth/refresh-token', headers: {} },
    };

    await expect(responseRejected(retriedError)).rejects.toBe(retriedError);
    await expect(responseRejected(refreshEndpointError)).rejects.toBe(refreshEndpointError);
    expect(axiosMocks.post).not.toHaveBeenCalled();
  });
});