import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function verifyAdminToken(token, secret) {
  if (!token) return false;
  const dotIndex = token.lastIndexOf('.');
  if (dotIndex === -1) return false;
  const payload = token.substring(0, dotIndex);
  const sig = token.substring(dotIndex + 1);
  const exp = parseInt(payload.split(':')[1], 10);
  if (!exp || Date.now() > exp) return false;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sigBytes = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  const expected = Array.from(new Uint8Array(sigBytes)).map(b => b.toString(16).padStart(2, '0')).join('');
  return sig === expected;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const adminPassword = Deno.env.get('ADMIN_PASSWORD');
    const { applicantId, interview_scheduled_at, interview_location, adminToken } = await req.json();

    if (!adminPassword || !await verifyAdminToken(adminToken, adminPassword)) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const applicant = await base44.asServiceRole.entities.Applicant.get(applicantId);
    if (!applicant) {
      return Response.json({ error: 'Applicant not found' }, { status: 404 });
    }

    // Format the date nicely for the email
    const dateObj = new Date(interview_scheduled_at);
    const dateStr = dateObj.toLocaleDateString('en-NG', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      timeZone: 'Africa/Lagos'
    });
    const timeStr = dateObj.toLocaleTimeString('en-NG', {
      hour: '2-digit', minute: '2-digit', hour12: true,
      timeZone: 'Africa/Lagos'
    });

    const locationLine = interview_location
      ? `<p><strong>Location / Meeting Link:</strong> ${interview_location}</p>`
      : '';

    const emailBody = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1A1A1A;">
  <div style="background: #2D6A2F; padding: 24px 32px; border-radius: 12px 12px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px;">Interview Invitation</h1>
    <p style="color: #c8e6c9; margin: 6px 0 0; font-size: 14px;">Transbill Digital Marketing Recruitment</p>
  </div>
  <div style="background: #f9fafb; padding: 32px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb; border-top: none;">
    <p style="font-size: 16px;">Dear <strong>${applicant.full_name}</strong>,</p>
    <p>We are pleased to invite you to an interview for the <strong>Digital Marketing Executive</strong> role at <strong>Transbill</strong>.</p>
    <div style="background: white; border: 1px solid #d1fae5; border-left: 4px solid #2D6A2F; border-radius: 8px; padding: 20px; margin: 24px 0;">
      <h3 style="margin: 0 0 12px; color: #2D6A2F; font-size: 15px;">Interview Details</h3>
      <p style="margin: 6px 0;"><strong>Date:</strong> ${dateStr}</p>
      <p style="margin: 6px 0;"><strong>Time:</strong> ${timeStr} (WAT)</p>
      ${locationLine}
    </div>
    <p>Please ensure you are available at the scheduled time. If you have any questions or need to reschedule, please contact us promptly by replying to this email.</p>
    <p>We look forward to speaking with you.</p>
    <p style="margin-top: 24px;">Best regards,<br/><strong>The Transbill Recruitment Team</strong></p>
  </div>
</div>`;

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: applicant.email,
      subject: `Interview Scheduled – ${dateStr} at ${timeStr}`,
      body: emailBody
    });

    await base44.asServiceRole.entities.Applicant.update(applicantId, {
      interview_scheduled_at,
      interview_location: interview_location || '',
      interview_email_sent: true,
      candidate_stage: 'Interview Scheduled'
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});