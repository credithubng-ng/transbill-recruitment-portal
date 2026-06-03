import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { slotId, applicantId } = await req.json();
    if (!slotId || !applicantId) {
      return Response.json({ error: 'slotId and applicantId are required' }, { status: 400 });
    }

    // Verify applicant belongs to this user
    const applicant = await base44.asServiceRole.entities.Applicant.get(applicantId);
    if (!applicant || applicant.email !== user.email) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check slot exists and is still available
    const slot = await base44.asServiceRole.entities.InterviewSlot.get(slotId);
    if (!slot) return Response.json({ error: 'Slot not found' }, { status: 404 });
    if (slot.is_booked) return Response.json({ error: 'Slot already booked' }, { status: 409 });

    // Mark slot as booked
    await base44.asServiceRole.entities.InterviewSlot.update(slotId, {
      is_booked: true,
      booked_by_applicant_id: applicantId,
    });

    // Format date for email
    const dateObj = new Date(slot.slot_datetime);
    const dateStr = dateObj.toLocaleDateString('en-NG', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      timeZone: 'Africa/Lagos'
    });
    const timeStr = dateObj.toLocaleTimeString('en-NG', {
      hour: '2-digit', minute: '2-digit', hour12: true,
      timeZone: 'Africa/Lagos'
    });

    const locationLine = slot.location
      ? `<p style="margin: 6px 0;"><strong>Location / Meeting Link:</strong> ${slot.location}</p>`
      : '';

    const emailBody = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1A1A1A;">
  <div style="background: #2D6A2F; padding: 24px 32px; border-radius: 12px 12px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px;">Interview Confirmed</h1>
    <p style="color: #c8e6c9; margin: 6px 0 0; font-size: 14px;">Transbill Digital Marketing Recruitment</p>
  </div>
  <div style="background: #f9fafb; padding: 32px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb; border-top: none;">
    <p style="font-size: 16px;">Dear <strong>${applicant.full_name}</strong>,</p>
    <p>Your interview for the <strong>Digital Marketing Executive</strong> role at <strong>Transbill</strong> has been confirmed.</p>
    <div style="background: white; border: 1px solid #d1fae5; border-left: 4px solid #2D6A2F; border-radius: 8px; padding: 20px; margin: 24px 0;">
      <h3 style="margin: 0 0 12px; color: #2D6A2F; font-size: 15px;">Interview Details</h3>
      <p style="margin: 6px 0;"><strong>Date:</strong> ${dateStr}</p>
      <p style="margin: 6px 0;"><strong>Time:</strong> ${timeStr} (WAT)</p>
      ${locationLine}
    </div>
    <p>Please ensure you are available at the scheduled time. If you need to make changes, contact us at support@transbill.ng.</p>
    <p>We look forward to speaking with you.</p>
    <p style="margin-top: 24px;">Best regards,<br/><strong>The Transbill Recruitment Team</strong></p>
  </div>
</div>`;

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: applicant.email,
      subject: `Interview Confirmed – ${dateStr} at ${timeStr}`,
      body: emailBody,
    });

    // Update applicant record
    await base44.asServiceRole.entities.Applicant.update(applicantId, {
      interview_scheduled_at: slot.slot_datetime,
      interview_location: slot.location || '',
      interview_email_sent: true,
      candidate_stage: 'Interview Scheduled',
    });

    return Response.json({ success: true, slot_datetime: slot.slot_datetime, location: slot.location });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});