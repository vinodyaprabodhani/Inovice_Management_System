import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, Building, LogOut, Edit2, X, Check, Save, Lock, Camera } from 'lucide-react';
import api from '../api/axios';

const Profile = () => {
  const { user, logout } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar ? `${import.meta.env.VITE_UPLOAD_URL || 'http://localhost:5000'}${user.avatar}` : null);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: ''
  });

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setError('');
    setMessage('');
    setAvatarFile(null);
    setRemoveAvatar(false);
    setAvatarPreview(user?.avatar ? `${import.meta.env.VITE_UPLOAD_URL || 'http://localhost:5000'}${user.avatar}` : null);
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      password: ''
    });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setRemoveAvatar(false);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('email', formData.email);
      if (formData.password) data.append('password', formData.password);
      if (avatarFile) data.append('avatar', avatarFile);
      if (removeAvatar) data.append('removeAvatar', 'true');
      
      const res = await api.put('/users/profile', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setMessage(res.data.message);
      setIsEditing(false);
      
      const localUser = JSON.parse(localStorage.getItem('user'));
      if (localUser) {
        localUser.name = formData.name;
        localUser.email = formData.email;
        if (removeAvatar) localUser.avatar = null;
        else if (res.data.avatar && res.data.avatar !== 'REMOVE') localUser.avatar = res.data.avatar;
        localStorage.setItem('user', JSON.stringify(localUser));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="My Profile">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {message && (
          <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded-lg flex items-center text-green-700 font-medium">
            <Check size={18} className="mr-3 shrink-0" />
            <div>
              {message} <button onClick={() => window.location.reload()} className="ml-2 underline hover:text-green-800 font-bold">Refresh page to see changes</button>
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-center text-red-700 font-medium">
            <X size={18} className="mr-3 shrink-0" />
            {error}
          </div>
        )}

        {/* Profile Header */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between relative overflow-hidden gap-6">
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-primary-600 to-blue-400 opacity-10 pointer-events-none"></div>
          
          <div className="flex items-center gap-8 relative z-10 w-full md:w-auto">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-primary-600 to-primary-400 flex items-center justify-center text-white font-black text-4xl shadow-xl shadow-primary-200 shrink-0 border-4 border-white overflow-hidden">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  (formData.name || user?.name || 'U').charAt(0).toUpperCase()
                )}
              </div>
              {isEditing && (
                <div className="absolute -bottom-2 -right-2 flex gap-1">
                  <label className="w-8 h-8 bg-primary-600 text-white rounded-full shadow-lg border-2 border-white flex items-center justify-center cursor-pointer hover:bg-primary-700 transition-colors">
                    <Camera size={14} />
                    <input type="file" className="hidden" onChange={handleAvatarChange} accept="image/*" />
                  </label>
                  {avatarPreview && (
                    <button 
                      type="button" 
                      onClick={() => {
                        setAvatarPreview(null);
                        setAvatarFile(null);
                        setRemoveAvatar(true);
                      }}
                      className="w-8 h-8 bg-red-500 text-white rounded-full shadow-lg border-2 border-white flex items-center justify-center cursor-pointer hover:bg-red-600 transition-colors"
                      title="Remove Avatar"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <h2 className="text-3xl font-black text-gray-900">{formData.name || user?.name}</h2>
              <p className="text-gray-500 font-medium capitalize mt-1 flex items-center gap-2">
                <Shield size={16} className={user?.role === 'admin' ? 'text-primary-500' : 'text-gray-400'} />
                {user?.role} Account
              </p>
            </div>
          </div>

          <div className="relative z-10 w-full md:w-auto flex justify-end">
             {!isEditing ? (
              <button 
                onClick={handleEditToggle}
                className="flex items-center justify-center w-full md:w-auto gap-2 px-5 py-2.5 bg-gray-50 text-gray-700 hover:bg-gray-100 rounded-xl font-bold transition-colors"
              >
                <Edit2 size={18} />
                Edit Profile
              </button>
             ) : (
              <button 
                onClick={handleEditToggle}
                className="flex items-center justify-center w-full md:w-auto gap-2 px-5 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl font-bold transition-colors"
              >
                <X size={18} />
                Cancel Edit
              </button>
             )}
          </div>
        </div>

        {/* Profile Details */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden transition-all">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <h3 className="font-bold text-gray-900">Account Details</h3>
          </div>
          
          <div className="p-6">
            {!isEditing ? (
              <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
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
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-2">
                      <User size={16} className="text-gray-400"/> Full Name
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 transition-all font-medium"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-2">
                      <Mail size={16} className="text-gray-400"/> Email Address
                    </label>
                    <input
                      type="email"
                      required
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 transition-all font-medium"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-2">
                      <Lock size={16} className="text-gray-400"/> New Password
                    </label>
                    <input
                      type="password"
                      placeholder="Leave blank to keep your current password"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 transition-all font-medium"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end pt-4 border-t border-gray-100">
                  <button
                      type="submit"
                      disabled={loading}
                      className="flex items-center gap-2 px-8 py-3 bg-primary-600 text-white rounded-xl font-bold shadow-xl shadow-primary-200 hover:bg-primary-700 transition-all disabled:opacity-70 w-full md:w-auto justify-center"
                  >
                      {loading ? (
                          <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      ) : (
                          <Save size={20} />
                      )}
                      {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Actions */}
        {!isEditing && (
          <div className="flex justify-end pt-4">
            <button 
              onClick={logout}
              className="flex items-center justify-center w-full md:w-auto gap-2 px-6 py-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl font-bold transition-colors"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        )}

      </div>
    </Layout>
  );
};

export default Profile;
