const express = require('express');

const router = express.Router();

const MODEL_CANDIDATES = [
  'gemini-2.5-flash-lite',  // Fastest & lightest — try first
  'gemini-2.5-flash',       // Slightly heavier but still fast
  'gemini-2.0-flash',       // Deprecated fallback
];

const SYSTEM_INSTRUCTION = `You are a helpful AI assistant for Babcock Campus Marketplace, 
a platform where Babcock University students buy and sell products on campus. 
Help users with questions about listings, pricing, product categories, how to post items, 
how to contact sellers, order tracking, and general marketplace usage. 
Be friendly, concise, and specific to the campus marketplace context. 
If a question is unrelated to the marketplace, politely redirect the conversation.
Always reply in plain text only. Do not use Markdown formatting symbols such as **, *, _, #, -, bullets, numbered lists, or code fences.`;

const sanitizeAssistantReply = (text) => {
  const source = String(text || '');

  return source
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

const parseRetryDelaySeconds = (message) => {
  const directMatch = String(message || '').match(/retry in\s+([0-9]+(?:\.[0-9]+)?)s/i);
  if (directMatch?.[1]) return Math.ceil(Number(directMatch[1]));
  const retryInfoMatch = String(message || '').match(/"retryDelay"\s*:\s*"([0-9]+)s"/i);
  if (retryInfoMatch?.[1]) return Number(retryInfoMatch[1]);
  return null;
};

let GoogleGenerativeAI;
const getSDK = () => {
  if (!GoogleGenerativeAI) {
    ({ GoogleGenerativeAI } = require('@google/generative-ai'));
  }
  return GoogleGenerativeAI;
};

router.get('/chat', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Use POST /api/ai/chat with a JSON body containing a messages array.',
    example: { messages: [{ role: 'user', text: 'Hello' }] },
  });
});

// ✅ KEY CHECK — visit /api/ai/keycheck in your browser
router.get('/keycheck', (req, res) => {
  const apiKey =
    process.env.GOOGLE_GEMINI_API_KEY ||
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_GEMINI_KEY;

  if (!apiKey) {
    return res.json({ status: 'NOT FOUND', message: 'No Gemini API key found in environment variables.' });
  }

  // Show first 8 and last 4 chars only for security
  const masked = `${apiKey.slice(0, 8)}...${apiKey.slice(-4)}`;
  return res.json({ status: 'FOUND', key: masked });
});

router.post('/chat', async (req, res) => {
  const apiKey =
    process.env.GOOGLE_GEMINI_API_KEY ||
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_GEMINI_KEY;

  if (!apiKey) {
    return res.status(503).json({ message: 'AI service is not configured on this server.' });
  }

  let SDK;
  try {
    SDK = getSDK();
  } catch {
    return res.status(503).json({ message: 'AI package not installed. Run: npm install @google/generative-ai' });
  }

  const { messages } = req.body;
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ message: 'messages must be a non-empty array.' });
  }

  const latest = messages[messages.length - 1];
  if (!latest?.text?.trim()) {
    return res.status(400).json({ message: 'Last message must have non-empty text.' });
  }

  const firstUserIndex = messages.findIndex((m) => m.role === 'user');
  const usable = firstUserIndex >= 0 ? messages.slice(firstUserIndex) : [];
  const history = usable.slice(0, -1).map((m) => ({
    role: m.role,
    parts: [{ text: m.text }],
  }));

  const genAI = new SDK(apiKey);
  let lastError;
  let sawQuotaError = false;
  let retryAfterSeconds = null;

  for (const modelName of MODEL_CANDIDATES) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: SYSTEM_INSTRUCTION,
      });

      const chat = model.startChat({ history });
      const result = await chat.sendMessage(latest.text);
      const rawReply = result.response.text();
      const reply = sanitizeAssistantReply(rawReply);
      return res.json({ reply, model: modelName });
    } catch (error) {
      lastError = error;
      const msg = String(error?.message || '');
      const lower = msg.toLowerCase();

      if (msg.includes('[429') || lower.includes('quota exceeded') || lower.includes('rate limit')) {
        sawQuotaError = true;
        const parsedDelay = parseRetryDelaySeconds(msg);
        if (parsedDelay !== null) retryAfterSeconds = parsedDelay;
        continue;
      }

      if (msg.includes('[401') || msg.includes('[403')) {
        return res.status(503).json({ message: 'AI service configuration error. Check your API key.' });
      }

      if (lower.includes('fetch failed') || lower.includes('econnrefused') || lower.includes('enotfound')) {
        return res.status(503).json({ message: 'Cannot reach AI service. Check your internet connection.' });
      }

      const modelUnavailable =
        msg.includes('is not found') ||
        msg.includes('not supported for generateContent') ||
        msg.includes('[404') ||
        lower.includes('deprecated');

      if (!modelUnavailable) {
        return res.status(500).json({ message: 'AI service encountered an unexpected error.' });
      }
    }
  }

  if (sawQuotaError) {
    if (retryAfterSeconds !== null) res.set('Retry-After', String(retryAfterSeconds));
    return res.status(429).json({
      message: 'AI assistant is temporarily busy. Please try again in a moment.',
      retryAfterSeconds,
    });
  }

  return res.status(503).json({
    message: lastError instanceof Error ? lastError.message : 'No supported Gemini model was available.',
  });
});

// Test route — remove before going to production
router.get('/test', async (req, res) => {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
  if (!apiKey) return res.json({ status: 'NO API KEY FOUND' });

  try {
    const SDK = getSDK();
    const genAI = new SDK(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent('Say hello in one sentence.');
    return res.json({ status: 'OK', model: 'gemini-2.5-flash', reply: result.response.text() });
  } catch (err) {
    return res.json({ status: 'ERROR', message: err.message });
  }
});

module.exports = router;