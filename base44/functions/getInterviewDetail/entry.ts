import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { verifyApplicantSession, verifyAdmin } from '../../shared/interviewSession.ts';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    // Admin path: full detail
    if (body.token && await verifyAdmin(body.token)) {
      const results = body.result_id
        ? await base44.asServiceRole.entities.InterviewResult.filter({ id: body.result_id }, '-created_date', 1)
        : await base44.asServiceRole.entities.InterviewResult.filter({ session_id: body.session_id }, '-created_date', 1);
      const result = results[0];
      if (!result) return Response.json({ error: 'Result not found.' }, { status: 404 });
      const session = await base44.asServiceRole.entities.InterviewSession.get(result.session_id);
      const turns = await base44.asServiceRole.entities.InterviewTurn.filter({ session_id: result.session_id }, 'turn_index', 100);
      const applicant = await base44.asServiceRole.entities.Applicant.get(result.applicant_id);
      const caseRec = await base44.asServiceRole.entities.InterviewCase.filter({ variant_id: result.variant_id }, '-created_date', 1);
      const reviews = await base44.asServiceRole.entities.InterviewReview.filter({ result_id: result.id }, 'reviewed_at', 50);
      return Response.json({
        result, session, turns,
        applicant: applicant ? {
          full_name: applicant.full_name, email: applicant.email, phone: applicant.phone,
          assessment_completed: applicant.assessment_completed, assessment_score: applicant.assessment_score,
          assessment_question_count: applicant.assessment_question_count,
          years_experience: applicant.years_experience, direct_sales_experience: applicant.direct_sales_experience,
          affiliate_experience: applicant.affiliate_experience, lagos_resident: applicant.lagos_resident,
          candidate_stage: applicant.candidate_stage,
        } : null,
        case_title: caseRec[0]?.title,
        reviews,
      });
    }

    // Applicant path: own session only, limited fields (no scores/rubric/recommendation)
    const session = await verifyApplicantSession(body.applicantSessionToken);
    if (!session || session.applicantId !== body.applicantId) {
      return Response.json({ error: 'Invalid or expired session' }, { status: 401 });
    }
    const results = await base44.asServiceRole.entities.InterviewResult.filter({ session_id: body.session_id }, '-created_date', 1);
    const result = results[0];
    if (!result || result.applicant_id !== body.applicantId) {
      return Response.json({ error: 'Result not found.' }, { status: 404 });
    }
    const caseRec = await base44.asServiceRole.entities.InterviewCase.filter({ variant_id: result.variant_id }, '-created_date', 1);
    return Response.json({
      result: {
        session_id: result.session_id,
        admin_decision: result.admin_decision,
        outcome_letter_status: result.outcome_letter_status,
      },
      case_title: caseRec[0]?.title,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});