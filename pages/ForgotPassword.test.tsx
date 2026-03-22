import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ForgotPassword from './ForgotPassword';

const forgotMocks = vi.hoisted(() => ({
  apiPost: vi.fn(),
}));

vi.mock('../services/api', () => ({
  default: {
    post: forgotMocks.apiPost,
  },
}));

describe('ForgotPassword page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('shows validation for missing email on step 1', async () => {
    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );

    const form = screen.getByRole('button', { name: 'Continue' }).closest('form');
    expect(form).toBeTruthy();
    fireEvent.submit(form as HTMLFormElement);

    expect(await screen.findByText('Please enter your email.')).toBeTruthy();
    expect(forgotMocks.apiPost).not.toHaveBeenCalled();
  });

  it('moves to step 2 after successful continue call with normalized email', async () => {
    forgotMocks.apiPost.mockResolvedValueOnce({ data: { ok: true } });

    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('you@babcock.edu.ng'), {
      target: { value: '  USER@BABCOCK.EDU.NG ' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

    await waitFor(() => {
      expect(forgotMocks.apiPost).toHaveBeenCalledWith('/auth/forgot-password', { email: 'user@babcock.edu.ng' });
    });

    expect(await screen.findByText(/Now create your new password/i)).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Reset Password' })).toBeTruthy();
  });

  it('validates reset step and handles successful reset', async () => {
    forgotMocks.apiPost
      .mockResolvedValueOnce({ data: { ok: true } })
      .mockResolvedValueOnce({ data: { message: 'Reset successful from API' } });

    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('you@babcock.edu.ng'), {
      target: { value: 'test@babcock.edu.ng' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    await screen.findByRole('button', { name: 'Reset Password' });

    fireEvent.change(screen.getByPlaceholderText('New password'), {
      target: { value: '12345' },
    });
    fireEvent.change(screen.getByPlaceholderText('Confirm new password'), {
      target: { value: '12345' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Reset Password' }));
    expect(await screen.findByText('Password must be at least 6 characters.')).toBeTruthy();

    fireEvent.change(screen.getByPlaceholderText('New password'), {
      target: { value: '123456' },
    });
    fireEvent.change(screen.getByPlaceholderText('Confirm new password'), {
      target: { value: '654321' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Reset Password' }));
    expect(await screen.findByText('Passwords do not match.')).toBeTruthy();

    fireEvent.change(screen.getByPlaceholderText('Confirm new password'), {
      target: { value: '123456' },
    });
    fireEvent.change(screen.getByPlaceholderText('Enter code'), {
      target: { value: 'WRONG' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Reset Password' }));
    expect(await screen.findByText('Please enter the human verification code correctly.')).toBeTruthy();

    const code = screen.getByText(/Human Check:/).querySelector('strong')?.textContent;
    expect(code).toBeTruthy();

    fireEvent.change(screen.getByPlaceholderText('Enter code'), {
      target: { value: code },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Reset Password' }));

    await waitFor(() => {
      expect(forgotMocks.apiPost).toHaveBeenCalledWith('/auth/reset-password-direct', {
        email: 'test@babcock.edu.ng',
        newPassword: '123456',
      });
    });

    expect(await screen.findByText('Reset successful from API')).toBeTruthy();
  });

  it('shows continue-step API error and supports human-code refresh', async () => {
    forgotMocks.apiPost.mockRejectedValueOnce({ response: { data: { message: 'Email not found' } } });

    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('you@babcock.edu.ng'), {
      target: { value: 'missing@babcock.edu.ng' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

    expect(await screen.findByText('Email not found')).toBeTruthy();
  });

  it('shows fallback continue error when API has no message', async () => {
    forgotMocks.apiPost.mockRejectedValueOnce({});

    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('you@babcock.edu.ng'), {
      target: { value: 'fallback-error@babcock.edu.ng' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

    expect(await screen.findByText('Unable to continue reset flow.')).toBeTruthy();
  });

  it('uses reset fallback message when API does not provide one', async () => {
    forgotMocks.apiPost
      .mockResolvedValueOnce({ data: { ok: true } })
      .mockResolvedValueOnce({ data: {} });

    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('you@babcock.edu.ng'), {
      target: { value: 'fallback@babcock.edu.ng' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

    await screen.findByText(/Now create your new password/i);

    const initialCode = screen.getByText(/Human Check:/).querySelector('strong')?.textContent;

    fireEvent.click(screen.getByRole('button', { name: 'New' }));

    const refreshedCode = screen.getByText(/Human Check:/).querySelector('strong')?.textContent;
    expect(refreshedCode).toBeTruthy();
    expect(refreshedCode).not.toBe(initialCode);

    fireEvent.change(screen.getByPlaceholderText('New password'), {
      target: { value: '123456' },
    });
    fireEvent.change(screen.getByPlaceholderText('Confirm new password'), {
      target: { value: '123456' },
    });
    fireEvent.change(screen.getByPlaceholderText('Enter code'), {
      target: { value: refreshedCode },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Reset Password' }));

    expect(await screen.findByText('Password reset successful. You can now login.')).toBeTruthy();
  });

  it('shows reset-step API error when reset request fails', async () => {
    forgotMocks.apiPost
      .mockResolvedValueOnce({ data: { ok: true } })
      .mockRejectedValueOnce({ response: { data: { message: 'No account found for this email' } } });

    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('you@babcock.edu.ng'), {
      target: { value: 'missing@babcock.edu.ng' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    await screen.findByText(/Now create your new password/i);

    const code = screen.getByText(/Human Check:/).querySelector('strong')?.textContent;
    expect(code).toBeTruthy();

    fireEvent.change(screen.getByPlaceholderText('New password'), {
      target: { value: '123456' },
    });
    fireEvent.change(screen.getByPlaceholderText('Confirm new password'), {
      target: { value: '123456' },
    });
    fireEvent.change(screen.getByPlaceholderText('Enter code'), {
      target: { value: code },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Reset Password' }));

    expect(await screen.findByText('No account found for this email')).toBeTruthy();
  });
});