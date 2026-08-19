import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { createAdminSession, hashOtp } from '../../shared/interviewSession.ts';

const MAX_OTP_ATTEMPTS = 5;

function normalizeEmail(email: string): string {
  return String(email || '').trim().toLowerCase();
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { email, otp } = await req.json();
    const normEmail = normalizeEmail(email);

    if (!normEmail || !otp) {
      return Response.json({ error: 'Email and verification code are required.' }, { status: 400 });
    }

    const matches = await base44.asServiceRole.entities.AdminUser.filter({ email: normEmail });
    const adminUser = matches?.[0];

    // Generic error to avoid revealing whether the email exists
    if (!adminUser || !adminUser.active) {
      return Response.json({ error: 'Invalid or expired verification code.' }, { status: 401 });
    }

    // Check attempts
    if ((adminUser.otp_attempts || 0) >= MAX_OTP_ATTEMPTS) {
      return Response.json({ error: 'Too many attempts. Please request a new code.' }, { status: 429 });
    }

    // Check expiry
    if (!adminUser.otp_expires_at || new Date(adminUser.otp_expires_at) < new Date()) {
      return Response.json({ error: 'Invalid or expired verification code.' }, { status: 401 });
    }

    // Verify OTP hash
    const expectedHash = await hashOtp(String(otp).trim());
    if (adminUser.otp_hash !== expectedHash) {
      await base44.asServiceRole.entities.AdminUser.update(adminUser.id, {
        otp_attempts: (adminUser.otp_attempts || 0) + 1,
      });
      return Response.json({ error: 'Invalid or expired verification code.' }, { status: 401 });
    }

    // Consume OTP atomically and update last login
    const now = new Date().toISOString();
    await base44.asServiceRole.entities.AdminUser.update(adminUser.id, {
      otp_hash: '',
      otp_expires_at: '',
      otp_attempts: 0,
      last_login_at: now,
    });

    // Issue signed short-lived admin session
    const token = await createAdminSession(adminUser.id, adminUser.email, adminUser.role);

    return Response.json({
      success: true,
      token,
      admin: { email: adminUser.email, display_name: adminUser.display_name, role: adminUser.role },
    });
  } catch (error) {
    return Response.json({ error: 'An error occurred. Please try again.' }, { status: 500 });
  }
});