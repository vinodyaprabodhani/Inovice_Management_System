import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, Menu, X, ArrowRight } from 'lucide-react';

const LandingLayout = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const navigate = useNavigate();

  const navLinks = [
    { name: 'Features', href: '/features' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-primary-100 selection:text-primary-700">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-200 group-hover:scale-105 transition-transform">
                <FileText className="text-white" size={24} />
              </div>
              <span className="text-2xl font-black text-gray-900 tracking-tight">InvoicePro</span>
            </Link>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  to={link.href} 
                  className="text-sm font-bold text-gray-500 hover:text-primary-600 transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center gap-4">
              <Link to="/login" className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors">
                Sign In
              </Link>
              <Link 
                to="/register" 
                className="px-6 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition-all shadow-lg shadow-gray-200"
              >
                Get Started
              </Link>
            </div>

            {/* Mobile Toggle */}
            <button 
              className="md:hidden p-2 text-gray-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-gray-100 animate-in slide-in-from-top duration-200">
            <div className="px-4 pt-2 pb-6 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="block px-3 py-4 text-base font-bold text-gray-600 hover:text-primary-600 border-b border-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-4 grid grid-cols-2 gap-4">
                <Link to="/login" className="py-3 text-center font-bold text-gray-600 bg-gray-50 rounded-xl">Login</Link>
                <Link to="/register" className="py-3 text-center font-bold text-white bg-primary-600 rounded-xl">Join Free</Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      <main className="pt-20">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-1">
               <Link to="/" className="flex items-center gap-2.5 mb-6">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <FileText className="text-white" size={18} />
                </div>
                <span className="text-xl font-black text-gray-900 tracking-tight">InvoicePro</span>
              </Link>
              <p className="text-sm text-gray-500 leading-relaxed mb-6">
                Empowering businesses with modern, automated invoicing solutions. Built for growth and scalability.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold text-gray-900 mb-6">Product</h4>
              <ul className="space-y-4 text-sm text-gray-500 font-medium">
                <li><Link to="/features" className="hover:text-primary-600">Features</Link></li>
                <li><Link to="/pricing" className="hover:text-primary-600">Pricing</Link></li>
                <li><a href="#" className="hover:text-primary-600">Integrations</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 mb-6">Company</h4>
              <ul className="space-y-4 text-sm text-gray-500 font-medium">
                <li><Link to="/about" className="hover:text-primary-600">About Us</Link></li>
                <li><a href="#" className="hover:text-primary-600">Careers</a></li>
                <li><Link to="/contact" className="hover:text-primary-600">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 mb-6">Legal</h4>
              <ul className="space-y-4 text-sm text-gray-500 font-medium">
                <li><Link to="/privacy" className="hover:text-primary-600">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-primary-600">Terms of Service</Link></li>
                <li><Link to="/cookies" className="hover:text-primary-600">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-20 pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-gray-400">© 2026 InvoicePro Systems Inc. All rights reserved.</p>
            <div className="flex gap-6">
                <a href="#" className="text-gray-400 hover:text-primary-600 transition-colors">Twitter</a>
                <a href="#" className="text-gray-400 hover:text-primary-600 transition-colors">LinkedIn</a>
                <a href="#" className="text-gray-400 hover:text-primary-600 transition-colors">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingLayout;
