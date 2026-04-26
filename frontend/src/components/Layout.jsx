import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Bell, Search, Mail, HelpCircle } from 'lucide-react';

const Layout = ({ children, title }) => {
  const { user } = useAuth();
  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

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
                <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                  <div className="p-3 border-b border-gray-100 bg-gray-50/50">
                    <p className="text-xs font-medium text-gray-500">Search Results</p>
                  </div>
                  <div className="p-4 flex flex-col items-center justify-center text-center space-y-2 min-h-[100px]">
                    <Search size={24} className="text-gray-300" />
                    <p className="text-sm text-gray-500">No results found for "{searchQuery}"</p>
                  </div>
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
                      <a href="#" className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                        <span className="font-medium">Documentation</span>
                      </a>
                      <a href="#" className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                        <span className="font-medium">Contact Support</span>
                      </a>
                      <a href="#" className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                        <span className="font-medium">Keyboard Shortcuts</span>
                      </a>
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
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary-600 to-primary-400 flex items-center justify-center text-white font-bold shadow-lg shadow-primary-200 group-hover:scale-105 transition-transform">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            </Link>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;

