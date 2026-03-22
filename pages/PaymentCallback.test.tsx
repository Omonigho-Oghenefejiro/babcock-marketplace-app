import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import PaymentCallback from './PaymentCallback';

const paymentMocks = vi.hoisted(() => ({
  apiGet: vi.fn(),
  clearCart: vi.fn(),
}));

vi.mock('../services/api', () => ({
  default: {
    get: paymentMocks.apiGet,
  },
}));

vi.mock('../contexts/StoreContext', () => ({
  useStore: () => ({
    clearCart: paymentMocks.clearCart,
  }),
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

const renderPage = (entry: string) => {
  render(
    <MemoryRouter initialEntries={[entry]}>
      <Routes>
        <Route path="/payment/callback" element={<PaymentCallback />} />
      </Routes>
    </MemoryRouter>
  );
};

describe('PaymentCallback page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('verifies payment successfully and clears cart', async () => {
    paymentMocks.apiGet.mockResolvedValueOnce({
      data: {
        paymentStatus: 'completed',
        message: 'Paid and confirmed',
      },
    });
    paymentMocks.clearCart.mockResolvedValueOnce(undefined);

    renderPage('/payment/callback?reference=ref-abc');

    expect(screen.getByText('Verifying Payment...')).toBeTruthy();

    await waitFor(() => {
      expect(paymentMocks.apiGet).toHaveBeenCalledWith('/payments/verify/ref-abc');
    });

    await waitFor(() => {
      expect(paymentMocks.clearCart).toHaveBeenCalled();
    });

    expect(await screen.findByText('Payment Successful!')).toBeTruthy();
    expect(screen.getByText('Paid and confirmed')).toBeTruthy();
  });

  it('shows failed status when verification does not complete', async () => {
    paymentMocks.apiGet.mockResolvedValueOnce({
      data: {
        paymentStatus: 'pending',
      },
    });

    renderPage('/payment/callback?reference=ref-failed');

    expect(await screen.findByText('Payment Failed')).toBeTruthy();
  });

  it('treats provider success status as completed', async () => {
    paymentMocks.apiGet.mockResolvedValueOnce({
      data: {
        status: 'success',
      },
    });
    paymentMocks.clearCart.mockResolvedValueOnce(undefined);

    renderPage('/payment/callback?reference=ref-success-status');

    expect(await screen.findByText('Payment Successful!')).toBeTruthy();
    expect(paymentMocks.clearCart).toHaveBeenCalled();
  });

  it('does not call verification endpoint when reference is absent', () => {
    renderPage('/payment/callback');

    expect(screen.getByText('Verifying Payment...')).toBeTruthy();
    expect(paymentMocks.apiGet).not.toHaveBeenCalled();
    expect(paymentMocks.clearCart).not.toHaveBeenCalled();
  });

  it('handles verification request errors', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    paymentMocks.apiGet.mockRejectedValueOnce(new Error('network down'));

    renderPage('/payment/callback?reference=ref-error');

    expect(await screen.findByText('Payment Failed')).toBeTruthy();
    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });
});