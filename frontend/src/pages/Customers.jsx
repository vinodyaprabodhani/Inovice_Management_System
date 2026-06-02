import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Plus, 
  Search, 
  Mail, 
  Phone, 
  MapPin, 
  Edit2, 
  Trash2, 
  ExternalLink,
  User,
  MoreVertical,
  X,
  Loader2,
  Paperclip,
  Download
} from 'lucide-react';

const Customers = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [phoneError, setPhoneError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    tax_id: ''
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await api.get('/customers');
      setCustomers(res.data);
    } catch (err) {
      console.error('Error fetching customers', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (customer = null) => {
    setPhoneError('');
    if (customer) {
      setEditingCustomer(customer);
      setFormData({
        name: customer.name,
        email: customer.email || '',
        phone: customer.phone || '',
        address: customer.address || '',
        tax_id: customer.tax_id || ''
      });
      fetchAttachments(customer.id);
    } else {
      setEditingCustomer(null);
      setAttachments([]);
      setFormData({ name: '', email: '', phone: '', address: '', tax_id: '' });
    }
    setShowModal(true);
  };

  const fetchAttachments = async (id) => {
    try {
      const res = await api.get(`/customers/${id}/attachments`);
      setAttachments(res.data);
    } catch (err) {
      console.error('Error fetching attachments', err);
    }
  };

  const handleFileUpload = async (e) => {
    if (!e.target.files || !e.target.files[0] || !editingCustomer) return;
    const file = e.target.files[0];
    const uploadData = new FormData();
    uploadData.append('file', file);
    
    try {
      await api.post(`/customers/${editingCustomer.id}/attachments`, uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      fetchAttachments(editingCustomer.id);
    } catch (err) {
      console.error('Error uploading file', err);
      alert('Error uploading file');
    }
  };

  const handleDeleteAttachment = async (attachmentId) => {
    if (!window.confirm('Delete this attachment?')) return;
    try {
      await api.delete(`/customers/${editingCustomer.id}/attachments/${attachmentId}`);
      fetchAttachments(editingCustomer.id);
    } catch (err) {
      console.error('Error deleting attachment', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPhoneError('');

    // Check if phone number has letters/alphabet characters
    if (formData.phone && /[a-zA-Z]/.test(formData.phone)) {
      setPhoneError('This field should include numbers only');
      return;
    }

    try {
      if (editingCustomer) {
        await api.put(`/customers/${editingCustomer.id}`, formData);
      } else {
        await api.post('/customers', formData);
      }
      setShowModal(false);
      fetchCustomers();
    } catch (err) {
      console.error('Error saving customer', err);
      alert(err.response?.data?.message || 'Failed to save customer. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await api.delete(`/customers/${id}`);
        fetchCustomers();
      } catch (err) {
        console.error('Error deleting customer', err);
      }
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    (c.email && c.email.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <Layout title="Customers">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search customers by name or email..." 
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-xl font-bold shadow-lg shadow-primary-200 hover:bg-primary-700 transition-all"
        >
          <Plus size={18} />
          Add Customer
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          [...Array(6)].map((_, i) => <div key={i} className="h-48 bg-gray-100 rounded-3xl animate-pulse"></div>)
        ) : filteredCustomers.length > 0 ? filteredCustomers.map((customer) => (
          <div key={customer.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group relative">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-primary-600 font-bold text-xl uppercase">
                {customer.name.charAt(0)}
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleOpenModal(customer)} className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                  <Edit2 size={16} />
                </button>
                {user?.role === 'admin' && (
                  <button onClick={() => handleDelete(customer.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-4">{customer.name}</h3>
            
            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-500">
                <Mail size={16} className="mr-3 text-gray-400" />
                {customer.email || 'No email provided'}
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Phone size={16} className="mr-3 text-gray-400" />
                {customer.phone || 'No phone provided'}
              </div>
              <div className="flex items-start text-sm text-gray-500">
                <MapPin size={16} className="mr-3 text-gray-400 mt-0.5" />
                <span className="line-clamp-2">{customer.address || 'No address provided'}</span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-50 flex items-center justify-between">
              <span className="text-xs font-medium text-gray-400">Since {new Date(customer.created_at).toLocaleDateString()}</span>
              <button 
                onClick={() => navigate(`/invoices?search=${encodeURIComponent(customer.name)}`)}
                className="text-xs font-bold text-primary-600 flex items-center hover:underline"
              >
                View History <ExternalLink size={12} className="ml-1" />
              </button>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-20 text-center">
            <User size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-lg font-medium text-gray-400">No customers found</p>
          </div>
        )}
      </div>

      {/* Customer Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0">
              <h3 className="text-xl font-bold text-gray-900">
                {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Customer Name</label>
                <input
                  type="text"
                  required
                  placeholder="Business or Individual Name"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    placeholder="email@example.com"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                 <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+1 (555) 000-0000"
                    className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all ${
                      phoneError ? 'border-red-500 focus:ring-red-500' : 'border-gray-200'
                    }`}
                    value={formData.phone}
                    onChange={(e) => {
                      setFormData({...formData, phone: e.target.value});
                      if (phoneError) setPhoneError('');
                    }}
                  />
                  {phoneError && (
                    <p className="text-red-500 text-xs mt-1 font-medium">{phoneError}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Tax ID / VAT Number</label>
                <input
                  type="text"
                  placeholder="TAX-123456"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
                  value={formData.tax_id}
                  onChange={(e) => setFormData({...formData, tax_id: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Detailed Address</label>
                <textarea
                  rows="3"
                  placeholder="Street address, City, Country, ZIP"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                ></textarea>
              </div>

              {editingCustomer && (
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700">Attachments</label>
                    <label className="cursor-pointer text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center">
                      <Paperclip size={16} className="mr-1" />
                      Upload File
                      <input type="file" className="hidden" onChange={handleFileUpload} />
                    </label>
                  </div>
                  
                  {attachments.length > 0 ? (
                    <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
                      {attachments.map(att => (
                        <div key={att.id} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg border border-gray-100">
                          <div className="flex items-center overflow-hidden">
                            <Paperclip size={14} className="text-gray-400 mr-2 flex-shrink-0" />
                            <span className="text-sm text-gray-700 truncate">{att.file_name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <a href={`http://localhost:5000${att.file_url}`} target="_blank" rel="noopener noreferrer" className="p-1.5 text-gray-400 hover:text-primary-600 rounded-md">
                              <Download size={14} />
                            </a>
                            <button type="button" onClick={() => handleDeleteAttachment(att.id)} className="p-1.5 text-gray-400 hover:text-red-600 rounded-md">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-400 italic text-center p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                      No attachments yet.
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 px-4 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 bg-primary-600 text-white rounded-xl font-bold shadow-lg shadow-primary-200 hover:bg-primary-700 transition-all"
                >
                  {editingCustomer ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Customers;
