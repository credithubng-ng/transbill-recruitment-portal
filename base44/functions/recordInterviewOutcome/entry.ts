import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
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

      const emailBody = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1A1A1A;">
  <div style="background: #2D6A2F; padding: 24px 32px; border-radius: 12px 12px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px;">Congratulations! 🎉</h1>
    <p style="color: #c8e6c9; margin: 6px 0 0; font-size: 14px;">Transbill Digital Marketing Recruitment</p>
  </div>
  <div style="background: #f9fafb; padding: 32px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb; border-top: none;">
    <p style="font-size: 16px;">Dear <strong>${applicant.full_name}</strong>,</p>
    <p>We are thrilled to inform you that you have <strong>successfully passed</strong> your interview for the <strong>Digital Marketing Executive</strong> role at <strong>Transbill</strong>.</p>
    <p>The next step is to complete your registration on the Transbill.ng platform. Please click the button below to create your account and begin onboarding:</p>
    <div style="text-align: center; margin: 32px 0;">
      <a href="https://transbill.ng/register" style="background: #2D6A2F; color: white; padding: 14px 32px; border-radius: 50px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">
        Register on Transbill.ng →
      </a>
    </div>
    <p>If you have any trouble registering, please reply to this email and our team will assist you promptly.</p>
    <p>Welcome to the Transbill family — we can't wait to have you on board!</p>
    <p style="margin-top: 24px;">Best regards,<br/><strong>The Transbill Recruitment Team</strong></p>
  </div>
</div>`;

      await base44.asServiceRole.integrations.Core.SendEmail({
        to: applicant.email,
        subject: 'You Passed Your Interview – Next Steps for Transbill',
        body: emailBody
      });
      emailSent = true;

    } else if (outcome === 'Fail') {
      newStage = 'Closed – Not Progressed';

      const emailBody = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1A1A1A;">
  <div style="background: #4a4a4a; padding: 24px 32px; border-radius: 12px 12px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px;">Application Update</h1>
    <p style="color: #d1d5db; margin: 6px 0 0; font-size: 14px;">Transbill Digital Marketing Recruitment</p>
  </div>
  <div style="background: #f9fafb; padding: 32px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb; border-top: none;">
    <p style="font-size: 16px;">Dear <strong>${applicant.full_name}</strong>,</p>
    <p>Thank you for taking the time to interview for the <strong>Digital Marketing Executive</strong> role at <strong>Transbill</strong>.</p>
    <p>After careful consideration, we regret to inform you that we will not be moving forward with your application at this time. This was a competitive process and we appreciate the effort you put in.</p>
    <p>We encourage you to continue developing your skills and wish you the very best in your future endeavours.</p>
    <p>Thank you again for your interest in Transbill.</p>
    <p style="margin-top: 24px;">Best regards,<br/><strong>The Transbill Recruitment Team</strong></p>
  </div>
</div>`;

      await base44.asServiceRole.integrations.Core.SendEmail({
        to: applicant.email,
        subject: 'Update on Your Transbill Application',
        body: emailBody
      });
      emailSent = true;

    } else if (outcome === 'Hold') {
      newStage = 'Interview Scheduling';
    }

    await base44.asServiceRole.entities.Applicant.update(applicantId, {
      interview_outcome: outcome,
      interview_outcome_notes: notes || '',
      interview_outcome_email_sent: emailSent,
      candidate_stage: newStage
    });

    return Response.json({ success: true, stage: newStage });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});