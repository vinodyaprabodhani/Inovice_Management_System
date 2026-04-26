import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../api/axios';
import { 
  MessageSquare, 
  Key, 
  Phone, 
  Save, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  Zap,
  RefreshCw
} from 'lucide-react';

const WhatsAppSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('disconnected'); // 'disconnected', 'connected', 'error'
  const [settings, setSettings] = useState({
    whatsapp_sid: '',
    whatsapp_token: '',
    whatsapp_phone: ''
  });
  const [testPhone, setTestPhone] = useState('');
  const [testStatus, setTestStatus] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/organization/whatsapp');
      if (res.data) {
        setSettings({
          whatsapp_sid: res.data.whatsapp_sid || '',
          whatsapp_token: res.data.whatsapp_token || '',
          whatsapp_phone: res.data.whatsapp_phone || ''
        });
        if (res.data.whatsapp_sid && res.data.whatsapp_token) setStatus('connected');
      }
    } catch (err) {
      console.error('Error fetching WhatsApp settings', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/organization/whatsapp', settings);
      setStatus('connected');
      alert('WhatsApp Integration updated successfully!');
    } catch (err) {
      console.error('Error saving WhatsApp settings', err);
      setStatus('error');
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    if (!testPhone) return alert('Please enter a phone number to test');
    setTestStatus('Sending...');
    try {
      await api.post('/notifications/whatsapp/test', { phone: testPhone });
      setTestStatus('Test message sent!');
    } catch (err) {
      setTestStatus('Error sending test message');
    }
  };

  return (
    <Layout title="WhatsApp Integration">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Status Card */}
        <div className={`p-8 rounded-[2.5rem] border flex items-center justify-between ${status === 'connected' ? 'bg-green-50 border-green-100' : 'bg-gray-50 border-gray-100'}`}>
            <div className="flex items-center gap-6">
                <div className={`w-16 h-16 rounded-3xl flex items-center justify-center shadow-lg ${status === 'connected' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
                    <MessageSquare size={32} />
                </div>
                <div>
                   <h3 className="text-xl font-black text-gray-900">Twilio WhatsApp API</h3>
                   <div className="flex items-center gap-2 mt-1">
                      <span className={`w-2 h-2 rounded-full ${status === 'connected' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></span>
                      <p className="text-sm font-bold capitalize text-gray-500">{status}</p>
                   </div>
                </div>
            </div>
            {status === 'connected' && (
                <div className="px-4 py-2 bg-white rounded-xl text-[10px] font-black uppercase tracking-widest text-green-600 border border-green-200 shadow-sm flex items-center gap-2">
                   <Zap size={14} /> Ready for Automation
                </div>
            )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Configuration Form */}
            <form onSubmit={handleSave} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-primary-50 text-primary-600 rounded-lg"><Key size={20} /></div>
                    <h4 className="font-bold text-gray-900 uppercase text-xs tracking-widest">Twilio Credentials</h4>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Account SID</label>
                    <input 
                        type="password" 
                        required 
                        className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-primary-500 outline-none transition-all font-mono text-sm"
                        value={settings.whatsapp_sid}
                        onChange={(e) => setSettings({...settings, whatsapp_sid: e.target.value})}
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Auth Token</label>
                    <input 
                        type="password" 
                        required 
                        className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-primary-500 outline-none transition-all font-mono text-sm"
                        value={settings.whatsapp_token}
                        onChange={(e) => setSettings({...settings, whatsapp_token: e.target.value})}
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Twilio Sandbox Phone / Number</label>
                    <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text" 
                            required 
                            placeholder="+14155238886"
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-primary-500 outline-none transition-all"
                            value={settings.whatsapp_phone}
                            onChange={(e) => setSettings({...settings, whatsapp_phone: e.target.value})}
                        />
                    </div>
                    <p className="text-[10px] text-gray-400 mt-2 italic px-1">Ensure this number is WhatsApp-enabled in your Twilio Console.</p>
                </div>

                <button 
                    type="submit" 
                    disabled={saving}
                    className="w-full py-4 bg-primary-600 text-white rounded-2xl font-black shadow-xl shadow-primary-200 hover:bg-primary-700 transition-all flex items-center justify-center gap-2 group"
                >
                    {saving ? <RefreshCw className="animate-spin" size={20} /> : <Save className="group-hover:scale-110 transition-transform" size={20} />}
                    {saving ? 'Syncing...' : 'Save Configuration'}
                </button>
            </form>

            <div className="space-y-8">
                {/* Integration Help */}
                <div className="bg-gray-900 p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
                    <div className="relative z-10">
                        <h4 className="text-lg font-black mb-4">How it works</h4>
                        <ul className="space-y-4 text-sm text-gray-400">
                           <li className="flex items-start gap-3">
                              <CheckCircle2 size={16} className="text-primary-500 shrink-0 mt-1" />
                              <p>Deliver secure invoice links directly to client WhatsApp.</p>
                           </li>
                           <li className="flex items-start gap-3">
                              <CheckCircle2 size={16} className="text-primary-500 shrink-0 mt-1" />
                              <p>Automate payment reminders based on due dates.</p>
                           </li>
                           <li className="flex items-start gap-3">
                              <CheckCircle2 size={16} className="text-primary-500 shrink-0 mt-1" />
                              <p>Improve payment speed by meeting clients on their mobile.</p>
                           </li>
                        </ul>
                        <a href="https://www.twilio.com/console" target="_blank" rel="noreferrer" className="mt-8 flex items-center justify-between p-4 bg-white/10 rounded-2xl font-bold hover:bg-white/20 transition-all">
                            Twilio Console
                            <ExternalLink size={18} />
                        </a>
                    </div>
                </div>

                {/* Test Connection */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                    <h4 className="font-bold text-gray-900 mb-6">Test Connectivity</h4>
                    <div className="space-y-4">
                        <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input 
                                type="text" 
                                placeholder="Your WhatsApp number (+...)"
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-primary-500 outline-none transition-all"
                                value={testPhone}
                                onChange={(e) => setTestPhone(e.target.value)}
                            />
                        </div>
                        <button 
                            onClick={handleTest}
                            className="w-full py-4 bg-gray-100 text-gray-900 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                        >
                            Send Test Notification
                        </button>
                        {testStatus && (
                            <div className={`flex items-center gap-2 text-xs font-bold pt-2 ${testStatus.includes('Error') ? 'text-red-500' : 'text-primary-600'}`}>
                                {testStatus.includes('Error') ? <AlertCircle size={14} /> : <CheckCircle2 size={14} />}
                                {testStatus}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
      </div>
    </Layout>
  );
};

export default WhatsAppSettings;
