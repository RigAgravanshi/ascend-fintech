import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, ArrowRight, Shield, AlertCircle, Sparkles } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { demoLogin } = useAuth();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleDemoLogin = async (e?: React.FormEvent, customEmail?: string) => {
    if (e) e.preventDefault();
    setErrorMessage('');

    const targetEmail = (customEmail || email).trim().toLowerCase();
    if (!targetEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(targetEmail)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      await demoLogin(targetEmail);
    } catch (err: any) {
      setErrorMessage(err.message || 'Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = () => {
    setEmail('demo@ascend-local.test');
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 relative bg-[#05080e] overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none"></div>
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-[#00e599]/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10 space-y-6">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#059669] to-[#00e599] p-0.5 shadow-neon-md">
            <div className="w-full h-full bg-[#05080e] rounded-[14px] flex items-center justify-center">
              <img src="/ascend-logo.svg" alt="Ascend" className="w-9 h-9" />
            </div>
          </div>

          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center justify-center">
              Ascend
              <span className="ml-2 inline-block w-2 h-2 rounded-full bg-[#00e599] shadow-neon-sm"></span>
            </h1>
            <p className="text-xs text-[#8b98aa] mt-1 font-mono tracking-wider uppercase">
              Intelligent Financial Platform
            </p>
          </div>
        </div>

        <div className="bg-[#0c121d] border border-[#1c283c] rounded-2xl p-6 sm:p-8 shadow-2xl relative">
          <div className="mb-6 space-y-1">
            <h2 className="text-lg font-bold text-white">Demo Sign In</h2>
            <p className="text-xs text-[#8b98aa]">
              Enter any email to continue. No OTP, DigiLocker, or real identity checks.
            </p>
          </div>

          {errorMessage && (
            <div className="mb-5 p-3 rounded-xl bg-red-950/30 border border-red-500/40 text-red-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleDemoLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#8b98aa]">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8b98aa]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  autoFocus
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#070a10] border border-[#1c283c] text-white text-sm focus:outline-none focus:border-[#00e599] transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-[#00e599] hover:bg-[#10b981] text-black font-semibold text-sm transition-all shadow-neon-sm flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <span>{loading ? 'Signing in...' : 'Continue to Demo'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={fillDemoAccount}
                className="text-[11px] text-[#00e599] hover:underline flex items-center justify-center mx-auto space-x-1"
              >
                <Sparkles className="w-3 h-3" />
                <span>Use Pre-seeded Demo Email (Kabir)</span>
              </button>
            </div>
          </form>

          <div className="mt-6 p-2.5 rounded-xl bg-[#070a10] border border-[#1c283c] text-[11px] text-[#64748b] text-center">
            <span className="text-[#8b98aa] font-semibold">Demo mode:</span> login is local only. No emails, OTPs, or government APIs are used.
          </div>
        </div>

        <div className="flex items-center justify-center space-x-2 text-[11px] text-[#64748b]">
          <Shield className="w-3.5 h-3.5 text-[#00e599]" />
          <span>Fictional demo fixtures — no real customer data required</span>
        </div>
      </div>
    </div>
  );
};
