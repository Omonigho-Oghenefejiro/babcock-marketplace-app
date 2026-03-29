import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import AIAssistant from './AIAssistant';

const assistantMocks = vi.hoisted(() => ({
  generateAssistantReply: vi.fn(),
}));

vi.mock('../services/geminiService', () => ({
  generateAssistantReply: assistantMocks.generateAssistantReply,
}));

const renderAssistant = (path = '/shop') => {
  render(
    <MemoryRouter initialEntries={[path]}>
      <AIAssistant />
    </MemoryRouter>
  );
};

describe('AIAssistant', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllEnvs();
  });

  it('opens and displays category menu on button click', () => {
    renderAssistant();
    fireEvent.click(screen.getByLabelText('Open assistant'));
    expect(screen.getByText('🛒 Buying')).toBeTruthy();
    expect(screen.getByText('📦 Selling')).toBeTruthy();
  });

  it('displays questions when category is selected and handles responses', async () => {
    assistantMocks.generateAssistantReply.mockResolvedValueOnce('Here is how to buy...');

    renderAssistant('/shop');
    fireEvent.click(screen.getByLabelText('Open assistant'));
    fireEvent.click(screen.getByText('🛒 Buying'));

    expect(screen.getByText('How do I buy an item?')).toBeTruthy();
    
    fireEvent.click(screen.getByText('How do I buy an item?'));

    await waitFor(() => {
      expect(assistantMocks.generateAssistantReply).toHaveBeenCalledTimes(1);
    });

    expect(await screen.findByText('Here is how to buy...')).toBeTruthy();
  });

  it('shows backend configuration errors directly', async () => {
    assistantMocks.generateAssistantReply.mockRejectedValueOnce(
      new Error('AI service configuration error. Contact the administrator.')
    );

    renderAssistant();
    fireEvent.click(screen.getByLabelText('Open assistant'));
    fireEvent.click(screen.getByText('🛒 Buying'));
    fireEvent.click(screen.getByText('How do I buy an item?'));

    expect(await screen.findByText('AI service configuration error. Contact the administrator.')).toBeTruthy();
  });

  it('shows quota errors and supports back navigation', async () => {
    assistantMocks.generateAssistantReply
      .mockRejectedValueOnce(new Error('AI assistant is temporarily busy. Please try again in a moment.'));

    renderAssistant('/shop');
    fireEvent.click(screen.getByLabelText('Open assistant'));
    fireEvent.click(screen.getByText('📦 Selling'));
    fireEvent.click(screen.getByText('How do I list an item for sale?'));

    expect(await screen.findByText('AI assistant is temporarily busy. Please try again in a moment.')).toBeTruthy();

    fireEvent.click(screen.getByLabelText('Go back'));
    expect(screen.getByText('📦 Selling')).toBeTruthy();
  });

  it('asks another question after first response', async () => {
    assistantMocks.generateAssistantReply
      .mockResolvedValueOnce('First response')
      .mockResolvedValueOnce('Second response');

    renderAssistant('/shop');
    fireEvent.click(screen.getByLabelText('Open assistant'));
    fireEvent.click(screen.getByText('💳 Payments'));
    fireEvent.click(screen.getByText('What payment methods are accepted?'));

    await waitFor(() => {
      expect(assistantMocks.generateAssistantReply).toHaveBeenCalledTimes(1);
    });

    fireEvent.click(screen.getByText('Ask another question'));
    fireEvent.click(screen.getByText('Is my payment information secure?'));

    await waitFor(() => {
      expect(assistantMocks.generateAssistantReply).toHaveBeenCalledTimes(2);
    });

    expect(await screen.findByText('Second response')).toBeTruthy();
  });

  it('uses default fallback text when error has no message', async () => {
    assistantMocks.generateAssistantReply.mockRejectedValueOnce({});

    renderAssistant();
    fireEvent.click(screen.getByLabelText('Open assistant'));
    fireEvent.click(screen.getByText('👤 My Account'));
    fireEvent.click(screen.getByText('How do I verify my email?'));

    expect(await screen.findByText('Failed to get a response. Please try again.')).toBeTruthy();
  });

  it('closes assistant and returns to home on reopen', async () => {
    assistantMocks.generateAssistantReply.mockResolvedValueOnce('Response');

    renderAssistant('/shop');
    fireEvent.click(screen.getByLabelText('Open assistant'));
    fireEvent.click(screen.getByText('📋 Orders'));
    fireEvent.click(screen.getByText('How do I track my order?'));

    await waitFor(() => {
      expect(assistantMocks.generateAssistantReply).toHaveBeenCalledTimes(1);
    });

    fireEvent.click(screen.getByLabelText('Close assistant'));
    await waitFor(() => {
      expect(screen.queryByText('Ask another question')).toBeNull();
    }, { timeout: 1000 });

    fireEvent.click(screen.getByLabelText('Open assistant'));
    await waitFor(() => {
      expect(screen.getByText('🛒 Buying')).toBeTruthy();
    }, { timeout: 1000 });
  });

  it('uses message-page bottom offset for floating button', () => {
    renderAssistant('/messages');

    const container = screen.getByLabelText('Open assistant').parentElement as HTMLElement;
    expect(container.style.bottom).toBe('96px');
  });
});