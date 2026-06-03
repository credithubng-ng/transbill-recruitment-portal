import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Find applicants with expired, unused booking tokens
    const applicants = await base44.asServiceRole.entities.Applicant.filter({ booking_used: false });

    const now = new Date();
    const expired = applicants.filter(a => {
      if (!a.booking_token) return false;
      if (!a.booking_token_expires_at) return false;
      if (new Date(a.booking_token_expires_at) >= now) return false;
      // Only those still waiting to book
      const validStages = ['Interview Scheduling', 'Interview Scheduled'];
      return validStages.includes(a.candidate_stage);
    });

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