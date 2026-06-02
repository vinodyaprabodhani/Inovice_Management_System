import React, { useState } from 'react';
import Layout from '../components/Layout';
import { Mail, MessageSquare, Phone, Send, CheckCircle, X } from 'lucide-react';

const Support = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { sender: 'agent', text: 'Hi there! Welcome to InvoicePro support. How can I help you today?', time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [agentTyping, setAgentTyping] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1500);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = {
      sender: 'user',
      text: chatInput,
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    };

    setChatMessages(prev => [...prev, userMsg]);
    const userQuery = chatInput.toLowerCase();
    setChatInput('');

    // Simulate Agent Typing
    setAgentTyping(true);
    setTimeout(() => {
      let replyText = "Thank you for reaching out. An agent will be with you shortly. Could you please specify your registered email address?";
      if (userQuery.includes('billing') || userQuery.includes('price') || userQuery.includes('invoice')) {
        replyText = "I can definitely help with your billing/invoice query! Could you please provide your Organization Name and Invoice Number?";
      } else if (userQuery.includes('hello') || userQuery.includes('hi')) {
        replyText = "Hello! Hope you are having a great day. How can I help you with your InvoicePro dashboard?";
      }

      setChatMessages(prev => [...prev, {
        sender: 'agent',
        text: replyText,
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      }]);
      setAgentTyping(false);
    }, 1200);
  };

  return (
    <Layout title="Contact Support">
      <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-8">
        
        {/* Left Column: Contact Info */}
        <div className="lg:w-1/3 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="text-xl font-black text-gray-900 mb-6">Get in Touch</h3>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary-50 text-primary-600 rounded-xl shrink-0">
                  <Mail size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Email Us</h4>
                  <p className="text-sm text-gray-500 mb-2">Our friendly team is here to help.</p>
                  <a href="mailto:support@invoicepro.com" className="text-sm font-bold text-primary-600 hover:underline">support@invoicepro.com</a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl shrink-0">
                  <MessageSquare size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Live Chat</h4>
                  <p className="text-sm text-gray-500 mb-2">Available Mon-Fri, 9am-5pm EST.</p>
                  <button 
                    onClick={() => setIsChatOpen(true)}
                    className="text-sm font-bold text-blue-600 hover:underline cursor-pointer focus:outline-none"
                  >
                    Start a Chat
                  </button>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-50 text-green-600 rounded-xl shrink-0">
                  <Phone size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Call Us</h4>
                  <p className="text-sm text-gray-500 mb-2">Mon-Fri from 8am to 5pm.</p>
                  <a href="tel:+15550000000" className="text-sm font-bold text-green-600 hover:underline">+1 (555) 000-0000</a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Contact Form */}
        <div className="lg:w-2/3">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            {submitted ? (
              <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in zoom-in-95">
                <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle size={40} />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">Message Sent!</h3>
                <p className="text-gray-500 max-w-md mx-auto">Thanks for reaching out to us. We've received your message and will get back to you within 24 hours.</p>
                <button 
                  onClick={() => setSubmitted(false)}
                  className="mt-8 px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in zoom-in-95">
                <div>
                  <h3 className="text-2xl font-black text-gray-900 mb-2">Send us a message</h3>
                  <p className="text-gray-500">Fill out the form below and we'll reply as soon as possible.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Subject</label>
                    <select required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 transition-all font-medium">
                      <option value="">Select a topic...</option>
                      <option value="billing">Billing Inquiry</option>
                      <option value="technical">Technical Support</option>
                      <option value="feature">Feature Request</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Priority</label>
                    <select required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 transition-all font-medium">
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">How can we help?</label>
                  <textarea 
                    required 
                    rows="6" 
                    placeholder="Please provide as much detail as possible..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 transition-all font-medium resize-none"
                  ></textarea>
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-100">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center justify-center gap-2 px-8 py-3 bg-primary-600 text-white rounded-xl font-bold shadow-xl shadow-primary-200 hover:bg-primary-700 transition-all disabled:opacity-70 w-full sm:w-auto cursor-pointer"
                  >
                    {loading ? (
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <Send size={18} />
                    )}
                    {loading ? 'Sending...' : 'Send Message'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Live Chat Window */}
      {isChatOpen && (
        <div className="fixed bottom-6 right-6 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-gray-100 flex flex-col z-50 animate-in slide-in-from-bottom duration-300 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-blue-600 px-6 py-4 text-white flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-ping"></div>
              <div>
                <h4 className="font-bold text-sm">Alex - InvoicePro Support</h4>
                <p className="text-[10px] text-primary-100">Typically replies in under a minute</p>
              </div>
            </div>
            <button 
              onClick={() => {
                setIsChatOpen(false);
                setChatMessages([
                  { sender: 'agent', text: 'Hi there! Welcome to InvoicePro support. How can I help you today?', time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }
                ]);
              }}
              className="text-white/80 hover:text-white p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-6 h-80 overflow-y-auto space-y-4 bg-gray-50/50">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                  msg.sender === 'user' 
                    ? 'bg-primary-600 text-white rounded-tr-none' 
                    : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none shadow-sm'
                }`}>
                  <p>{msg.text}</p>
                </div>
                <span className="text-[10px] text-gray-400 mt-1 px-1">{msg.time}</span>
              </div>
            ))}
            {agentTyping && (
              <div className="flex items-center gap-1 bg-white border border-gray-100 rounded-2xl rounded-tl-none px-4 py-3 w-fit shadow-sm">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-200"></span>
              </div>
            )}
          </div>

          {/* Input Footer */}
          <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-100 flex gap-2">
            <input 
              type="text"
              placeholder="Type your message..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            />
            <button 
              type="submit"
              className="p-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors shadow-md shadow-primary-200 cursor-pointer animate-in zoom-in-75"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </Layout>
  );
};

export default Support;
