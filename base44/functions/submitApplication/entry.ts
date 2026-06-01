import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    const email = body.email?.trim().toLowerCase();
    if (!email) {
      return Response.json({ error: 'Email is required.' }, { status: 400 });
    }

    // Duplicate check using service role (bypasses RLS)
    const existing = await base44.asServiceRole.entities.Applicant.filter({ email });
    if (existing.length > 0) {
      return Response.json({ error: 'duplicate' }, { status: 409 });
    }

    // Create applicant using service role
    const applicant = await base44.asServiceRole.entities.Applicant.create({
      ...body,
      email,
      status: 'Applied',
      assessment_completed: false
    });

    return Response.json({ id: applicant.id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});