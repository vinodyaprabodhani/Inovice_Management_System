import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import LandingLayout from '../components/LandingLayout';
import { 
  CreditCard, 
  ShieldCheck, 
  ArrowLeft, 
  Lock, 
  Rocket, 
  Check, 
  Building2,
  AlertCircle
} from 'lucide-react';

const Checkout = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const plan = searchParams.get('plan') || 'professional';
  
  const [formData, setFormData] = useState({
    cardholderName: '',
    cardNumber: '',
    expiry: '',
    cvc: '',
    zip: ''
  });
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Format Card Number with spaces
  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    value = value.substring(0, 16);
    const parts = [];
    for (let i = 0; i < value.length; i += 4) {
      parts.push(value.substring(i, i + 4));
    }
    setFormData({
      ...formData,
      cardNumber: parts.length > 0 ? parts.join(' ') : ''
    });
  };

  // Format Expiry as MM/YY
  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    value = value.substring(0, 4);
    if (value.length > 2) {
      setFormData({
        ...formData,
        expiry: `${value.substring(0, 2)}/${value.substring(2)}`
      });
    } else {
      setFormData({
        ...formData,
        expiry: value
      });
    }
  };

  // Format CVC
  const handleCvcChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').substring(0, 4);
    setFormData({
      ...formData,
      cvc: value
    });
  };

  // Format ZIP
  const handleZipChange = (e) => {
    const value = e.target.value.substring(0, 10);
    setFormData({
      ...formData,
      zip: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Basic Validation
    const cleanCard = formData.cardNumber.replace(/\s/g, '');
    if (cleanCard.length < 16) {
      setError('Please enter a valid 16-digit card number.');
      return;
    }
    if (formData.expiry.length < 5) {
      setError('Please enter a valid expiry date (MM/YY).');
      return;
    }
    if (formData.cvc.length < 3) {
      setError('Please enter a valid CVC code.');
      return;
    }

    setIsProcessing(true);

    // Simulate validation delay
    setTimeout(() => {
      setIsProcessing(false);
      navigate('/register', { 
        state: { 
          plan: plan, 
          paymentVerified: true,
          cardholderName: formData.cardholderName 
        } 
      });
    }, 1500);
  };

  return (
    <LandingLayout>
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 font-sans relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-200/40 rounded-full blur-3xl z-0"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-200/40 rounded-full blur-3xl z-0"></div>

        <div className="max-w-5xl w-full flex flex-col lg:flex-row gap-8 relative z-10 my-12">
          {/* Checkout Form */}
          <div className="flex-1 space-y-6">
              <button 
                  onClick={() => navigate('/pricing')}
                  className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors"
              >
                  <ArrowLeft size={16} /> Back to Pricing
              </button>
              
              <div className="bg-white p-8 lg:p-12 rounded-[2.5rem] shadow-2xl border border-gray-100">
                  <div className="flex items-center gap-4 mb-10">
                      <div className="w-12 h-12 bg-primary-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary-200">
                          <CreditCard size={24} />
                      </div>
                      <div>
                          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Checkout</h2>
                          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest flex items-center gap-2">
                              <Lock size={12} /> Secure Billing Details
                          </p>
                      </div>
                  </div>

                  {error && (
                    <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-center text-red-700 text-sm animate-in fade-in duration-200">
                      <AlertCircle size={18} className="mr-3 shrink-0" />
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                      <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">Cardholder Name</label>
                          <input 
                              type="text" 
                              required 
                              value={formData.cardholderName}
                              onChange={(e) => setFormData({...formData, cardholderName: e.target.value})}
                              className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all font-medium text-sm" 
                              placeholder="John Doe"
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">Card Number</label>
                          <div className="relative">
                              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"><CreditCard size={20} /></div>
                              <input 
                                  type="text" 
                                  required 
                                  value={formData.cardNumber}
                                  onChange={handleCardNumberChange}
                                  className="w-full pl-14 pr-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all font-mono tracking-widest text-sm" 
                                  placeholder="4242 4242 4242 4242"
                              />
                          </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                          <div className="col-span-1">
                              <label className="block text-sm font-bold text-gray-700 mb-2">Expiry Date</label>
                              <input 
                                  type="text" 
                                  required 
                                  value={formData.expiry}
                                  onChange={handleExpiryChange}
                                  className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all font-mono text-sm text-center" 
                                  placeholder="MM/YY"
                              />
                          </div>
                          <div className="col-span-1">
                              <label className="block text-sm font-bold text-gray-700 mb-2">CVC</label>
                              <input 
                                  type="password" 
                                  required 
                                  value={formData.cvc}
                                  onChange={handleCvcChange}
                                  className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all font-mono text-sm text-center" 
                                  placeholder="123"
                              />
                          </div>
                          <div className="col-span-1">
                              <label className="block text-sm font-bold text-gray-700 mb-2">Postal Code</label>
                              <input 
                                  type="text" 
                                  required 
                                  value={formData.zip}
                                  onChange={handleZipChange}
                                  className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all font-medium text-sm text-center" 
                                  placeholder="10001"
                              />
                          </div>
                      </div>

                      <button 
                          type="submit" 
                          disabled={isProcessing}
                          className="w-full py-4 bg-primary-600 text-white rounded-2xl font-black shadow-xl shadow-primary-200 hover:bg-primary-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed group text-base cursor-pointer"
                      >
                          {isProcessing ? (
                            <span className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                          ) : (
                            <ShieldCheck size={20} className="group-hover:scale-110 transition-transform" />
                          )}
                          {isProcessing ? 'Verifying Account Details...' : 'Proceed to Registration'}
                      </button>
                  </form>

                  <div className="mt-8 flex justify-center items-center gap-6 grayscale opacity-30">
                     <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4" />
                     <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6" />
                     <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-5" />
                  </div>
              </div>
          </div>

          {/* Plan Summary Card */}
          <div className="w-full lg:w-96 lg:pt-12">
             <div className="bg-gray-900 rounded-[2.5rem] p-8 text-white sticky top-24 border border-white/5 shadow-2xl overflow-hidden group">
                <div className="absolute inset-0 bg-primary-600/10 blur-3xl rounded-full"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-8">
                      <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md">
                          <Rocket className="text-primary-400" size={20} />
                      </div>
                      <span className="font-black text-sm uppercase tracking-widest opacity-80">Subscription Plan</span>
                  </div>
                  
                  <h3 className="text-2xl font-black text-white tracking-tight mb-2">Professional Package</h3>
                  <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                    Unlock growth with automated invoicing, WhatsApp alerts, and revenue analytics.
                  </p>

                  <div className="pb-6 border-b border-white/10 mb-6 flex items-end gap-1">
                      <span className="text-4xl font-black text-white">$29</span>
                      <span className="text-gray-400 font-bold text-sm mb-1">/ month</span>
                  </div>

                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Included Features</h4>
                  <div className="space-y-3 mb-8">
                      {['Unlimited Invoices', '3 Organizations', 'WhatsApp Alerts', 'Premium Templates', 'Priority Support'].map(f => (
                        <div key={f} className="flex items-center gap-3 text-sm font-medium text-gray-300">
                           <div className="w-5 h-5 rounded-full bg-white/10 text-primary-400 flex items-center justify-center shrink-0">
                               <Check size={12} strokeWidth={3} />
                           </div>
                           {f}
                        </div>
                      ))}
                  </div>

                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-[11px] text-gray-400 leading-relaxed font-medium italic">
                      All transaction details are securely processed. Your credit card will not be charged until the account registration is complete.
                  </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </LandingLayout>
  );
};

export default Checkout;
