import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../api/axios';
import { 
  Plus, 
  Search, 
  CreditCard, 
  Calendar, 
  DollarSign, 
  FileText,
  Clock,
  CheckCircle,
  MoreVertical,
  X,
  PlusCircle,
  Trash2
} from 'lucide-react';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [actionMenuOpen, setActionMenuOpen] = useState(null);
  const [formData, setFormData] = useState({
    invoice_id: '',
    amount: '',
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: 'Bank Transfer',
    note: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/payments/all');
      setPayments(Array.isArray(res.data) ? res.data : []);
      
      const invRes = await api.get('/invoices?limit=1000');
      const invoiceList = Array.isArray(invRes.data) ? invRes.data : (invRes.data?.invoices || []);
      setInvoices(invoiceList);
    } catch (err) {
      console.error('Error fetching payments', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = (Array.isArray(payments) ? payments : []).filter(p => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    const transactionId = (p.transaction_id || `TRX-${p.id}`).toLowerCase();
    const note = (p.note || '').toLowerCase();
    const invoiceNumber = (p.invoice_number || '').toLowerCase();
    const method = (p.payment_method || '').toLowerCase();
    const amount = (p.amount || '').toString();
    const customerName = (p.customer_name || '').toLowerCase();
    const date = new Date(p.payment_date).toLocaleDateString().toLowerCase();

    return transactionId.includes(query) ||
           note.includes(query) ||
           invoiceNumber.includes(query) ||
           method.includes(query) ||
           amount.includes(query) ||
           customerName.includes(query) ||
           date.includes(query);
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/payments', formData);
      setShowModal(false);
      setFormData({ ...formData, invoice_id: '', amount: '', note: '' });
      fetchData();
    } catch (err) {
      console.error('Error recording payment', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this payment record? This will revert the invoice status if necessary.')) {
      try {
        await api.delete(`/payments/${id}`);
        fetchData();
        setActionMenuOpen(null);
      } catch (err) {
        console.error('Error deleting payment', err);
        alert('Failed to delete payment');
      }
    }
  };

  const handleInvoiceChange = (e) => {
    const invId = e.target.value;
    if (!invId) {
      setFormData({...formData, invoice_id: '', amount: ''});
      return;
    }
    
    const invoiceArray = Array.isArray(invoices) ? invoices : [];
    const inv = invoiceArray.find(i => i.id === parseInt(invId));
    if (inv) {
      const paid = (Array.isArray(payments) ? payments : [])
        .filter(p => p.invoice_id === parseInt(invId))
        .reduce((sum, p) => sum + parseFloat(p.amount), 0);
      
      const remaining = parseFloat(inv.total) - paid;
      
      setFormData({
        ...formData, 
        invoice_id: invId,
        amount: remaining > 0 ? remaining.toFixed(2) : ''
      });
    } else {
      setFormData({...formData, invoice_id: invId});
    }
  };

  const getSelectedInvoiceDetails = () => {
    if (!formData.invoice_id) return null;
    const invoiceArray = Array.isArray(invoices) ? invoices : [];
    const inv = invoiceArray.find(i => i.id === parseInt(formData.invoice_id));
    if (!inv) return null;
    const paid = (Array.isArray(payments) ? payments : [])
        .filter(p => p.invoice_id === parseInt(formData.invoice_id))
        .reduce((sum, p) => sum + parseFloat(p.amount), 0);
    const remaining = parseFloat(inv.total) - paid;
    return { total: inv.total, paid, remaining };
  };

  const selectedInvoiceDetails = getSelectedInvoiceDetails();

  return (
    <Layout title="Payments">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search transactions..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm"
          />
        </div>
        
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-xl font-bold shadow-lg shadow-primary-200 hover:bg-primary-700 transition-all"
        >
          <PlusCircle size={18} />
          Record Payment
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Transaction</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Invoice</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Method</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Invoice Status</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              [...Array(5)].map((_, i) => <tr key={i} className="animate-pulse"><td colSpan="7" className="px-6 py-4"><div className="h-4 bg-gray-100 rounded"></div></td></tr>)
            ) : filteredPayments.length > 0 ? filteredPayments.map((p, index) => (
              <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <p className="text-sm font-bold text-gray-900 mb-0.5">#{p.transaction_id || `TRX-${p.id}`}</p>
                  <p className="text-xs text-gray-500 line-clamp-1">{p.note || 'Regular Payment'}</p>
                </td>
                <td className="px-6 py-4 font-medium text-primary-600">
                   <div className="flex items-center">
                    <FileText size={14} className="mr-1.5 opacity-50" />
                    {p.invoice_number || 'UNKNOWN'}
                   </div>
                </td>
                <td className="px-6 py-4 font-semibold text-gray-900">{new Date(p.payment_date).toLocaleDateString()}</td>
                <td className="px-6 py-4"><span className="text-sm font-bold text-green-600">+${parseFloat(p.amount).toFixed(2)}</span></td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-gray-100 rounded-lg text-xs font-medium text-gray-600">{p.payment_method}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-lg text-xs font-bold ${
                    p.invoice_status === 'paid' ? 'bg-green-100 text-green-700' : 
                    p.invoice_status === 'partially_paid' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {p.invoice_status === 'partially_paid' ? 'Partial' : p.invoice_status === 'paid' ? 'Paid' : 'Sent'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right relative">
                   <button 
                      onClick={() => setActionMenuOpen(actionMenuOpen === p.id ? null : p.id)}
                      className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                   >
                      <MoreVertical size={18} />
                   </button>
                   {actionMenuOpen === p.id && (
                     <>
                       <div className="fixed inset-0 z-10" onClick={() => setActionMenuOpen(null)}></div>
                       <div className={`absolute right-8 ${index >= filteredPayments.length - 2 ? 'bottom-10' : 'top-12'} w-48 bg-white border border-gray-100 rounded-xl shadow-lg z-20 py-2 animate-in fade-in zoom-in duration-200`}>
                         <button 
                           onClick={() => handleDelete(p.id)}
                           className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 font-medium flex items-center gap-2"
                         >
                           <Trash2 size={16} /> Delete Payment
                         </button>
                       </div>
                     </>
                   )}
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center text-gray-400">
                  <div className="flex flex-col items-center">
                    <CreditCard size={48} className="text-gray-200 mb-4" />
                    <p className="text-lg font-medium text-gray-400">
                      {searchQuery ? `No transactions found matching "${searchQuery}"` : 'No payments recorded'}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Payment Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Record Payment</h3>
              <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Select Invoice</label>
                <select
                  required
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm"
                  value={formData.invoice_id}
                  onChange={handleInvoiceChange}
                >
                  <option value="">Choose an invoice...</option>
                  {(Array.isArray(invoices) ? invoices : []).map(inv => (
                    <option key={inv.id} value={inv.id}>
                      {inv.invoice_number} - {inv.customer_name} (${parseFloat(inv.total || 0).toFixed(2)})
                    </option>
                  ))}
                </select>
                {selectedInvoiceDetails && (
                  <div className="mt-3 p-3 bg-blue-50/50 border border-blue-100 rounded-xl flex justify-between items-center text-sm">
                    <div className="text-gray-500">Invoice Total: <span className="font-bold text-gray-900">${parseFloat(selectedInvoiceDetails.total).toFixed(2)}</span></div>
                    <div className="text-gray-500">Paid: <span className="font-bold text-green-600">${selectedInvoiceDetails.paid.toFixed(2)}</span></div>
                    <div className="text-gray-500">Remaining: <span className="font-bold text-blue-600">${selectedInvoiceDetails.remaining.toFixed(2)}</span></div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Amount Paid</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="number"
                      step="0.01"
                      required
                      max={selectedInvoiceDetails?.remaining || undefined}
                      placeholder="0.00"
                      className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm"
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Date Received</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="date"
                      required
                      className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm"
                      value={formData.payment_date}
                      onChange={(e) => setFormData({...formData, payment_date: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Payment Method</label>
                <select
                  required
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm"
                  value={formData.payment_method}
                  onChange={(e) => setFormData({...formData, payment_method: e.target.value})}
                >
                  <option>Bank Transfer</option>
                  <option>Cash</option>
                  <option>Check</option>
                  <option>Credit Card</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Internal Note</label>
                <textarea
                  rows="2"
                  placeholder="Optional reference description..."
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm"
                  value={formData.note}
                  onChange={(e) => setFormData({...formData, note: e.target.value})}
                ></textarea>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 px-4 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-all">Cancel</button>
                <button type="submit" className="flex-1 py-3 px-4 bg-primary-600 text-white rounded-xl font-bold shadow-lg shadow-primary-200 hover:bg-primary-700 transition-all">Post Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Payments;
