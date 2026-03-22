import { createRequire } from 'module';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const require = createRequire(import.meta.url);
const loggerPath = require.resolve('./logger.js');

const loadLogger = () => {
  delete require.cache[loggerPath];
  return require('./logger.js') as any;
};

describe('server logger utils', () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalLogHttp = process.env.LOG_HTTP;

  let stdoutSpy: ReturnType<typeof vi.spyOn>;
  let stderrSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    stdoutSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true as any);
    stderrSpy = vi.spyOn(process.stderr, 'write').mockImplementation(() => true as any);
    delete process.env.LOG_HTTP;
    process.env.NODE_ENV = 'test';
  });

  afterEach(() => {
    stdoutSpy.mockRestore();
    stderrSpy.mockRestore();
    process.env.NODE_ENV = originalNodeEnv;
    process.env.LOG_HTTP = originalLogHttp;
  });

  it('writes info logs to stdout with serialized object metadata', () => {
    const logger = loadLogger();

    logger.info('Request completed', { requestId: 'req-1', status: 200 });

    expect(stdoutSpy).toHaveBeenCalledTimes(1);
    expect(stderrSpy).not.toHaveBeenCalled();

    const payload = String(stdoutSpy.mock.calls[0][0]);
    expect(payload).toContain('[INFO] Request completed');
    expect(payload).toContain('"requestId":"req-1"');
    expect(payload).toContain('"status":200');
  });

  it('writes warn and error logs to stderr and supports string metadata', () => {
    const logger = loadLogger();

    logger.warn('Rate limit nearing', '50 requests left');
    logger.error('Unhandled failure', { code: 'E_FATAL' });

    expect(stderrSpy).toHaveBeenCalledTimes(2);
    const warnMessage = String(stderrSpy.mock.calls[0][0]);
    const errorMessage = String(stderrSpy.mock.calls[1][0]);

    expect(warnMessage).toContain('[WARN] Rate limit nearing 50 requests left');
    expect(errorMessage).toContain('[ERROR] Unhandled failure');
    expect(errorMessage).toContain('"code":"E_FATAL"');
  });

  it('handles unserializable metadata safely without throwing', () => {
    const logger = loadLogger();
    const circular: any = { id: 'meta-1' };
    circular.self = circular;

    logger.info('Circular meta payload', circular);

    expect(stdoutSpy).toHaveBeenCalledTimes(1);
    const message = String(stdoutSpy.mock.calls[0][0]);
    expect(message).toContain('[INFO] Circular meta payload');
  });

  it('suppresses HTTP logs in production unless LOG_HTTP is true', () => {
    const logger = loadLogger();

    process.env.NODE_ENV = 'production';
    delete process.env.LOG_HTTP;
    logger.http('GET /orders', { status: 200 });
    expect(stdoutSpy).not.toHaveBeenCalled();

    process.env.LOG_HTTP = 'true';
    logger.http('GET /orders', { status: 200 });

    expect(stdoutSpy).toHaveBeenCalledTimes(1);
    const message = String(stdoutSpy.mock.calls[0][0]);
    expect(message).toContain('[HTTP] GET /orders');
  });

  it('supports empty metadata path in serializer', () => {
    const logger = loadLogger();

    logger.info('Simple message');

    expect(stdoutSpy).toHaveBeenCalledTimes(1);
    const message = String(stdoutSpy.mock.calls[0][0]);
    expect(message).toContain('[INFO] Simple message');
  });
});