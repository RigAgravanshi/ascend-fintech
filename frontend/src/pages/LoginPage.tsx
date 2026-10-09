import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, KeyRound, ArrowRight, Shield, AlertCircle, CheckCircle2, RotateCw, Sparkles } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { requestCode, verifyCode } = useAuth();

  const [screen, setScreen] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successInfo, setSuccessInfo] = useState('');
  const [cooldown, setCooldown] = useState(0);

  // 30-second countdown timer for OTP resend
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (cooldown > 0) {
      timer = setTimeout(() => {
        setCooldown(cooldown - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleRequestCode = async (e?: React.FormEvent, customEmail?: string) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    setSuccessInfo('');

    const targetEmail = (customEmail || email).trim().toLowerCase();
    if (!targetEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(targetEmail)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await requestCode(targetEmail);
      setSuccessInfo(res.message || 'Verification code sent to your email.');
      setScreen('otp');
      setCooldown(30); // 30s resend cooldown timer
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to dispatch verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const trimmedCode = otpCode.trim();
    if (!/^\d{6}$/.test(trimmedCode)) {
      setErrorMessage('Please enter the 6-digit verification code.');
      return;
    }

    setLoading(true);
    try {
      await verifyCode(email, trimmedCode);
      // On success, AuthContext updates user state and switches automatically
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid or expired code.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = () => {
    setEmail('demo@ascend-local.test');
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 relative bg-[#05080e] overflow-hidden">
      
      {/* Background radial glow & grid mimicking reference aesthetics */}
      <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none"></div>
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-[#00e599]/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10 space-y-6">
        
        {/* Logo and App Title */}
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

        {/* Card Container */}
        <div className="bg-[#0c121d] border border-[#1c283c] rounded-2xl p-6 sm:p-8 shadow-2xl relative">
          
          {/* Header per screen */}
          {screen === 'email' ? (
            <div className="mb-6 space-y-1">
              <h2 className="text-lg font-bold text-white">Passwordless Sign In</h2>
              <p className="text-xs text-[#8b98aa]">
                Enter your work or personal email to receive a secure 6-digit login code.
              </p>
            </div>
          ) : (
            <div className="mb-6 space-y-1">
              <h2 className="text-lg font-bold text-white">Enter Verification Code</h2>
              <p className="text-xs text-[#8b98aa]">
                We sent a single-use login code to{' '}
                <span className="text-white font-medium">{email}</span>. Code expires in 10 minutes.
              </p>
            </div>
          )}

          {/* Feedback messages */}
          {errorMessage && (
            <div className="mb-5 p-3 rounded-xl bg-red-950/30 border border-red-500/40 text-red-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successInfo && (
            <div className="mb-5 p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-emerald-300 text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{successInfo}</span>
            </div>
          )}

          {/* SCREEN 1: Enter Email */}
          {screen === 'email' && (
            <form onSubmit={handleRequestCode} className="space-y-4">
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
                <span>{loading ? 'Sending Code...' : 'Send Login Code'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Demo Helper Button */}
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
          )}

          {/* SCREEN 2: Enter 6-digit OTP */}
          {screen === 'otp' && (
            <form onSubmit={handleVerifyCode} className="space-y-5">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[#8b98aa]">
                  6-Digit Verification Code
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8b98aa]">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    autoFocus
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#070a10] border border-[#1c283c] text-white font-mono text-xl tracking-[8px] text-center focus:outline-none focus:border-[#00e599]"
                  />
                </div>
                <span className="text-[10px] text-[#64748b] block text-center">
                  Max 5 attempts allowed before code is invalidated.
                </span>
              </div>

              <button
                type="submit"
                disabled={loading || otpCode.length !== 6}
                className="w-full py-2.5 px-4 rounded-xl bg-[#00e599] hover:bg-[#10b981] text-black font-semibold text-sm transition-all shadow-neon-sm flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <span>{loading ? 'Verifying...' : 'Sign In to Ascend'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Cooldown Timer & Resend */}
              <div className="flex items-center justify-between pt-2 border-t border-[#1c283c] text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setScreen('email');
                    setOtpCode('');
                    setErrorMessage('');
                  }}
                  className="text-[#8b98aa] hover:text-white"
                >
                  Change Email
                </button>

                <button
                  type="button"
                  disabled={cooldown > 0 || loading}
                  onClick={() => handleRequestCode()}
                  className={`flex items-center space-x-1 ${
                    cooldown > 0
                      ? 'text-[#64748b] cursor-not-allowed'
                      : 'text-[#00e599] hover:underline'
                  }`}
                >
                  <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  <span>{cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Code'}</span>
                </button>
              </div>
            </form>
          )}

          {/* Dev Notice */}
          <div className="mt-6 p-2.5 rounded-xl bg-[#070a10] border border-[#1c283c] text-[11px] text-[#64748b] text-center">
            <span className="text-[#8b98aa] font-semibold">Dev Note:</span> In local dev, the 6-digit OTP code is logged directly to the backend terminal console for instant testing.
          </div>
        </div>

        {/* Security Footer Notice */}
        <div className="flex items-center justify-center space-x-2 text-[11px] text-[#64748b]">
          <Shield className="w-3.5 h-3.5 text-[#00e599]" />
          <span>Protected by Ascend Zero-Trust Authentication & SHA-256 OTP Hash</span>
        </div>
      </div>
    </div>
  );
};
