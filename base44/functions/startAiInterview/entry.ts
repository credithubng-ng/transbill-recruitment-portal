import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { getApplicantFromSession } from '../../shared/interviewSession.ts';

// Appointment window: candidate may join 15 min early, up to 30 min after slot start.
const EARLY_MS = 15 * 60 * 1000;
const LATE_MS = 30 * 60 * 1000;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { applicantId, applicantSessionToken, booking_id, nonce } = await req.json();
    const applicant = await getApplicantFromSession(base44, applicantId, applicantSessionToken);
    if (!applicant) return Response.json({ error: 'Invalid or expired session' }, { status: 401 });
    if (!booking_id || !nonce) return Response.json({ error: 'Booking and nonce are required.' }, { status: 400 });

    const booking = await base44.asServiceRole.entities.InterviewBooking.get(booking_id);
    if (!booking || booking.applicant_id !== applicantId) return Response.json({ error: 'Booking not found.' }, { status: 404 });
    if (booking.status !== 'booked') return Response.json({ error: 'This booking is no longer active.' }, { status: 400 });

    const slotTime = new Date(booking.slot_datetime).getTime();
    const now = Date.now();
    if (now < slotTime - EARLY_MS) return Response.json({ error: 'Your interview is not open yet. Please return at the scheduled time.' }, { status: 403 });
    if (now > slotTime + LATE_MS) return Response.json({ error: 'Your interview window has closed. Please reschedule from your status page.' }, { status: 403 });

    // Idempotency: if a session already exists for this booking/nonce, return it (no duplicate).
    const existing = await base44.asServiceRole.entities.InterviewSession.filter({ booking_id }, '-created_date', 1);
    if (existing[0]) {
      const session = existing[0];
      const caseRec = await base44.asServiceRole.entities.InterviewCase.filter({ variant_id: session.variant_id }, '-created_date', 1);
      return Response.json({
        session_id: session.id,
        status: session.status,
        consent_given: session.consent_given,
        case: caseRec[0] ? {
          variant_id: caseRec[0].variant_id,
          title: caseRec[0].title,
          scenario: caseRec[0].scenario,
          common_rules: caseRec[0].common_rules,
          slides: caseRec[0].slides,
          follow_up_questions: caseRec[0].follow_up_questions,
        } : null,
        resumed: true,
      });
    }

    const variantId = booking.variant_id || applicant.ai_interview_variant_id || 1;
    const caseRec = await base44.asServiceRole.entities.InterviewCase.filter({ variant_id: variantId }, '-created_date', 1);
    if (!caseRec[0]) return Response.json({ error: 'Interview case not configured.' }, { status: 500 });

    const session = await base44.asServiceRole.entities.InterviewSession.create({
      booking_id,
      applicant_id: applicantId,
      variant_id: variantId,
      case_id: caseRec[0].id,
      nonce,
      status: 'in_progress',
      consent_given: false,
      started_at: new Date().toISOString(),
      adaptive_question_count: 0,
      technical_interruptions: 0,
      reconnect_count: 0,
      audio_recorded: false,
    });
    await base44.asServiceRole.entities.InterviewBooking.update(booking_id, { session_id: session.id });

    return Response.json({
      session_id: session.id,
      status: 'in_progress',
      consent_given: false,
      case: {
        variant_id: caseRec[0].variant_id,
        title: caseRec[0].title,
        scenario: caseRec[0].scenario,
        common_rules: caseRec[0].common_rules,
        slides: caseRec[0].slides,
        follow_up_questions: caseRec[0].follow_up_questions,
      },
      resumed: false,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});