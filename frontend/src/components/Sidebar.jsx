import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  FileText, 
  CreditCard, 
  TrendingDown, 
  Settings, 
  LogOut,
  ShieldCheck,
  MessageSquare,
  LayoutGrid,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { logout, user } = useAuth();

  const navItems = [
    { name: 'Dashboard', icon: LayoutGrid, path: '/dashboard' },
    { name: 'Invoices', icon: FileText, path: '/invoices' },
    { name: 'Customers', icon: Users, path: '/customers' },
    { name: 'Products', icon: Package, path: '/products' },
    { name: 'Payments', icon: CreditCard, path: '/payments' },
    { name: 'Expenses', icon: TrendingDown, path: '/expenses' },
    { name: 'Reports', icon: BarChart3, path: '/reports' },
    { name: 'Team Staff', icon: ShieldCheck, path: '/staff' },
    // Admin only
    ...(user?.role === 'admin' ? [
        { name: 'WhatsApp', icon: MessageSquare, path: '/whatsapp' },
        { name: 'Settings', icon: Settings, path: '/settings' },
    ] : [])
  ];

  return (
    <div className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col fixed left-0 top-0 z-10">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
          I
        </div>
        <div>
          <h1 className="font-bold text-gray-900 leading-tight">InvoicePro</h1>
          <p className="text-xs text-gray-500">Management System</p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 text-sm font-bold rounded-2xl transition-all ${
                isActive 
                  ? 'bg-primary-50 text-primary-600 shadow-sm shadow-primary-50' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <item.icon size={20} className="mr-3" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-medium">
            {user?.name?.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 truncate capitalize">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
        >
          <LogOut size={18} className="mr-3" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
