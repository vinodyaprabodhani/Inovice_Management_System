import React, { useState } from 'react';
import Layout from '../components/Layout';
import { Book, FileText, Users, CreditCard, ChevronRight, X } from 'lucide-react';

const Documentation = () => {
  const [selectedArticle, setSelectedArticle] = useState(null);

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

  const articleContents = {
    'Setting up your profile': {
      title: 'Setting up your profile',
      content: (
        <div className="space-y-4 text-gray-600">
          <p>Your user profile and business configurations are printed directly on your invoices. Keeping them complete is essential for professional billing.</p>
          <div className="bg-primary-50 p-4 rounded-xl border border-primary-100 flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">1</span>
            <p className="text-sm">Click on your user avatar or name in the top-right header, or go to the <strong>Profile</strong> tab in the sidebar.</p>
          </div>
          <div className="bg-primary-50 p-4 rounded-xl border border-primary-100 flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">2</span>
            <p className="text-sm">Enter your full name, work email address, and active mobile number.</p>
          </div>
          <div className="bg-primary-50 p-4 rounded-xl border border-primary-100 flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">3</span>
            <p className="text-sm">Upload a professional avatar picture to customize your layout.</p>
          </div>
          <div className="bg-primary-50 p-4 rounded-xl border border-primary-100 flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">4</span>
            <p className="text-sm">Click <strong>Save Changes</strong> at the bottom. Your updated details will be used for all new billing communications.</p>
          </div>
          <p className="text-xs text-gray-400 mt-4 italic">Note: To customize business details like your organization logo, tax identifier, or theme color, go to the <strong>Settings</strong> page instead.</p>
        </div>
      )
    },
    'Welcome to Invoice Management System': {
      title: 'Welcome to Invoice Management System',
      content: (
        <div className="space-y-4 text-gray-600">
          <p>Welcome to InvoicePro! Our platform is a state-of-the-art solution designed for modern business operations. Let us walk you through the key features:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Automated PDF Generation:</strong> Create and download styled business-grade invoices in seconds.</li>
            <li><strong>WhatsApp Integration:</strong> Auto-dispatch text reminders and invoice alerts to customers.</li>
            <li><strong>Interactive Reporting:</strong> Dynamic charts and filters analyze your monthly earnings, paid/unpaid statuses, and net expenses.</li>
          </ul>
        </div>
      )
    },
    'Inviting team members': {
      title: 'Inviting team members',
      content: (
        <div className="space-y-4 text-gray-600">
          <p>Collaborate with your coworkers by inviting them to join your organization:</p>
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2">
            <p className="text-sm"><strong>Step 1:</strong> Navigate to the <strong>Staff</strong> page in the sidebar.</p>
            <p className="text-sm"><strong>Step 2:</strong> Click <strong>Invite Staff</strong> and enter their email address.</p>
            <p className="text-sm"><strong>Step 3:</strong> Select their access level (<strong>Admin</strong> for full access, or <strong>Member</strong> for restricted views).</p>
            <p className="text-sm"><strong>Step 4:</strong> Click send to issue their platform invitation.</p>
          </div>
        </div>
      )
    },
    'How to create your first invoice': {
      title: 'How to create your first invoice',
      content: (
        <div className="space-y-4 text-gray-600">
          <p>Getting started with your first invoice is straightforward:</p>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Go to the <strong>Invoices</strong> section and click <strong>Create Invoice</strong>.</li>
            <li>Select an existing customer from the dropdown, or add a customer in the <strong>Customers</strong> tab first.</li>
            <li>Fill out the invoice metadata (invoice number, date, and due date).</li>
            <li>Add line items, indicating description, quantity, unit price, and localized tax rate.</li>
            <li>Review the auto-calculated subtotal, tax amount, and discount before hitting <strong>Save</strong>.</li>
          </ol>
        </div>
      )
    },
    'Understanding invoice statuses': {
      title: 'Understanding invoice statuses',
      content: (
        <div className="space-y-4 text-gray-600">
          <p>Every invoice in InvoicePro travels through a specific lifecycle:</p>
          <ul className="space-y-3">
            <li className="flex items-start gap-2"><span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-bold shrink-0 mt-0.5">Draft</span> <span>The invoice has been created but not sent to the customer yet.</span></li>
            <li className="flex items-start gap-2"><span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-bold shrink-0 mt-0.5">Sent</span> <span>Dispatched to the customer. Reminders and WhatsApp updates are active.</span></li>
            <li className="flex items-start gap-2"><span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-xs font-bold shrink-0 mt-0.5">Partially Paid</span> <span>The customer made a payment but a remaining balance is still due.</span></li>
            <li className="flex items-start gap-2"><span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-bold shrink-0 mt-0.5">Paid</span> <span>Fully cleared. No outstanding balance remains.</span></li>
            <li className="flex items-start gap-2"><span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-bold shrink-0 mt-0.5">Overdue</span> <span>The due date has passed without the invoice being fully settled.</span></li>
          </ul>
        </div>
      )
    },
    'Setting up recurring invoices': {
      title: 'Setting up recurring invoices',
      content: (
        <div className="space-y-4 text-gray-600">
          <p>Automate your monthly retainers and subscription services by enabling recurring templates. (Feature available for Professional plan members under Settings).</p>
        </div>
      )
    },
    'Importing customer lists': {
      title: 'Importing customer lists',
      content: (
        <div className="space-y-4 text-gray-600">
          <p>Importing customers saves hours of manual data entry:</p>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Go to the <strong>Customers</strong> page in the dashboard.</li>
            <li>Click on the <strong>Add Customer</strong> button to add individual clients.</li>
            <li>Provide client name, official email, active contact number, and address.</li>
            <li>You can query or filter added customers directly when creating a new invoice.</li>
          </ol>
        </div>
      )
    },
    'Managing your product catalog': {
      title: 'Managing your product catalog',
      content: (
        <div className="space-y-4 text-gray-600">
          <p>Define standard products/services in your catalog to speed up itemized additions during invoice generation:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Go to the <strong>Products</strong> section.</li>
            <li>Click <strong>Add Product</strong>, fill in the standard selling price, name, and standard tax rate.</li>
            <li>When creating invoices, selecting standard catalog items automatically populates prices and details.</li>
          </ul>
        </div>
      )
    },
    'Adding tax rates': {
      title: 'Adding tax rates',
      content: (
        <div className="space-y-4 text-gray-600">
          <p>Localized taxes (VAT, GST, or Sales Tax) can be added as custom percentages when defining itemized rows on the invoice creation page, ensuring total compliance.</p>
        </div>
      )
    },
    'Recording manual payments': {
      title: 'Recording manual payments',
      content: (
        <div className="space-y-4 text-gray-600">
          <p>Record manual bank transfers or cash payments to keep ledger status up to date:</p>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Go to the <strong>Payments</strong> page.</li>
            <li>Click <strong>Record Payment</strong>.</li>
            <li>Select the relevant Invoice number.</li>
            <li>Enter the paid amount, payment date, and transaction method (e.g. Cash, Card, Bank Transfer).</li>
            <li>Save the payment. The invoice status updates automatically.</li>
          </ol>
        </div>
      )
    },
    'Setting up payment gateways': {
      title: 'Setting up payment gateways',
      content: (
        <div className="space-y-4 text-gray-600">
          <p>Connect payment processor gateways under the <strong>Settings</strong> page to let clients pay invoices online with Credit Cards via the client portal link.</p>
        </div>
      )
    },
    'Handling partial payments': {
      title: 'Handling partial payments',
      content: (
        <div className="space-y-4 text-gray-600">
          <p>If a recorded manual or online payment is less than the total outstanding invoice amount, our system automatically labels the invoice as <strong>Partially Paid</strong> and tracks the remaining balance due.</p>
        </div>
      )
    }
  };

  return (
    <Layout title="Documentation">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="bg-gradient-to-r from-primary-600 to-blue-600 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
           <div className="relative z-10">
             <h1 className="text-3xl font-black mb-2">How can we help you?</h1>
             <p className="text-primary-100 text-base max-w-xl">Search our knowledge base or browse the categories below to find exactly what you're looking for.</p>
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
                    <button 
                      onClick={() => setSelectedArticle(article)}
                      className="w-full flex items-center justify-between text-left text-gray-600 hover:text-primary-600 group transition-colors cursor-pointer"
                    >
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

      {/* Interactive Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-gray-900 text-lg">
                {articleContents[selectedArticle]?.title || selectedArticle}
              </h3>
              <button 
                onClick={() => setSelectedArticle(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-8 max-h-[70vh] overflow-y-auto">
              {articleContents[selectedArticle]?.content || (
                <p className="text-gray-500 text-sm">Instructional content for this article is being updated.</p>
              )}
            </div>
            <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button 
                onClick={() => setSelectedArticle(null)}
                className="px-5 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors cursor-pointer"
              >
                Got it, thanks!
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Documentation;
