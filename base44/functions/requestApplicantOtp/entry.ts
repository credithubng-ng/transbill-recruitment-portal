import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { getApplicationDeadline, hashApplicantOtp } from '../_shared/applicantSession.ts';

const APP_DOMAIN = Deno.env.get('APP_DOMAIN') || 'https://jobs.transbill.ng';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { email: rawEmail } = await req.json();
    const email = String(rawEmail || '').trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: 'Enter a valid email address.' }, { status: 400 });
    }

    const deadline = await getApplicationDeadline(base44);
    if (deadline && Date.now() > deadline) {
      return Response.json({ error: 'The call for applications has closed.' }, { status: 403 });
    }

    const applicants = await base44.asServiceRole.entities.Applicant.filter({ email });
    const applicant = applicants?.[0];
    // Always return the same public result so this endpoint cannot be used to enumerate applicants.
    if (!applicant || applicant.assessment_completed === true) {
      return Response.json({ success: true, message: 'If an incomplete application exists, a code has been sent.' });
    }

    const lastSent = applicant.login_otp_sent_at ? new Date(applicant.login_otp_sent_at).getTime() : 0;
    if (lastSent && Date.now() - lastSent < 60_000) {
      return Response.json({ success: true, message: 'If an incomplete application exists, a code has been sent.' });
    }

    const code = String(crypto.getRandomValues(new Uint32Array(1))[0] % 1_000_000).padStart(6, '0');
    const now = new Date().toISOString();
    await base44.asServiceRole.entities.Applicant.update(applicant.id, {
      login_otp_hash: await hashApplicantOtp(applicant.id, code),
      login_otp_expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      login_otp_sent_at: now,
      login_otp_attempts: 0,
    });

    const firstName = applicant.full_name?.split(' ')[0] || 'Applicant';
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: email,
      from_name: 'Transbill Programme Team',
      subject: 'Your Transbill application login code',
      body: `Hello ${firstName},\n\nYour one-time login code is: ${code}\n\nThis code expires in 10 minutes. Use it at ${APP_DOMAIN}/login to continue your incomplete assessment before the call for applications closes.\n\nIf you did not request this code, you can ignore this email.\n\nTransbill Programme Team`,
    });

    return Response.json({ success: true, message: 'If an incomplete application exists, a code has been sent.' });
  } catch (error) {
    console.error('Applicant OTP request failed:', error.message);
    return Response.json({ error: 'We could not send a code right now. Please try again later.' }, { status: 500 });
  }
});
