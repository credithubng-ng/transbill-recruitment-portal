import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { getApplicantFromSession, sendBrevoEmail } from '../../shared/interviewSession.ts';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { applicantId, applicantSessionToken, slot_datetime, action } = await req.json();
    const applicant = await getApplicantFromSession(base44, applicantId, applicantSessionToken);
    if (!applicant) return Response.json({ error: 'Invalid or expired session' }, { status: 401 });
    if (applicant.candidate_stage !== 'AI Interview Shortlisted' && applicant.candidate_stage !== 'AI Interview Scheduled') {
      return Response.json({ error: 'You are not eligible to book an AI interview.' }, { status: 403 });
    }

    if (action === 'cancel') {
      const existing = await base44.asServiceRole.entities.InterviewBooking.filter({ applicant_id: applicantId, status: 'booked' }, '-created_date', 1);
      if (existing[0]) {
        await base44.asServiceRole.entities.InterviewBooking.update(existing[0].id, { status: 'cancelled' });
        await base44.asServiceRole.entities.Applicant.updateMany({ id: applicantId }, { $set: { candidate_stage: 'AI Interview Shortlisted' } });
      }
      return Response.json({ success: true });
    }

    if (!slot_datetime) return Response.json({ error: 'A slot time is required.' }, { status: 400 });
    const slotTime = new Date(slot_datetime).getTime();
    if (!Number.isFinite(slotTime) || slotTime < Date.now() + 30 * 60 * 1000) {
      return Response.json({ error: 'That slot is no longer available.' }, { status: 400 });
    }

    const conflict = await base44.asServiceRole.entities.InterviewBooking.filter({ slot_datetime, status: 'booked' }, '-created_date', 1);
    if (conflict.length) return Response.json({ error: 'That slot was just booked. Please choose another.' }, { status: 409 });

    const ownExisting = await base44.asServiceRole.entities.InterviewBooking.filter({ applicant_id: applicantId, status: 'booked' }, '-created_date', 1);
    if (ownExisting.length) {
      await base44.asServiceRole.entities.InterviewBooking.update(ownExisting[0].id, { status: 'cancelled' });
    }

    const variantId = applicant.ai_interview_variant_id || 1;
    const booking = await base44.asServiceRole.entities.InterviewBooking.create({
      applicant_id: applicantId,
      variant_id: variantId,
      slot_datetime,
      timezone: 'Africa/Lagos',
      status: 'booked',
      reschedule_count: ownExisting.length ? 1 : 0,
    });
    await base44.asServiceRole.entities.Applicant.updateMany({ id: applicantId }, { $set: { candidate_stage: 'AI Interview Scheduled' } });

    try {
      const firstName = applicant.full_name?.split(' ')[0] || 'Applicant';
      const local = new Date(slot_datetime).toLocaleString('en-GB', { timeZone: 'Africa/Lagos', dateStyle: 'full', timeStyle: 'short' });
      await sendBrevoEmail({
        to: applicant.email,
        subject: 'Your Selection Interview is Booked – Transbill Programme',
        body: `Hello ${firstName},\n\nYour Transbill Digital Selection Interview is booked for:\n${local} (Lagos time).\n\nAt the appointment time, sign in and open your application status to start the interview. This is a structured, digitally facilitated interview lasting 15–20 minutes. Your responses will be recorded as a transcript and reviewed by Transbill's recruitment team. Final decisions are made by authorised Transbill staff.\n\nIf you need a human-led alternative or have accessibility/connectivity concerns, you can reschedule from your status page.\n\nTransbill Programme Team`,
      });
    } catch (_e) { /* email best-effort */ }

    return Response.json({ success: true, booking_id: booking.id, slot_datetime });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});