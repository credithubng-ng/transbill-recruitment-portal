import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { verifyAdmin } from '../../shared/interviewSession.ts';

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const { token } = body;
    const admin = await verifyAdmin(token);
    if (!admin) {
      return Response.json({ error: 'Unauthorized: invalid or expired session' }, { status: 401 });
    }

    const base44 = createClientFromRequest(req);
    const applicants = await base44.asServiceRole.entities.Applicant.list('-created_date', 10000);
    return Response.json({ applicants });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});