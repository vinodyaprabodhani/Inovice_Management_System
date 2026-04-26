import React from 'react';
import LandingLayout from '../components/LandingLayout';
import { Check, ArrowRight, Zap, Building2, Rocket } from 'lucide-react';
import { Link } from 'react-router-dom';

const Pricing = () => {
  const plans = [
    {
      name: 'Starter',
      price: '0',
      desc: 'Perfect for freelancers starting out.',
      features: ['5 Invoices / month', '1 Organization', 'Basic PDF Templates', 'Email Support'],
      icon: <Zap className="text-orange-500" />,
      color: 'bg-orange-50',
      cta: 'Start for Free',
      link: '/register'
    },
    {
      name: 'Professional',
      price: '29',
      desc: 'Unlock growth with automated features.',
      features: ['Unlimited Invoices', '3 Organizations', 'WhatsApp Alerts', 'Premium Templates', 'Priority Support'],
      icon: <Rocket className="text-primary-600" />,
      color: 'bg-primary-50',
      popular: true,
      cta: 'Get Started',
      link: '/register'
    },
    {
      name: 'Enterprise',
      price: '99',
      desc: 'Advanced controls for large teams.',
      features: ['Unlimited Everything', 'Dedicated Manager', 'API Access', 'Custom Branding', 'SLA Guarantee'],
      icon: <Building2 className="text-purple-600" />,
      color: 'bg-purple-50',
      cta: 'Contact Sales',
      link: '/contact'
    }
  ];

  return (
    <LandingLayout>
      <section className="pt-24 pb-12 lg:pt-32 lg:pb-20 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-5xl lg:text-6xl font-black text-gray-900 mb-6 tracking-tight">Simple, <span className="text-primary-600">transparent</span> pricing.</h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Choose the plan that fits your business stage. No hidden fees, no long-term contracts.
          </p>
        </div>
      </section>

      <section className="pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            {plans.map((plan) => (
              <div 
                key={plan.name} 
                className={`relative p-8 rounded-[2.5rem] bg-white border ${plan.popular ? 'border-primary-200 shadow-2xl shadow-primary-100 scale-105 z-10' : 'border-gray-100 shadow-xl shadow-gray-100/50'} transition-all hover:-translate-y-1 duration-300`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-12 -translate-y-1/2 bg-primary-600 text-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-lg">
                    Most Popular
                  </div>
                )}
                
                <div className={`w-14 h-14 ${plan.color} rounded-2xl flex items-center justify-center mb-6`}>
                   {React.cloneElement(plan.icon, { size: 28 })}
                </div>
                
                <h3 className="text-2xl font-black text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-500 text-sm mb-8 leading-relaxed">{plan.desc}</p>
                
                <div className="mb-8">
                   <span className="text-5xl font-black text-gray-900">${plan.price}</span>
                   <span className="text-gray-400 font-bold"> / month</span>
                </div>

                <div className="space-y-4 mb-10">
                   {plan.features.map(f => (
                     <div key={f} className="flex items-center gap-3 text-sm font-medium text-gray-600">
                        <div className="w-5 h-5 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
                            <Check size={12} strokeWidth={3} />
                        </div>
                        {f}
                     </div>
                   ))}
                </div>

                <Link to={plan.link} className={`w-full py-4 rounded-2xl font-black transition-all flex items-center justify-center gap-2 ${plan.popular ? 'bg-primary-600 text-white shadow-xl shadow-primary-200 hover:bg-primary-700' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}>
                   {plan.cta}
                   <ArrowRight size={18} />
                </Link>
              </div>
            ))}
          </div>

          {/* Pricing FAQ or Trust */}
          <div className="mt-24 text-center">
             <div className="inline-flex items-center gap-8 py-6 px-12 bg-gray-50 rounded-[2rem] border border-gray-100">
                <div className="flex -space-x-3">
                    {[1,2,3,4].map(i => (
                        <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 overflow-hidden">
                           <img src={`https://i.pravatar.cc/100?u=${i}`} alt="User" />
                        </div>
                    ))}
                </div>
                <p className="text-sm font-bold text-gray-900 group">
                    <span className="text-primary-600">10,000+ companies</span> trust InvoicePro for their global billing.
                </p>
             </div>
          </div>
        </div>
      </section>
    </LandingLayout>
  );
};

export default Pricing;
