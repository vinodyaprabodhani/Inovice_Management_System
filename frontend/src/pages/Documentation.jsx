import React from 'react';
import Layout from '../components/Layout';
import { Book, FileText, Users, Settings, CreditCard, ChevronRight } from 'lucide-react';

const Documentation = () => {
  const sections = [
    {
      title: 'Getting Started',
      icon: <Book className="text-primary-500" size={24} />,
      articles: ['Welcome to Invoice Management System', 'Setting up your profile', 'Inviting team members']
    },
    {
      title: 'Managing Invoices',
      icon: <FileText className="text-blue-500" size={24} />,
      articles: ['How to create your first invoice', 'Understanding invoice statuses', 'Setting up recurring invoices']
    },
    {
      title: 'Customers & Products',
      icon: <Users className="text-green-500" size={24} />,
      articles: ['Importing customer lists', 'Managing your product catalog', 'Adding tax rates']
    },
    {
      title: 'Payments',
      icon: <CreditCard className="text-purple-500" size={24} />,
      articles: ['Recording manual payments', 'Setting up payment gateways', 'Handling partial payments']
    }
  ];

  return (
    <Layout title="Documentation">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="bg-gradient-to-r from-primary-600 to-blue-600 rounded-3xl p-10 text-white shadow-lg relative overflow-hidden">
           <div className="relative z-10">
             <h1 className="text-4xl font-black mb-4">How can we help you?</h1>
             <p className="text-primary-100 text-lg max-w-xl">Search our knowledge base or browse the categories below to find exactly what you're looking for.</p>
           </div>
           <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sections.map((section, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-gray-50 rounded-xl">
                  {section.icon}
                </div>
                <h2 className="text-xl font-bold text-gray-900">{section.title}</h2>
              </div>
              <ul className="space-y-3">
                {section.articles.map((article, aIdx) => (
                  <li key={aIdx}>
                    <button className="w-full flex items-center justify-between text-left text-gray-600 hover:text-primary-600 group transition-colors">
                      <span className="font-medium">{article}</span>
                      <ChevronRight size={16} className="text-gray-300 group-hover:text-primary-500 transition-colors" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Documentation;
