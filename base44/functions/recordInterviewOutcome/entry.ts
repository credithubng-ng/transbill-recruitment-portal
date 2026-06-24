import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function verifyToken(token, secret) {
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
    const { applicantId, outcome, notes, token } = await req.json();
    const adminPassword = Deno.env.get('ADMIN_PASSWORD');
    const valid = await verifyToken(token, adminPassword);
    if (!valid) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const applicant = await base44.asServiceRole.entities.Applicant.get(applicantId);
    if (!applicant) {
      return Response.json({ error: 'Applicant not found' }, { status: 404 });
    }

    let newStage = 'Interview Scheduling';
    let emailSent = false;

    if (outcome === 'Pass') {
      newStage = 'Interview Outcome – Pass';
    } else if (outcome === 'Fail') {
      newStage = 'Closed – Not Progressed';
    } else if (outcome === 'Hold') {
      newStage = 'Interview Scheduling';
    }

    // Save outcome immediately
    await base44.asServiceRole.entities.Applicant.update(applicantId, {
      interview_outcome: outcome,
      interview_outcome_notes: notes || '',
      candidate_stage: newStage
    });

    // Fire email + follow-up update asynchronously — don't block the response
    const sendEmail = async () => {
      let sent = false;
      try {
        let emailBody = '';
        let subject = '';
        if (outcome === 'Pass') {
          subject = 'You Passed Your Interview – Transbill Solutions Limited';
          emailBody = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1A1A1A;">
  <div style="background: #2D6A2F; padding: 24px 32px; border-radius: 12px 12px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px;">Congratulations! 🎉</h1>
    <p style="color: #c8e6c9; margin: 6px 0 0; font-size: 14px;">Transbill Digital Marketing Recruitment</p>
  </div>
  <div style="background: #f9fafb; padding: 32px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb; border-top: none;">
    <p style="font-size: 16px;">Dear <strong>${applicant.full_name}</strong>,</p>
    <p>We are thrilled to inform you that you have <strong>successfully passed</strong> your interview for the <strong>Digital Marketing & Growth Associate</strong> role at <strong>Transbill Solutions Limited</strong>.</p>
    <p>Please log in to your application portal to view your official progression letter with details on the next steps.</p>
    <p style="margin-top: 24px;">Best regards,<br/><strong>The Transbill Recruitment Team</strong></p>
  </div>
</div>`;
        } else if (outcome === 'Fail') {
          subject = 'Update on Your Transbill Application';
          emailBody = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1A1A1A;">
  <div style="background: #4a4a4a; padding: 24px 32px; border-radius: 12px 12px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px;">Application Update</h1>
    <p style="color: #d1d5db; margin: 6px 0 0; font-size: 14px;">Transbill Digital Marketing Recruitment</p>
  </div>
  <div style="background: #f9fafb; padding: 32px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb; border-top: none;">
    <p style="font-size: 16px;">Dear <strong>${applicant.full_name}</strong>,</p>
    <p>Thank you for taking the time to interview for the <strong>Digital Marketing & Growth Associate</strong> role at <strong>Transbill Solutions Limited</strong>.</p>
    <p>After careful consideration, we regret to inform you that we will not be moving forward with your application at this time. We appreciate the effort you put in.</p>
    <p>We wish you the very best in your future endeavours.</p>
    <p style="margin-top: 24px;">Best regards,<br/><strong>The Transbill Recruitment Team</strong></p>
  </div>
</div>`;
        }
        if (emailBody) {
          await base44.asServiceRole.integrations.Core.SendEmail({ to: applicant.email, subject, body: emailBody });
          sent = true;
        }
      } catch (e) {
        console.error('Email send failed (non-fatal):', e.message);
      }
      try {
        await base44.asServiceRole.entities.Applicant.update(applicantId, { interview_outcome_email_sent: sent });
      } catch (e) {
        console.error('Email status update failed:', e.message);
      }
    };

    // Fire and forget
    sendEmail();

    return Response.json({ success: true, stage: newStage, emailSent: false });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});