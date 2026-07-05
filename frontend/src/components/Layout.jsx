import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Bell, Search, Mail, HelpCircle, ArrowRight, Loader2, Check, CheckCheck, Inbox, MessageSquare, ArrowLeft, Send } from 'lucide-react';
import api from '../api/axios';

const defaultCustomerMessages = [
  {
    id: 1,
    sender: 'Acme Corp (Sarah Connor)',
    email: 'sarah@acmecorp.com',
    text: 'Hi, can you please resend invoice #INV-1002 with the updated tax ID?',
    time: '10 mins ago',
    isRead: false,
    replies: []
  },
  {
    id: 2,
    sender: 'TechStart Inc (Alex Rivera)',
    email: 'alex@techstart.io',
    text: 'Payment of $1,250.00 for project milestone has been completed via Stripe.',
    time: '1 hour ago',
    isRead: false,
    replies: []
  },
  {
    id: 3,
    sender: 'Global Solutions',
    email: 'billing@globalsolutions.com',
    text: 'Thanks for the quick invoice update. Everything looks great!',
    time: 'Yesterday',
    isRead: true,
    replies: []
  }
];

const Layout = ({ children, title }) => {
  const { user } = useAuth();
  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const [customerMessages, setCustomerMessages] = useState(() => {
    const saved = localStorage.getItem('invoice_customer_messages');
    return saved ? JSON.parse(saved) : defaultCustomerMessages;
  });

  const [messagesTab, setMessagesTab] = useState('unread');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replySuccessMessage, setReplySuccessMessage] = useState('');

  useEffect(() => {
    localStorage.setItem('invoice_customer_messages', JSON.stringify(customerMessages));
  }, [customerMessages]);

  const unreadMessages = customerMessages.filter(m => !m.isRead);
  const readMessages = customerMessages.filter(m => m.isRead);

  const markAsRead = (id) => {
    setCustomerMessages(prev => prev.map(m => m.id === id ? { ...m, isRead: true } : m));
  };

  const markAsUnread = (id) => {
    setCustomerMessages(prev => prev.map(m => m.id === id ? { ...m, isRead: false } : m));
  };

  const markAllAsRead = () => {
    setCustomerMessages(prev => prev.map(m => ({ ...m, isRead: true })));
  };

  const handleOpenMessage = (msg) => {
    markAsRead(msg.id);
    setSelectedMessage(msg);
    setReplyText('');
    setReplySuccessMessage('');
  };

  const handleSendReply = (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedMessage) return;

    const newReply = {
      id: Date.now(),
      text: replyText.trim(),
      time: 'Just now',
      sender: 'You'
    };

    const updated = customerMessages.map(m => {
      if (m.id === selectedMessage.id) {
        const existingReplies = m.replies || [];
        return {
          ...m,
          replies: [...existingReplies, newReply]
        };
      }
      return m;
    });

    setCustomerMessages(updated);
    setSelectedMessage(prev => ({
      ...prev,
      replies: [...(prev.replies || []), newReply]
    }));
    setReplyText('');
    setReplySuccessMessage('Reply sent successfully!');
    setTimeout(() => setReplySuccessMessage(''), 3000);
  };

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await api.get('/invoices', {
          params: { search: searchQuery }
        });
        setSearchResults(res.data.invoices || []);
      } catch (err) {
        console.error('Error searching invoices', err);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = (name) => {
    if (activeDropdown === name) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(name);
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      
      <div className="flex-1 ml-64 flex flex-col min-h-screen overflow-hidden">
        {/* Top Header */}
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-sm border-b border-gray-200 px-8 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          
          <div className="flex items-center gap-6">
            {/* Search Bar */}
            <div className="relative hidden md:block">
              <div className="flex items-center bg-gray-100 rounded-full px-4 py-2 w-72">
                <Search size={18} className="text-gray-400 mr-2" />
                <input 
                  type="text" 
                  placeholder="Search anything..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                  className="bg-transparent border-none focus:outline-none text-sm w-full"
                />
              </div>

              {isSearchFocused && searchQuery.length > 0 && (
                <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                  <div className="p-3 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Search Results</p>
                    {searching && <Loader2 size={12} className="animate-spin text-gray-400" />}
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {searching && searchResults.length === 0 ? (
                      <div className="p-4 text-center text-sm text-gray-500">Searching...</div>
                    ) : searchResults.length > 0 ? (
                      searchResults.map((inv) => (
                        <Link
                          key={inv.id}
                          to={`/invoices/edit/${inv.id}`}
                          onMouseDown={() => setSearchQuery('')}
                          className="flex flex-col px-4 py-2.5 hover:bg-gray-50 border-b border-gray-50 last:border-b-0 cursor-pointer block"
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-semibold text-gray-900">{inv.invoice_number}</span>
                            <span className="text-sm font-bold text-primary-600">${Number(inv.total || 0).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center mt-0.5">
                            <span className="text-xs text-gray-500">{inv.customer_name}</span>
                            <span className="text-[10px] uppercase font-bold text-gray-400">{inv.status}</span>
                          </div>
                        </Link>
                      ))
                    ) : (
                      <div className="p-4 flex flex-col items-center justify-center text-center space-y-2 min-h-[100px]">
                        <Search size={24} className="text-gray-300" />
                        <p className="text-sm text-gray-500">No results found for "{searchQuery}"</p>
                      </div>
                    )}
                  </div>
                  {searchResults.length > 0 && (
                    <Link
                      to={`/invoices?search=${encodeURIComponent(searchQuery)}`}
                      onMouseDown={() => setSearchQuery('')}
                      className="flex items-center justify-between px-4 py-3 bg-primary-50/50 hover:bg-primary-50 text-xs font-bold text-primary-600 text-center border-t border-gray-100"
                    >
                      <span>View all invoice matches</span>
                      <ArrowRight size={14} />
                    </Link>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-4" ref={dropdownRef}>
              {/* Notifications */}
              <div className="relative">
                <button 
                  onClick={() => toggleDropdown('notifications')}
                  className={`p-2 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-colors relative ${activeDropdown === 'notifications' ? 'text-primary-600 bg-primary-50' : 'text-gray-400'}`}
                >
                  <Bell size={20} />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>
                {activeDropdown === 'notifications' && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                      <h3 className="font-semibold text-gray-900">Notifications</h3>
                      <span className="text-xs text-primary-600 cursor-pointer hover:underline">Mark all as read</span>
                    </div>
                    <div className="p-4 flex flex-col items-center justify-center text-center space-y-3 min-h-[150px]">
                      <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-400">
                        <Bell size={24} />
                      </div>
                      <p className="text-sm text-gray-500">You're all caught up!<br/>No new notifications right now.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Messages */}
              <div className="relative">
                <button 
                  onClick={() => toggleDropdown('messages')}
                  className={`p-2 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-colors relative ${activeDropdown === 'messages' ? 'text-primary-600 bg-primary-50' : 'text-gray-400'}`}
                  title="Messages"
                >
                  <Mail size={20} />
                  {unreadMessages.length > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-white flex items-center justify-center">
                      {unreadMessages.length}
                    </span>
                  )}
                </button>
                {activeDropdown === 'messages' && (
                  <div className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
                    {selectedMessage ? (
                      /* Conversation / Reply View */
                      <div className="flex flex-col max-h-[480px]">
                        {/* Header */}
                        <div className="p-4 border-b border-gray-100 bg-gray-50/80 flex items-center justify-between">
                          <button 
                            onClick={() => setSelectedMessage(null)}
                            className="flex items-center gap-1.5 text-xs font-bold text-primary-600 hover:text-primary-700 bg-primary-50 px-2.5 py-1.5 rounded-lg transition-colors"
                          >
                            <ArrowLeft size={14} /> Back
                          </button>
                          <div className="text-right truncate max-w-[200px]">
                            <p className="text-xs font-bold text-gray-900 truncate">{selectedMessage.sender}</p>
                            <p className="text-[10px] text-gray-400 truncate">{selectedMessage.email}</p>
                          </div>
                        </div>

                        {/* Conversation Body */}
                        <div className="p-4 flex-1 overflow-y-auto space-y-4 max-h-72 bg-gray-50/30">
                          {/* Original Customer Message */}
                          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-2">
                            <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                              <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                                <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-[10px]">
                                  {selectedMessage.sender.charAt(0)}
                                </span>
                                {selectedMessage.sender}
                              </span>
                              <span className="text-[10px] text-gray-400">{selectedMessage.time}</span>
                            </div>
                            <p className="text-xs text-gray-700 leading-relaxed pt-1 whitespace-pre-wrap">{selectedMessage.text}</p>
                          </div>

                          {/* Replies Thread */}
                          {selectedMessage.replies && selectedMessage.replies.map((reply) => (
                            <div key={reply.id} className="flex flex-col items-end space-y-1">
                              <div className="bg-primary-600 text-white p-3 rounded-2xl rounded-tr-none max-w-[85%] text-xs shadow-sm">
                                <p className="leading-relaxed whitespace-pre-wrap">{reply.text}</p>
                              </div>
                              <span className="text-[10px] text-gray-400 px-1">{reply.time}</span>
                            </div>
                          ))}

                          {replySuccessMessage && (
                            <div className="p-2.5 bg-green-50 border border-green-200 text-green-700 text-xs font-bold rounded-xl text-center animate-in fade-in">
                              {replySuccessMessage}
                            </div>
                          )}
                        </div>

                        {/* Reply Form */}
                        <form onSubmit={handleSendReply} className="p-3 bg-white border-t border-gray-100 flex items-center gap-2">
                          <input 
                            type="text" 
                            required
                            placeholder={`Reply to ${selectedMessage.sender.split(' ')[0]}...`}
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            className="flex-1 px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-xs font-medium"
                          />
                          <button 
                            type="submit"
                            className="px-4 py-2.5 bg-primary-600 text-white rounded-xl text-xs font-bold hover:bg-primary-700 transition-colors flex items-center gap-1 shrink-0 shadow-md shadow-primary-200"
                          >
                            <Send size={13} /> Send
                          </button>
                        </form>
                      </div>
                    ) : (
                      /* Message List View */
                      <>
                        {/* Header */}
                        <div className="p-4 border-b border-gray-100 bg-gray-50/70 flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-gray-900 text-base">Customer Messages</h3>
                            {unreadMessages.length > 0 && (
                              <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs font-bold rounded-full">
                                {unreadMessages.length} New
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-gray-100 bg-gray-50/40 text-xs font-bold">
                          <button
                            onClick={() => setMessagesTab('unread')}
                            className={`flex-1 py-2.5 text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
                              messagesTab === 'unread' 
                                ? 'border-primary-600 text-primary-600 bg-white' 
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                          >
                            <span>New Messages</span>
                            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${messagesTab === 'unread' ? 'bg-primary-100 text-primary-700' : 'bg-gray-200 text-gray-600'}`}>
                              {unreadMessages.length}
                            </span>
                          </button>
                          <button
                            onClick={() => setMessagesTab('read')}
                            className={`flex-1 py-2.5 text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
                              messagesTab === 'read' 
                                ? 'border-primary-600 text-primary-600 bg-white' 
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                          >
                            <span>Read Messages</span>
                            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${messagesTab === 'read' ? 'bg-primary-100 text-primary-700' : 'bg-gray-200 text-gray-600'}`}>
                              {readMessages.length}
                            </span>
                          </button>
                        </div>

                        {/* Message List */}
                        <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                          {messagesTab === 'unread' ? (
                            unreadMessages.length > 0 ? (
                              unreadMessages.map((msg) => (
                                <div 
                                  key={msg.id}
                                  className="p-3.5 hover:bg-primary-50/40 transition-colors flex items-start justify-between gap-3 group cursor-pointer"
                                  onClick={() => handleOpenMessage(msg)}
                                >
                                  <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                                    {msg.sender.charAt(0)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-1">
                                      <p className="text-xs font-bold text-gray-900 truncate">{msg.sender}</p>
                                      <span className="text-[10px] text-primary-600 font-semibold shrink-0 ml-2">{msg.time}</span>
                                    </div>
                                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">{msg.text}</p>
                                  </div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      markAsRead(msg.id);
                                    }}
                                    className="p-1 text-gray-400 hover:text-primary-600 hover:bg-primary-100 rounded-lg transition-colors shrink-0"
                                    title="Mark as read"
                                  >
                                    <Check size={15} />
                                  </button>
                                </div>
                              ))
                            ) : (
                              <div className="p-8 text-center flex flex-col items-center justify-center space-y-2">
                                <div className="w-12 h-12 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-1">
                                  <CheckCheck size={24} />
                                </div>
                                <p className="text-sm font-bold text-gray-800">All caught up!</p>
                                <p className="text-xs text-gray-400">No new unread messages. Check "Read Messages" to view history.</p>
                              </div>
                            )
                          ) : (
                            readMessages.length > 0 ? (
                              readMessages.map((msg) => (
                                <div 
                                  key={msg.id}
                                  className="p-3.5 bg-gray-50/50 hover:bg-gray-100/50 transition-colors flex items-start justify-between gap-3 group cursor-pointer"
                                  onClick={() => handleOpenMessage(msg)}
                                >
                                  <div className="w-9 h-9 rounded-full bg-gray-200 text-gray-600 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                                    {msg.sender.charAt(0)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-1">
                                      <p className="text-xs font-medium text-gray-800 truncate">{msg.sender}</p>
                                      <span className="text-[10px] text-gray-400 shrink-0 ml-2">{msg.time}</span>
                                    </div>
                                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{msg.text}</p>
                                  </div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      markAsUnread(msg.id);
                                    }}
                                    className="p-1 text-gray-400 hover:text-primary-600 rounded-lg transition-colors shrink-0 text-[10px] font-bold"
                                    title="Mark as unread"
                                  >
                                    Unread
                                  </button>
                                </div>
                              ))
                            ) : (
                              <div className="p-8 text-center flex flex-col items-center justify-center space-y-2">
                                <Inbox size={28} className="text-gray-300 mb-1" />
                                <p className="text-sm font-semibold text-gray-600">No read messages</p>
                                <p className="text-xs text-gray-400">Read messages will be archived here.</p>
                              </div>
                            )
                          )}
                        </div>

                        {/* Footer */}
                        <div className="p-3 bg-gray-50/80 border-t border-gray-100 flex justify-between items-center text-xs font-semibold">
                          {unreadMessages.length > 0 ? (
                            <button 
                              onClick={markAllAsRead}
                              className="text-primary-600 hover:underline cursor-pointer"
                            >
                              Mark all as read
                            </button>
                          ) : (
                            <span className="text-gray-400">Updated just now</span>
                          )}
                          <Link 
                            to="/support" 
                            onClick={() => setActiveDropdown(null)} 
                            className="text-gray-600 hover:text-primary-600 flex items-center gap-1"
                          >
                            View in Support <ArrowRight size={12} />
                          </Link>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Help & Support */}
              <div className="relative">
                <button 
                  onClick={() => toggleDropdown('help')}
                  className={`p-2 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-colors ${activeDropdown === 'help' ? 'text-primary-600 bg-primary-50' : 'text-gray-400'}`}
                >
                  <HelpCircle size={20} />
                </button>
                {activeDropdown === 'help' && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                    <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                      <h3 className="font-semibold text-gray-900">Help & Support</h3>
                    </div>
                    <div className="p-2">
                      <Link to="/docs" onClick={() => setActiveDropdown(null)} className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                        <span className="font-medium">Documentation</span>
                      </Link>
                      <Link to="/support" onClick={() => setActiveDropdown(null)} className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                        <span className="font-medium">Contact Support</span>
                      </Link>
                      <button 
                        onClick={() => {
                          setActiveDropdown(null);
                          setIsShortcutsOpen(true);
                        }} 
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <span className="font-medium">Keyboard Shortcuts</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="h-8 w-px bg-gray-200"></div>

            <Link to="/profile" className="flex items-center gap-3 hover:bg-gray-50 p-1.5 pr-4 rounded-2xl transition-colors cursor-pointer group">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">{user?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary-600 to-primary-400 flex items-center justify-center text-white font-bold shadow-lg shadow-primary-200 group-hover:scale-105 transition-transform overflow-hidden">
                {user?.avatar ? (
                  <img src={`${import.meta.env.VITE_UPLOAD_URL || 'http://localhost:5000'}${user.avatar}`} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  user?.name?.charAt(0).toUpperCase()
                )}
              </div>
            </Link>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-8 overflow-y-auto relative">
          {children}

          {/* Keyboard Shortcuts Modal */}
          {isShortcutsOpen && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                  <h3 className="font-bold text-gray-900 text-lg">Keyboard Shortcuts</h3>
                  <button onClick={() => setIsShortcutsOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">New Invoice</span>
                    <kbd className="px-2 py-1 bg-gray-100 border border-gray-200 rounded text-xs font-mono text-gray-600 font-bold">Ctrl + I</kbd>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Search</span>
                    <kbd className="px-2 py-1 bg-gray-100 border border-gray-200 rounded text-xs font-mono text-gray-600 font-bold">Ctrl + K</kbd>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Go to Dashboard</span>
                    <kbd className="px-2 py-1 bg-gray-100 border border-gray-200 rounded text-xs font-mono text-gray-600 font-bold">G then D</kbd>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Close Modals</span>
                    <kbd className="px-2 py-1 bg-gray-100 border border-gray-200 rounded text-xs font-mono text-gray-600 font-bold">Esc</kbd>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                  <button onClick={() => setIsShortcutsOpen(false)} className="px-4 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors">
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Layout;

