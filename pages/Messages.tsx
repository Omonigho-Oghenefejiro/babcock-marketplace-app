import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Send, Search, User, MoreVertical, ArrowLeft } from 'lucide-react';
import { useStore } from '../contexts/StoreContext';
import { Conversation } from '../types';

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

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

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
  }, [user, location.state, conversations, allUsers, navigate]);

  // Mark as read when opening a conversation
  useEffect(() => {
    if (selectedConvId && selectedConvId !== 'new') {
        markAsRead(selectedConvId);
        setTempConversation(null);
    }
  }, [selectedConvId, markAsRead]);

  // Scroll to bottom of chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversations, selectedConvId]);

  // Helpers
  const getOtherParticipantId = (conv: Conversation) => conv.participants.find(p => p !== user?.id) || '';
  
  const getUserDetails = (userId: string) => {
    return allUsers.find(u => u.id === userId) || { name: 'Unknown User', avatar: 'https://via.placeholder.com/40' };
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
    return otherUser.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    if (selectedConvId === 'new' && tempConversation) {
        sendMessage(tempConversation.receiverId, inputText, tempConversation.productId);
        // After sending, the conversation will exist in state. 
        // We rely on StoreContext updating 'conversations', which triggers re-render.
        // We need to switch selectedConvId from 'new' to the actual ID.
        // For simplicity, we just clear temp and let the user click the new item in list or find it via logic
        // But better UX: find the new conversation ID.
        // Since we don't get the ID back from sendMessage synchronously in this mock, we might just rely on the effect reacting to state change.
        setInputText('');
        // Optimization: In real app, sendMessage should return ID.
        // Here, we wait for the update cycle.
    } else if (selectedConvId) {
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
  
  // If we are in "new" mode, we simulate a conversation object for display
  const activeChat = currentConversation || (selectedConvId === 'new' && tempConversation ? {
    id: 'new',
    participants: [user?.id || '', tempConversation.receiverId],
    messages: [],
    productId: tempConversation.productId,
    updatedAt: new Date().toISOString()
  } : null);


  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-4rem)]">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-full flex flex-col md:flex-row">
        
        {/* Sidebar List */}
        <div className={`w-full md:w-80 lg:w-96 border-r border-gray-100 flex flex-col ${selectedConvId ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Messages</h2>
            <div className="relative">
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
             {filteredConversations.length === 0 && !searchTerm ? (
                 <div className="p-8 text-center text-gray-500 text-sm">
                     No conversations yet.
                 </div>
             ) : (
                filteredConversations.map(conv => {
                    const otherId = getOtherParticipantId(conv);
                    const otherUser = getUserDetails(otherId);
                    const lastMsg = conv.messages[conv.messages.length - 1];
                    const product = getProductDetails(conv.productId);
                    const unreadCount = conv.messages.filter(m => m.senderId !== user?.id && !m.read).length;

                    return (
                        <button
                            key={conv.id}
                            onClick={() => setSelectedConvId(conv.id)}
                            className={`w-full p-4 flex items-start space-x-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 ${
                                selectedConvId === conv.id ? 'bg-blue-50 border-blue-100' : ''
                            }`}
                        >
                            <img src={otherUser.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline mb-1">
                                    <h3 className="text-sm font-semibold text-gray-900 truncate">{otherUser.name}</h3>
                                    <span className="text-xs text-gray-400 whitespace-nowrap">
                                        {new Date(conv.updatedAt).toLocaleDateString()}
                                    </span>
                                </div>
                                {product && (
                                    <p className="text-xs text-blue-600 font-medium mb-1 truncate">
                                        Ref: {product.title}
                                    </p>
                                )}
                                <p className={`text-sm truncate ${unreadCount > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                                    {lastMsg ? (lastMsg.senderId === user?.id ? 'You: ' : '') + lastMsg.content : 'Draft'}
                                </p>
                            </div>
                            {unreadCount > 0 && (
                                <div className="bg-blue-600 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full mt-2">
                                    {unreadCount}
                                </div>
                            )}
                        </button>
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
                    <div className="bg-white p-4 border-b border-gray-100 flex justify-between items-center shadow-sm z-10">
                        <div className="flex items-center">
                            <button 
                                onClick={() => setSelectedConvId(null)}
                                className="md:hidden mr-3 text-gray-500"
                            >
                                <ArrowLeft className="h-6 w-6" />
                            </button>
                            {(() => {
                                const otherId = activeChat.id === 'new' && tempConversation ? tempConversation.receiverId : getOtherParticipantId(activeChat as Conversation);
                                const otherUser = getUserDetails(otherId);
                                const product = getProductDetails(activeChat.productId);
                                
                                return (
                                    <div className="flex items-center">
                                        <img src={otherUser.avatar} alt="" className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                                        <div className="ml-3">
                                            <h3 className="font-bold text-gray-900">{otherUser.name}</h3>
                                            {product && <p className="text-xs text-gray-500">Regarding: {product.title}</p>}
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                        <button className="text-gray-400 hover:text-gray-600">
                            <MoreVertical className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                        {activeChat.messages.length === 0 && (
                            <div className="text-center text-gray-400 text-sm py-10">
                                Start the conversation by sending a message.
                            </div>
                        )}
                        {activeChat.messages.map((msg) => {
                            const isMe = msg.senderId === user?.id;
                            return (
                                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[75%] rounded-2xl px-5 py-3 text-sm shadow-sm ${
                                        isMe 
                                        ? 'bg-blue-600 text-white rounded-br-none' 
                                        : 'bg-white text-gray-900 border border-gray-100 rounded-bl-none'
                                    }`}>
                                        <p>{msg.content}</p>
                                        <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-blue-200' : 'text-gray-400'}`}>
                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-white border-t border-gray-100">
                        <form onSubmit={handleSend} className="flex items-center gap-2">
                            <input
                                type="text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder="Type a message..."
                                className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                            />
                            <button 
                                type="submit" 
                                disabled={!inputText.trim()}
                                className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors shadow-sm"
                            >
                                <Send className="h-5 w-5" />
                            </button>
                        </form>
                    </div>
                </>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <Search className="h-8 w-8 text-gray-300" />
                    </div>
                    <p>Select a conversation to start chatting</p>
                </div>
            )}
        </div>

      </div>
    </div>
  );
};

export default Messages;