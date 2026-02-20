import { GoogleGenerativeAI } from '@google/generative-ai';

type AssistantMessage = {
  role: 'user' | 'model';
  text: string;
};

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

const buildHistory = (messages: AssistantMessage[]) => {
  const firstUserIndex = messages.findIndex((message) => message.role === 'user');
  const usable = firstUserIndex >= 0 ? messages.slice(firstUserIndex) : [];
  return usable.map((message) => ({
    role: message.role,
    parts: [{ text: message.text }],
  }));
};

export const generateAssistantReply = async (messages: AssistantMessage[]) => {
  if (!apiKey) {
    throw new Error('Missing VITE_GEMINI_API_KEY');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const history = buildHistory(messages.slice(0, -1));
  const latest = messages[messages.length - 1];

  const chat = model.startChat({ history });
  const result = await chat.sendMessage(latest.text);
  return result.response.text();
};

export type { AssistantMessage };
