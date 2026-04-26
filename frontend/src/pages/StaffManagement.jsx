import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { 
  Plus, 
  Users, 
  Shield, 
  ShieldAlert, 
  Mail, 
  Trash2, 
  CheckCircle2, 
  X,
  MoreVertical
} from 'lucide-react';

const StaffManagement = () => {
  const [users, setUsers] = useState([]);
  const { user: currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'staff'
  });

  useEffect(() => {
    fetchUsers();
    
    const handleClickOutside = (event) => {
      if (!event.target.closest('.user-dropdown-container')) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users/organization');
      setUsers(res.data);
    } catch (err) {
      console.error('Error fetching users', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/users/invite', formData);
      setShowModal(false);
      setFormData({ name: '', email: '', password: '', role: 'staff' });
      fetchUsers();
    } catch (err) {
      console.error('Error adding user', err);
      alert(err.response?.data?.message || 'Failed to add user');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this user from your organization?')) {
      try {
        await api.delete(`/users/${id}`);
        fetchUsers();
      } catch (err) {
        console.error('Error deleting user', err);
      }
    }
  };

  const handleUpdateRole = async (id, newRole, currentActive) => {
    try {
      await api.put(`/users/${id}`, { role: newRole, is_active: currentActive });
      fetchUsers();
      setActiveDropdown(null);
    } catch (err) {
      console.error('Error updating user', err);
      alert(err.response?.data?.message || 'Failed to update user');
    }
  };

  const handleToggleActive = async (id, currentRole, newActiveStatus) => {
    try {
      await api.put(`/users/${id}`, { role: currentRole, is_active: newActiveStatus ? 1 : 0 });
      fetchUsers();
      setActiveDropdown(null);
    } catch (err) {
      console.error('Error updating user', err);
      alert(err.response?.data?.message || 'Failed to update user');
    }
  };

  return (
    <Layout title="Staff Management">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Team Members</h2>
           <p className="text-gray-500 text-sm">Manage who has access to your organization.</p>
        </div>
        
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-xl font-bold shadow-lg shadow-primary-200 hover:bg-primary-700 transition-all"
        >
          <Plus size={18} />
          Invite Member
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
             [...Array(3)].map((_, i) => <div key={i} className="h-48 bg-gray-100 rounded-3xl animate-pulse"></div>)
        ) : users.map(user => (
            <div key={user.id} className={`bg-white p-6 rounded-3xl border ${user.is_active ? 'border-gray-100' : 'border-red-100 bg-red-50/10'} shadow-sm relative group user-dropdown-container`}>
                <div className="absolute top-6 right-6">
                    <button 
                      onClick={() => setActiveDropdown(activeDropdown === user.id ? null : user.id)}
                      className="p-2 text-gray-300 hover:text-gray-600 focus:outline-none"
                    >
                        <MoreVertical size={18} />
                    </button>
                    {activeDropdown === user.id && currentUser?.role === 'admin' && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                        <div className="p-2 flex flex-col">
                          {user.role === 'staff' ? (
                            <button onClick={() => handleUpdateRole(user.id, 'admin', user.is_active)} className="text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">Make Admin</button>
                          ) : (
                            <button onClick={() => handleUpdateRole(user.id, 'staff', user.is_active)} className="text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">Revoke Admin</button>
                          )}
                          
                          {user.is_active ? (
                            <button onClick={() => handleToggleActive(user.id, user.role, false)} className="text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg">Deactivate User</button>
                          ) : (
                            <button onClick={() => handleToggleActive(user.id, user.role, true)} className="text-left px-4 py-2 text-sm text-green-600 hover:bg-green-50 rounded-lg">Activate User</button>
                          )}
                        </div>
                      </div>
                    )}
                </div>

                <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center text-primary-600 font-black text-xl">
                        {user.name.charAt(0)}
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 line-clamp-1">
                          {user.name} {!user.is_active && <span className="text-xs text-red-500 font-normal ml-2">(Inactive)</span>}
                        </h3>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Mail size={12} /> {user.email}
                        </p>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                    <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${user.role === 'admin' ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                        {user.role === 'admin' ? <ShieldAlert size={12} /> : <Shield size={12} />}
                        {user.role}
                    </span>
                    
                    {currentUser?.role === 'admin' && (
                      <button 
                          onClick={() => handleDelete(user.id)}
                          className="p-2 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      >
                          <Trash2 size={16} />
                      </button>
                    )}
                </div>
            </div>
        ))}
      </div>

      {/* Invite Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
             <div className="px-8 py-8 border-b border-gray-50 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Invite New Member</h3>
                <p className="text-sm text-gray-500">They will receive access to your organization.</p>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 bg-gray-50 rounded-xl"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">User Name or Organization Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jane Doe"
                  className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-primary-500 outline-none transition-all"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-primary-500 outline-none transition-all"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Initial Password</label>
                <input
                  type="password"
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-primary-500 outline-none transition-all"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Permissions Role</label>
                <div className="grid grid-cols-2 gap-4">
                    <button 
                        type="button"
                        onClick={() => setFormData({...formData, role: 'staff'})}
                        className={`p-4 rounded-2xl border transition-all text-left ${formData.role === 'staff' ? 'border-primary-600 bg-primary-50 ring-1 ring-primary-600' : 'border-gray-100 bg-white hover:bg-gray-50'}`}
                    >
                        <Shield size={20} className={formData.role === 'staff' ? 'text-primary-600' : 'text-gray-400'} />
                        <p className={`mt-2 font-bold text-sm ${formData.role === 'staff' ? 'text-primary-900' : 'text-gray-900'}`}>Staff Member</p>
                        <p className="text-[10px] text-gray-500 mt-1 uppercase font-black">Limited Access</p>
                    </button>
                    <button 
                         type="button"
                         onClick={() => setFormData({...formData, role: 'admin'})}
                         className={`p-4 rounded-2xl border transition-all text-left ${formData.role === 'admin' ? 'border-purple-600 bg-purple-50 ring-1 ring-purple-600' : 'border-gray-100 bg-white hover:bg-gray-50'}`}
                    >
                        <ShieldAlert size={20} className={formData.role === 'admin' ? 'text-purple-600' : 'text-gray-400'} />
                        <p className={`mt-2 font-bold text-sm ${formData.role === 'admin' ? 'text-purple-900' : 'text-gray-900'}`}>Org Admin</p>
                        <p className="text-[10px] text-gray-500 mt-1 uppercase font-black">Full Access</p>
                    </button>
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all">Cancel</button>
                <button type="submit" className="flex-1 py-4 bg-primary-600 text-white rounded-2xl font-black shadow-xl shadow-primary-200 hover:bg-primary-700 transition-all flex items-center justify-center gap-2">
                   Send Invitation
                   <CheckCircle2 size={18} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default StaffManagement;
