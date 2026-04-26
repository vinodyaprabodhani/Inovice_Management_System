import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../api/axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  MoreHorizontal, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Eye,
  Trash2,
  Edit2,
  FileText,
  Send
} from 'lucide-react';

const StatusBadge = ({ status }) => {
  const styles = {
    paid: 'bg-green-100 text-green-700 border-green-200',
    sent: 'bg-blue-100 text-blue-700 border-blue-200',
    draft: 'bg-gray-100 text-gray-700 border-gray-200',
    overdue: 'bg-red-100 text-red-700 border-red-200',
    partially_paid: 'bg-orange-100 text-orange-700 border-orange-200',
  };
  
  const icons = {
    paid: <CheckCircle size={14} className="mr-1.5" />,
    sent: <CheckCircle size={14} className="mr-1.5" />,
    draft: <Clock size={14} className="mr-1.5" />,
    overdue: <AlertCircle size={14} className="mr-1.5" />,
    partially_paid: <Clock size={14} className="mr-1.5" />,
  };

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border flex items-center w-fit capitalize ${styles[status]}`}>
      {icons[status]}
      {status.replace('_', ' ')}
    </span>
  );
};

const Invoices = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const initialSearch = queryParams.get('search') || '';

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialSearch);
  const [filter, setFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const filterRef = React.useRef(null);

  useEffect(() => {
    fetchInvoices();
    
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilters(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchInvoices = async () => {
    try {
      const res = await api.get('/invoices');
      setInvoices(res.data);
    } catch (err) {
      console.error('Error fetching invoices', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.invoice_number.toLowerCase().includes(search.toLowerCase()) || 
                         inv.customer_name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filter === 'all' || inv.status === filter;
    
    let matchesDate = true;
    if (dateFilter === '30days') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      matchesDate = new Date(inv.date) >= thirtyDaysAgo;
    } else if (dateFilter === '90days') {
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      matchesDate = new Date(inv.date) >= ninetyDaysAgo;
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  const handleDownload = async (id, number) => {
    try {
      const res = await api.get(`/invoices/${id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice_${number}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      console.error('Error downloading PDF', err);
    }
  };
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        await api.delete(`/invoices/${id}`);
        fetchInvoices();
      } catch (err) {
        console.error('Error deleting invoice', err);
        alert('Failed to delete invoice');
      }
    }
  };

  return (
    <Layout title="Invoices">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by number or customer..." 
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="relative" ref={filterRef}>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <Filter size={18} />
              Filters
              {dateFilter !== 'all' && <span className="w-2 h-2 rounded-full bg-primary-600 absolute top-2 right-2"></span>}
            </button>

            {showFilters && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-3 border-b border-gray-50">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Date Range</p>
                </div>
                <div className="p-1">
                  <button 
                    onClick={() => { setDateFilter('all'); setShowFilters(false); }} 
                    className={`w-full text-left px-4 py-2 text-sm rounded-lg hover:bg-gray-50 transition-colors ${dateFilter === 'all' ? 'text-primary-600 font-bold bg-primary-50' : 'text-gray-700'}`}
                  >
                    All Time
                  </button>
                  <button 
                    onClick={() => { setDateFilter('30days'); setShowFilters(false); }} 
                    className={`w-full text-left px-4 py-2 text-sm rounded-lg hover:bg-gray-50 transition-colors ${dateFilter === '30days' ? 'text-primary-600 font-bold bg-primary-50' : 'text-gray-700'}`}
                  >
                    Last 30 Days
                  </button>
                  <button 
                    onClick={() => { setDateFilter('90days'); setShowFilters(false); }} 
                    className={`w-full text-left px-4 py-2 text-sm rounded-lg hover:bg-gray-50 transition-colors ${dateFilter === '90days' ? 'text-primary-600 font-bold bg-primary-50' : 'text-gray-700'}`}
                  >
                    Last 90 Days
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <button 
          onClick={() => navigate('/invoices/create')}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-xl font-bold shadow-lg shadow-primary-200 hover:bg-primary-700 transition-all"
          title="Create New Invoice"
        >
          <Plus size={18} />
          Create Invoice
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
        {['all', 'draft', 'sent', 'paid', 'overdue'].map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-6 py-3 text-sm font-medium capitalize border-b-2 transition-colors ${
              filter === t ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Invoice</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan="6" className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-full"></div></td>
                </tr>
              ))
            ) : filteredInvoices.length > 0 ? filteredInvoices.map((inv) => (
              <tr key={inv.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <p className="text-sm font-bold text-gray-900 mb-0.5">{inv.invoice_number}</p>
                  <p className="text-xs text-gray-500">ID: #{inv.id}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm font-bold text-gray-900 mb-0.5">{inv.customer_name}</p>
                  <p className="text-xs text-gray-500">Business Client</p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-gray-900">{new Date(inv.date).toLocaleDateString()}</p>
                  <p className="text-xs text-red-500">Due: {new Date(inv.due_date).toLocaleDateString()}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm font-bold text-gray-900">${inv.total.toLocaleString()}</p>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={inv.status} />
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={() => handleDownload(inv.id, inv.invoice_number)}
                      className="p-2 text-gray-400 hover:text-primary-600 transition-colors" 
                      title="Download PDF"
                    >
                      <Download size={18} />
                    </button>
                    <button onClick={() => navigate(`/invoices/edit/${inv.id}`)} className="p-2 text-gray-400 hover:text-primary-600 transition-colors" title="Edit">
                      <Edit2 size={18} />
                    </button>
                    {user?.role === 'admin' && (
                      <button onClick={() => handleDelete(inv.id)} className="p-2 text-gray-400 hover:text-red-600 transition-colors" title="Delete">
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center">
                    <FileText size={48} className="text-gray-200 mb-4" />
                    <p className="text-lg font-medium text-gray-400">No invoices found</p>
                    <p className="text-sm">Try adjusting your filters or search.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
    </Layout>
  );
};

export default Invoices;
