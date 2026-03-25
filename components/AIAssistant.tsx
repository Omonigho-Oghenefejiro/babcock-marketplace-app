import { useEffect, useRef, useState } from 'react';
import { MessageSquare, X, ChevronLeft } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { generateAssistantReply, type AssistantMessage } from '../services/geminiService';

const tokens = {
  green: '#1B4332',
  greenMid: '#2D6A4F',
  greenLight: '#D8F3DC',
  greenPale: '#F0FAF2',
  cream: '#FAF7F2',
  ink: '#1A1A1A',
  muted: '#6B7280',
  border: '#E8E2D9',
  amber: '#F4A226',
};

const CATEGORIES = [
  {
    label: '🛒 Buying',
    questions: [
      'How do I buy an item?',
      'How do I add items to my cart?',
      'Can I negotiate the price with a seller?',
      'How do I contact a seller?',
      'Is it safe to buy on Babcock Market?',
    ],
  },
  {
    label: '📦 Selling',
    questions: [
      'How do I list an item for sale?',
      'Why is my listing pending approval?',
      'How long does approval take?',
      'Can I edit my listing after posting?',
      'How do I delete a listing?',
    ],
  },
  {
    label: '💳 Payments',
    questions: [
      'What payment methods are accepted?',
      'Is my payment information secure?',
      'What happens if my payment fails?',
      'Can I get a refund?',
      'How do I view my payment history?',
    ],
  },
  {
    label: '📋 Orders',
    questions: [
      'How do I track my order?',
      'Where do I pick up my item?',
      'What if the seller doesn\'t respond?',
      'How do I report a problem with an order?',
      'Can I cancel an order?',
    ],
  },
  {
    label: '👤 My Account',
    questions: [
      'How do I verify my email?',
      'How do I update my profile?',
      'How do I reset my password?',
      'Why do I need a Babcock email?',
      'How do I view my purchase history?',
    ],
  },
];

type Screen = 'home' | 'category' | 'chat';

