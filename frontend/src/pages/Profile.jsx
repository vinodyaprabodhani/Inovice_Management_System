import React from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, Building, LogOut } from 'lucide-react';

const Profile = () => {
  const { user, logout } = useAuth();

  return (
    <Layout title="My Profile">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Profile Header */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-primary-600 to-blue-400 opacity-10"></div>
          
          <div className="relative z-10 w-24 h-24 rounded-full bg-gradient-to-tr from-primary-600 to-primary-400 flex items-center justify-center text-white font-black text-4xl shadow-xl shadow-primary-200 shrink-0 border-4 border-white">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          
          <div className="relative z-10 flex-1">
            <h2 className="text-3xl font-black text-gray-900">{user?.name}</h2>
            <p className="text-gray-500 font-medium capitalize mt-1 flex items-center gap-2">
              <Shield size={16} className={user?.role === 'admin' ? 'text-primary-500' : 'text-gray-400'} />
              {user?.role} Account
            </p>
          </div>
        </div>

        {/* Profile Details */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50">
            <h3 className="font-bold text-gray-900">Account Details</h3>
          </div>
          <div className="p-6 space-y-6">
            
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 shrink-0">
                <User size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 mb-1">Full Name</p>
                <p className="text-gray-600">{user?.name}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 shrink-0">
                <Mail size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 mb-1">Email Address</p>
                <p className="text-gray-600">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 shrink-0">
                <Building size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 mb-1">Organization</p>
                <p className="text-gray-600">{user?.organizationName || 'N/A'}</p>
              </div>
            </div>

          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end pt-4">
          <button 
            onClick={logout}
            className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl font-bold transition-colors"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>

      </div>
    </Layout>
  );
};

export default Profile;
