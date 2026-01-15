import React, { useState, useEffect, useRef } from 'react';
import { MainLayout } from '../layouts/MainLayout';
import { communicationService } from '../services/communicationService';
import { Search, Send, User, MoreVertical, RefreshCw, Filter } from 'lucide-react';

const Communication = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [conversations, setConversations] = useState([]); // List of ALL users
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'OWNER' | 'TENANT'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const messagesEndRef = useRef(null);
  const chatIntervalRef = useRef(null);

  // 1. Load Current User & Initial Conversations
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setCurrentUser(JSON.parse(userStr));
    }
    fetchConversations();

    // Poll for new conversations/unread counts every 10s
    const convInterval = setInterval(fetchConversations, 10000);
    return () => clearInterval(convInterval);
  }, []);

  // 2. Fetch Conversations (Users)
  const fetchConversations = async () => {
    try {
      setRefreshing(true);
      const users = await communicationService.getConversations();
      setConversations(users);
    } catch (error) {
      console.error("Failed to fetch conversations", error);
    } finally {
        setRefreshing(false);
    }
  };

  // 3. Filter Conversations based on Tab & Search
  const getFilteredConversations = () => {
    let filtered = conversations;

    // Filter by Tab
    if (activeTab !== 'ALL') {
        filtered = filtered.filter(u => u.role === activeTab);
    }

    // Filter by Search
    if (searchTerm) {
        filtered = filtered.filter(u => 
            u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            u.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }

    return filtered;
  };

  const displayedUsers = getFilteredConversations();

  // 4. Select User & Fetch History
  const handleSelectUser = async (user) => {
    setSelectedUser(user);
    setMessages([]); // Clear previous messages immediately
    setLoading(true);
    await fetchHistory(user.id);
    setLoading(false);
    
    // Mark as read immediately
    try {
        await communicationService.markAsRead(user.id);
        // Optimistically update unread count
        setConversations(prev => prev.map(u => u.id === user.id ? { ...u, unreadCount: 0 } : u));
    } catch (e) { console.error(e); }
  };

  const fetchHistory = async (userId) => {
    try {
      const history = await communicationService.getHistory(userId);
      setMessages(history);
      scrollToBottom();
    } catch (error) {
      console.error("Failed to fetch history", error);
    }
  };

  // 5. Poll for Messages when User is Selected
  useEffect(() => {
    if (chatIntervalRef.current) clearInterval(chatIntervalRef.current);

    if (selectedUser) {
      chatIntervalRef.current = setInterval(() => {
        fetchHistory(selectedUser.id);
      }, 3000); // Poll every 3 seconds
    }

    return () => {
      if (chatIntervalRef.current) clearInterval(chatIntervalRef.current);
    };
  }, [selectedUser]);

  // 6. Send Message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    setSending(true);
    try {
      await communicationService.sendMessage(selectedUser.id, newMessage);
      setNewMessage('');
      await fetchHistory(selectedUser.id); // Refresh immediately
    } catch (error) {
      console.error("Failed to send message", error);
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <MainLayout title="Communication Hub">
      <div className="flex h-[calc(100vh-140px)] bg-white rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.06)] overflow-hidden">
        
        {/* LEFT: SIDEBAR (User List) */}
        <div className="w-[340px] border-r border-slate-100 flex flex-col bg-slate-50/50">
          
          {/* Header & Tabs */}
          <div className="p-4 bg-white border-b border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="font-bold text-slate-800">Messages</h2>
                <button onClick={fetchConversations} className={`p-2 rounded-full hover:bg-slate-100 transition-colors ${refreshing ? 'animate-spin text-indigo-600' : 'text-slate-400'}`}>
                    <RefreshCw size={16} />
                </button>
            </div>

            {/* Tabs */}
            <div className="flex p-1 bg-slate-100 rounded-lg">
                <button 
                    onClick={() => setActiveTab('ALL')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${activeTab === 'ALL' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    All
                </button>
                <button 
                    onClick={() => setActiveTab('OWNER')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${activeTab === 'OWNER' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Owners
                </button>
                <button 
                    onClick={() => setActiveTab('TENANT')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${activeTab === 'TENANT' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Tenants
                </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search..." 
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* User List */}
          <div className="flex-1 overflow-y-auto">
            {displayedUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                    <Filter size={24} className="mb-2 opacity-50" />
                    <span className="text-sm font-medium">No {activeTab === 'ALL' ? 'users' : activeTab.toLowerCase() + 's'} found</span>
                </div>
            ) : (
                displayedUsers.map(user => (
                  <div 
                    key={user.id}
                    onClick={() => handleSelectUser(user)}
                    className={`p-4 flex items-center gap-3 cursor-pointer transition-colors border-b border-slate-50 hover:bg-white group ${selectedUser?.id === user.id ? 'bg-white border-l-4 border-l-indigo-600 shadow-sm z-10' : 'border-l-4 border-l-transparent'}`}
                  >
                    <div className="relative">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 shadow-sm ${selectedUser?.id === user.id ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}>
                        {user.name ? user.name.charAt(0).toUpperCase() : <User size={16} />}
                        </div>
                        {/* Status Indicator (Mock) */}
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <h4 className={`text-sm font-semibold truncate ${selectedUser?.id === user.id ? 'text-indigo-900' : 'text-slate-700'}`}>
                          {user.name || user.email}
                        </h4>
                        {user.lastMessage && (
                            <span className="text-[10px] text-slate-400 shrink-0 ml-2">
                                {new Date(user.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        )}
                      </div>
                      <p className={`text-xs truncate ${user.unreadCount > 0 ? 'font-bold text-slate-800' : 'text-slate-400'}`}>
                        {user.role && (
                             <span className="inline-block mr-1.5 px-1 py-[1px] rounded-[3px] bg-slate-100 text-[9px] font-bold text-slate-500 uppercase tracking-widest border border-slate-200">
                                {user.role === 'OWNER' ? 'OWN' : 'TNT'}
                             </span>
                        )}
                        {user.lastMessage ? user.lastMessage.content : 'No messages yet'}
                      </p>
                    </div>

                    {user.unreadCount > 0 && (
                        <span className="w-5 h-5 flex items-center justify-center bg-indigo-600 text-white text-[10px] font-bold rounded-full shadow-md shadow-indigo-100">
                            {user.unreadCount}
                        </span>
                    )}
                  </div>
                ))
            )}
          </div>
        </div>

        {/* RIGHT: CHAT AREA */}
        <div className="flex-1 flex flex-col bg-slate-50 relative">
          {!selectedUser ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
               <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-slate-100">
                  <User size={40} className="text-slate-300" />
               </div>
               <h3 className="text-lg font-semibold text-slate-700 mb-1">Select a conversation</h3>
               <p className="text-sm text-slate-400">Choose a tenant or owner to start chatting</p>
            </div>
          ) : (
            <>
              {/* Active Chat Header */}
              <div className="h-[73px] px-6 bg-white border-b border-slate-100 flex items-center justify-between shadow-sm z-20">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-indigo-100">
                      {selectedUser.name ? selectedUser.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                            {selectedUser.name || selectedUser.email}
                            <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-wide border border-indigo-100">
                                {selectedUser.role}
                            </span>
                        </h3>
                        <p className="text-xs text-emerald-600 font-medium flex items-center gap-1.5 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> 
                            Active Now
                        </p>
                    </div>
                </div>
                <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-all">
                    <MoreVertical size={20} />
                </button>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
                 {loading && messages.length === 0 ? (
                    <div className="flex justify-center p-8"><RefreshCw className="animate-spin text-indigo-400" /></div>
                 ) : (
                     messages.map((msg, index) => {
                         const isMe = msg.senderId === currentUser?.id;
                         return (
                             <div key={msg.id || index} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group`}>
                                 {!isMe && (
                                     <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 mr-3 self-end shadow-sm">
                                         {msg.sender?.name?.charAt(0) || 'U'}
                                     </div>
                                 )}
                                 <div className={`max-w-[65%] px-5 py-3.5 rounded-2xl text-[13.5px] leading-relaxed shadow-sm transition-all ${
                                     isMe 
                                     ? 'bg-indigo-600 text-white rounded-br-sm shadow-indigo-100' 
                                     : 'bg-white text-slate-700 border border-slate-100 rounded-bl-sm'
                                 }`}>
                                     {msg.content}
                                     <div className={`text-[10px] mt-1.5 text-right font-medium ${isMe ? 'text-indigo-200' : 'text-slate-400'}`}>
                                         {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                     </div>
                                 </div>
                             </div>
                         );
                     })
                 )}
                 <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 bg-white border-t border-slate-100">
                <form onSubmit={handleSendMessage} className="flex gap-3 max-w-4xl mx-auto">
                    <input 
                        type="text" 
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder={`Message ${selectedUser.name || 'user'}...`}
                        className="flex-1 h-12 px-5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all font-medium text-slate-700 placeholder:text-slate-400"
                    />
                    <button 
                        type="submit" 
                        disabled={sending || !newMessage.trim()}
                        className="h-12 w-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {sending ? <RefreshCw className="animate-spin" size={20} /> : <Send size={20} />}
                    </button>
                </form>
              </div>
            </>
          )}
        </div>

      </div>
    </MainLayout>
  );
};

export default Communication;
