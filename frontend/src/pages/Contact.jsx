import React, { useState } from 'react';
import LandingLayout from '../components/LandingLayout';
import { Mail, Phone, MapPin, Send, MessageCircle } from 'lucide-react';

const Contact = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <LandingLayout>
      <section className="pt-24 pb-12 lg:pt-32 lg:pb-20 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-5xl lg:text-7xl font-black text-gray-900 mb-6 tracking-tight">Get in <span className="text-primary-600">touch</span>.</h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Have questions about our platform or need a custom enterprise solution? Our team is here to help.
          </p>
        </div>
      </section>

      <section className="pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="flex flex-col lg:flex-row gap-16">
              {/* Info Side */}
              <div className="flex-1 space-y-12">
                 <div className="space-y-6">
                    <h2 className="text-3xl font-black text-gray-900">How can we help?</h2>
                    <p className="text-gray-500 leading-relaxed">
                        Whether you're a freelancer just starting out or a large-scale organization looking to automate thousands of invoices, we have a solution for you.
                    </p>
                 </div>

                 <div className="space-y-8">
                    <div className="flex items-start gap-6 group">
                        <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                            <Mail size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 mb-1">Email Support</h4>
                            <p className="text-gray-500 text-sm">support@invoicepro.com</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-6 group">
                        <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                            <MessageCircle size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 mb-1">WhatsApp Business</h4>
                            <p className="text-gray-500 text-sm">+1 (555) INVOICE-PR</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-6 group">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                            <MapPin size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 mb-1">Global Headquarters</h4>
                            <p className="text-gray-500 text-sm font-medium">100 Tech Plaza, Financial District<br/>San Francisco, CA 94103</p>
                        </div>
                    </div>
                 </div>
              </div>

              {/* Form Side */}
              <div className="flex-1">
                 {submitted ? (
                    <div className="bg-primary-50 border border-primary-100 rounded-[3rem] p-12 text-center animate-in zoom-in duration-300">
                        <div className="w-20 h-20 bg-primary-600 text-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary-200">
                            <Send size={32} />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 mb-4">Message Sent!</h3>
                        <p className="text-gray-500 leading-relaxed mb-8">
                            Thanks for reaching out. One of our team members will get back to you within 24 hours.
                        </p>
                        <button 
                            onClick={() => setSubmitted(false)}
                            className="text-primary-600 font-bold hover:underline"
                        >
                            Send another message
                        </button>
                    </div>
                 ) : (
                    <div className="bg-white border border-gray-100 rounded-[3rem] p-8 lg:p-12 shadow-2xl shadow-gray-100">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                                    <input 
                                        type="text" 
                                        required 
                                        className="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-primary-500 outline-none transition-all font-medium" 
                                        placeholder="Enter your name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Work Email</label>
                                    <input 
                                        type="email" 
                                        required 
                                        className="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-primary-500 outline-none transition-all font-medium" 
                                        placeholder="you@company.com"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Organization Size</label>
                                <select className="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-primary-500 outline-none transition-all font-medium appearance-none">
                                    <option>Individual / Freelancer</option>
                                    <option>Small Business (2-10)</option>
                                    <option>Medium Agency (11-50)</option>
                                    <option>Enterprise (50+)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Message</label>
                                <textarea 
                                    rows="4" 
                                    required 
                                    className="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-primary-500 outline-none transition-all font-medium" 
                                    placeholder="How can we help you?"
                                ></textarea>
                            </div>
                            <button 
                                type="submit" 
                                className="w-full py-4 bg-primary-600 text-white font-black rounded-2xl shadow-xl shadow-primary-200 hover:bg-primary-700 hover:-translate-y-1 transition-all"
                            >
                                Send Message
                            </button>
                        </form>
                    </div>
                 )}
              </div>
           </div>
        </div>
      </section>
    </LandingLayout>
  );
};

export default Contact;
