import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogIn, Mail, Loader2 } from 'lucide-react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import AuthLayout from '@/components/AuthLayout';

export default function Login() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const requestCode = async (event) => {
    event?.preventDefault();
    setError('');
    setLoading(true);
    try {
      await base44.functions.invoke('submitApplication', {
        action: 'request_login_otp',
        email: email.trim().toLowerCase(),
      });
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
      window.location.href = `/assessment?id=${response.data.applicantId}`;
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
