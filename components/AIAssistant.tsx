import { useEffect, useRef, useState } from 'react';
import { MessageSquare, Send, X } from 'lucide-react';
import { generateAssistantReply, type AssistantMessage } from '../services/geminiService';

const tokens = {
  green: '#1B4332',
  greenMid: '#2D6A4F',
  greenLight: '#D8F3DC',
  cream: '#FAF7F2',
  ink: '#1A1A1A',
  muted: '#6B7280',
  border: '#E8E2D9',
  amber: '#F4A226',
};

const AIAssistant = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      role: 'model',
      text: 'Hi! Ask me about listings, prices, or how to use the marketplace.',
    },
  ]);

  const listRef = useRef<HTMLDivElement>(null);
  const hasKey = Boolean(import.meta.env.VITE_GEMINI_API_KEY);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, open]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const nextMessages: AssistantMessage[] = [...messages, { role: 'user', text: trimmed }];
    setMessages(nextMessages);
    setInput('');
    setIsLoading(true);

    try {
      if (!hasKey) {
        throw new Error('Missing VITE_GEMINI_API_KEY');
      }
      const reply = await generateAssistantReply(nextMessages);
      setMessages((prev) => [...prev, { role: 'model', text: reply }]);
    } catch (error: any) {
      const msg = error?.message || 'Failed to get a response.';
      setMessages((prev) => [...prev, { role: 'model', text: `Error: ${msg}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', right: 22, bottom: 22, zIndex: 80 }}>
      {open && (
        <div
          style={{
            width: 320,
            height: 420,
            background: '#fff',
            border: `1.5px solid ${tokens.border}`,
            borderRadius: 16,
            boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            marginBottom: 12,
            fontFamily: "'Instrument Sans', sans-serif",
          }}
        >
          <div
            style={{
              padding: '12px 14px',
              background: tokens.green,
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: 'rgba(255,255,255,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                }}
              >
                AI
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Marketplace Assistant</div>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#fff',
                cursor: 'pointer',
              }}
              aria-label="Close assistant"
            >
              <X size={18} />
            </button>
          </div>

          <div
            ref={listRef}
            style={{
              flex: 1,
              padding: 12,
              background: tokens.cream,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                style={{
                  alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
                  background: message.role === 'user' ? tokens.green : '#fff',
                  color: message.role === 'user' ? '#fff' : tokens.ink,
                  border: message.role === 'user' ? 'none' : `1px solid ${tokens.border}`,
                  borderRadius: 12,
                  padding: '8px 10px',
                  fontSize: '0.82rem',
                  lineHeight: 1.5,
                  maxWidth: '80%',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {message.text}
              </div>
            ))}
            {isLoading && (
              <div
                style={{
                  alignSelf: 'flex-start',
                  background: '#fff',
                  border: `1px solid ${tokens.border}`,
                  borderRadius: 12,
                  padding: '8px 10px',
                  fontSize: '0.82rem',
                  color: tokens.muted,
                }}
              >
                Thinking...
              </div>
            )}
          </div>

          <div style={{ padding: 10, background: '#fff', borderTop: `1px solid ${tokens.border}` }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={hasKey ? 'Ask about listings, pricing, or categories...' : 'Add VITE_GEMINI_API_KEY to enable'}
                style={{
                  flex: 1,
                  border: `1.5px solid ${tokens.border}`,
                  borderRadius: 10,
                  padding: '8px 10px',
                  fontSize: '0.82rem',
                  outline: 'none',
                  fontFamily: "'Instrument Sans', sans-serif",
                }}
                disabled={!hasKey}
              />
              <button
                onClick={handleSend}
                style={{
                  background: tokens.green,
                  border: 'none',
                  color: '#fff',
                  borderRadius: 10,
                  width: 38,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
                disabled={!hasKey || isLoading}
                aria-label="Send message"
              >
                <Send size={16} />
              </button>
            </div>
            {!hasKey && (
              <div style={{ marginTop: 6, fontSize: '0.7rem', color: tokens.muted }}>
                Add VITE_GEMINI_API_KEY in your Vite env to enable responses.
              </div>
            )}
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((prev) => !prev)}
        style={{
          width: 52,
          height: 52,
          borderRadius: '50%',
          border: 'none',
          background: tokens.green,
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 10px 24px rgba(27,67,50,0.25)',
          cursor: 'pointer',
        }}
        aria-label="Open assistant"
      >
        <MessageSquare size={22} />
      </button>
    </div>
  );
};

export default AIAssistant;
