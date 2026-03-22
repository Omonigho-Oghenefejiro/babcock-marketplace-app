import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ToastProvider, useToast } from './ToastContext';

const ToastConsumer = () => {
  const { addToast } = useToast();

  return (
    <div>
      <button onClick={() => addToast('Saved successfully')}>Add success</button>
      <button onClick={() => addToast('Action failed', 'error')}>Add error</button>
      <button onClick={() => addToast('Heads up', 'info')}>Add info</button>
    </div>
  );
};

describe('ToastContext', () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('throws when useToast is used outside provider', () => {
    const BrokenConsumer = () => {
      useToast();
      return null;
    };

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    try {
      expect(() => render(<BrokenConsumer />)).toThrowError('useToast must be used within ToastProvider');
    } finally {
      consoleErrorSpy.mockRestore();
    }
  });

  it('renders success, error and info toasts and supports manual close', async () => {
    render(
      <ToastProvider>
        <ToastConsumer />
      </ToastProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Add success' }));
    fireEvent.click(screen.getByRole('button', { name: 'Add error' }));
    fireEvent.click(screen.getByRole('button', { name: 'Add info' }));

    expect(await screen.findByText('Saved successfully')).toBeTruthy();
    expect(screen.getByText('Action failed')).toBeTruthy();
    expect(screen.getByText('Heads up')).toBeTruthy();

    const closeButtons = screen
      .getAllByRole('button')
      .filter((button) => !button.textContent?.trim());

    expect(closeButtons.length).toBeGreaterThan(0);
    fireEvent.click(closeButtons[0]);

    await waitFor(() => {
      expect(screen.queryByText('Saved successfully')).toBeNull();
    });
  });

  it('auto-removes toasts after 3 seconds', async () => {
    vi.useFakeTimers();

    render(
      <ToastProvider>
        <ToastConsumer />
      </ToastProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Add info' }));
    expect(screen.getByText('Heads up')).toBeTruthy();

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(screen.queryByText('Heads up')).toBeNull();
  });
});