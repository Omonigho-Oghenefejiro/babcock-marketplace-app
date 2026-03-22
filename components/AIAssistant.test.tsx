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

  it('keeps chat input enabled without a frontend Gemini key', () => {
    renderAssistant();
    fireEvent.click(screen.getByLabelText('Open assistant'));

    const input = screen.getByPlaceholderText('Ask about listings, pricing, or categories...') as HTMLInputElement;
    const sendButton = screen.getByLabelText('Send message') as HTMLButtonElement;

    expect(input.disabled).toBe(false);
    expect(sendButton.disabled).toBe(false);
  });

  it('sends user message and displays assistant response', async () => {
    assistantMocks.generateAssistantReply.mockResolvedValueOnce('Assistant response');

    renderAssistant('/shop');
    fireEvent.click(screen.getByLabelText('Open assistant'));

    fireEvent.change(screen.getByPlaceholderText('Ask about listings, pricing, or categories...'), {
      target: { value: 'How much is this item?' },
    });
    fireEvent.click(screen.getByLabelText('Send message'));

    expect(await screen.findByText('How much is this item?')).toBeTruthy();

    await waitFor(() => {
      expect(assistantMocks.generateAssistantReply).toHaveBeenCalledTimes(1);
    });

    expect(await screen.findByText('Assistant response')).toBeTruthy();
  });

  it('shows backend configuration errors directly', async () => {
    assistantMocks.generateAssistantReply.mockRejectedValueOnce(
      new Error('AI service configuration error. Contact the administrator.')
    );

    renderAssistant();
    fireEvent.click(screen.getByLabelText('Open assistant'));

    fireEvent.change(screen.getByPlaceholderText('Ask about listings, pricing, or categories...'), {
      target: { value: 'Hello' },
    });
    fireEvent.click(screen.getByLabelText('Send message'));

    expect(await screen.findByText('AI service configuration error. Contact the administrator.')).toBeTruthy();
  });

  it('shows quota errors and supports enter-key send flow', async () => {
    assistantMocks.generateAssistantReply
      .mockRejectedValueOnce(new Error('AI assistant is temporarily busy. Please try again in a moment.'))
      .mockResolvedValueOnce('Sent with Enter');

    renderAssistant('/shop');
    fireEvent.click(screen.getByLabelText('Open assistant'));

    const input = screen.getByPlaceholderText('Ask about listings, pricing, or categories...');

    fireEvent.change(input, { target: { value: 'Need pricing details' } });
    fireEvent.click(screen.getByLabelText('Send message'));

    expect(await screen.findByText('AI assistant is temporarily busy. Please try again in a moment.')).toBeTruthy();

    fireEvent.change(input, { target: { value: 'hello from enter' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(await screen.findByText('Sent with Enter')).toBeTruthy();
  });

  it('ignores empty messages and blocks duplicate sends while loading', async () => {
    let resolveReply: ((value: string) => void) | undefined;
    const pendingReply = new Promise<string>((resolve) => {
      resolveReply = resolve;
    });
    assistantMocks.generateAssistantReply.mockReturnValueOnce(pendingReply);

    renderAssistant('/shop');
    fireEvent.click(screen.getByLabelText('Open assistant'));

    const input = screen.getByPlaceholderText('Ask about listings, pricing, or categories...');
    const sendButton = screen.getByLabelText('Send message') as HTMLButtonElement;

    fireEvent.click(sendButton);
    expect(assistantMocks.generateAssistantReply).not.toHaveBeenCalled();

    fireEvent.change(input, { target: { value: 'first message' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(assistantMocks.generateAssistantReply).toHaveBeenCalledTimes(1);
    });

    expect(sendButton.disabled).toBe(true);

    fireEvent.change(input, { target: { value: 'second message while loading' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(assistantMocks.generateAssistantReply).toHaveBeenCalledTimes(1);

    resolveReply?.('Loaded reply');
    expect(await screen.findByText('Loaded reply')).toBeTruthy();
  });

  it('uses default fallback text when error has no message', async () => {
    assistantMocks.generateAssistantReply.mockRejectedValueOnce({});

    renderAssistant();
    fireEvent.click(screen.getByLabelText('Open assistant'));

    fireEvent.change(screen.getByPlaceholderText('Ask about listings, pricing, or categories...'), {
      target: { value: 'Hello fallback' },
    });
    fireEvent.click(screen.getByLabelText('Send message'));

    expect(await screen.findByText('Failed to get a response.')).toBeTruthy();
  });

  it('handles generic errors and ignores shift-enter submission', async () => {
    assistantMocks.generateAssistantReply.mockRejectedValueOnce(new Error('service unavailable'));

    renderAssistant('/shop');
    fireEvent.click(screen.getByLabelText('Open assistant'));

    const input = screen.getByPlaceholderText('Ask about listings, pricing, or categories...');
    fireEvent.change(input, { target: { value: 'hello' } });
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: true });

    expect(assistantMocks.generateAssistantReply).not.toHaveBeenCalled();

    fireEvent.keyDown(input, { key: 'Enter' });
    expect(await screen.findByText('service unavailable')).toBeTruthy();

    fireEvent.click(screen.getByLabelText('Close assistant'));
    expect(screen.queryByLabelText('Close assistant')).toBeNull();
  });

  it('uses message-page bottom offset for floating button', () => {
    renderAssistant('/messages');

    const container = screen.getByLabelText('Open assistant').parentElement as HTMLElement;
    expect(container.style.bottom).toBe('96px');
  });
});