import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const NEXT_STEP_URL = 'https://transbill.ng';
const COMPANY_NAME = 'Transbill';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Find all candidates awaiting registration who haven't completed it
    const candidates = await base44.asServiceRole.entities.Applicant.filter({
      registration_completed: false,
      assessment_email_sent: true,
    });

    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
    let sent = 0;

    for (const c of candidates) {
      // Only those who received email 3+ days ago and are in awaiting registration stage
      if (c.candidate_stage !== 'Awaiting Registration') continue;
      if (!c.assessment_email_sent_at) continue;
      if (c.assessment_email_sent_at > threeDaysAgo) continue;

      const firstName = c.full_name?.split(' ')[0] || 'Candidate';

      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: c.email,
          subject: 'Reminder: Complete Your Transbill.ng Registration',
          body: `Hello ${firstName},

This is a reminder to complete your Transbill.ng registration.

Link:
${NEXT_STEP_URL}

Regards
Recruitment Team
${COMPANY_NAME}`,
        });
        sent++;
      } catch (emailErr) {
        console.error(`Reminder failed for ${c.email}:`, emailErr.message);
      }
    }

    return Response.json({ success: true, reminders_sent: sent });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});