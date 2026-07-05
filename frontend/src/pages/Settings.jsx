import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { 
  Building, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Camera, 
  Save, 
  Check, 
  CreditCard,
  Hash,
  Palette
} from 'lucide-react';

const Settings = () => {
  const { updateUser } = useAuth();
  const [org, setOrg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    tax_id: '',
    currency: 'USD',
    color_theme: '#3b82f6'
  });
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/organization');
      setOrg(res.data);
      setFormData({
        name: res.data.name || '',
        email: res.data.email || '',
        phone: res.data.phone || '',
        address: res.data.address || '',
        tax_id: res.data.tax_id || '',
        currency: res.data.currency || 'USD',
        color_theme: res.data.color_theme || '#3b82f6'
      });
      if (res.data.logo_url) setLogoPreview(`${import.meta.env.VITE_UPLOAD_URL || 'http://localhost:5000'}${res.data.logo_url}`);
    } catch (err) {
      console.error('Error fetching settings', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogo(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    
    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    if (logo) data.append('logo', logo);

    try {
      await api.put('/organization', data);
      updateUser({ organizationName: formData.name });
      setMessage('Settings updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Error updating settings', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Layout title="Settings"><div className="animate-pulse h-96 bg-gray-100 rounded-3xl"></div></Layout>;

  return (
    <Layout title="Organization Settings">
      <div className="max-w-4xl mx-auto">
        {message && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg flex items-center text-green-700 font-medium animate-in slide-in-from-top-2">
            <Check size={18} className="mr-3" />
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* General Information */}
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <Building size={20} className="mr-3 text-primary-600" />
              General Information
            </h3>
            
            <div className="flex flex-col md:flex-row gap-8">
              {/* Logo Upload */}
              <div className="flex flex-col items-center">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 overflow-hidden flex items-center justify-center">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo" className="w-full h-full object-contain p-2" />
                    ) : (
                      <Building size={40} className="text-gray-200" />
                    )}
                  </div>
                  <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary-600 text-white rounded-xl shadow-lg border-2 border-white flex items-center justify-center cursor-pointer hover:bg-primary-700 transition-colors">
                    <Camera size={18} />
                    <input type="file" className="hidden" onChange={handleLogoChange} accept="image/*" />
                  </label>
                </div>
                <p className="text-xs text-gray-400 mt-4 font-medium text-center">Your company logo for<br/>invoices and reports.</p>
              </div>

              {/* Form Grid */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 font-bold">Organization Name</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 transition-all"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 font-bold">Business Email</label>
                  <input
                    type="email"
                    required
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 transition-all font-medium"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 font-bold">Phone Number</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 transition-all font-medium"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                 <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 font-bold">Currency Code</label>
                  <select
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 transition-all font-medium"
                    value={formData.currency}
                    onChange={(e) => setFormData({...formData, currency: e.target.value})}
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="INR">INR (₹)</option>
                    <option value="AUD">AUD ($)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Address & Tax */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                    <MapPin size={18} className="mr-3 text-primary-600" />
                    Business details
                </h3>
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5 font-bold">Tax/VAT ID</label>
                        <input
                            type="text"
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 transition-all font-medium"
                            value={formData.tax_id}
                            onChange={(e) => setFormData({...formData, tax_id: e.target.value})}
                            placeholder="e.g. TAX12345678"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5 font-bold">Headquarters Address</label>
                        <textarea
                            rows="4"
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 transition-all"
                            value={formData.address}
                            onChange={(e) => setFormData({...formData, address: e.target.value})}
                            placeholder="Street, City, State, ZIP, Country"
                        ></textarea>
                    </div>
                </div>
            </div>

            {/* Branding & Style */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                    <Palette size={18} className="mr-3 text-primary-600" />
                    Branding & Styling
                </h3>
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5 font-bold">Theme Primary Color</label>
                        <div className="flex items-center gap-4">
                            <input
                                type="color"
                                className="w-12 h-12 rounded-xl cursor-pointer bg-transparent border-none overflow-hidden"
                                value={formData.color_theme}
                                onChange={(e) => setFormData({...formData, color_theme: e.target.value})}
                            />
                            <input
                                type="text"
                                className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 transition-all font-mono text-sm"
                                value={formData.color_theme}
                                onChange={(e) => setFormData({...formData, color_theme: e.target.value})}
                            />
                        </div>
                    </div>
                </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-8 py-3 bg-primary-600 text-white rounded-2xl font-bold shadow-xl shadow-primary-200 hover:bg-primary-700 transition-all disabled:opacity-70 disabled:cursor-not-allowed group"
            >
                {saving ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                    <Save size={20} className="group-hover:scale-110 transition-transform" />
                )}
                {saving ? 'Saving changes...' : 'Save All Settings'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default Settings;
