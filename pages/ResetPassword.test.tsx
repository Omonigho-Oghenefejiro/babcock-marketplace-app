import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ResetPassword from './ResetPassword';

const resetMocks = vi.hoisted(() => ({
  apiPost: vi.fn(),
  navigate: vi.fn(),
}));

vi.mock('../services/api', () => ({
  default: {
    post: resetMocks.apiPost,
  },
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => resetMocks.navigate,
  };
});

describe('ResetPassword page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('submits token and password then redirects on success', async () => {
    resetMocks.apiPost.mockResolvedValueOnce({ data: { ok: true } });

    render(
      <MemoryRouter>
        <ResetPassword />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Reset token'), {
      target: { value: 'token-1' },
    });
    fireEvent.change(screen.getByPlaceholderText('New password'), {
      target: { value: 'newpassword' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Reset Password' }));

    await waitFor(() => {
      expect(resetMocks.apiPost).toHaveBeenCalledWith('/auth/reset-password', {
        token: 'token-1',
        newPassword: 'newpassword',
      });
    });

    expect(screen.getByText('Password reset successful. Redirecting to login...')).toBeTruthy();
    await waitFor(() => {
      expect(resetMocks.navigate).toHaveBeenCalledWith('/login');
    }, { timeout: 2000 });
  });

  it('shows fallback error when request fails', async () => {
    resetMocks.apiPost.mockRejectedValueOnce({});

    render(
      <MemoryRouter>
        <ResetPassword />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Reset token'), {
      target: { value: 'token-2' },
    });
    fireEvent.change(screen.getByPlaceholderText('New password'), {
      target: { value: 'newpassword' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Reset Password' }));

    expect(await screen.findByText('Password reset failed.')).toBeTruthy();
  });

  it('shows API-provided error message when available', async () => {
    resetMocks.apiPost.mockRejectedValueOnce({ response: { data: { message: 'Reset token expired' } } });

    render(
      <MemoryRouter>
        <ResetPassword />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Reset token'), {
      target: { value: 'token-expired' },
    });
    fireEvent.change(screen.getByPlaceholderText('New password'), {
      target: { value: 'newpassword' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Reset Password' }));

    expect(await screen.findByText('Reset token expired')).toBeTruthy();
  });
});