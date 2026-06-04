import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const now = new Date().toISOString();

    const applicants = await base44.asServiceRole.entities.Applicant.list();

    const expired = applicants.filter(a =>
      a.booking_token &&
      !a.booking_used &&
      a.booking_token_expires_at &&
      a.booking_token_expires_at < now &&
      a.candidate_stage === 'Interview Scheduling'
    );

    let updated = 0;
    for (const a of expired) {
      await base44.asServiceRole.entities.Applicant.update(a.id, {
        candidate_stage: 'Booking Link Expired',
      });
      updated++;
    }

    return Response.json({ success: true, expiredCount: updated });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});