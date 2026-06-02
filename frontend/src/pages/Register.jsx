import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { User, Mail, Lock, Building, UserPlus, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';

const Register = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const urlPlan = searchParams.get('plan');
  const plan = location.state?.plan || urlPlan;
  const paymentVerified = location.state?.paymentVerified;
  const cardholderName = location.state?.cardholderName;

  const [formData, setFormData] = useState({
    name: cardholderName || '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Password complexity helpers
  const pwHasLetter = /[a-zA-Z]/.test(formData.password);
  const pwHasNumber = /[0-9]/.test(formData.password);
  const pwHasSymbol = /[^a-zA-Z0-9]/.test(formData.password);
  const isPasswordValid = pwHasLetter && pwHasNumber && pwHasSymbol;

  useEffect(() => {
    if (plan === 'professional' && !paymentVerified) {
      navigate('/checkout?plan=professional');
    }
  }, [plan, paymentVerified, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate username for special characters
    const hasSpecialChars = /[^a-zA-Z0-9\s_-]/.test(formData.name);
    if (hasSpecialChars) {
      setError('Invalid username.The username cannot contain special characters');
      return;
    }

    // Validate password complexity
    if (!pwHasLetter || !pwHasNumber || !pwHasSymbol) {
      setError('Password must contain a mix of letters, numbers, and symbols.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/auth/register', { ...formData, organizationName: formData.name });
      navigate('/login', { state: { message: 'Registration successful! Please login.' } });
    } catch (err) {
      setError(err.response?.data?.message || 'Error occurred during registration');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-200/40 rounded-full blur-3xl z-0"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-200/40 rounded-full blur-3xl z-0"></div>

      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-10 relative z-10 border border-gray-100">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <UserPlus size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Get Started</h1>
          <p className="text-gray-500 mt-2">Create your organization account in seconds.</p>
          {plan === 'professional' && paymentVerified && (
            <div className="mt-4 px-4 py-3 bg-green-50 border border-green-200 rounded-2xl flex items-center justify-center gap-2 text-green-700 text-xs font-black uppercase tracking-wider shadow-sm animate-in zoom-in duration-200">
              <CheckCircle2 size={16} />
              Professional Plan - Payment Verified
            </div>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-center text-red-700 text-sm">
            <AlertCircle size={18} className="mr-3 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">User Name or Organization Name</label>
            <div className="relative group">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={18} />
              <input
                type="text"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all text-sm"
                placeholder="e.g. John Doe or Acme Corp"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={18} />
              <input
                type="email"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all text-sm"
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={18} />
              <input
                type="password"
                required
                minLength="6"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all text-sm"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
            {formData.password && (
              <div className="mt-2 animate-in fade-in duration-200">
                {isPasswordValid ? (
                  <div className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
                    <CheckCircle2 size={14} className="shrink-0" />
                    <span>Password requirements met</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs text-red-600 font-medium">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>Password must contain a mix of letters, numbers, and symbols.</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold shadow-lg shadow-primary-200 transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-70 cursor-pointer"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <UserPlus size={20} />}
            {isSubmitting ? 'Creating Account...' : (plan === 'professional' ? 'Complete Purchase & Register' : 'Register Organization')}
          </button>
        </form>

        <div className="mt-8 text-center bg-gray-50 -mx-10 -mb-10 p-6 rounded-b-3xl border-t border-gray-100">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 font-bold hover:underline">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
