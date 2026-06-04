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

    // Optimistic lock: reject if another booking is in-flight (within 60s)
    if (slot.pending_lock) {
      const lockAge = Date.now() - new Date(slot.pending_lock).getTime();
      if (lockAge < 60_000) {
        return Response.json({ error: 'This slot was just taken — please choose another time.' }, { status: 409 });
      }
    }

    // Claim the slot with a pending lock before any async work
    await base44.asServiceRole.entities.InterviewSlot.update(slotId, {
      pending_lock: new Date().toISOString(),
    });

    // Mark slot as booked
    await base44.asServiceRole.entities.InterviewSlot.update(slotId, {
      is_booked: true,
      booked_by_applicant_id: applicantId,
    });

    // Format date/time strings for email
    const dateObj = new Date(slot.slot_datetime);
    const endObj = new Date(dateObj.getTime() + 30 * 60 * 1000);
    const dateStr = dateObj.toLocaleDateString('en-NG', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      timeZone: 'Africa/Lagos'
    });
    const timeStr = dateObj.toLocaleTimeString('en-NG', {
      hour: '2-digit', minute: '2-digit', hour12: true,
      timeZone: 'Africa/Lagos'
    });

    // --- Create Google Calendar event with Meet link ---
    let meetLink = '';
    try {
      const { accessToken } = await base44.asServiceRole.connectors.getConnection('googlecalendar');

      // Build attendees: candidate + interviewer (if google_meet_email set)
      const attendees = [{ email: applicant.email }];
      if (slot.interviewer_email) {
        attendees.push({ email: slot.interviewer_email });
      }

      const eventBody = {
        summary: `Transbill Interview — ${applicant.full_name}`,
        description: `Digital Marketing Executive interview with ${applicant.full_name}.\n\nCandidate email: ${applicant.email}`,
        start: {
          dateTime: dateObj.toISOString(),
          timeZone: 'Africa/Lagos',
        },
        end: {
          dateTime: endObj.toISOString(),
          timeZone: 'Africa/Lagos',
        },
        attendees,
        conferenceData: {
          createRequest: {
            requestId: `transbill-${applicantId}-${slotId}`,
            conferenceSolutionKey: { type: 'hangoutsMeet' },
          },
        },
      };

      const calRes = await fetch(
        'https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1&sendUpdates=all',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(eventBody),
        }
      );

      if (calRes.ok) {
        const calData = await calRes.json();
        meetLink = calData.conferenceData?.entryPoints?.find(e => e.entryPointType === 'video')?.uri || '';
      } else {
        const err = await calRes.text();
        console.error('Calendar API error:', err);
      }
    } catch (calErr) {
      console.error('Calendar event creation failed:', calErr.message);
    }

    // Build email
    const meetButton = meetLink
      ? `<div style="text-align:center;margin:24px 0;">
          <a href="${meetLink}" style="background:#3A7D3C;color:white;padding:14px 32px;border-radius:30px;text-decoration:none;font-weight:bold;font-size:16px;display:inline-block;">
            Join Interview on Google Meet
          </a>
         </div>`
      : '';

    const interviewerLine = slot.interviewer
      ? `<p style="margin: 6px 0;"><strong>Interviewer:</strong> ${slot.interviewer}</p>`
      : '';

    const emailBody = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1A1A1A;">
  <div style="background: #2D6A2F; padding: 24px 32px; border-radius: 12px 12px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px;">Interview Confirmed ✅</h1>
    <p style="color: #c8e6c9; margin: 6px 0 0; font-size: 14px;">Transbill Digital Marketing Recruitment</p>
  </div>
  <div style="background: #f9fafb; padding: 32px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb; border-top: none;">
    <p style="font-size: 16px;">Dear <strong>${applicant.full_name}</strong>,</p>
    <p>Your interview for the <strong>Digital Marketing Executive</strong> role at <strong>Transbill</strong> has been confirmed.</p>
    <div style="background: white; border: 1px solid #d1fae5; border-left: 4px solid #2D6A2F; border-radius: 8px; padding: 20px; margin: 24px 0;">
      <h3 style="margin: 0 0 12px; color: #2D6A2F; font-size: 15px;">Interview Details</h3>
      <p style="margin: 6px 0;"><strong>Date:</strong> ${dateStr}</p>
      <p style="margin: 6px 0;"><strong>Time:</strong> ${timeStr} (WAT)</p>
      <p style="margin: 6px 0;"><strong>Duration:</strong> 30 minutes</p>
      <p style="margin: 6px 0;"><strong>Format:</strong> Google Meet (video call)</p>
      ${interviewerLine}
      ${meetLink ? `<p style="margin: 6px 0;"><strong>Meet Link:</strong> <a href="${meetLink}">${meetLink}</a></p>` : ''}
    </div>
    ${meetButton}
    <p>A calendar invite has been sent to your email. Please ensure you are available at the scheduled time.</p>
    <p>If you need to make changes, contact us at <a href="mailto:support@transbill.ng">support@transbill.ng</a>.</p>
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
      interview_location: meetLink || slot.location || '',
      interview_meet_link: meetLink,
      interview_email_sent: true,
      candidate_stage: 'Interview Scheduled',
    });

    return Response.json({ success: true, slot_datetime: slot.slot_datetime, meet_link: meetLink });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});