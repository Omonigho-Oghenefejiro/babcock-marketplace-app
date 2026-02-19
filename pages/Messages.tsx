import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Send, Search, User, MoreVertical, ArrowLeft, MessageCircle } from 'lucide-react';
import { useStore } from '../contexts/StoreContext';
import { Conversation } from '../types';
import { fadeUpVariants } from '../lib/animations';
import { Badge } from '../components/ui/badge';

const Messages = () => {
  const { user, conversations, sendMessage, markAsRead, allUsers, products } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // State for UI
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Handle creating new conversation context from navigation state
  const [tempConversation, setTempConversation] = useState<{
    receiverId: string;
    productId: string;
    sellerName: string;
  } | null>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: '/messages', message: 'Sign in to view your messages' } });
    }
  }, [user, navigate]);

  // Handle navigation state for new chat
  useEffect(() => {
    if (!user) return;
    
    // Check if we navigated here with intent to chat with someone
    if (location.state?.sellerId) {
      const { sellerId, productId } = location.state;
      
      // Look for existing conversation
      const existing = conversations.find(c => 
        c.participants.includes(user.id) && 
        c.participants.includes(sellerId) &&
        (productId ? c.productId === productId : true)
      );

      if (existing) {
        setSelectedConvId(existing.id);
      } else {
        // Set up temporary state to show empty chat window
        setTempConversation({
            receiverId: sellerId,
            productId,
            sellerName: allUsers.find(u => u.id === sellerId)?.name || 'Seller'
        });
        setSelectedConvId('new');
      }
    }
  }, [user, location.state, allUsers]);

  // After sending a message in 'new' mode, switch to the actual conversation
  useEffect(() => {
    if (selectedConvId === 'new' && tempConversation && user) {
      // Look for conversation that was just created
      const newConv = conversations.find(c => 
        c.participants.includes(user.id) && 
        c.participants.includes(tempConversation.receiverId) &&
        (tempConversation.productId ? c.productId === tempConversation.productId : true)
      );
      if (newConv) {
        setSelectedConvId(newConv.id);
        setTempConversation(null);
      }
    }
  }, [conversations, selectedConvId, tempConversation, user]);

  // Track which conversations we've marked as read to prevent infinite loops
  const markedAsReadRef = useRef<Set<string>>(new Set());

  // Mark as read when opening a conversation
  useEffect(() => {
    if (selectedConvId && selectedConvId !== 'new' && !markedAsReadRef.current.has(selectedConvId)) {
        markedAsReadRef.current.add(selectedConvId);
        markAsRead(selectedConvId);
        setTempConversation(null);
    }
  }, [selectedConvId]);

  // Scroll to bottom of chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversations, selectedConvId]);

  // Guard: show nothing while redirecting
  if (!user) {
    return null;
  }

  // Helpers
  const getOtherParticipantId = (conv: Conversation) => conv.participants?.find(p => p !== user?.id) || '';
  
  const getUserDetails = (userId: string) => {
    if (!userId || !allUsers) return { name: 'Unknown User', avatar: 'https://placehold.co/40x40/e2e8f0/1e293b?text=U' };
    return allUsers.find(u => u.id === userId) || { name: 'Unknown User', avatar: 'https://placehold.co/40x40/e2e8f0/1e293b?text=U' };
  };

  const getProductDetails = (productId?: string) => {
    if (!productId) return null;
    return products.find(p => p.id === productId);
  };

  // Filter conversations
  const myConversations = conversations
    .filter(c => c.participants.includes(user?.id || ''))
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const filteredConversations = myConversations.filter(c => {
    const otherId = getOtherParticipantId(c);
    const otherUser = getUserDetails(otherId);
    const userName = otherUser?.name || 'Unknown';
    return userName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    if (selectedConvId === 'new' && tempConversation) {
        sendMessage(tempConversation.receiverId, inputText, tempConversation.productId);
        setInputText('');
        // Don't clear tempConversation here - let the effect handle the switch
    } else if (selectedConvId && selectedConvId !== 'new') {
        const conv = conversations.find(c => c.id === selectedConvId);
        if (conv) {
             const receiverId = getOtherParticipantId(conv);
             sendMessage(receiverId, inputText, conv.productId);
             setInputText('');
        }
    }
  };

  // Determine current chat view data
  const currentConversation = conversations.find(c => c.id === selectedConvId);
  
  // If we are in "new" mode, simulate a conversation object
  // Also check if the conversation now exists (after sending first message)
  let activeChat: typeof currentConversation | { id: string; participants: string[]; messages: any[]; productId?: string; updatedAt: string } | null = null;
  
  if (currentConversation) {
    activeChat = currentConversation;
  } else if (selectedConvId === 'new' && tempConversation) {
    // Check if conversation was just created
    const justCreated = conversations.find(c => 
      c.participants.includes(user?.id || '') && 
      c.participants.includes(tempConversation.receiverId) &&
      (tempConversation.productId ? c.productId === tempConversation.productId : !c.productId)
    );
    if (justCreated) {
      activeChat = justCreated;
    } else {
      activeChat = {
        id: 'new',
        participants: [user?.id || '', tempConversation.receiverId],
        messages: [],
        productId: tempConversation.productId,
        updatedAt: new Date().toISOString()
      };
    }
  }


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-primary-900 via-primary-800 to-primary-900 py-8">
        <div className="container-custom">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUpVariants}
          >
            <Badge variant="secondary" className="mb-3 bg-white/10 text-white border-white/20">
              <MessageCircle className="h-3 w-3 mr-1" />
              Chat
            </Badge>
            <h1 className="text-3xl font-bold text-white">Messages</h1>
            <p className="text-white/70 mt-1">Connect with buyers and sellers</p>
          </motion.div>
        </div>
      </div>

      <div className="container-custom py-6">
        <motion.div 
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-[calc(100vh-16rem)] flex flex-col md:flex-row"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
        
          {/* Sidebar List */}
          <div className={`w-full md:w-80 lg:w-96 border-r border-gray-100 flex flex-col ${selectedConvId ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-4 border-b border-gray-100 bg-gray-50/50">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                />
                <Search className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
              </div>
            </div>
          
            <div className="flex-1 overflow-y-auto">
               {filteredConversations.length === 0 && !searchTerm ? (
                   <div className="p-8 text-center">
                     <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center mx-auto mb-4">
                       <MessageCircle className="h-8 w-8 text-primary-600" />
                     </div>
                     <p className="text-gray-500 text-sm">No conversations yet.</p>
                   </div>
               ) : (
                  filteredConversations.map(conv => {
                      const otherId = getOtherParticipantId(conv);
                      const otherUser = getUserDetails(otherId);
                      const lastMsg = conv.messages[conv.messages.length - 1];
                      const product = getProductDetails(conv.productId);
                      const unreadCount = conv.messages.filter(m => m.senderId !== user?.id && !m.read).length;

                      return (
                          <motion.button
                              key={conv.id}
                              onClick={() => setSelectedConvId(conv.id)}
                              className={`w-full p-4 flex items-start space-x-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-100 ${
                                  selectedConvId === conv.id ? 'bg-primary-50 border-l-4 border-l-primary-500' : ''
                              }`}
                              whileHover={{ x: 4 }}
                              whileTap={{ scale: 0.99 }}
                          >
                              <img src={otherUser.avatar} alt="" className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-sm" />
                              <div className="flex-1 min-w-0">
                                  <div className="flex justify-between items-baseline mb-1">
                                      <h3 className="text-sm font-semibold text-gray-900 truncate">{otherUser.name}</h3>
                                      <span className="text-xs text-gray-400 whitespace-nowrap">
                                          {new Date(conv.updatedAt).toLocaleDateString()}
                                      </span>
                                  </div>
                                  {product && (
                                      <p className="text-xs text-primary-600 font-medium mb-1 truncate">
                                          Ref: {product.title}
                                      </p>
                                  )}
                                  <p className={`text-sm truncate ${unreadCount > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                                      {lastMsg ? (lastMsg.senderId === user?.id ? 'You: ' : '') + lastMsg.content : 'Draft'}
                                  </p>
                              </div>
                              {unreadCount > 0 && (
                                  <div className="bg-accent-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full mt-2 shadow-sm">
                                      {unreadCount}
                                  </div>
                              )}
                          </motion.button>
                      );
                  })
               )}
            </div>
          </div>

          {/* Chat Window */}
          <div className={`flex-1 flex flex-col bg-gray-50 ${!selectedConvId ? 'hidden md:flex' : 'flex'}`}>
              {activeChat ? (
                  <>
                      {/* Header */}
                      <div className="bg-gradient-to-r from-primary-800 to-primary-900 p-4 flex justify-between items-center shadow-sm z-10">
                          <div className="flex items-center">
                              <motion.button 
                                  onClick={() => setSelectedConvId(null)}
                                  className="md:hidden mr-3 text-white/70 hover:text-white"
                                  whileTap={{ scale: 0.95 }}
                              >
                                  <ArrowLeft className="h-6 w-6" />
                              </motion.button>
                              {(() => {
                                  const otherId = (activeChat.id === 'new' && tempConversation) 
                                    ? tempConversation.receiverId 
                                    : (activeChat.participants?.find(p => p !== user?.id) || '');
                                  const otherUser = getUserDetails(otherId);
                                  const product = getProductDetails(activeChat.productId);
                                  
                                  return (
                                      <div className="flex items-center">
                                          <img src={otherUser.avatar || 'https://placehold.co/40x40/e2e8f0/1e293b?text=U'} alt="" className="w-11 h-11 rounded-full object-cover ring-2 ring-white/20" />
                                          <div className="ml-3">
                                              <h3 className="font-bold text-white">{otherUser.name}</h3>
                                              {product && <p className="text-xs text-white/60">Regarding: {product.title}</p>}
                                          </div>
                                      </div>
                                  );
                              })()}
                          </div>
                          <button className="text-white/60 hover:text-white transition-colors">
                              <MoreVertical className="h-5 w-5" />
                          </button>
                      </div>

                      {/* Messages Area */}
                      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white">
                          {(!activeChat.messages || activeChat.messages.length === 0) && (
                              <div className="text-center py-16">
                                <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center mx-auto mb-4">
                                  <Send className="h-7 w-7 text-primary-600" />
                                </div>
                                <p className="text-gray-500 text-sm">Start the conversation by sending a message.</p>
                              </div>
                          )}
                          {(activeChat.messages || []).map((msg) => {
                              const isMe = msg.senderId === user?.id;
                              return (
                                  <motion.div 
                                    key={msg.id} 
                                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                  >
                                      <div className={`max-w-[75%] rounded-2xl px-5 py-3 text-sm shadow-sm ${
                                          isMe 
                                          ? 'bg-gradient-to-br from-primary-700 to-primary-800 text-white rounded-br-none' 
                                          : 'bg-white text-gray-900 border border-gray-100 rounded-bl-none'
                                      }`}>
                                          <p>{msg.content}</p>
                                          <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-primary-200' : 'text-gray-400'}`}>
                                              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                          </p>
                                      </div>
                                  </motion.div>
                              );
                          })}
                      </div>

                      {/* Input Area */}
                      <div className="p-4 bg-white border-t border-gray-100">
                          <form onSubmit={handleSend} className="flex items-center gap-3">
                              <input
                                  type="text"
                                  value={inputText}
                                  onChange={(e) => setInputText(e.target.value)}
                                  placeholder="Type a message..."
                                  className="flex-1 px-5 py-3 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
                              />
                              <motion.button 
                                  type="submit" 
                                  disabled={!inputText.trim()}
                                  className="p-3.5 bg-gradient-to-br from-primary-700 to-primary-800 text-white rounded-full hover:from-primary-800 hover:to-primary-900 disabled:opacity-50 transition-all shadow-lg"
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                              >
                                  <Send className="h-5 w-5" />
                              </motion.button>
                          </form>
                      </div>
                  </>
              ) : (
                  <div className="flex-1 flex flex-col items-center justify-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center mb-4">
                          <MessageCircle className="h-10 w-10 text-primary-600" />
                      </div>
                      <p className="text-gray-500 font-medium">Select a conversation to start chatting</p>
                      <p className="text-gray-400 text-sm mt-1">Choose from your existing conversations</p>
                  </div>
              )}
          </div>

        </motion.div>
      </div>
    </div>
  );
};

export default Messages;