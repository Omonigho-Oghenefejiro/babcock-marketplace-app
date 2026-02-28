import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Search, ArrowLeft, MessageCircle, Check } from 'lucide-react';
import { useStore } from '../contexts/StoreContext';
import { Conversation } from '../types';
import { getMessagesPollInterval } from '../lib/messaging';

const t = {
  green: '#1B4332',
  greenMid: '#2D6A4F',
  greenLight: '#D8F3DC',
  greenPale: '#F0FAF2',
  amber: '#F4A226',
  cream: '#FAF7F2',
  ink: '#1A1A1A',
  muted: '#6B7280',
  border: '#E8E2D9',
};

const Avatar = ({ name, size = 40, bg = t.green }: { name: string; size?: number; bg?: string }) => (
  <div style={{
    width: size, height: size, borderRadius: '50%',
    background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: "'Syne', sans-serif", fontWeight: 800,
    fontSize: size * 0.38, color: '#fff', flexShrink: 0,
  }}>
    {name?.[0]?.toUpperCase() ?? '?'}
  </div>
);

const Messages = () => {
  const { user, conversations, sendMessage, markAsRead, allUsers, products, refreshConversations } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const scrollRef = useRef<HTMLDivElement>(null);

  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isPageVisible, setIsPageVisible] = useState(() =>
    typeof document === 'undefined' ? true : document.visibilityState === 'visible'
  );
  const [tempConversation, setTempConversation] = useState<{
    receiverId: string; productId: string; sellerName: string;
  } | null>(null);

  const markedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!user) navigate('/login', { state: { from: '/messages', message: 'Sign in to view messages' } });
  }, [user, navigate]);

  useEffect(() => {
    if (!user || !location.state?.sellerId) return;
    const { sellerId, productId } = location.state;
    const existing = conversations.find(c =>
      c.participants.includes(user.id) &&
      c.participants.includes(sellerId) &&
      (!productId || c.productId === productId)
    );
    if (existing) {
      setSelectedConvId(existing.id);
    } else {
      setTempConversation({
        receiverId: sellerId,
        productId,
        sellerName: allUsers.find(u => u.id === sellerId)?.name || 'Seller',
      });
      setSelectedConvId('new');
    }
  }, [user, location.state, allUsers, conversations]);

  useEffect(() => {
    if (selectedConvId !== 'new' || !tempConversation || !user) return;
    const newConv = conversations.find(c =>
      c.participants.includes(user.id) &&
      c.participants.includes(tempConversation.receiverId) &&
      (!tempConversation.productId || c.productId === tempConversation.productId)
    );
    if (newConv) {
      setSelectedConvId(newConv.id);
      setTempConversation(null);
    }
  }, [conversations, selectedConvId, tempConversation, user]);

  useEffect(() => {
    if (!selectedConvId || selectedConvId === 'new' || markedRef.current.has(selectedConvId)) return;
    markedRef.current.add(selectedConvId);
    markAsRead(selectedConvId);
    setTempConversation(null);
  }, [selectedConvId, markAsRead]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [conversations, selectedConvId]);

  useEffect(() => {
    const handleVisibility = () => {
      const visible = document.visibilityState === 'visible';
      setIsPageVisible(visible);
      if (visible) {
        refreshConversations();
      }
    };

    const handleFocus = () => {
      setIsPageVisible(true);
      refreshConversations();
    };

    const handleBlur = () => {
      setIsPageVisible(false);
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [refreshConversations]);

  const pollIntervalMs = getMessagesPollInterval({
    isAuthenticated: Boolean(user),
    isPageVisible,
    hasActiveConversation: Boolean(selectedConvId),
  });

  useEffect(() => {
    if (!pollIntervalMs || !user || !isPageVisible) return;

    refreshConversations();
    const intervalId = window.setInterval(() => {
      refreshConversations();
    }, pollIntervalMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [user, isPageVisible, pollIntervalMs, refreshConversations]);

  if (!user) return null;

  const getOtherId = (c: Conversation) => c.participants.find(p => p !== user.id) ?? '';
  const getUser = (id: string) => allUsers.find(u => u.id === id) ?? { name: 'Unknown', id };
  const getProduct = (pid?: string) => products.find(p => p.id === pid);

  const myConvs = conversations
    .filter(c => c.participants.includes(user.id))
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const filtered = myConvs.filter(c => {
    const other = getUser(getOtherId(c));
    return (other.name ?? '').toLowerCase().includes(searchTerm.toLowerCase());
  });

  const currentConv = conversations.find(c => c.id === selectedConvId);
  const activeChat: any = currentConv ?? (selectedConvId === 'new' && tempConversation
    ? { id: 'new', participants: [user.id, tempConversation.receiverId], messages: [], productId: tempConversation.productId }
    : null);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    const messageText = inputText;
    setInputText('');
    if (selectedConvId === 'new' && tempConversation) {
      await sendMessage(tempConversation.receiverId, messageText, tempConversation.productId);
    } else if (currentConv) {
      await sendMessage(getOtherId(currentConv), messageText, currentConv.productId);
    }
  };

  const activeChatOtherId = activeChat
    ? (activeChat.id === 'new' && tempConversation ? tempConversation.receiverId : getOtherId(activeChat))
    : null;
  const activeChatOther = activeChatOtherId ? getUser(activeChatOtherId) : null;
  const activeChatProduct = activeChat ? getProduct(activeChat.productId) : null;

  return (
    <div style={{ background: t.cream, height: 'calc(100vh - 4rem)', display: 'flex', flexDirection: 'column', fontFamily: "'Instrument Sans', sans-serif" }}>
      <div style={{ background: t.green, padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <MessageCircle size={18} color="#fff" />
        </div>
        <div>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1rem', color: '#fff', lineHeight: 1 }}>Messages</h1>
          <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{myConvs.length} conversation{myConvs.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>
        <div
          style={{ width: 320, flexShrink: 0, background: '#fff', borderRight: `1.5px solid ${t.border}`, display: 'flex', flexDirection: 'column' }}
          className={`messages-sidebar ${selectedConvId ? 'hidden md:flex' : 'flex'}`}
        >
          <div style={{ padding: '14px 16px', borderBottom: `1px solid ${t.border}` }}>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: t.muted }} />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ width: '100%', paddingLeft: 30, paddingRight: 12, paddingTop: 9, paddingBottom: 9, background: t.cream, border: `1.5px solid ${t.border}`, borderRadius: 10, fontFamily: "'Instrument Sans', sans-serif", fontSize: '0.82rem', color: t.ink, outline: 'none' }}
              />
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {filtered.length === 0 ? (
              <div style={{ padding: '48px 24px', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: 12 }}>💬</div>
                <p style={{ fontSize: '0.85rem', color: t.muted }}>{searchTerm ? 'No results found' : 'No conversations yet'}</p>
              </div>
            ) : (
              filtered.map(conv => {
                const otherId = getOtherId(conv);
                const other = getUser(otherId);
                const lastMsg = conv.messages[conv.messages.length - 1];
                const product = getProduct(conv.productId);
                const unread = conv.messages.filter(m => m.senderId !== user.id && !m.read).length;
                const isSelected = selectedConvId === conv.id;
                return (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConvId(conv.id)}
                    style={{ width: '100%', display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 16px', border: 'none', cursor: 'pointer', textAlign: 'left', background: isSelected ? t.greenPale : 'transparent', borderLeft: `3px solid ${isSelected ? t.green : 'transparent'}`, borderBottom: `1px solid ${t.border}` }}
                  >
                    <Avatar name={other.name} size={42} bg={isSelected ? t.green : t.greenMid} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 2 }}>
                        <span style={{ fontWeight: unread > 0 ? 700 : 600, fontSize: '0.875rem', color: t.ink, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{other.name}</span>
                        <span style={{ fontSize: '0.65rem', color: t.muted, flexShrink: 0, marginLeft: 6 }}>{new Date(conv.updatedAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}</span>
                      </div>
                      {product && <p style={{ fontSize: '0.68rem', color: t.greenMid, fontWeight: 600, marginBottom: 2, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>📦 {product.title}</p>}
                      <p style={{ fontSize: '0.78rem', color: unread > 0 ? t.ink : t.muted, fontWeight: unread > 0 ? 600 : 400, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{lastMsg ? (lastMsg.senderId === user.id ? 'You: ' : '') + lastMsg.content : 'Start chatting…'}</p>
                    </div>
                    {unread > 0 && <span style={{ background: t.amber, color: t.ink, width: 20, height: 20, borderRadius: '50%', fontSize: '0.65rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: "'Syne', sans-serif" }}>{unread}</span>}
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, background: t.cream }} className={`messages-chat ${!selectedConvId ? 'hidden md:flex' : 'flex'}`}>
          {activeChat && activeChatOther ? (
            <>
              <div style={{ background: '#fff', borderBottom: `1.5px solid ${t.border}`, padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                <button onClick={() => setSelectedConvId(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.muted, display: 'flex', padding: 4 }} className="md:hidden">
                  <ArrowLeft size={18} />
                </button>
                <Avatar name={activeChatOther.name} size={40} bg={t.green} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '0.95rem', color: t.ink }}>{activeChatOther.name}</p>
                  {activeChatProduct && <p style={{ fontSize: '0.72rem', color: t.muted, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>About: {activeChatProduct.title}</p>}
                </div>
              </div>

              <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <AnimatePresence initial={false}>
                  {(activeChat.messages ?? []).map((msg: any) => {
                    const isMe = msg.senderId === user.id;
                    return (
                      <motion.div key={msg.id} initial={{ opacity: 0, y: 8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.2 }} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', gap: 8, alignItems: 'flex-end' }}>
                        {!isMe && <Avatar name={activeChatOther.name} size={28} bg={t.greenMid} />}
                        <div style={{ maxWidth: '72%', background: isMe ? t.green : '#fff', color: isMe ? '#fff' : t.ink, border: isMe ? 'none' : `1.5px solid ${t.border}`, borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px', padding: '10px 14px' }}>
                          <p style={{ fontSize: '0.875rem', lineHeight: 1.55 }}>{msg.content}</p>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4, marginTop: 4 }}>
                            <span style={{ fontSize: '0.65rem', color: isMe ? 'rgba(255,255,255,0.5)' : t.muted }}>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            {isMe && <Check size={10} color="rgba(255,255,255,0.5)" />}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              <div style={{ background: '#fff', borderTop: `1.5px solid ${t.border}`, padding: '14px 20px', flexShrink: 0 }}>
                <form onSubmit={handleSend} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <input
                    type="text"
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    placeholder="Type a message..."
                    style={{ flex: 1, padding: '12px 16px', background: t.cream, border: `1.5px solid ${t.border}`, borderRadius: 12, fontFamily: "'Instrument Sans', sans-serif", fontSize: '0.875rem', color: t.ink, outline: 'none' }}
                  />
                  <button type="submit" disabled={!inputText.trim()} style={{ width: 44, height: 44, borderRadius: 12, border: 'none', background: inputText.trim() ? t.green : '#E5E7EB', color: inputText.trim() ? '#fff' : t.muted, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: inputText.trim() ? 'pointer' : 'not-allowed', transition: 'all 0.2s', flexShrink: 0 }}>
                    <Send size={16} />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32, opacity: 0.7 }}>
              <div style={{ width: 72, height: 72, borderRadius: 20, background: t.greenLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MessageCircle size={30} color={t.green} />
              </div>
              <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '1rem', color: t.ink }}>Select a conversation</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .messages-sidebar { width: 100% !important; }
          .messages-chat    { width: 100% !important; }
        }
      `}</style>
    </div>
  );
};

export default Messages;