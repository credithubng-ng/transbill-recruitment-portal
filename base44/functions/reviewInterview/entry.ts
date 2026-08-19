import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { verifyAdmin } from '../../shared/interviewSession.ts';

const DECISIONS = ['approved_successful', 'second_review', 'human_interview', 'hold', 'not_successful'];
const ADVERSE = ['second_review', 'hold', 'not_successful'];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { token, result_id, decision, notes, reviewer } = await req.json();
    const admin = await verifyAdmin(token);
    if (!admin) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (admin.role === 'read_only') return Response.json({ error: 'Read-only users cannot review interviews.' }, { status: 403 });
    if (!result_id || !DECISIONS.includes(decision)) return Response.json({ error: 'A valid decision is required.' }, { status: 400 });
    if (ADVERSE.includes(decision) && (!notes || notes.trim().length < 5)) {
      return Response.json({ error: 'Reviewer notes are required for this action.' }, { status: 400 });
    }

    const results = await base44.asServiceRole.entities.InterviewResult.filter({ id: result_id }, '-created_date', 1);
    const result = results[0];
    if (!result) return Response.json({ error: 'Result not found.' }, { status: 404 });

    const reviewedBy = reviewer || 'admin';
    const now = new Date().toISOString();
    const auditEvent = `Decision "${decision}" recorded by ${reviewedBy} at ${now}. Notes: ${(notes || '').slice(0, 500)}`;

    // Immutable audit record
    await base44.asServiceRole.entities.InterviewReview.create({
      result_id,
      applicant_id: result.applicant_id,
      reviewed_by: reviewedBy,
      decision,
      notes: notes || '',
      audit_event: auditEvent,
      reviewed_at: now,
    });

    const update = { admin_decision: decision };
    // Approved → queue an outcome letter for explicit Send (AI never sends email itself)
    if (decision === 'approved_successful') update.outcome_letter_status = 'queued';

    await base44.asServiceRole.entities.InterviewResult.update(result_id, update);

    // Map decision to applicant stage
    const stageMap = {
      approved_successful: 'AI Interview Reviewed',
      second_review: 'AI Interview Reviewed',
      human_interview: 'AI Interview Reviewed',
      hold: 'AI Interview Reviewed',
      not_successful: 'Closed – Not Progressed',
    };
    await base44.asServiceRole.entities.Applicant.updateMany({ id: result.applicant_id }, { $set: { candidate_stage: stageMap[decision] } });

    return Response.json({ success: true, decision, audit_event: auditEvent });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});