import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import AdminReports from './AdminReports';

const reportMocks = vi.hoisted(() => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
  apiDefaults: { baseURL: 'http://localhost:5000/api' },
  useStore: vi.fn(),
}));

vi.mock('../services/api', () => ({
  default: {
    get: reportMocks.apiGet,
    post: reportMocks.apiPost,
    defaults: reportMocks.apiDefaults,
  },
}));

vi.mock('../contexts/StoreContext', () => ({
  useStore: () => reportMocks.useStore(),
}));

describe('AdminReports page', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    vi.clearAllMocks();
    reportMocks.apiDefaults.baseURL = 'http://localhost:5000/api';
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: {
        href: '',
      },
    });
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllEnvs();
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation,
    });
  });

  it('returns null for non-admin users', () => {
    reportMocks.useStore.mockReturnValue({ user: { role: 'user' } });

    const { container } = render(<AdminReports />);

    expect(container.innerHTML).toBe('');
    expect(reportMocks.apiGet).not.toHaveBeenCalled();
  });

  it('loads report data and sends summaries as admin', async () => {
    reportMocks.useStore.mockReturnValue({ user: { role: 'admin' } });

    reportMocks.apiGet.mockResolvedValueOnce({
      data: {
        salesHistory: [{ totalAmount: 1200 }, { totalAmount: 800 }],
        topSellingProducts: [{ productId: 'p1', title: 'Math Book', unitsSold: 5, revenue: 4000 }],
        lowStockItems: [{ productId: 'p2' }],
        dailyTrend: [{ _id: { year: 2026, month: 3, day: 4 }, orders: 2, totalRevenue: 2000 }],
      },
    });

    reportMocks.apiPost
      .mockResolvedValueOnce({ data: { message: 'Daily summary sent' } })
      .mockResolvedValueOnce({ data: { message: 'Weekly summary sent' } });

    render(<AdminReports />);

    expect(screen.getByText('Sales Reports')).toBeTruthy();

    expect(await screen.findByText('₦2,000')).toBeTruthy();
    expect(reportMocks.apiGet).toHaveBeenCalledWith('/admin/reports/sales');
    expect(screen.getByText(/Math Book/)).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Send Daily Summary' }));
    expect(await screen.findByText('Daily summary sent')).toBeTruthy();
    expect(reportMocks.apiPost).toHaveBeenCalledWith('/admin/reports/sales/notify', { period: 'daily' });

    fireEvent.click(screen.getByRole('button', { name: 'Send Weekly Summary' }));
    expect(await screen.findByText('Weekly summary sent')).toBeTruthy();
    expect(reportMocks.apiPost).toHaveBeenCalledWith('/admin/reports/sales/notify', { period: 'weekly' });
  }, 15000);

  it('supports export buttons and fallback summary values', async () => {
    reportMocks.useStore.mockReturnValue({ user: { role: 'admin' } });

    reportMocks.apiGet.mockResolvedValueOnce({
      data: {
        salesHistory: [{}, { totalAmount: 0 }],
        topSellingProducts: [{ productId: 'p9', unitsSold: 1, revenue: undefined }],
        lowStockItems: [],
        dailyTrend: [{ _id: { year: 2026, month: 3, day: 5 }, orders: 1 }],
      },
    });

    reportMocks.apiPost.mockResolvedValueOnce({ data: {} });

    render(<AdminReports />);

    expect(await screen.findByText(/Unknown product/)).toBeTruthy();
    expect(screen.getByText('₦0')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Export CSV' }));
    expect(window.location.href).toContain('/admin/reports/sales/export');

    fireEvent.click(screen.getByRole('button', { name: 'Export PDF' }));
    expect(window.location.href).toContain('/admin/reports/sales/export-pdf');

    fireEvent.click(screen.getByRole('button', { name: 'Send Daily Summary' }));

    await waitFor(() => {
      expect(reportMocks.apiPost).toHaveBeenCalledWith('/admin/reports/sales/notify', { period: 'daily' });
    });

    expect(await screen.findByText('Summary sent.')).toBeTruthy();
  });

  it('uses configured API base URL for export links', async () => {
    reportMocks.apiDefaults.baseURL = 'https://api.babcock.test/v2';
    reportMocks.useStore.mockReturnValue({ user: { role: 'admin' } });
    reportMocks.apiGet.mockResolvedValueOnce({
      data: {
        salesHistory: [],
        topSellingProducts: [],
        lowStockItems: [],
        dailyTrend: [],
      },
    });

    render(<AdminReports />);
    await screen.findByText('Sales Reports');

    fireEvent.click(screen.getByRole('button', { name: 'Export CSV' }));
    expect(window.location.href).toBe('https://api.babcock.test/v2/admin/reports/sales/export');

    fireEvent.click(screen.getByRole('button', { name: 'Export PDF' }));
    expect(window.location.href).toBe('https://api.babcock.test/v2/admin/reports/sales/export-pdf');
  });

  it('falls back to localhost API base URL when API defaults are missing', async () => {
    reportMocks.apiDefaults.baseURL = undefined as any;
    reportMocks.useStore.mockReturnValue({ user: { role: 'admin' } });
    reportMocks.apiGet.mockResolvedValueOnce({
      data: {
        salesHistory: [],
        topSellingProducts: [],
        lowStockItems: [],
        dailyTrend: [],
      },
    });

    render(<AdminReports />);
    await screen.findByText('Sales Reports');

    fireEvent.click(screen.getByRole('button', { name: 'Export CSV' }));
    expect(window.location.href).toBe('http://localhost:5000/api/admin/reports/sales/export');
  });
});