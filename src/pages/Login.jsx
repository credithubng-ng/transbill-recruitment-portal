import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogIn, Mail, Loader2, ChevronRight } from 'lucide-react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import AuthLayout from '@/components/AuthLayout';

export default function Login() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [completedNotice, setCompletedNotice] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const requestCode = async (event) => {
    event?.preventDefault();
    setError('');
    setCompletedNotice(false);
    setLoading(true);
    try {
      const res = await base44.functions.invoke('submitApplication', {
        action: 'request_login_otp',
        email: email.trim().toLowerCase(),
      });
      if (res.data?.completed === true) {
        // Completed applicant: no OTP is sent. Route to /status with a narrowly scoped
        // signed session token. Never redirect a completed applicant to /assessment.
        if (res.data.sessionToken) {
          sessionStorage.setItem('transbill_applicant_session', res.data.sessionToken);
          window.location.href = '/status';
          return;
        }
        // No secure session could be created — show the fallback message (no auth weakening).
        setCompletedNotice(true);
        return;
      }
      setCodeSent(true);
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Unable to send a code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    setError('');
    setLoading(true);
    try {
      const response = await base44.functions.invoke('submitApplication', {
        action: 'verify_login_otp',
        email: email.trim().toLowerCase(),
        code,
      });
      sessionStorage.setItem('transbill_applicant_session', response.data.sessionToken);
      // Preserve the requested next URL only for incomplete applicants after OTP verification.
      const next = new URLSearchParams(window.location.search).get('next');
      const safeNext = next && next.startsWith('/') ? next : null;
      window.location.href = safeNext
        ? `${safeNext}${safeNext.includes('?') ? '&' : '?'}id=${response.data.applicantId}`
        : `/assessment?id=${response.data.applicantId}`;
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Invalid or expired code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      icon={codeSent ? Mail : LogIn}
      title={codeSent ? 'Enter your login code' : 'Continue your application'}
      subtitle={codeSent ? `We sent a 6-digit code to ${email}` : 'Use the email address submitted with your application'}
      footer={<a href="/apply" className="text-primary font-medium hover:underline">Start a new application</a>}
    >
      {error && <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}

      {completedNotice && (
        <div className="mb-4 p-4 rounded-lg bg-[#EBF5EB] border border-[#2D6A2F]/30 text-sm">
          <p className="text-[#1A1A1A] font-medium mb-3">Your assessment has already been completed. View your application status.</p>
          <a href="/status" className="inline-flex items-center gap-1.5 bg-[#3A7D3C] hover:bg-[#4A9A4D] text-white font-bold text-sm px-5 py-2.5 rounded-full transition-all">
            View application status <ChevronRight className="w-4 h-4" />
          </a>
        </div>
      )}

      {!codeSent ? (
        <form onSubmit={requestCode} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
              <Input id="email" type="email" autoComplete="email" autoFocus placeholder="you@example.com"
                value={email} onChange={event => setEmail(event.target.value)} className="pl-10 h-12" required />
            </div>
          </div>
          <Button type="submit" className="w-full h-12 font-medium" disabled={loading}>
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sending code...</> : 'Email me a login code'}
          </Button>
          <p className="text-xs text-muted-foreground text-center">No password is required. The code expires after 10 minutes.</p>
        </form>
      ) : (
        <div>
          <div className="flex justify-center mb-6">
            <InputOTP maxLength={6} value={code} onChange={setCode} autoFocus autoComplete="one-time-code">
              <InputOTPGroup>
                {[0, 1, 2, 3, 4, 5].map(index => <InputOTPSlot key={index} index={index} />)}
              </InputOTPGroup>
            </InputOTP>
          </div>
          <Button className="w-full h-12 font-medium" onClick={verifyCode} disabled={loading || code.length !== 6}>
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Verifying...</> : 'Verify & Continue Assessment'}
          </Button>
          <div className="flex justify-center gap-4 mt-4 text-sm">
            <button onClick={requestCode} disabled={loading} className="text-primary font-medium hover:underline">Resend code</button>
            <button onClick={() => { setCodeSent(false); setCode(''); setError(''); }} className="text-muted-foreground hover:underline">Change email</button>
          </div>
        </div>
      )}
    </AuthLayout>
  );
}