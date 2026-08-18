import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { verifyApplicantSession } from '../../shared/interviewSession.ts';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { applicantId, applicantSessionToken, session_id } = await req.json();
    const session = await verifyApplicantSession(applicantSessionToken);
    if (!session || session.applicantId !== applicantId) return Response.json({ error: 'Invalid or expired session' }, { status: 401 });

    const interviewSession = await base44.asServiceRole.entities.InterviewSession.get(session_id);
    if (!interviewSession || interviewSession.applicant_id !== applicantId) {
      return Response.json({ error: 'Session not found.' }, { status: 404 });
    }
    if (interviewSession.status !== 'in_progress') {
      return Response.json({ error: 'This interview session is no longer active.' }, { status: 400 });
    }
    if (interviewSession.consent_given) return Response.json({ success: true, already_given: true });

    await base44.asServiceRole.entities.InterviewSession.update(session_id, {
      consent_given: true,
      consent_at: new Date().toISOString(),
    });
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});