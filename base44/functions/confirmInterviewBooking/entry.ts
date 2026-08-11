import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { token, slotId } = await req.json();

    if (!token || !slotId) {
      return Response.json({ error: 'token and slotId are required' }, { status: 400 });
    }
    if (!/^(?:[0-9a-f]{32}|[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})$/i.test(token)) {
      return Response.json({ error: 'Invalid booking token' }, { status: 401 });
    }
    const applicants = await base44.asServiceRole.entities.Applicant.filter({ booking_token: token });
    const applicant = applicants?.[0];
    if (!applicant || applicant.booking_used || !applicant.booking_token_expires_at ||
        new Date(applicant.booking_token_expires_at) < new Date()) {
      return Response.json({ error: 'Invalid or expired booking token' }, { status: 403 });
    }

    // Delegate to bookInterviewSlot
    const result = await base44.asServiceRole.functions.invoke('bookInterviewSlot', { token, slotId });
    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
