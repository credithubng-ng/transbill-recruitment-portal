import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    // Auth check — allow real admin users or any authenticated session (admin page uses custom token auth)
    const isAuthed = await base44.auth.isAuthenticated();
    if (!isAuthed) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { applicantId, outcome, notes } = await req.json();

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

    // Update record first — outcome must be saved regardless of email success
    await base44.asServiceRole.entities.Applicant.update(applicantId, {
      interview_outcome: outcome,
      interview_outcome_notes: notes || '',
      candidate_stage: newStage
    });

    // Send notification email — best effort, don't fail the request if it errors
    if (outcome === 'Pass') {
      try {
        const emailBody = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1A1A1A;">
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
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: applicant.email,
          subject: 'You Passed Your Interview – Transbill Solutions Limited',
          body: emailBody
        });
        emailSent = true;
      } catch (e) {
        console.error('Email send failed (non-fatal):', e.message);
      }
    } else if (outcome === 'Fail') {
      try {
        const emailBody = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1A1A1A;">
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
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: applicant.email,
          subject: 'Update on Your Transbill Application',
          body: emailBody
        });
        emailSent = true;
      } catch (e) {
        console.error('Email send failed (non-fatal):', e.message);
      }
    }

    await base44.asServiceRole.entities.Applicant.update(applicantId, {
      interview_outcome_email_sent: emailSent
    });

    return Response.json({ success: true, stage: newStage, emailSent });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});