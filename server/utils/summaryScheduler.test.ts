import { createRequire } from 'module';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const require = createRequire(import.meta.url);
const summarySchedulerPath = require.resolve('./summaryScheduler.js');

const loadSummaryScheduler = () => {
  delete require.cache[summarySchedulerPath];
  return require('./summaryScheduler.js') as {
    sendSalesSummary: (period?: 'daily' | 'weekly') => Promise<void>;
    startSummaryScheduler: () => void;
  };
};

describe('server summaryScheduler utils', () => {
  let Order: any;
  let User: any;
  let notificationService: any;
  let logger: any;

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    Order = require('../models/Order.js');
    User = require('../models/User.js');
    notificationService = require('./notificationService.js');
    logger = require('./logger.js');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('sends daily summary email payloads to all admins', async () => {
    const orderFindSpy = vi
      .spyOn(Order, 'find')
      .mockResolvedValue([{ totalAmount: 1200 }, { totalAmount: 800 }, {}] as any);
    const selectSpy = vi.fn().mockResolvedValue([{ email: 'admin1@babcock.edu.ng' }, { email: 'admin2@babcock.edu.ng' }]);
    vi.spyOn(User, 'find').mockReturnValue({ select: selectSpy } as any);
    const sendEmailSpy = vi.spyOn(notificationService, 'sendEmail').mockResolvedValue({ sent: true } as any);
    const infoSpy = vi.spyOn(logger, 'info').mockImplementation(() => undefined);

    const { sendSalesSummary } = loadSummaryScheduler();
    await sendSalesSummary('daily');

    expect(orderFindSpy).toHaveBeenCalledWith({
      paymentStatus: 'completed',
      createdAt: { $gte: expect.any(Date) },
    });
    expect(selectSpy).toHaveBeenCalledWith('email');
    expect(sendEmailSpy).toHaveBeenCalledTimes(2);
    expect(sendEmailSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'admin1@babcock.edu.ng',
        subject: 'Daily Sales Summary',
        text: expect.stringContaining('Orders: 3'),
      })
    );
    expect(infoSpy).toHaveBeenCalledWith('Sales summary notifications sent', {
      period: 'daily',
      recipients: 2,
      orders: 3,
    });
  });

  it('uses a 7-day lookback for weekly summaries', async () => {
    const orderFindSpy = vi.spyOn(Order, 'find').mockResolvedValue([] as any);
    const selectSpy = vi.fn().mockResolvedValue([{ email: 'admin@babcock.edu.ng' }]);
    vi.spyOn(User, 'find').mockReturnValue({ select: selectSpy } as any);
    const sendEmailSpy = vi.spyOn(notificationService, 'sendEmail').mockResolvedValue({ sent: true } as any);
    vi.spyOn(logger, 'info').mockImplementation(() => undefined);

    const { sendSalesSummary } = loadSummaryScheduler();
    await sendSalesSummary('weekly');

    const query = orderFindSpy.mock.calls[0][0];
    const since = query.createdAt.$gte as Date;
    const diffDays = (Date.now() - since.getTime()) / (24 * 60 * 60 * 1000);

    expect(diffDays).toBeGreaterThan(6.9);
    expect(diffDays).toBeLessThan(7.1);
    expect(sendEmailSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: 'Weekly Sales Summary',
      })
    );
  });

  it('defaults to daily period when no period argument is provided', async () => {
    vi.spyOn(Order, 'find').mockResolvedValue([] as any);
    const selectSpy = vi.fn().mockResolvedValue([{ email: 'admin@babcock.edu.ng' }]);
    vi.spyOn(User, 'find').mockReturnValue({ select: selectSpy } as any);
    const sendEmailSpy = vi.spyOn(notificationService, 'sendEmail').mockResolvedValue({ sent: true } as any);

    const { sendSalesSummary } = loadSummaryScheduler();
    await sendSalesSummary();

    expect(sendEmailSpy).toHaveBeenCalledWith(expect.objectContaining({ subject: 'Daily Sales Summary' }));
  });

  it('registers scheduler intervals for daily and weekly jobs', () => {
    const setIntervalSpy = vi
      .spyOn(global, 'setInterval')
      .mockImplementation((() => 1 as any) as any);

    const { startSummaryScheduler } = loadSummaryScheduler();
    startSummaryScheduler();

    expect(setIntervalSpy).toHaveBeenCalledTimes(2);
    expect(setIntervalSpy.mock.calls[0][1]).toBe(24 * 60 * 60 * 1000);
    expect(setIntervalSpy.mock.calls[1][1]).toBe(7 * 24 * 60 * 60 * 1000);
  });

  it('logs daily and weekly scheduler callback failures', async () => {
    const callbacks: Array<() => void> = [];
    vi.spyOn(global, 'setInterval').mockImplementation(((cb: () => void) => {
      callbacks.push(cb);
      return 1 as any;
    }) as any);

    vi.spyOn(Order, 'find').mockResolvedValue([] as any);
    vi.spyOn(User, 'find').mockReturnValue({
      select: vi.fn().mockResolvedValue([{ email: 'admin@babcock.edu.ng' }]),
    } as any);
    vi.spyOn(notificationService, 'sendEmail').mockRejectedValue(new Error('mailer offline'));
    const errorSpy = vi.spyOn(logger, 'error').mockImplementation(() => undefined);

    const { startSummaryScheduler } = loadSummaryScheduler();
    startSummaryScheduler();

    callbacks[0]();
    callbacks[1]();

    await new Promise((resolve) => setTimeout(resolve, 0));
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(errorSpy).toHaveBeenCalledWith('Daily summary failed', { error: 'mailer offline' });
    expect(errorSpy).toHaveBeenCalledWith('Weekly summary failed', { error: 'mailer offline' });
  });
});