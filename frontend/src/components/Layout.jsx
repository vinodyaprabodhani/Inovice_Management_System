import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Bell, Search, Mail, HelpCircle, ArrowRight, Loader2, Send, X, Check } from 'lucide-react';
import api from '../api/axios';

const Layout = ({ children, title }) => {
  const { user } = useAuth();
  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  // New Message State
  const [isNewMessageOpen, setIsNewMessageOpen] = useState(false);
  const [messageForm, setMessageForm] = useState({ recipient: '', subject: '', message: '', type: 'Email' });
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageSuccess, setMessageSuccess] = useState('');
  const [messageError, setMessageError] = useState('');
  const [messagesList, setMessagesList] = useState([]);

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

  const fetchMessages = async () => {
    try {
      const res = await api.get('/notifications');
      setMessagesList(res.data || []);
    } catch (err) {
      console.error('Error fetching messages', err);
    }
  };

  const toggleDropdown = (name) => {
    if (activeDropdown === name) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(name);
      if (name === 'messages') {
        fetchMessages();
      }
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    setSendingMessage(true);
    setMessageError('');
    setMessageSuccess('');
    try {
      const res = await api.post('/notifications/custom', messageForm);
      setMessageSuccess(res.data.message || 'Message sent successfully!');
      setMessageForm({ recipient: '', subject: '', message: '', type: 'Email' });
      fetchMessages();
    } catch (err) {
      setMessageError(err.response?.data?.message || 'Failed to send message.');
    } finally {
      setSendingMessage(false);
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
                  className={`p-2 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-colors ${activeDropdown === 'messages' ? 'text-primary-600 bg-primary-50' : 'text-gray-400'}`}
                >
                  <Mail size={20} />
                </button>
                {activeDropdown === 'messages' && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                      <h3 className="font-semibold text-gray-900">Messages</h3>
                      <button 
                        onClick={() => {
                          setActiveDropdown(null);
                          setIsNewMessageOpen(true);
                        }}
                        className="text-xs text-primary-600 font-bold cursor-pointer hover:underline"
                      >
                        New Message
                      </button>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {messagesList.length > 0 ? (
                        messagesList.map((msg) => (
                          <div key={msg.id} className="p-3 border-b border-gray-50 hover:bg-gray-50/80 transition-colors">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs font-bold text-gray-900 truncate">{msg.recipient}</span>
                              <span className="text-[10px] text-gray-400">{new Date(msg.sent_at).toLocaleDateString()}</span>
                            </div>
                            <p className="text-xs text-gray-500 truncate">{msg.type} • Status: {msg.status}</p>
                          </div>
                        ))
                      ) : (
                        <div className="p-6 flex flex-col items-center justify-center text-center space-y-3 min-h-[150px]">
                          <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-400">
                            <Mail size={24} />
                          </div>
                          <p className="text-sm text-gray-500">No recent messages.<br/>Click "New Message" to compose.</p>
                        </div>
                      )}
                    </div>
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

          {/* New Message Composition Modal */}
          {isNewMessageOpen && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                  <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                    <Mail className="text-primary-600" size={20} />
                    New Message
                  </h3>
                  <button onClick={() => setIsNewMessageOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
                    <X size={20} />
                  </button>
                </div>

                {messageSuccess ? (
                  <div className="p-8 text-center space-y-4">
                    <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto">
                      <Check size={32} />
                    </div>
                    <h4 className="text-xl font-bold text-gray-900">Message Sent!</h4>
                    <p className="text-sm text-gray-500">{messageSuccess}</p>
                    <button
                      onClick={() => {
                        setIsNewMessageOpen(false);
                        setMessageSuccess('');
                      }}
                      className="px-6 py-2.5 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors"
                    >
                      Done
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSendMessage} className="p-6 space-y-4">
                    {messageError && (
                      <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-xl flex items-center justify-between">
                        <span>{messageError}</span>
                        <button type="button" onClick={() => setMessageError('')}><X size={14} /></button>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Channel / Type</label>
                        <select
                          value={messageForm.type}
                          onChange={(e) => setMessageForm({ ...messageForm, type: e.target.value })}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium"
                        >
                          <option value="Email">Email</option>
                          <option value="WhatsApp">WhatsApp</option>
                          <option value="Internal Note">Internal Note</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">To (Recipient)</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. client@example.com or phone"
                          value={messageForm.recipient}
                          onChange={(e) => setMessageForm({ ...messageForm, recipient: e.target.value })}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Subject</label>
                      <input
                        type="text"
                        required
                        placeholder="Message subject line..."
                        value={messageForm.subject}
                        onChange={(e) => setMessageForm({ ...messageForm, subject: e.target.value })}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Message Content</label>
                      <textarea
                        required
                        rows="4"
                        placeholder="Write your message here..."
                        value={messageForm.message}
                        onChange={(e) => setMessageForm({ ...messageForm, message: e.target.value })}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium"
                      ></textarea>
                    </div>

                    <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={() => setIsNewMessageOpen(false)}
                        className="px-5 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-200 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={sendingMessage}
                        className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-200 disabled:opacity-70"
                      >
                        {sendingMessage ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Send size={16} />
                        )}
                        {sendingMessage ? 'Sending...' : 'Send Message'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}

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

