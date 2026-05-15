import React from 'react';
import { Link } from 'react-router-dom';
import LandingLayout from '../components/LandingLayout';
import { 
  CheckCircle2, 
  ArrowRight, 
  Zap, 
  ShieldCheck, 
  Globe, 
  BarChart3,
  MessageSquare,
  Users
} from 'lucide-react';

const Home = () => {
  return (
    <LandingLayout>
      {/* Hero Section */}
      <section className="relative pt-16 pb-24 lg:pt-32 lg:pb-40 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto mb-16">
            <h1 className="text-4xl lg:text-6xl font-black text-gray-900 tracking-tight leading-[1.1] mb-8 animate-in fade-in slide-in-from-bottom duration-700">
              Invoicing that <span className="text-primary-600">moves as fast</span> as your business.
            </h1>
            <p className="text-lg text-gray-500 leading-relaxed mb-10 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom duration-1000">
              The only platform that combines professional PDF invoicing with real-time WhatsApp alerts and powerful revenue analytics. Built for modern teams.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom duration-1000 delay-200">
              <Link to="/register" className="w-full sm:w-auto px-8 py-4 bg-primary-600 text-white font-black rounded-2xl shadow-xl shadow-primary-200 hover:bg-primary-700 hover:-translate-y-1 transition-all text-base flex items-center justify-center gap-2">
                Start 14-day Free Trial
                <ArrowRight size={20} />
              </Link>
              <Link to="/features" className="w-full sm:w-auto px-8 py-4 bg-white text-gray-900 font-bold rounded-2xl border border-gray-200 hover:bg-gray-50 transition-all text-base">
                View Features
              </Link>
            </div>
          </div>

          {/* Product Preview Mockup */}
          <div className="relative max-w-5xl mx-auto animate-in fade-in zoom-in duration-1000 delay-300">
            <div className="absolute inset-0 bg-primary-600/5 blur-3xl rounded-full -z-10 transform scale-110"></div>
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-4 relative">
               <div className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-200 aspect-[16/9] flex items-center justify-center relative group">
                  <div className="absolute inset-0 bg-gradient-to-tr from-gray-900/5 to-transparent"></div>
                  <img 
                    src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop" 
                    alt="Dashboard Preview" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 opacity-90" 
                  />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-6 bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 max-w-sm text-center">
                    <div className="w-16 h-16 bg-primary-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 italic font-black text-2xl">iP</div>
                    <h3 className="font-black text-gray-900 text-lg mb-2">Automated Billing</h3>
                    <p className="text-sm text-gray-500">Your revenue dashboard, ready in minutes.</p>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Floating Shapes */}
        <div className="absolute top-1/4 -left-20 w-64 h-64 bg-primary-100/30 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-0 -right-20 w-80 h-80 bg-blue-100/20 rounded-full blur-3xl -z-10"></div>
      </section>

      {/* Social Proof */}
      <section className="py-12 border-y border-gray-100 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-8">Trusted by 2,000+ businesses worldwide</p>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-40 grayscale">
             <span className="text-2xl font-black text-gray-900">ACME</span>
             <span className="text-2xl font-black text-gray-900">GLOBEX</span>
             <span className="text-2xl font-black text-gray-900">SOYLENT</span>
             <span className="text-2xl font-black text-gray-900">WAYNE</span>
             <span className="text-2xl font-black text-gray-900">STARK</span>
          </div>
        </div>
      </section>

      {/* Main Features Grid */}
      <section className="py-24 lg:py-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 tracking-tight leading-tight mb-6">
              Everything you need to <span className="text-primary-600">scale your revenue</span>.
            </h2>
            <p className="text-lg text-gray-500">
              We've replaced the clutter of traditional tools with a streamlined experience designed for growth-oriented companies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { 
                title: 'Smart Invoicing', 
                desc: 'Create and send branded PDF invoices in seconds. Auto-calculate taxes and discounts.', 
                icon: <Zap className="text-orange-500" />,
                bg: 'bg-orange-50'
              },
              { 
                title: 'WhatsApp Alerts', 
                desc: 'Deliver invoices and payment reminders directly to your clients via WhatsApp Business API.', 
                icon: <MessageSquare className="text-green-500" />,
                bg: 'bg-green-50'
              },
              { 
                title: 'Real-time Reports', 
                desc: 'Track revenue, expenses, and outstanding payments with stunning visualization charts.', 
                icon: <BarChart3 className="text-primary-600" />,
                bg: 'bg-primary-50'
              },
              { 
                title: 'Staff Roles', 
                desc: 'Manage multiple organizations and invite team members with granular permission controls.', 
                icon: <Users className="text-purple-500" />,
                bg: 'bg-purple-50'
              },
              { 
                title: 'Secure Payments', 
                desc: 'Accept payments through bank transfers or credit cards with full status tracking.', 
                icon: <ShieldCheck className="text-blue-500" />,
                bg: 'bg-blue-50'
              },
              { 
                title: 'Local & Global', 
                desc: 'Multi-currency support and localized tax IDs make global business effortless.', 
                icon: <Globe className="text-teal-500" />,
                bg: 'bg-teal-50'
              }
            ].map((f, i) => (
              <div key={i} className="group p-8 bg-white border border-gray-100 rounded-3xl hover:border-primary-100 hover:shadow-xl hover:shadow-primary-50 transition-all duration-300">
                <div className={`w-14 h-14 ${f.bg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  {React.cloneElement(f.icon, { size: 28 })}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-900 rounded-[3rem] p-12 lg:p-24 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-primary-600/10 blur-3xl rounded-full translate-y-1/2"></div>
            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-4xl lg:text-5xl font-black text-white mb-8">Ready to automate your billing?</h2>
              <p className="text-lg text-gray-400 mb-12">
                Join thousands of businesses who have switched to a faster, more modern way of managing their finances.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                 <Link to="/register" className="w-full sm:w-auto px-10 py-5 bg-primary-600 text-white font-black rounded-2xl shadow-xl shadow-primary-900/40 hover:bg-primary-700 hover:-translate-y-1 transition-all text-lg">
                    Get Started Free
                 </Link>
                 <Link to="/contact" className="w-full sm:w-auto px-10 py-5 bg-white/10 text-white font-bold rounded-2xl hover:bg-white/20 backdrop-blur-md transition-all text-lg border border-white/10">
                    Contact Sales
                 </Link>
              </div>
              <p className="mt-8 text-sm text-gray-500 flex items-center justify-center gap-4">
                 <span className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-primary-500" /> No credit card required</span>
                 <span className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-primary-500" /> Cancel anytime</span>
              </p>
            </div>
          </div>
        </div>
      </section>
    </LandingLayout>
  );
};

export default Home;
