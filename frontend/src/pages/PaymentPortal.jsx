import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { 
  CreditCard, 
  ShieldCheck, 
  ArrowLeft, 
  CheckCircle2, 
  Lock,
  Building,
  DollarSign
} from 'lucide-react';

const PaymentPortal = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const res = await api.get(`/invoices/portal/${token}`);
        setInvoice(res.data);
      } catch (err) {
        console.error('Error fetching invoice', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [token]);

  const handlePayment = async (e) => {
    e.preventDefault();
    setPaying(true);
    // Simulate payment processing
    setTimeout(async () => {
      try {
        await api.post(`/payments/process/${token}`, {
          amount: invoice.total,
          method: 'Credit Card'
        });
        setSuccess(true);
      } catch (err) {
        console.error('Payment error', err);
        alert('Payment failed. Please try again.');
      } finally {
        setPaying(false);
      }
    }, 2000);
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-bold text-gray-400 animate-pulse text-lg">Encrypting Connection...</div>;

  if (success) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-[3rem] p-12 text-center shadow-2xl border border-gray-100 animate-in zoom-in duration-300">
          <div className="w-24 h-24 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-green-100">
             <CheckCircle2 size={48} />
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-4">Payment Successful</h2>
          <p className="text-gray-500 mb-8 leading-relaxed">
            Thank you! Your payment of <span className="font-bold text-gray-900 tracking-tight">{invoice.org_currency} {parseFloat(invoice.total).toFixed(2)}</span> has been confirmed and applied to invoice #{invoice.invoice_number}.
          </p>
          <div className="p-4 bg-gray-50 rounded-2xl mb-10 text-left border border-gray-100">
             <div className="flex justify-between text-xs font-bold text-gray-400 uppercase mb-2">
                <span>Transaction Ref</span>
                <span>Date</span>
             </div>
             <div className="flex justify-between text-sm font-bold text-gray-900">
                <span>#SET-{(Math.random()*1000000).toFixed(0)}</span>
                <span>{new Date().toLocaleDateString()}</span>
             </div>
          </div>
          <button 
             onClick={() => navigate(`/portal/invoice/${token}`)}
             className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
          >
             <ArrowLeft size={18} />
             Back to Invoice
          </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 font-sans">
      <div className="max-w-4xl w-full flex flex-col lg:flex-row gap-8">
        
        {/* Payment Form */}
        <div className="flex-1 space-y-6">
            <button 
                onClick={() => navigate(`/portal/invoice/${token}`)}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
            >
                <ArrowLeft size={16} /> Back to Invoice
            </button>
            
            <div className="bg-white p-8 lg:p-12 rounded-[3rem] shadow-2xl border border-gray-200">
                <div className="flex items-center gap-4 mb-10">
                    <div className="w-12 h-12 bg-primary-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary-100">
                        <CreditCard size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Secure Payment</h2>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest flex items-center gap-2">
                            <Lock size={12} /> SSL Encrypted
                        </p>
                    </div>
                </div>

                <form onSubmit={handlePayment} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Cardholder Name</label>
                        <input 
                            type="text" 
                            required 
                            className="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-primary-500 outline-none transition-all font-medium" 
                            placeholder="John Doe"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Card Information</label>
                        <div className="relative">
                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"><CreditCard size={20} /></div>
                            <input 
                                type="text" 
                                required 
                                className="w-full pl-14 pr-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-primary-500 outline-none transition-all font-mono tracking-widest" 
                                placeholder="4242 4242 4242 4242"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Expiry Date</label>
                            <input 
                                type="text" 
                                required 
                                className="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-primary-500 outline-none transition-all font-mono" 
                                placeholder="MM/YY"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">CVC</label>
                            <input 
                                type="text" 
                                required 
                                className="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-primary-500 outline-none transition-all font-mono" 
                                placeholder="123"
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={paying}
                        className="w-full py-4 bg-primary-600 text-white rounded-2xl font-black shadow-xl shadow-primary-200 hover:bg-primary-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed group text-lg"
                    >
                        {paying ? <span className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : <ShieldCheck size={20} className="group-hover:scale-110 transition-transform" /> }
                        {paying ? 'Processing...' : `Pay ${invoice.org_currency} ${parseFloat(invoice.total).toFixed(2)}`}
                    </button>
                </form>

                <div className="mt-8 flex justify-center items-center gap-6 grayscale opacity-30">
                   <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4" />
                   <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6" />
                   <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-5" />
                </div>
            </div>
        </div>

        {/* Invoice Summary Side */}
        <div className="w-full lg:w-80 pt-16">
           <div className="bg-gray-900 rounded-[2.5rem] p-8 text-white sticky top-12 border border-white/5 shadow-2xl overflow-hidden group">
              <div className="absolute inset-0 bg-primary-600/10 blur-3xl rounded-full"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md">
                        <Building size={20} />
                    </div>
                    <span className="font-black text-sm uppercase tracking-widest opacity-80">{invoice.org_name}</span>
                </div>
                
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Summary</h3>
                <div className="space-y-4 mb-8">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Invoice</span>
                        <span className="font-bold">{invoice.invoice_number}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Due Date</span>
                        <span className="font-bold">{new Date(invoice.due_date).toLocaleDateString()}</span>
                    </div>
                    <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                        <span className="text-xs text-gray-400">Amount to pay</span>
                        <span className="text-2xl font-black tracking-tight">{invoice.org_currency} {parseFloat(invoice.total).toFixed(2)}</span>
                    </div>
                </div>

                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-[10px] text-gray-400 leading-relaxed font-medium italic">
                    All transactions are secure and encrypted. InvoicePro does not store your full card details.
                </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPortal;
