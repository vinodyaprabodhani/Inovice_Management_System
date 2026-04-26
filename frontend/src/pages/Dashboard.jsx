import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../api/axios';
import { 
  TrendingUp, 
  Users, 
  FileCheck, 
  Clock, 
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  X
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

const StatCard = ({ title, value, icon: Icon, color, trend }) => (
  <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-2xl ${color}`}>
        <Icon size={24} className="text-white" />
      </div>
      {trend && (
        <div className={`flex items-center text-xs font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
          {trend > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {Math.abs(trend)}%
        </div>
      )}
    </div>
    <p className="text-sm text-gray-500 font-medium">{title}</p>
    <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/reports/dashboard');
        setStats(res.data);
      } catch (err) {
        console.error('Error fetching dashboard stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);


  if (loading) return <Layout title="Dashboard"><div className="animate-pulse flex space-y-4 flex-col">...</div></Layout>;

  const data = stats?.monthlyChart || [
    { month: 'Jan', total: 4000 },
    { month: 'Feb', total: 3000 },
    { month: 'Mar', total: 5000 },
    { month: 'Apr', total: 4500 },
    { month: 'May', total: 6000 },
    { month: 'Jun', total: 5500 },
  ];

  return (
    <Layout title="Dashboard Overview">
      {/* Stat Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Revenue" 
          value={`$${stats?.revenue?.toLocaleString()}`} 
          icon={DollarSign} 
          color="bg-primary-600" 
          trend={12}
        />
        <StatCard 
          title="Total Customers" 
          value={stats?.customersCount ?? 0} 
          icon={Users} 
          color="bg-blue-500" 
          trend={8}
        />
        <StatCard 
          title="Paid Invoices" 
          value={stats?.counts?.find(c => c.status === 'paid')?.count || '0'} 
          icon={FileCheck} 
          color="bg-green-500" 
          trend={15}
        />
        <StatCard 
          title="Outstanding" 
          value={`$${stats?.outstanding?.toLocaleString()}`} 
          icon={Clock} 
          color="bg-orange-500" 
          trend={-5}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Revenue Analysis</h3>
              <p className="text-sm text-gray-500">Monthly income overview</p>
            </div>
            <select className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary-500">
              <option>Last 6 Months</option>
              <option>Last Year</option>
            </select>
          </div>
          
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
                />
                <Area type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Recent Activity</h3>
          <div className="space-y-6">
            {stats?.activities?.length > 0 ? stats.activities.slice(0, 4).map((act, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500 shrink-0">
                  <Activity size={18} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{act.action}</p>
                  <p className="text-xs text-gray-500 mt-1">{new Date(act.timestamp).toLocaleDateString()}</p>
                </div>
              </div>
            )) : (
              <div className="text-center py-10">
                <Activity size={40} className="mx-auto text-gray-200 mb-2" />
                <p className="text-sm text-gray-400">No recent activity</p>
              </div>
            )}
          </div>
          <button 
            onClick={() => setShowActivityModal(true)}
            className="w-full mt-8 py-3 text-sm font-bold text-primary-600 bg-primary-50 rounded-xl hover:bg-primary-100 transition-colors"
          >
            View All Activity
          </button>
        </div>
      </div>

      {/* Quick Actions or Bottom Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-primary-900 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-xl font-bold mb-2">Create New Invoice</h3>
              <p className="text-primary-200 text-sm mb-6">Quickly generate and send professional invoices to your clients.</p>
              <button 
                onClick={() => navigate('/invoices/create')}
                className="bg-white text-primary-900 px-6 py-2.5 rounded-xl font-bold hover:bg-primary-50 transition-colors"
                title="Create Invoice"
              >
                Get Started
              </button>
            </div>
            <TrendingUp size={120} className="absolute -bottom-4 -right-4 text-white/5 rotate-12" />
          </div>
          
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Expenses This Month</h3>
              <p className="text-sm text-gray-500 mb-4">Total trackable spending</p>
              <h4 className="text-2xl font-bold text-gray-900">${stats?.expenses?.toLocaleString() || '0'}</h4>
            </div>
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center">
              <ArrowDownRight size={32} />
            </div>
          </div>
      </div>

      {/* Activity Modal */}
      {showActivityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">All Recent Activity</h3>
              <button 
                onClick={() => setShowActivityModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto space-y-6">
              {stats?.activities?.map((act, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500 shrink-0">
                    <Activity size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{act.action}</p>
                    <p className="text-xs text-gray-500 mt-1">{new Date(act.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Dashboard;
