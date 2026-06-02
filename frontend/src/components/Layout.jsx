import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Bell, Search, Mail, HelpCircle, ArrowRight, Loader2 } from 'lucide-react';
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
                  className={`p-2 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-colors ${activeDropdown === 'messages' ? 'text-primary-600 bg-primary-50' : 'text-gray-400'}`}
                >
                  <Mail size={20} />
                </button>
                {activeDropdown === 'messages' && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                      <h3 className="font-semibold text-gray-900">Messages</h3>
                      <span className="text-xs text-primary-600 cursor-pointer hover:underline">New Message</span>
                    </div>
                    <div className="p-4 flex flex-col items-center justify-center text-center space-y-3 min-h-[150px]">
                      <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-400">
                        <Mail size={24} />
                      </div>
                      <p className="text-sm text-gray-500">No new messages.<br/>Your inbox is empty.</p>
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

