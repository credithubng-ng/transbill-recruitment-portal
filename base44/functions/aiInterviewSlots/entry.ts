import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { getApplicantFromSession } from '../../shared/interviewSession.ts';

// Generate available 30-minute slots for the next N working days (Mon–Sat, 09:00–17:00 WAT),
// excluding already-booked times. Returns UTC ISO strings + a local-time label.
function generateSlots(daysAhead = 10) {
  const slots = [];
  const now = new Date();
  for (let d = 1; d <= daysAhead; d++) {
    const day = new Date(now.getTime() + d * 24 * 60 * 60 * 1000);
    const wat = new Date(day.getTime() + 60 * 60 * 1000);
    const dow = wat.getUTCDay();
    if (dow === 0) continue;
    for (let h = 9; h < 17; h++) {
      for (let m of [0, 30]) {
        const slot = new Date(Date.UTC(wat.getUTCFullYear(), wat.getUTCMonth(), wat.getUTCDate(), h, m, 0) - 60 * 60 * 1000);
        if (slot.getTime() <= now.getTime() + 30 * 60 * 1000) continue;
        slots.push(slot.toISOString());
      }
    }
  }
  return slots;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { applicantId, applicantSessionToken } = await req.json();
    const applicant = await getApplicantFromSession(base44, applicantId, applicantSessionToken);
    if (!applicant) return Response.json({ error: 'Invalid or expired session' }, { status: 401 });
    if (applicant.candidate_stage !== 'AI Interview Shortlisted' && applicant.candidate_stage !== 'AI Interview Scheduled') {
      return Response.json({ error: 'You are not eligible to book an AI interview at this time.' }, { status: 403 });
    }

    const allSlots = generateSlots(10);
    const booked = await base44.asServiceRole.entities.InterviewBooking.filter({ status: 'booked' }, '-created_date', 500);
    const bookedSet = new Set(booked.map(b => b.slot_datetime));
    const available = allSlots.filter(s => !bookedSet.has(s)).map(s => ({
      slot_datetime: s,
      label: new Date(s).toLocaleString('en-GB', { timeZone: 'Africa/Lagos', dateStyle: 'full', timeStyle: 'short' }),
    }));

    return Response.json({ slots: available, timezone: 'Africa/Lagos' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});