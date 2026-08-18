import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { verifyAdmin } from '../../shared/interviewSession.ts';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { token } = await req.json();
    if (!await verifyAdmin(token)) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const results = await base44.asServiceRole.entities.InterviewResult.list('-created_date', 500);
    const sessions = await base44.asServiceRole.entities.InterviewSession.list('-created_date', 500);
    const cases = await base44.asServiceRole.entities.InterviewCase.list('-created_date', 20);
    const caseTitle = {};
    for (const c of cases) caseTitle[c.variant_id] = c.title;

    // Build applicant lookup for names
    const applicantIds = [...new Set(results.map(r => r.applicant_id))];
    const applicants = [];
    for (const id of applicantIds) {
      try { applicants.push(await base44.asServiceRole.entities.Applicant.get(id)); } catch (_e) {}
    }
    const applicantMap = {};
    for (const a of applicants) if (a) applicantMap[a.id] = { full_name: a.full_name, email: a.email, candidate_stage: a.candidate_stage };

    const sessionByApplicant = {};
    for (const s of sessions) sessionByApplicant[s.applicant_id + ':' + s.id] = s;

    const rows = results.map(r => {
      const session = sessions.find(s => s.id === r.session_id);
      return {
        result_id: r.id,
        applicant_id: r.applicant_id,
        applicant_name: applicantMap[r.applicant_id]?.full_name || '—',
        applicant_email: applicantMap[r.applicant_id]?.email || '',
        candidate_stage: applicantMap[r.applicant_id]?.candidate_stage,
        variant_id: r.variant_id,
        case_title: caseTitle[r.variant_id] || `Case ${r.variant_id}`,
        overall_score: r.overall_score,
        ai_recommendation: r.ai_recommendation,
        admin_decision: r.admin_decision,
        outcome_letter_status: r.outcome_letter_status,
        integrity_flags: r.integrity_flags || [],
        technical_flags: r.technical_flags || [],
        session_status: session?.status,
        technical_interruptions: session?.technical_interruptions || 0,
        completed_at: r.created_date,
      };
    });

    const counts = {
      awaiting_review: results.filter(r => r.admin_decision === 'pending').length,
      recommended: results.filter(r => r.ai_recommendation === 'Recommended').length,
      borderline: results.filter(r => r.ai_recommendation === 'Borderline').length,
      technical_failures: results.filter(r => r.session_id && sessions.find(s => s.id === r.session_id)?.status === 'technical_failure').length
        + results.filter(r => (r.technical_flags || []).length > 0).length,
      integrity_flags: results.filter(r => (r.integrity_flags || []).length > 0).length,
      approved: results.filter(r => r.admin_decision === 'approved_successful').length,
    };

    return Response.json({ counts, rows });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});