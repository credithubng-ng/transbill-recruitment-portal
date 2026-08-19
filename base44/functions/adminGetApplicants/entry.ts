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

    // Fetch AI interview results and reviews so the admin drill-down can show
    // interview scores, AI recommendation, and review metadata without any
    // direct frontend entity queries.
    const results = await base44.asServiceRole.entities.InterviewResult.list('-created_date', 500);
    const reviews = await base44.asServiceRole.entities.InterviewReview.list('-reviewed_at', 500);

    // Latest review per result_id
    const latestReviewByResult: Record<string, any> = {};
    for (const rv of reviews) {
      const existing = latestReviewByResult[rv.result_id];
      if (!existing || new Date(rv.reviewed_at || 0) > new Date(existing.reviewed_at || 0)) {
        latestReviewByResult[rv.result_id] = rv;
      }
    }

    // Latest result per applicant_id
    const interviewResults: Record<string, any> = {};
    for (const r of results) {
      const existing = interviewResults[r.applicant_id];
      if (!existing || new Date(r.created_date) > new Date(existing.created_date)) {
        const review = latestReviewByResult[r.id];
        interviewResults[r.applicant_id] = {
          result_id: r.id,
          overall_score: r.overall_score,
          dimension_scores: r.dimension_scores,
          ai_recommendation: r.ai_recommendation,
          admin_decision: r.admin_decision,
          reviewed_by: review?.reviewed_by || '',
          reviewed_at: review?.reviewed_at || '',
          review_notes: review?.notes || '',
        };
      }
    }

    return Response.json({ applicants, interviewResults });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});