const AIAssistant = () => {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [screen, setScreen] = useState<Screen>('home');
  const [activeCategory, setActiveCategory] = useState<typeof CATEGORIES[0] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const listRef = useRef<HTMLDivElement>(null);
  const bottomOffset = location.pathname === '/messages' ? 96 : 22;

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, open]);

  // Reset to home when closed
  const handleClose = () => {
    setOpen(false);
    setTimeout(() => {
      setScreen('home');
      setActiveCategory(null);
      setMessages([]);
    }, 300);
  };

  const handleOpen = () => setOpen(true);

  const handleCategorySelect = (cat: typeof CATEGORIES[0]) => {
    setActiveCategory(cat);
    setScreen('category');
  };

  const handleQuestionSelect = async (question: string) => {
    const userMsg: AssistantMessage = { role: 'user', text: question };
    const nextMessages = [userMsg];
    setMessages(nextMessages);
    setScreen('chat');
    setIsLoading(true);

    try {
      const reply = await generateAssistantReply(nextMessages);
      setMessages([userMsg, { role: 'model', text: reply }]);
    } catch (error: any) {
      const msg = error?.message || 'Failed to get a response. Please try again.';
      setMessages([userMsg, { role: 'model', text: String(msg) }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAskAnother = () => {
    setMessages([]);
    setScreen('category');
  };

  const handleBackToCategories = () => {
    setMessages([]);
    setActiveCategory(null);
    setScreen('home');
  };

  return (
    <div style={{ position: 'fixed', right: 22, bottom: bottomOffset, zIndex: 80 }}>
      {open && (
        <div style={{
          width: 320,
          height: 460,
          background: '#fff',
          border: `1.5px solid ${tokens.border}`,
          borderRadius: 16,
          boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          marginBottom: 12,
          fontFamily: "'Instrument Sans', sans-serif",
        }}>

          {/* Header */}
          <div style={{
            padding: '12px 14px',
            background: tokens.green,
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {screen !== 'home' && (
                <button
                  onClick={screen === 'chat' ? handleAskAnother : handleBackToCategories}
                  style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.8)', cursor: 'pointer', padding: '0 4px 0 0', display: 'flex' }}
                  aria-label="Go back"
                >
                  <ChevronLeft size={18} />
                </button>
              )}
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                background: 'rgba(255,255,255,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: '0.75rem',
              }}>
                AI
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.88rem', lineHeight: 1.2 }}>Marketplace Assistant</div>
                {screen === 'category' && activeCategory && (
                  <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1 }}>{activeCategory.label}</div>
                )}
              </div>
            </div>
            <button
              onClick={handleClose}
              style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}
              aria-label="Close assistant"
            >
              <X size={18} />
            </button>
          </div>

          {/* ── HOME: Category picker ── */}
          {screen === 'home' && (
            <div style={{ flex: 1, overflowY: 'auto', padding: 14, background: tokens.cream, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{
                background: '#fff', borderRadius: 12, padding: '10px 12px',
                border: `1px solid ${tokens.border}`, fontSize: '0.82rem',
                color: tokens.ink, lineHeight: 1.5, marginBottom: 4,
              }}>
                👋 Hi! What can I help you with today? Pick a topic below.
              </div>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.label}
                  onClick={() => handleCategorySelect(cat)}
                  style={{
                    width: '100%', textAlign: 'left',
                    background: '#fff', border: `1.5px solid ${tokens.border}`,
                    borderRadius: 12, padding: '11px 14px',
                    fontSize: '0.85rem', fontWeight: 600, color: tokens.ink,
                    cursor: 'pointer', transition: 'all 0.15s',
                    fontFamily: "'Instrument Sans', sans-serif",
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = tokens.greenMid;
                    e.currentTarget.style.background = tokens.greenPale;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = tokens.border;
                    e.currentTarget.style.background = '#fff';
                  }}
                >
                  <span>{cat.label}</span>
                  <span style={{ color: tokens.muted, fontSize: '0.8rem' }}>›</span>
                </button>
              ))}
            </div>
          )}

          {/* ── CATEGORY: Question list ── */}
          {screen === 'category' && activeCategory && (
            <div style={{ flex: 1, overflowY: 'auto', padding: 14, background: tokens.cream, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{
                fontSize: '0.76rem', fontWeight: 600, color: tokens.muted,
                textTransform: 'uppercase', letterSpacing: '0.08em',
                padding: '0 2px', marginBottom: 4,
              }}>
                Select a question
              </div>
              {activeCategory.questions.map((q) => (
                <button
                  key={q}
                  onClick={() => handleQuestionSelect(q)}
                  style={{
                    width: '100%', textAlign: 'left',
                    background: '#fff', border: `1.5px solid ${tokens.border}`,
                    borderRadius: 12, padding: '10px 14px',
                    fontSize: '0.82rem', fontWeight: 500, color: tokens.ink,
                    cursor: 'pointer', transition: 'all 0.15s',
                    fontFamily: "'Instrument Sans', sans-serif",
                    lineHeight: 1.45,
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = tokens.greenMid;
                    e.currentTarget.style.background = tokens.greenPale;
                    e.currentTarget.style.color = tokens.green;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = tokens.border;
                    e.currentTarget.style.background = '#fff';
                    e.currentTarget.style.color = tokens.ink;
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* ── CHAT: Answer view ── */}
          {screen === 'chat' && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div
                ref={listRef}
                style={{
                  flex: 1, padding: 12, background: tokens.cream,
                  overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10,
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
                      lineHeight: 1.55,
                      maxWidth: '85%',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {message.text}
                  </div>
                ))}
                {isLoading && (
                  <div style={{
                    alignSelf: 'flex-start', background: '#fff',
                    border: `1px solid ${tokens.border}`, borderRadius: 12,
                    padding: '8px 12px', fontSize: '0.82rem', color: tokens.muted,
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    <span style={{ display: 'inline-flex', gap: 3 }}>
                      {[0, 1, 2].map(i => (
                        <span key={i} style={{
                          width: 6, height: 6, borderRadius: '50%',
                          background: tokens.muted, display: 'inline-block',
                          animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                        }} />
                      ))}
                    </span>
                    <style>{`@keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-5px)} }`}</style>
                  </div>
                )}
              </div>

              {/* Ask another / back buttons */}
              {!isLoading && messages.length >= 2 && (
                <div style={{
                  padding: '10px 12px', background: '#fff',
                  borderTop: `1px solid ${tokens.border}`,
                  display: 'flex', gap: 8, flexShrink: 0,
                }}>
                  <button
                    onClick={handleAskAnother}
                    style={{
                      flex: 1, padding: '9px 8px', borderRadius: 10,
                      border: `1.5px solid ${tokens.greenMid}`,
                      background: '#fff', color: tokens.green,
                      fontFamily: "'Instrument Sans', sans-serif",
                      fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer',
                    }}
                  >
                    Ask another question
                  </button>
                  <button
                    onClick={handleBackToCategories}
                    style={{
                      flex: 1, padding: '9px 8px', borderRadius: 10,
                      border: 'none', background: tokens.green, color: '#fff',
                      fontFamily: "'Instrument Sans', sans-serif",
                      fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer',
                    }}
                  >
                    Back to topics
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <button
        onClick={open ? handleClose : handleOpen}
        style={{
          width: 52, height: 52, borderRadius: '50%',
          border: 'none', background: tokens.green, color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 10px 24px rgba(27,67,50,0.25)', cursor: 'pointer',
          transition: 'transform 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
        aria-label="Open assistant"
      >
        <MessageSquare size={22} />
      </button>
    </div>
  );
};

export default AIAssistant;
