import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { getApplicantFromSession, candidateSafeCaseFields } from '../../shared/interviewSession.ts';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { applicantId, applicantSessionToken } = await req.json();
    const applicant = await getApplicantFromSession(base44, applicantId, applicantSessionToken);
    if (!applicant) return Response.json({ error: 'Invalid or expired session' }, { status: 401 });

    const bookings = await base44.asServiceRole.entities.InterviewBooking.filter({ applicant_id: applicantId, status: 'booked' }, '-created_date', 1);
    const booking = bookings[0];
    if (!booking) return Response.json({ booking: null });

    const caseRec = await base44.asServiceRole.entities.InterviewCase.filter({ variant_id: booking.variant_id }, '-created_date', 1);
    const safeCase = candidateSafeCaseFields(caseRec[0]);
    const slotTime = new Date(booking.slot_datetime).getTime();
    const now = Date.now();
    const canStart = now >= slotTime - 15 * 60 * 1000 && now <= slotTime + 30 * 60 * 1000;

    return Response.json({
      booking: {
        booking_id: booking.id,
        slot_datetime: booking.slot_datetime,
        label: new Date(booking.slot_datetime).toLocaleString('en-GB', { timeZone: 'Africa/Lagos', dateStyle: 'full', timeStyle: 'short' }),
        variant_id: booking.variant_id,
        case_title: safeCase?.case_title || `Case ${booking.variant_id}`,
        case_scenario: safeCase?.case_scenario || null,
        case_common_rules: safeCase?.case_common_rules || null,
        case_slides: safeCase?.case_slides || [],
        can_start: canStart,
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});