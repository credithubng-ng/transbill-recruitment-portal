import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { verifyAdmin, sendBrevoEmail } from '../../shared/interviewSession.ts';

const LAGOS_OFFSET = '+01:00';

function lagosToUtc(dateStr: string, timeStr: string): string {
  return new Date(`${dateStr}T${timeStr}:00${LAGOS_OFFSET}`).toISOString();
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { token, applicant_id, slot_datetime, interviewer_names, meeting_link } = body;

    const admin = await verifyAdmin(token);
    if (!admin) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (admin.role === 'read_only') {
      return Response.json({ error: 'Read-only users cannot schedule live panel interviews.' }, { status: 403 });
    }
    if (!applicant_id) return Response.json({ error: 'applicant_id is required' }, { status: 400 });
    if (!slot_datetime) return Response.json({ error: 'A date and time is required.' }, { status: 400 });

    const slotTime = new Date(slot_datetime).getTime();
    if (!Number.isFinite(slotTime) || slotTime < Date.now() + 30 * 60 * 1000) {
      return Response.json({ error: 'The scheduled time must be at least 30 minutes from now.' }, { status: 400 });
    }

    const applicant = await base44.asServiceRole.entities.Applicant.get(applicant_id);
    if (!applicant) return Response.json({ error: 'Applicant not found' }, { status: 404 });

    // Must have been referred to live panel first
    if (applicant.interview_mode !== 'live_panel') {
      return Response.json({
        error: 'Applicant must be referred to live panel before scheduling. Use the Refer to Live Panel action first.',
      }, { status: 400 });
    }

    const safeInterviewers = typeof interviewer_names === 'string' ? interviewer_names.trim() : '';
    const safeMeetingLink = typeof meeting_link === 'string' ? meeting_link.trim() : '';

    // Cancel any existing live_panel booking for this applicant (idempotent re-schedule)
    const existing = await base44.asServiceRole.entities.InterviewBooking.filter({
      applicant_id, status: 'booked', interview_mode: 'live_panel',
    }, '-created_date', 1);
    if (existing[0]) {
      await base44.asServiceRole.entities.InterviewBooking.update(existing[0].id, { status: 'cancelled' });
    }

    // Create the live panel booking
    await base44.asServiceRole.entities.InterviewBooking.create({
      applicant_id,
      slot_datetime,
      timezone: 'Africa/Lagos',
      status: 'booked',
      interview_mode: 'live_panel',
      meeting_link: safeMeetingLink,
      interviewer_names: safeInterviewers,
    });

    await base44.asServiceRole.entities.Applicant.updateMany({ id: applicant_id }, { $set: {
      live_panel_scheduled_at: slot_datetime,
      live_panel_location: safeMeetingLink,
      live_panel_interviewer_names: safeInterviewers,
      candidate_stage: 'Live Panel Scheduled',
    } });

    // Send live panel invitation email — idempotent (only if not already sent for this slot)
    if (!applicant.live_panel_email_sent || applicant.live_panel_scheduled_at !== slot_datetime) {
      try {
        const firstName = applicant.full_name?.split(' ')[0] || 'Applicant';
        const local = new Date(slot_datetime).toLocaleString('en-GB', { timeZone: 'Africa/Lagos', dateStyle: 'full', timeStyle: 'short' });
        const locationLine = safeMeetingLink
          ? safeMeetingLink.startsWith('http')
            ? `\n\nJoin the panel interview here: ${safeMeetingLink}`
            : `\n\nLocation: ${safeMeetingLink}`
          : '';
        const interviewerLine = safeInterviewers ? `\nPanel interviewers: ${safeInterviewers}` : '';

        await sendBrevoEmail({
          to: applicant.email,
          subject: 'Live Panel Interview Invitation – Transbill Programme',
          body: `Hello ${firstName},\n\nFollowing your Structured Digital Selection Interview, you have been invited to a Live Panel Interview with the Transbill recruitment team.\n\nDate & Time: ${local} (Lagos time)\n${interviewerLine}${locationLine}\n\nThis is a live, human-led panel interview. Please ensure you are available at the scheduled time and have a stable internet connection.\n\nTraining participation does not guarantee employment. Only successful participants who meet Transbill's selection requirements may receive employment offers from Transbill.\n\nIf you need to reschedule, please contact the recruitment team by replying to this email.\n\nTransbill Programme Team`,
        });

        await base44.asServiceRole.entities.Applicant.updateMany({ id: applicant_id }, { $set: {
          live_panel_email_sent: true,
        } });
      } catch (emailError) {
        console.error('Live panel email failed:', emailError.message);
      }
    }

    return Response.json({
      success: true,
      message: 'Live panel interview scheduled and invitation sent.',
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});