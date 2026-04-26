import React from 'react';
import LandingLayout from '../components/LandingLayout';
import { Target, Heart, Award, Sparkles } from 'lucide-react';

const About = () => {
  return (
    <LandingLayout>
      <section className="pt-24 pb-12 lg:pt-32 lg:pb-20 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-5xl lg:text-7xl font-black text-gray-900 mb-6 tracking-tight">Our mission is <span className="text-primary-600">to empower</span> business.</h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
             We started with a simple belief: that invoicing shouldn't be a chore, but a professional touchpoint that helps you grow.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-24 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-16">
           <div className="flex-1">
              <div className="bg-gray-100 aspect-video rounded-3xl overflow-hidden relative">
                 <img 
                    src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2670&auto=format&fit=crop" 
                    alt="Team collaboration" 
                    className="w-full h-full object-cover grayscale opacity-80"
                 />
                 <div className="absolute inset-0 bg-primary-600/10 backdrop-blur-sm flex items-center justify-center">
                    <p className="text-white font-black text-4xl">Since 2024</p>
                 </div>
              </div>
           </div>
           <div className="flex-1 space-y-6">
              <h2 className="text-3xl font-black text-gray-900">Born out of frustration.</h2>
              <p className="text-gray-500 leading-relaxed">
                 Traditional invoicing software felt stuck in the early 2000s—slow, unstyled, and disconnected from modern communication channels. We built InvoicePro to be the solution we wanted for our own businesses.
              </p>
              <p className="text-gray-500 leading-relaxed">
                 Today, we help thousands of freelancers, agencies, and small businesses manage their cash flow with ease, focusing more on their craft and less on their paperwork.
              </p>
           </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 lg:py-40 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-20">
           <h2 className="text-4xl font-black text-gray-900 mb-4">Values that drive us</h2>
           <p className="text-gray-500">The core principles behind every feature we build.</p>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
                { title: 'Simplicity First', desc: 'Powerful technology doesn’t have to be complicated.', icon: <Sparkles className="text-yellow-500" /> },
                { title: 'Uncompromising Trust', desc: 'Security and reliability are at the core of our business.', icon: <Award className="text-primary-600" /> },
                { title: 'Customer Obsessed', desc: 'We build based on real feedback from real users.', icon: <Heart className="text-red-500" /> },
                { title: 'Global Thinking', desc: 'Designed for the borderless economy of tomorrow.', icon: <Target className="text-blue-500" /> }
            ].map(v => (
                <div key={v.title} className="p-8 bg-white border border-gray-100 rounded-3xl text-center">
                    <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center mx-auto mb-6">
                       {React.cloneElement(v.icon, { size: 24 })}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{v.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{v.desc}</p>
                </div>
            ))}
        </div>
      </section>
    </LandingLayout>
  );
};

export default About;
