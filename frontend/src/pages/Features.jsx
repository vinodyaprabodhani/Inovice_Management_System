import React from 'react';
import LandingLayout from '../components/LandingLayout';
import { 
  BarChart3, 
  MessageSquare, 
  ShieldCheck, 
  Zap, 
  Globe, 
  FileText,
  Clock,
  Layers,
  Settings
} from 'lucide-react';

const Features = () => {
  const featureGroups = [
    {
      category: 'Invoicing & Payments',
      features: [
        { title: 'Branded Invoices', desc: 'Create high-fidelity PDF invoices that reflect your professional brand.', icon: <FileText /> },
        { title: 'Payment Tracking', desc: 'Monitor every transaction with real-time status updates from sent to paid.', icon: <ShieldCheck /> },
        { title: 'Recurring Billing', desc: 'Automate your subscription runs and focused on growth, not manual entry.', icon: <Layers /> },
      ]
    },
    {
      category: 'Messaging & Notifications',
      features: [
        { title: 'WhatsApp Integration', desc: 'Send invoices and reminders directly to where your clients are active.', icon: <MessageSquare /> },
        { title: 'Email Automation', desc: 'Configure custom email templates for every stage of the billing lifecycle.', icon: <Zap /> },
        { title: 'Status Triggers', desc: 'Auto-notify clients when invoices are overdue or payments are received.', icon: <Clock /> },
      ]
    },
    {
       category: 'Insights & Management',
       features: [
         { title: 'Revenue Analytics', desc: 'Deep dive into your business health with beautiful charts and KPI cards.', icon: <BarChart3 /> },
         { title: 'Global Multi-Currency', desc: 'Handle business across borders with support for 150+ international currencies.', icon: <Globe /> },
         { title: 'Advanced Settings', desc: 'Control every aspect of your organization from tax IDs to custom color themes.', icon: <Settings /> },
       ]
    }
  ];

  return (
    <LandingLayout>
      <section className="pt-24 pb-12 lg:pt-32 lg:pb-20 bg-gray-50/50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-5xl lg:text-7xl font-black text-gray-900 mb-6 tracking-tight">Supercharge your <span className="text-primary-600">billing workflow</span>.</h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Eliminate manual work and get paid faster with tools designed to automate your entire invoicing lifecycle.
          </p>
        </div>
      </section>

      <section className="py-24 lg:py-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           {featureGroups.map((group, idx) => (
             <div key={idx} className="mb-24 last:mb-0">
               <div className="flex items-center gap-4 mb-12">
                  <div className="h-px bg-gray-100 flex-1"></div>
                  <h2 className="text-2xl font-black text-gray-900 px-6 py-2 bg-white border border-gray-100 rounded-2xl shadow-sm uppercase tracking-widest text-sm">
                    {group.category}
                  </h2>
                  <div className="h-px bg-gray-100 flex-1"></div>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                  {group.features.map(f => (
                    <div key={f.title} className="group relative">
                        <div className="mb-6 w-12 h-12 rounded-xl bg-primary-600 text-white flex items-center justify-center transform group-hover:rotate-6 transition-all duration-300 shadow-lg shadow-primary-200">
                           {React.cloneElement(f.icon, { size: 24 })}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">{f.title}</h3>
                        <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
                    </div>
                  ))}
               </div>
             </div>
           ))}
        </div>
      </section>

      {/* Feature Showcase 1 */}
      <section className="py-24 bg-gray-900 overflow-hidden relative">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 text-center lg:text-left">
                <div className="w-12 h-1 bg-primary-600 mb-8 mx-auto lg:mx-0"></div>
                <h2 className="text-4xl lg:text-5xl font-black text-white mb-8 tracking-tight leading-tight">
                   WhatsApp notifications <br className="hidden lg:block"/> for modern payment speed.
                </h2>
                <p className="text-lg text-gray-400 mb-10 leading-relaxed max-w-lg mx-auto lg:mx-0">
                   Stop getting lost in busy email inboxes. Deliver invoices directly to clients via WhatsApp and get paid up to 3x faster than traditional methods.
                </p>
                <ul className="space-y-4 text-gray-300 font-medium text-sm inline-block lg:block text-left">
                   <li className="flex items-center gap-3"><Zap size={18} className="text-primary-500" /> Instant invoice delivery</li>
                   <li className="flex items-center gap-3"><Zap size={18} className="text-primary-500" /> Automated payment reminders</li>
                   <li className="flex items-center gap-3"><Zap size={18} className="text-primary-500" /> Read receipts for invoice tracking</li>
                </ul>
            </div>
            <div className="flex-1 relative">
                <div className="bg-white/5 backdrop-blur-2xl rounded-[3rem] p-8 border border-white/10 relative z-10 shadow-3xl">
                    <div className="space-y-4">
                        <div className="p-4 bg-primary-600 text-white rounded-2xl max-w-[80%] shadow-lg">
                           <p className="text-sm font-bold">Hello Mark! Your invoice #INV-2024 for "Mobile App Design" is ready. You can pay here: </p>
                           <p className="text-xs mt-2 opacity-80 underline">invoicepro.com/pay/7d9f2a</p>
                        </div>
                        <div className="p-4 bg-gray-800 text-gray-300 rounded-2xl max-w-[60%] ml-auto text-sm">
                           Thanks! Just paid it now. 🚀
                        </div>
                    </div>
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-600/20 blur-3xl -z-10 animate-pulse"></div>
            </div>
         </div>
      </section>
    </LandingLayout>
  );
};

export default Features;
