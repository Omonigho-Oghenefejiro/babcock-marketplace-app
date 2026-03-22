import axios from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('axios');

const mockedAxios = vi.mocked(axios);

const loadService = async () => import('./geminiService');

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('generateAssistantReply', () => {
  it('posts messages to the backend AI route and returns the reply', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: { reply: 'assistant reply' },
    } as any);

    const { generateAssistantReply } = await loadService();

    const result = await generateAssistantReply([
      { role: 'model', text: 'system welcome' },
      { role: 'user', text: 'first question' },
      { role: 'model', text: 'first answer' },
      { role: 'user', text: 'latest question' },
    ]);

    expect(result).toBe('assistant reply');
    expect(mockedAxios.post).toHaveBeenCalledWith('http://localhost:5000/api/ai/chat', {
      messages: [
        { role: 'model', text: 'system welcome' },
        { role: 'user', text: 'first question' },
        { role: 'model', text: 'first answer' },
        { role: 'user', text: 'latest question' },
      ],
    });
  });

  it('uses VITE_API_BASE_URL when provided', async () => {
    vi.stubEnv('VITE_API_BASE_URL', 'https://example.com/custom-api');
    mockedAxios.post.mockResolvedValueOnce({ data: { reply: 'configured' } } as any);

    const { generateAssistantReply } = await loadService();
    const result = await generateAssistantReply([{ role: 'user', text: 'hello' }]);

    expect(result).toBe('configured');
    expect(mockedAxios.post).toHaveBeenCalledWith('https://example.com/custom-api/ai/chat', {
      messages: [{ role: 'user', text: 'hello' }],
    });
  });

  it('maps backend error payload messages to thrown errors', async () => {
    const axiosError = {
      response: {
        data: {
          message: 'AI service is not configured on this server.',
        },
      },
    };
    mockedAxios.post.mockRejectedValueOnce(axiosError);
    mockedAxios.isAxiosError.mockReturnValueOnce(true);

    const { generateAssistantReply } = await loadService();

    await expect(generateAssistantReply([{ role: 'user', text: 'hello' }])).rejects.toThrow(
      'AI service is not configured on this server.'
    );
  });

  it('rethrows non-Axios errors unchanged', async () => {
    const networkError = new Error('socket hang up');
    mockedAxios.post.mockRejectedValueOnce(networkError);
    mockedAxios.isAxiosError.mockReturnValueOnce(false);

    const { generateAssistantReply } = await loadService();

    await expect(generateAssistantReply([{ role: 'user', text: 'hello' }])).rejects.toBe(networkError);
  });
});