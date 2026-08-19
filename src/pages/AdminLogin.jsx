import React, { useState, useEffect } from 'react';
import TransbillLogo from '../components/TransbillLogo';
import { base44 } from '@/api/base44Client';
import { ArrowLeft } from 'lucide-react';

export default function AdminLogin({ onLogin }) {
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  useEffect(() => {
    if (resendCountdown <= 0) return;
    const t = setTimeout(() => setResendCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCountdown]);

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError('');
    setInfo('');
    try {
      await base44.functions.invoke('requestAdminOtp', { email });
      setInfo('If your email is approved, a verification code has been sent to ' + email.trim() + '.');
      setStep('otp');
      setResendCountdown(60);
    } catch (_err) {
      setError('Unable to send verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) return;
    setLoading(true);
    setError('');
    try {
      const res = await base44.functions.invoke('verifyAdminOtp', { email, otp });
      if (res.data?.success) {
        sessionStorage.setItem('transbill_admin_token', res.data.token);
        sessionStorage.setItem('transbill_admin_info', JSON.stringify(res.data.admin));
        onLogin(res.data.admin);
      } else {
        setError(res.data?.error || 'Invalid or expired verification code.');
      }
    } catch (err) {
      setError(err?.response?.data?.error || 'Unable to verify code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCountdown > 0) return;
    setLoading(true);
    setError('');
    try {
      await base44.functions.invoke('requestAdminOtp', { email });
      setInfo('A new verification code has been sent.');
      setResendCountdown(60);
    } catch (_err) {
      setError('Unable to resend code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep('email');
    setOtp('');
    setError('');
    setInfo('');
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <TransbillLogo />
        </div>
        <div className="bg-[#F8FAF8] border border-[#E2E8E2] rounded-[14px] p-6">
          <h2 className="font-bold text-lg text-[#1A1A1A] text-center mb-1">Admin Access</h2>
          <p className="text-[#7A7A8A] text-sm text-center mb-5">
            {step === 'email' ? 'Enter your approved email to receive a verification code' : 'Enter the 6-digit code sent to your email'}
          </p>

          {step === 'email' ? (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                placeholder="admin@transbill.ng"
                className="w-full px-4 py-3 rounded-[10px] border-[1.5px] border-[#E2E8E2] focus:border-[#2D6A2F] outline-none text-sm"
                autoFocus
              />
              {error && <p className="text-[#D32F2F] text-xs font-medium">{error}</p>}
              <button type="submit" disabled={loading || !email.trim()} className="w-full bg-[#3A7D3C] hover:bg-[#4A9A4D] disabled:opacity-60 text-white font-bold py-3 rounded-full transition-all">
                {loading ? 'Sending...' : 'Send Verification Code'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              {info && <p className="text-[#2D6A2F] text-xs font-medium bg-[#EBF5EB] rounded-lg px-3 py-2">{info}</p>}
              <input
                type="text"
                inputMode="numeric"
                pattern="\d{6}"
                maxLength={6}
                value={otp}
                onChange={e => { setOtp(e.target.value.replace(/\D/g, '')); setError(''); }}
                placeholder="000000"
                className="w-full px-4 py-3 rounded-[10px] border-[1.5px] border-[#E2E8E2] focus:border-[#2D6A2F] outline-none text-center text-2xl tracking-[0.5em] font-bold"
                autoFocus
              />
              {error && <p className="text-[#D32F2F] text-xs font-medium">{error}</p>}
              <button type="submit" disabled={loading || otp.length !== 6} className="w-full bg-[#3A7D3C] hover:bg-[#4A9A4D] disabled:opacity-60 text-white font-bold py-3 rounded-full transition-all">
                {loading ? 'Verifying...' : 'Verify & Login'}
              </button>
              <div className="flex items-center justify-between text-xs">
                <button type="button" onClick={handleBack} className="text-[#7A7A8A] hover:text-[#1A1A1A] flex items-center gap-1">
                  <ArrowLeft className="w-3 h-3" /> Change email
                </button>
                <button type="button" onClick={handleResend} disabled={resendCountdown > 0 || loading} className="text-[#2D6A2F] hover:text-[#1A5C1F] disabled:opacity-50 font-medium">
                  {resendCountdown > 0 ? `Resend in ${resendCountdown}s` : 'Resend code'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}