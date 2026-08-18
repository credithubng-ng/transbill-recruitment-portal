import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { createApplicantSession, getApplicationDeadline, hashApplicantOtp } from '../_shared/applicantSession.ts';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const email = String(body.email || '').trim().toLowerCase();
    const code = String(body.code || '').trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !/^\d{6}$/.test(code)) {
      return Response.json({ error: 'Invalid or expired code.' }, { status: 400 });
    }

    const deadline = await getApplicationDeadline(base44);
    if (deadline && Date.now() > deadline) {
      return Response.json({ error: 'The call for applications has closed.' }, { status: 403 });
    }

    const applicants = await base44.asServiceRole.entities.Applicant.filter({ email });
    const applicant = applicants?.[0];
    const attempts = applicant?.login_otp_attempts || 0;
    const expired = !applicant?.login_otp_expires_at || new Date(applicant.login_otp_expires_at).getTime() < Date.now();
    const suppliedHash = applicant ? await hashApplicantOtp(applicant.id, code) : '';
    if (!applicant || applicant.assessment_completed === true || expired || attempts >= 5 || suppliedHash !== applicant.login_otp_hash) {
      if (applicant && attempts < 5) {
        await base44.asServiceRole.entities.Applicant.update(applicant.id, { login_otp_attempts: attempts + 1 });
      }
      return Response.json({ error: 'Invalid or expired code.' }, { status: 401 });
    }

    await base44.asServiceRole.entities.Applicant.update(applicant.id, {
      login_otp_hash: '',
      login_otp_expires_at: '',
      login_otp_attempts: 0,
      last_applicant_login_at: new Date().toISOString(),
    });
    return Response.json({
      applicantId: applicant.id,
      sessionToken: await createApplicantSession(applicant.id, applicant.email),
    });
  } catch (error) {
    console.error('Applicant OTP verification failed:', error.message);
    return Response.json({ error: 'We could not verify the code right now.' }, { status: 500 });
  }
});
