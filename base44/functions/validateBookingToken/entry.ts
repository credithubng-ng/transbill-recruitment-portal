import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { token } = await req.json();

    if (!token) {
      return Response.json({ valid: false, reason: 'not_found' });
    }

    const matches = await base44.asServiceRole.entities.Applicant.filter({ booking_token: token });

    if (!matches || matches.length === 0) {
      return Response.json({ valid: false, reason: 'not_found' });
    }

    const applicant = matches[0];

    if (applicant.booking_used) {
      return Response.json({ valid: false, reason: 'used' });
    }

    if (!applicant.booking_token_expires_at || new Date(applicant.booking_token_expires_at) < new Date()) {
      return Response.json({ valid: false, reason: 'expired' });
    }

    const firstName = applicant.full_name?.split(' ')[0] || applicant.full_name || 'Candidate';

    return Response.json({ valid: true, firstName, applicantId: applicant.id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});