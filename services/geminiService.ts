import axios from 'axios';

type AssistantMessage = {
  role: 'user' | 'model';
  text: string;
};

const normalizeApiBaseUrl = (raw: string) => {
  let value = String(raw || '').trim();
  if (!/^https?:\/\//i.test(value)) {
    value = `https://${value.replace(/^\/+/, '')}`;
  }
  value = value.replace(/\/+$/, '');
  if (!/\/api$/i.test(value)) {
    value = `${value}/api`;
  }
  return value;
};

export const generateAssistantReply = async (messages: AssistantMessage[]): Promise<string> => {
  const base = normalizeApiBaseUrl(
    import.meta.env.VITE_API_BASE_URL || 'https://babcock-marketplace-app-production.up.railway.app/api'
  );
  try {
    const response = await axios.post<{ reply: string }>(`${base}/ai/chat`, { messages });
    return response.data.reply;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message;
      if (typeof message === 'string' && message.trim()) {
        throw new Error(message);
      }
    }

    throw error;
  }
};

export type { AssistantMessage };
