import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import { 
  Download, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Building,
  FileText,
  CreditCard,
  ChevronRight
} from 'lucide-react';

const ClientInvoiceView = () => {
  const { token } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const res = await api.get(`/invoices/portal/${token}`);
        setInvoice(res.data);
      } catch (err) {
        console.error('Error fetching invoice', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [token]);

  const handleDownload = async () => {
    try {
      const res = await api.get(`/invoices/${invoice.id}/pdf`, { 
        responseType: 'blob',
        headers: { 'Authorization': '' } // No auth needed as it's public
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice_${invoice.invoice_number}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      console.error('Error downloading PDF', err);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center animate-pulse">
        <FileText size={48} className="mx-auto text-primary-200 mb-4" />
        <h2 className="text-xl font-bold text-gray-400">Loading Invoice...</h2>
      </div>
    </div>
  );

  if (error || !invoice) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-12 rounded-3xl shadow-xl text-center max-w-md border border-gray-100">
        <AlertCircle size={64} className="mx-auto text-red-500 mb-6" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Invoice Not Found</h2>
        <p className="text-gray-500 mb-8">This invoice link may have expired or is incorrect. Please contact the sender for assistance.</p>
        <button 
            onClick={() => window.location.reload()}
            className="w-full py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all font-sans"
        >
            Try Again
        </button>
      </div>
    </div>
  );

  const statusStyles = {
    paid: 'bg-green-100 text-green-700 border-green-200',
    sent: 'bg-blue-100 text-blue-700 border-blue-200',
    partially_paid: 'bg-orange-100 text-orange-700 border-orange-200',
    overdue: 'bg-red-100 text-red-700 border-red-200',
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">Invoice {invoice.invoice_number}</h1>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold border uppercase ${statusStyles[invoice.status]}`}>
                {invoice.status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-sm text-gray-500">Issued by {invoice.org_name} on {new Date(invoice.date).toLocaleDateString()}</p>
          </div>
          
          <button 
             onClick={handleDownload}
             className="flex items-center gap-2 px-6 py-3 bg-white text-gray-900 rounded-xl font-bold border border-gray-200 shadow-sm hover:bg-gray-50 transition-all group"
          >
            <Download size={20} className="group-hover:translate-y-0.5 transition-transform" />
            Download PDF
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Invoice Card */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
              <div className="p-8 md:p-12">
                <div className="flex justify-between items-start mb-12">
                  <div>
                    {invoice.org_logo ? (
                      <img src={`${import.meta.env.VITE_UPLOAD_URL}${invoice.org_logo}`} alt="Logo" className="h-16 w-auto mb-6" />
                    ) : (
                      <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold mb-6">
                        {invoice.org_name.charAt(0)}
                      </div>
                    )}
                    <h2 className="text-xl font-bold text-gray-900">{invoice.org_name}</h2>
                    <p className="text-sm text-gray-500 whitespace-pre-wrap mt-2">{invoice.org_address}</p>
                    {invoice.org_tax_id && <p className="text-xs text-gray-400 mt-2 font-mono">Tax ID: {invoice.org_tax_id}</p>}
                  </div>
                  <div className="text-right">
                    <h3 className="text-4xl font-black text-gray-900 opacity-10">INVOICE</h3>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 mb-12 pt-8 border-t border-gray-50">
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Bill To</h4>
                    <p className="text-lg font-bold text-gray-900">{invoice.customer_name}</p>
                  </div>
                  <div className="text-right">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Due Date</h4>
                    <p className="text-lg font-bold text-red-500">{new Date(invoice.due_date).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Items Table */}
                <div className="overflow-x-auto">
                    <table className="w-full mb-12">
                    <thead>
                        <tr className="border-b-2 border-gray-100">
                        <th className="py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Description</th>
                        <th className="py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">Qty</th>
                        <th className="py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Price</th>
                        <th className="py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {invoice.items.map((item, i) => (
                        <tr key={i}>
                            <td className="py-5">
                                <p className="text-sm font-bold text-gray-900">{item.description}</p>
                            </td>
                            <td className="py-5 text-center text-sm text-gray-600">{item.quantity}</td>
                            <td className="py-5 text-right text-sm text-gray-600">{invoice.org_currency} {parseFloat(item.unit_price).toFixed(2)}</td>
                            <td className="py-5 text-right text-sm font-bold text-gray-900">{invoice.org_currency} {parseFloat(item.total).toFixed(2)}</td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </div>

                <div className="flex flex-col items-end gap-3 pt-8 border-t-2 border-gray-100">
                  <div className="flex justify-between w-64 text-sm text-gray-500">
                    <span>Subtotal</span>
                    <span>{invoice.org_currency} {parseFloat(invoice.subtotal).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between w-64 text-sm text-gray-500">
                    <span>Total Tax</span>
                    <span>{invoice.org_currency} {parseFloat(invoice.tax_amount).toFixed(2)}</span>
                  </div>
                  {invoice.discount > 0 && (
                     <div className="flex justify-between w-64 text-sm text-red-500 font-bold">
                        <span>Discount</span>
                        <span>-{invoice.org_currency} {parseFloat(invoice.discount).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between w-64 pt-4 mt-2 border-t border-gray-100">
                    <span className="text-lg font-bold text-gray-900">Total Amount</span>
                    <span className="text-2xl font-black text-primary-600 font-sans tracking-tight">
                        {invoice.org_currency} {parseFloat(invoice.total).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 px-12 py-8 border-t border-gray-100">
                 <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Terms & Notes</h4>
                 <p className="text-sm text-gray-600 italic">{invoice.notes || 'No specific terms provided. Payment is due upon receipt unless otherwise specified.'}</p>
              </div>
            </div>
          </div>

          {/* Right Summary Column */}
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 text-center">
               <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Payment Status</h3>
               <div className="flex flex-col items-center">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${invoice.status === 'paid' ? 'bg-green-50 text-green-500' : 'bg-primary-50 text-primary-500 animate-pulse'}`}>
                        {invoice.status === 'paid' ? <CheckCircle size={40} /> : <Clock size={40} />}
                    </div>
                    <p className="text-lg font-black text-gray-900 capitalize">{invoice.status.replace('_', ' ')}</p>
                    <p className="text-xs text-gray-500 mt-2">Outstanding: {invoice.org_currency} {invoice.status === 'paid' ? '0.00' : parseFloat(invoice.total).toFixed(2)}</p>
               </div>
               
               {invoice.status !== 'paid' && (
                 <a 
                    href={`/portal/pay/${token}`}
                    className="w-full mt-6 py-4 bg-primary-600 text-white rounded-2xl font-black shadow-xl shadow-primary-200 hover:bg-primary-700 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                 >
                    <CreditCard size={18} />
                    Pay Now
                 </a>
               )}
               
               <div className="mt-8 pt-8 border-t border-gray-100 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-gray-400 uppercase">
                    <span>Payment Methods</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                    <CreditCard size={18} className="text-gray-400" />
                    <span className="text-sm font-bold text-gray-900">Online Payment</span>
                    <span className="ml-auto text-[10px] bg-gray-200 px-1.5 py-0.5 rounded uppercase">Setup Required</span>
                  </div>
               </div>
            </div>

            <div className="bg-primary-600 p-8 rounded-3xl shadow-xl text-white relative overflow-hidden group border border-primary-500">
               <div className="relative z-10">
                <h3 className="font-bold text-xl mb-2">Questions?</h3>
                <p className="text-primary-100 text-sm mb-6">If you have any questions about this invoice, please reach out to the billing team.</p>
                <a 
                    href={`mailto:${invoice.org_email || 'billing@acme.com'}`}
                    className="flex items-center justify-between w-full p-4 bg-white/10 backdrop-blur-md rounded-2xl font-bold hover:bg-white/20 transition-all"
                >
                    Email Support
                    <ChevronRight size={20} />
                </a>
               </div>
               <Building size={140} className="absolute -bottom-6 -right-6 text-white/10 -rotate-12 transition-transform duration-500 group-hover:scale-110" />
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
            <p className="text-xs text-gray-400 flex items-center justify-center gap-2">
                Powered by <span className="font-bold text-gray-900 tracking-tight">InvoicePro</span> Management Systems
            </p>
        </div>
      </div>
    </div>
  );
};

export default ClientInvoiceView;
