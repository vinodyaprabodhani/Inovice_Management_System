import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../api/axios';
import { 
  Plus, 
  Search, 
  TrendingDown, 
  Calendar, 
  DollarSign, 
  Image as ImageIcon,
  Trash2,
  X,
  CreditCard,
  PieChart as PieChartIcon
} from 'lucide-react';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    category: 'General',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    receipt: null
  });

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const res = await api.get('/expenses');
      setExpenses(res.data);
    } catch (err) {
      console.error('Error fetching expenses', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('description', formData.description);
    data.append('category', formData.category);
    data.append('amount', formData.amount);
    data.append('date', formData.date);
    if (formData.receipt) data.append('receipt', formData.receipt);

    try {
      await api.post('/expenses', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setShowModal(false);
      fetchExpenses();
    } catch (err) {
      console.error('Error saving expense', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this expense record?')) {
      try {
        await api.delete(`/expenses/${id}`);
        fetchExpenses();
      } catch (err) {
        console.error('Error deleting expense', err);
      }
    }
  };

  return (
    <Layout title="Expense Management">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search expenses..." 
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm"
          />
        </div>
        
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-6 py-2.5 bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-200 hover:bg-red-700 transition-all"
        >
          <Plus size={18} />
          Add Expense
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          [...Array(3)].map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse"></div>)
        ) : expenses.length > 0 ? expenses.map((exp) => (
          <div key={exp.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between hover:bg-gray-50/50 transition-colors group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-50 text-red-500 flex items-center justify-center">
                <TrendingDown size={24} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900">{exp.description}</h4>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-lg">{exp.category}</span>
                  <span className="text-xs text-gray-400 flex items-center">
                    <Calendar size={12} className="mr-1" />
                    {new Date(exp.date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-8">
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">-${parseFloat(exp.amount).toFixed(2)}</p>
                {exp.receipt_url && (
                  <a 
                    href={exp.receipt_url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-xs text-primary-600 hover:underline flex items-center justify-end"
                  >
                    <ImageIcon size={12} className="mr-1" /> View Receipt
                  </a>
                )}
              </div>
              <button 
                onClick={() => handleDelete(exp.id)}
                className="p-2 text-gray-300 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        )) : (
          <div className="py-20 text-center bg-white rounded-3xl border border-gray-100">
             <CreditCard size={48} className="mx-auto text-gray-200 mb-4" />
             <p className="text-lg font-medium text-gray-400">No expenses recorded yet</p>
          </div>
        )}
      </div>

      {/* Expense Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
             <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Add New Expense</h3>
              <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <input
                  type="text"
                  required
                  placeholder="What was this for?"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 transition-all text-sm"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Amount</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="0.00"
                      className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 transition-all text-sm"
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Date</label>
                  <input
                    type="date"
                    required
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 transition-all text-sm"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
                <select
                  required
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 transition-all text-sm"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                >
                  <option>Software Subscription</option>
                  <option>Office Supplies</option>
                  <option>Marketing</option>
                  <option>Travel</option>
                  <option>Utilities</option>
                  <option>General</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Receipt Attachment</label>
                <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:bg-gray-50 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <ImageIcon size={24} className="text-gray-400 mb-2" />
                            <p className="text-xs text-gray-500">
                                {formData.receipt ? formData.receipt.name : 'Upload receipt image or PDF'}
                            </p>
                        </div>
                        <input 
                            type="file" 
                            className="hidden" 
                            onChange={(e) => setFormData({...formData, receipt: e.target.files[0]})}
                        />
                    </label>
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 px-4 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-all">Cancel</button>
                <button type="submit" className="flex-1 py-3 px-4 bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-200 hover:bg-red-700 transition-all">Save Expense</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Expenses;
