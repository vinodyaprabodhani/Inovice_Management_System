import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../api/axios';
import { 
  Plus, 
  Trash2, 
  Save, 
  ArrowLeft, 
  User, 
  Calendar, 
  FileText,
  DollarSign,
  PlusCircle,
  X
} from 'lucide-react';

const CreateInvoice = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    customer_id: '',
    invoice_number: `INV-${Date.now().toString().slice(-6)}`,
    date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    discount: 0,
    notes: '',
    items: [
      { product_id: '', description: '', quantity: 1, unit_price: 0, tax_rate: 0, total: 0 }
    ]
  });


  useEffect(() => {
    const fetchData = async () => {
      try {
        const [custRes, prodRes] = await Promise.all([
          api.get('/customers'),
          api.get('/products?activeOnly=true')
        ]);
        setCustomers(custRes.data);
        setProducts(prodRes.data);

        if (isEditMode) {
          const invRes = await api.get(`/invoices/${id}`);
          const inv = invRes.data;
          
          setFormData({
            customer_id: inv.customer_id || '',
            invoice_number: inv.invoice_number || '',
            date: inv.date ? new Date(inv.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            due_date: inv.due_date ? new Date(inv.due_date).toISOString().split('T')[0] : '',
            discount: inv.discount || 0,
            notes: inv.notes || '',
            items: inv.items && inv.items.length > 0 ? inv.items.map(item => ({
              product_id: item.product_id || '',
              description: item.description || '',
              quantity: parseFloat(item.quantity) || 1,
              unit_price: parseFloat(item.unit_price) || 0,
              tax_rate: parseFloat(item.tax_rate) || 0,
              total: parseFloat(item.total) || 0
            })) : [{ product_id: '', description: '', quantity: 1, unit_price: 0, tax_rate: 0, total: 0 }]
          });
        }
      } catch (err) {
        console.error('Error fetching data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, isEditMode]);

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { product_id: '', description: '', quantity: 1, unit_price: 0, tax_rate: 0, total: 0 }]
    });
  };

  const handleRemoveItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    const item = { ...newItems[index] };

    if (field === 'product_id') {
      const product = products.find(p => p.id === parseInt(value));
      if (product) {
        item.product_id = product.id;
        item.description = product.name;
        item.unit_price = parseFloat(product.price);
        item.tax_rate = parseFloat(product.tax_rate);
      }
    } else {
      item[field] = value;
    }

    // Recalculate item total
    const qty = parseFloat(item.quantity) || 0;
    const price = parseFloat(item.unit_price) || 0;
    const tax = parseFloat(item.tax_rate) || 0;
    const sub = qty * price;
    item.total = sub + (sub * tax / 100);

    newItems[index] = item;
    setFormData({ ...formData, items: newItems });
  };

  const totals = formData.items.reduce((acc, item) => {
    const sub = (parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0);
    const tax = sub * (parseFloat(item.tax_rate) || 0) / 100;
    return {
      subtotal: acc.subtotal + sub,
      tax: acc.tax + tax,
      total: acc.total + sub + tax
    };
  }, { subtotal: 0, tax: 0, total: 0 });

  const finalTotal = totals.total - (parseFloat(formData.discount) || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.customer_id) return alert('Please select a customer');
    if (formData.items.some(item => !item.description)) return alert('All items must have a description');

    setIsSubmitting(true);
    try {
      const isDraft = e.nativeEvent.submitter?.name === 'saveOnly';
      const payload = { ...formData, status: isDraft ? 'draft' : 'sent' };

      let invoiceId;
      if (isEditMode) {
        await api.put(`/invoices/${id}`, payload);
        invoiceId = id;
      } else {
        const res = await api.post('/invoices', payload);
        invoiceId = res.data.invoiceId;
      }

      if (e.nativeEvent.submitter?.name === 'saveAndSend') {
        try {
          await api.post(`/notifications/email/invoice/${invoiceId}`);
        } catch (notifErr) {
          console.error('Email failed but invoice saved', notifErr);
        }
      }

      navigate('/invoices');
    } catch (err) {
      console.error('Error saving invoice', err);
      alert('Failed to save invoice');
    } finally {
      setIsSubmitting(false);
    }
  };


  if (loading) return <Layout title={isEditMode ? "Edit Invoice" : "Create Invoice"}><div>Loading...</div></Layout>;

  return (
    <Layout title={isEditMode ? "Edit Invoice" : "Create New Invoice"}>
      <div className="max-w-5xl mx-auto">
        <button 
          onClick={() => navigate('/invoices')}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to list
        </button>

        <form onSubmit={handleSubmit} className="space-y-8 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left - Core Details */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-primary-100 text-primary-600 rounded-lg">
                    <User size={20} />
                  </div>
                  <h3 className="font-bold text-gray-900">Customer Details</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Customer</label>
                    <select
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                      value={formData.customer_id}
                      onChange={(e) => setFormData({...formData, customer_id: e.target.value})}
                    >
                      <option value="">Choose a customer...</option>
                      {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.email})</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Line Items */}
              <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary-100 text-primary-600 rounded-lg">
                      <FileText size={20} />
                    </div>
                    <h3 className="font-bold text-gray-900">Invoice Items</h3>
                  </div>
                  <button 
                    type="button" 
                    onClick={handleAddItem}
                    className="flex items-center gap-2 text-xs font-bold text-primary-600 hover:bg-primary-50 px-3 py-1.5 rounded-lg transition-colors border border-primary-100"
                  >
                    <PlusCircle size={14} />
                    Add Field
                  </button>
                </div>

                <div className="space-y-4">
                  {formData.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-4 p-4 bg-gray-50/50 rounded-2xl border border-gray-100 relative group animate-in slide-in-from-right-2 fade-in duration-200">
                      <div className="col-span-12 md:col-span-4">
                        <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1 ml-1">Product/Service</label>
                        <select
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                          value={item.product_id}
                          onChange={(e) => handleItemChange(index, 'product_id', e.target.value)}
                        >
                          <option value="">Manual Entry...</option>
                          {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                        <input
                          type="text"
                          placeholder="Description"
                          className="w-full mt-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm"
                          value={item.description}
                          onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        />
                      </div>
                      <div className="col-span-4 md:col-span-2">
                         <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1 ml-1">Qty</label>
                         <input
                          type="number"
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                         />
                      </div>
                      <div className="col-span-4 md:col-span-2">
                        <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1 ml-1">Price</label>
                        <input
                          type="number"
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm"
                          value={item.unit_price}
                          onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)}
                         />
                      </div>
                      <div className="col-span-4 md:col-span-2">
                        <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1 ml-1">Tax%</label>
                        <input
                          type="number"
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm"
                          value={item.tax_rate}
                          onChange={(e) => handleItemChange(index, 'tax_rate', e.target.value)}
                         />
                      </div>
                      <div className="col-span-12 md:col-span-2 flex items-center justify-between">
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1 ml-1">Total</label>
                          <p className="text-sm font-bold text-gray-900">${item.total.toFixed(2)}</p>
                        </div>
                        {formData.items.length > 1 && (
                          <button 
                            type="button" 
                            onClick={() => handleRemoveItem(index)}
                            className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right - Summary & Actions */}
            <div className="space-y-6">
              <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm sticky top-28">
                <div className="space-y-6 mb-8">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Invoice Number</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono text-sm"
                      value={formData.invoice_number}
                      onChange={(e) => setFormData({...formData, invoice_number: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 font-bold">Issue Date</label>
                    <input
                      type="date"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 font-bold text-red-500">Due Date</label>
                    <input
                      type="date"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                      value={formData.due_date}
                      onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-6 border-t border-gray-100">
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Subtotal</span>
                    <span>${totals.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Total Tax</span>
                    <span>${totals.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm items-center">
                    <span className="text-gray-500">Discount</span>
                    <input
                      type="number"
                      className="w-20 text-right px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-sm text-red-500 font-bold"
                      value={formData.discount}
                      onChange={(e) => setFormData({...formData, discount: e.target.value})}
                    />
                  </div>
                  <div className="flex justify-between text-xl font-bold text-gray-900 pt-4 border-t border-gray-100">
                    <span>Total Due</span>
                    <span>${finalTotal.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  name="saveOnly"
                  disabled={isSubmitting}
                  className="w-full mt-10 py-4 bg-white text-gray-900 border border-gray-200 rounded-2xl font-bold shadow-sm hover:bg-gray-50 transition-all flex items-center justify-center gap-3 group disabled:opacity-70"
                >
                  <Save size={20} className="group-hover:scale-110 transition-transform text-gray-400" />
                  Save Draft
                </button>

                <button
                  type="submit"
                  name="saveAndSend"
                  disabled={isSubmitting}
                  className="w-full mt-4 py-4 bg-primary-600 text-white rounded-2xl font-bold shadow-xl shadow-primary-200 hover:bg-primary-700 transition-all flex items-center justify-center gap-3 group disabled:opacity-70"
                >
                  {isSubmitting ? <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-5 h-5"></span> : <FileText size={20} className="group-hover:scale-110 transition-transform" />}
                  {isSubmitting ? 'Processing...' : 'Save & Send Invoice'}
                </button>
              </div>
            </div>
          </div>
        </form>

      </div>
    </Layout>
  );
};

export default CreateInvoice;
