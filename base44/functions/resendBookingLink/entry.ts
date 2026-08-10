import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function verifyAdminToken(token, secret) {
  if (!token || !secret) return false;
  const dotIndex = token.lastIndexOf('.');
  if (dotIndex === -1) return false;
  const payload = token.substring(0, dotIndex);
  const suppliedSignature = token.substring(dotIndex + 1);
  if (!payload.startsWith('admin:')) return false;
  const expiresAt = Number(payload.split(':')[1]);
  if (!expiresAt || Date.now() > expiresAt) return false;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const bytes = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  const expected = Array.from(new Uint8Array(bytes)).map(byte => byte.toString(16).padStart(2, '0')).join('');
  return suppliedSignature === expected;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { applicantId, token } = await req.json();
    const isAdmin = await verifyAdminToken(token, Deno.env.get('ADMIN_PASSWORD'));
    if (!isAdmin) return Response.json({ error: 'Forbidden' }, { status: 403 });

    if (!applicantId) {
      return Response.json({ error: 'applicantId is required' }, { status: 400 });
    }

    const applicant = await base44.asServiceRole.entities.Applicant.get(applicantId);
    if (!applicant) {
      return Response.json({ error: 'Applicant not found' }, { status: 404 });
    }

    // Generate a new booking token
    const newToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

    const domain = Deno.env.get('APP_DOMAIN');
    if (!domain) return Response.json({ error: 'APP_DOMAIN is not configured' }, { status: 500 });
    const bookingLink = `${domain}/book-interview?token=${newToken}`;

    const emailBody = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1A1A1A;">
  <div style="background: #2D6A2F; padding: 24px 32px; border-radius: 12px 12px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px;">Your Interview Booking Link</h1>
    <p style="color: #c8e6c9; margin: 6px 0 0; font-size: 14px;">Transbill Digital Marketing Recruitment</p>
  </div>
  <div style="background: #f9fafb; padding: 32px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb; border-top: none;">
    <p style="font-size: 16px;">Dear <strong>${applicant.full_name}</strong>,</p>
    <p>You have passed the pre-screening for the <strong>Digital Marketing &amp; Workforce Development Programme</strong>.</p>
    <p>Please use the link below to choose a convenient interview date and time:</p>
    <div style="text-align: center; margin: 32px 0;">
      <a href="${bookingLink}" style="background: #3A7D3C; color: white; padding: 14px 32px; border-radius: 30px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">
        Book Your Interview
      </a>
    </div>
    <p style="font-size: 13px; color: #7A7A8A;">This link is personal to you and expires in 7 days. If you did not request this, please disregard this email.</p>
    <p style="margin-top: 24px;">Best regards,<br/><strong>The Transbill Recruitment Team</strong></p>
  </div>
</div>`;

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: applicant.email,
      subject: 'Book Your Selection Interview – Transbill Programme',
      body: emailBody,
    });

    // Update applicant with fresh token
    await base44.asServiceRole.entities.Applicant.update(applicantId, {
      booking_token: newToken,
      booking_token_expires_at: expiresAt,
      booking_used: false,
      booking_link_sent_at: new Date().toISOString(),
      candidate_stage: 'Interview Scheduling',
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
