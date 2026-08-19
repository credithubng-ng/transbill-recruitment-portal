import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { generateOtp, hashOtp, sendBrevoEmail } from '../../shared/interviewSession.ts';

const RESEND_COOLDOWN_MS = 60_000;
const OTP_TTL_MS = 10 * 60 * 1000;
const OWNER_BOOTSTRAP_EMAIL = 'sllacen@gmail.com';

function normalizeEmail(email: string): string {
  return String(email || '').trim().toLowerCase();
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { email } = await req.json();
    const normEmail = normalizeEmail(email);

    // Bootstrap owner if no active owner exists
    const existingOwners = await base44.asServiceRole.entities.AdminUser.filter({ role: 'owner', active: true });
    if (!existingOwners || existingOwners.length === 0) {
      await base44.asServiceRole.entities.AdminUser.create({
        email: OWNER_BOOTSTRAP_EMAIL,
        display_name: 'Platform Owner',
        role: 'owner',
        active: true,
        approved_at: new Date().toISOString(),
        approved_by: 'system-bootstrap',
      });
    }

    // Always return generic success to prevent email enumeration
    const genericSuccess = Response.json({
      success: true,
      message: 'If your email is approved, a verification code has been sent.',
    });

    if (!normEmail) return genericSuccess;

    // Only active pre-approved users receive OTP
    const matches = await base44.asServiceRole.entities.AdminUser.filter({ email: normEmail });
    const adminUser = matches?.[0];
    if (!adminUser || !adminUser.active) {
      return genericSuccess;
    }

    // Resend cooldown
    if (adminUser.otp_sent_at) {
      const elapsed = Date.now() - new Date(adminUser.otp_sent_at).getTime();
      if (elapsed < RESEND_COOLDOWN_MS) {
        return genericSuccess;
      }
    }

    // Generate and store OTP hash (never plaintext)
    const otp = generateOtp();
    const otpHash = await hashOtp(otp);
    const now = new Date().toISOString();
    await base44.asServiceRole.entities.AdminUser.update(adminUser.id, {
      otp_hash: otpHash,
      otp_expires_at: new Date(Date.now() + OTP_TTL_MS).toISOString(),
      otp_sent_at: now,
      otp_attempts: 0,
    });

    // Send via Brevo — never log or return the OTP
    try {
      await sendBrevoEmail({
        to: normEmail,
        subject: 'Your Transbill Admin Verification Code',
        body: `Hello,\n\nYour verification code for the Transbill Recruitment Admin Portal is: ${otp}\n\nThis code expires in 10 minutes. If you did not request this code, please ignore this email.\n\nTransbill Solutions Limited`,
      });
    } catch (emailError) {
      console.error('Admin OTP email failed:', emailError.message);
    }

    return genericSuccess;
  } catch (error) {
    return Response.json({ error: 'An error occurred. Please try again.' }, { status: 500 });
  }
});