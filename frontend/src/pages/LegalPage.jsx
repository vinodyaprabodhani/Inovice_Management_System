import React from 'react';
import LandingLayout from '../components/LandingLayout';

const LegalPage = ({ title }) => {
  return (
    <LandingLayout>
      <div className="max-w-4xl mx-auto px-4 py-24">
        <h1 className="text-4xl font-black text-gray-900 mb-8">{title}</h1>
        <div className="prose prose-lg text-gray-600">
          <p className="mb-4">Last updated: {new Date().toLocaleDateString()}</p>
          <p className="mb-6">This is a placeholder for the {title}. You should replace this content with your actual legal text.</p>
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Introduction</h2>
          <p className="mb-4">
            Welcome to InvoicePro. This document sets out the {title.toLowerCase()} for your use of our services.
            Please read this carefully.
          </p>
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. Your Responsibilities</h2>
          <p className="mb-4">
            By using our services, you agree to comply with this {title.toLowerCase()} and all applicable laws and regulations.
          </p>
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. Contact Us</h2>
          <p className="mb-4">
            If you have any questions about this {title.toLowerCase()}, please contact us at legal@invoicepro.com.
          </p>
        </div>
      </div>
    </LandingLayout>
  );
};

export default LegalPage;
