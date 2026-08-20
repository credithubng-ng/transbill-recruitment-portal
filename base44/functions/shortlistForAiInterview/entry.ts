import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { verifyAdmin } from '../../shared/interviewSession.ts';
import { emitFunnelEvent } from '../../shared/funnelAnalytics.ts';

// Role-fit potential across 6 areas. Low-experience applicants may still qualify through
// learning potential and numerical judgement.
function assessRoleFit(applicant) {
  const cat = applicant.assessment_category_scores || {};
  const max = applicant.assessment_category_maximums || {};
  const ratio = (s, m) => (s !== undefined && s !== null && m) ? s / m : null;
  const digitalPct = applicant.digital_validation_max ? ratio(applicant.digital_validation_score, applicant.digital_validation_max) : ratio(cat.digital, max.digital);
  const salesPct = applicant.sales_validation_max ? ratio(applicant.sales_validation_score, applicant.sales_validation_max) : ratio(cat.sales, max.sales);
  const learnPct = applicant.learning_agility_max ? ratio(applicant.learning_agility_score, applicant.learning_agility_max) : ratio(cat.learnability, max.learnability);
  const overallPct = applicant.assessment_completed ? ratio(applicant.assessment_score, applicant.assessment_question_count || 25) : null;
  const perfPct = cat.performance !== undefined ? ratio(cat.performance, max.performance) : ratio(applicant.common_core_score, applicant.common_core_max);
  const affiliatePct = ratio(cat.affiliate, max.affiliate);
  const hasSalesExp = applicant.direct_sales_experience && applicant.direct_sales_experience !== 'No formal experience';
  const areas = {
    digital_lead_generation: digitalPct !== null && digitalPct >= 0.5,
    direct_sales: (salesPct !== null && salesPct >= 0.5) || hasSalesExp,
    recruitment: applicant.affiliate_experience === 'Yes' || (affiliatePct !== null && affiliatePct >= 0.5),
    field_team_support: learnPct !== null && learnPct >= 0.67,
    data_reporting: overallPct !== null && overallPct >= 0.6,
    performance_coaching: perfPct !== null && perfPct >= 0.5,
  };
  const passed = Object.keys(areas).filter(k => areas[k]);
  return { areas, passedCount: passed.length };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { token, applicant_id } = await req.json();
    if (!await verifyAdmin(token)) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (!applicant_id) return Response.json({ error: 'applicant_id is required' }, { status: 400 });

    const applicant = await base44.asServiceRole.entities.Applicant.get(applicant_id);
    if (!applicant) return Response.json({ error: 'Applicant not found' }, { status: 404 });

    if (applicant.lagos_resident !== 'Yes') return Response.json({ error: 'Applicant is not a confirmed Lagos resident' }, { status: 400 });
    if (applicant.assessment_completed !== true) return Response.json({ error: 'Applicant has not completed the assessment' }, { status: 400 });

    const flags = [];
    if (applicant.review_required_flag) flags.push('review_required_flag');
    if (applicant.duplicate_signature_flag) flags.push('duplicate_signature_flag');
    if (applicant.experience_inflation_flag) flags.push('experience_inflation_flag');
    if (applicant.very_rapid_completion_flag) flags.push('very_rapid_completion_flag');
    if (flags.length) return Response.json({ error: `Unresolved integrity flag(s): ${flags.join(', ')}.` }, { status: 400 });

    const fit = assessRoleFit(applicant);
    if (fit.passedCount < 3) {
      return Response.json({ error: `Role-fit potential shown in only ${fit.passedCount} of 6 areas (minimum 3 required).`, areas: fit.areas }, { status: 422 });
    }

    // Even variant assignment
    const counts = {};
    for (let v = 1; v <= 8; v++) counts[v] = 0;
    const bookings = await base44.asServiceRole.entities.InterviewBooking.list('-created_date', 500);
    for (const b of bookings) if (b.variant_id) counts[b.variant_id] = (counts[b.variant_id] || 0) + 1;
    let variantId = 1, minCount = counts[1];
    for (let v = 2; v <= 8; v++) if (counts[v] < minCount) { minCount = counts[v]; variantId = v; }

    await base44.asServiceRole.entities.Applicant.updateMany({ id: applicant_id }, { $set: {
      ai_interview_variant_id: variantId,
      ai_interview_shortlisted_at: new Date().toISOString(),
      candidate_stage: 'AI Interview Shortlisted',
      interview_mode: 'structured_digital',
    } });

    // Emit interview_ready funnel event (idempotent — dedupes by applicant_id)
    try {
      await emitFunnelEvent(base44, {
        event_type: 'interview_ready',
        applicant_id: applicant_id,
        occurred_at: new Date().toISOString(),
      });
    } catch (_e) { /* analytics best-effort */ }

    return Response.json({
      success: true,
      variant_id: variantId,
      role_fit: { passedCount: fit.passedCount, areas: fit.areas },
      message: 'Applicant shortlisted for the Selection Interview.',
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});