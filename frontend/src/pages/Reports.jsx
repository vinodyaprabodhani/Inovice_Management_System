import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../api/axios';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart as PieIcon,
  Download,
  Calendar,
  Layers
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  Cell,
  PieChart,
  Pie
} from 'recharts';

const Reports = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });

  const fetchReport = async () => {
    setLoading(true);
    try {
      const { startDate, endDate } = dateRange;
      const res = await api.get(`/reports/financial`, { params: { startDate, endDate } });
      setReportData(res.data);
    } catch (err) {
      console.error('Error fetching reports', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  const pieData = [
    { name: 'Received', value: Number(reportData?.totalReceived || 0) },
    { name: 'Pending', value: Number(reportData?.totalInvoiced || 0) - Number(reportData?.totalReceived || 0) },
    { name: 'Expenses', value: Number(reportData?.totalExpenses || 0) }
  ];

  const exportToCSV = () => {
    if (!reportData) return;
    
    const headers = ['Metric', 'Amount (USD)'];
    const rows = [
      ['Total Invoiced', reportData.totalInvoiced || 0],
      ['Total Received', reportData.totalReceived || 0],
      ['Total Expenses', reportData.totalExpenses || 0],
      ['Net Profit', reportData.grossProfit || 0]
    ];
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Financial_Statement_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Layout title="Financial Reports">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-500">Track your business performance and financial health.</p>
        </div>
        
        <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
          <input 
            type="date" 
            className="text-sm border-none focus:ring-0 px-2"
            value={dateRange.startDate}
            onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
          />
          <span className="text-gray-300">-</span>
          <input 
            type="date" 
            className="text-sm border-none focus:ring-0 px-2"
            value={dateRange.endDate}
            onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
          />
          <button 
            onClick={fetchReport}
            className="bg-primary-600 text-white p-2 rounded-xl hover:bg-primary-700 transition-colors"
          >
            <Calendar size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
            <DollarSign size={24} />
          </div>
          <p className="text-sm text-gray-500 font-medium">Total Invoiced</p>
          <h3 className="text-2xl font-bold mt-1">${reportData?.totalInvoiced?.toLocaleString()}</h3>
        </div>
        
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-4">
            <TrendingUp size={24} />
          </div>
          <p className="text-sm text-gray-500 font-medium">Total Received</p>
          <h3 className="text-2xl font-bold mt-1">${reportData?.totalReceived?.toLocaleString()}</h3>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mb-4">
            <TrendingDown size={24} />
          </div>
          <p className="text-sm text-gray-500 font-medium">Total Expenses</p>
          <h3 className="text-2xl font-bold mt-1">${reportData?.totalExpenses?.toLocaleString()}</h3>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center mb-4">
            <Layers size={24} />
          </div>
          <p className="text-sm text-gray-500 font-medium">Net Profit</p>
          <h3 className="text-2xl font-bold mt-1 text-primary-600">${reportData?.grossProfit?.toLocaleString()}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Breakdown Chart */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <PieIcon size={20} className="text-primary-600" />
            Financial Breakdown
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  minAngle={15}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Action Center */}
        <div className="bg-primary-900 rounded-3xl p-8 text-white relative overflow-hidden">
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-4">Financial Health</h3>
              <p className="text-primary-200 mb-6">Your business is growing! You've received {((reportData?.totalReceived / reportData?.totalInvoiced) * 100 || 0).toFixed(1)}% of your total billed amount this period.</p>
              
              <div className="space-y-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Collection Progress</span>
                  <span>{((reportData?.totalReceived / reportData?.totalInvoiced) * 100 || 0).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-primary-800 rounded-full h-2">
                  <div 
                    className="bg-white h-2 rounded-full transition-all duration-1000" 
                    style={{width: `${(reportData?.totalReceived / reportData?.totalInvoiced) * 100 || 0}%`}}
                  ></div>
                </div>
              </div>
            </div>

            <button 
              onClick={exportToCSV}
              className="flex items-center justify-center gap-2 w-full py-4 bg-white text-primary-900 rounded-2xl font-bold transition-transform hover:scale-[1.02] mt-8"
            >
              <Download size={20} />
              Export Financial Statement
            </button>
          </div>
          <TrendingUp size={200} className="absolute -bottom-10 -right-10 text-white/5" />
        </div>
      </div>
    </Layout>
  );
};

export default Reports;
