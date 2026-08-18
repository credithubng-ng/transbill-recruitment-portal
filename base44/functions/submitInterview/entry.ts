import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { verifyApplicantSession } from '../../shared/interviewSession.ts';

const WEIGHTS = {
  role_market_understanding: 0.15,
  recruitment_activation_system: 0.20,
  sme_acquisition_strategy: 0.15,
  numerical_commercial_reasoning: 0.15,
  performance_management: 0.15,
  execution_adaptability: 0.10,
  integrity_communication: 0.10,
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { applicantId, applicantSessionToken, session_id, nonce, turns, completion_time, technical_failure } = await req.json();
    const session = await verifyApplicantSession(applicantSessionToken);
    if (!session || session.applicantId !== applicantId) return Response.json({ error: 'Invalid or expired session' }, { status: 401 });

    const interviewSession = await base44.asServiceRole.entities.InterviewSession.get(session_id);
    if (!interviewSession || interviewSession.applicant_id !== applicantId) {
      return Response.json({ error: 'Session not found.' }, { status: 404 });
    }
    // Idempotency: a completed session returns its existing result, never re-scores.
    if (interviewSession.status === 'completed') {
      const results = await base44.asServiceRole.entities.InterviewResult.filter({ session_id }, '-created_date', 1);
      return Response.json({ success: true, already_submitted: true, result_id: results[0]?.id });
    }
    if (interviewSession.status !== 'in_progress') return Response.json({ error: 'Session is not active.' }, { status: 400 });
    if (interviewSession.nonce !== nonce) return Response.json({ error: 'Session nonce mismatch.' }, { status: 400 });
    if (!interviewSession.consent_given) return Response.json({ error: 'Consent is required before submission.' }, { status: 403 });
    if (!Array.isArray(turns) || turns.length === 0) return Response.json({ error: 'A transcript is required.' }, { status: 400 });

    const now = new Date().toISOString();
    const completionSeconds = Number.isFinite(completion_time) ? completion_time : Math.round((new Date(interviewSession.started_at).getTime() - Date.now()) / -1000);

    // Technical failure path: mark session, do NOT score. Technical failure must not reduce score.
    if (technical_failure) {
      await base44.asServiceRole.entities.InterviewSession.update(session_id, {
        status: 'technical_failure',
        completed_at: now,
        completion_time_seconds: completionSeconds,
        technical_interruptions: (interviewSession.technical_interruptions || 0) + 1,
      });
      return Response.json({ success: true, status: 'technical_failure', message: 'Your session was ended due to a technical issue. It will not be scored and a reviewer will follow up.' });
    }

    // Persist turns
    const turnRecords = turns.map((t, i) => ({
      session_id,
      applicant_id: applicantId,
      turn_index: i,
      question: String(t.question || '').slice(0, 4000),
      answer: String(t.answer || '').slice(0, 8000),
      turn_type: t.turn_type || (t.is_adaptive ? 'adaptive' : 'follow_up'),
      is_adaptive: !!t.is_adaptive,
    }));
    await base44.asServiceRole.entities.InterviewTurn.bulkCreate(turnRecords);

    const caseRec = await base44.asServiceRole.entities.InterviewCase.filter({ variant_id: interviewSession.variant_id }, '-created_date', 1);
    const caseScenario = caseRec[0]?.scenario || '';
    const transcript = turns.map((t, i) => `Q${i + 1} [${t.turn_type || 'follow_up'}]: ${t.question}\nA: ${t.answer}`).join('\n\n');

    const dimensionKeys = Object.keys(WEIGHTS);
    const scoringPrompt = `You are a strict, fair evaluator scoring a written interview transcript for an Affiliate Banker Manager role on the FirstBank SME Account Acquisition Project. An Affiliate Banker generates 4 qualified SME accounts per working day (Mon–Sat); a manager recruits at least 1 suitable Affiliate Banker per working day and maintains at least 78% network performance. Compensation is up to ₦180,000 monthly, performance-linked and prorated — never guaranteed.

CASE SCENARIO:
${caseScenario}

TRANSCRIPT:
${transcript}

Score each of the following dimensions from 1 to 5 (5 = excellent, 1 = very poor). For each, cite specific evidence from the transcript:
- role_market_understanding: grasp of the Affiliate Banker role, SME accounts, and the target market.
- recruitment_activation_system: ability to build and activate a productive Affiliate Banker network.
- sme_acquisition_strategy: quality of approach to sourcing and qualifying SME accounts.
- numerical_commercial_reasoning: accuracy of maths, funnels, costs, forecasts; catch calculation errors.
- performance_management: segmentation, coaching, warnings, quality control, 78% maintenance.
- execution_adaptability: concrete next actions, contingencies, adapting when assumptions change.
- integrity_communication: honesty (no guaranteed-income promises), due process, clear communication.

Also list: strengths, concerns, calculation_errors (specific maths mistakes), contradictions (claims that conflict), integrity_flags (dishonesty, coercive selling, fabricated accounts, account-quality disregard — any flag forces human escalation, never auto-rejection), technical_flags (if the transcript suggests connectivity/device disruption).

STRICT RULES:
- Evaluate ONLY the written content. Do NOT infer or score accent, emotion, confidence, tone, gender, ethnicity, disability, appearance, age, or background noise.
- Base every score on specific evidence quoted or paraphrased from the transcript.
- Do not invent evidence not present in the transcript.`;

    const schema = {
      type: 'object',
      properties: {
        dimension_scores: { type: 'object', properties: Object.fromEntries(dimensionKeys.map(k => [k, { type: 'number' }])), required: dimensionKeys },
        dimension_evidence: { type: 'object', properties: Object.fromEntries(dimensionKeys.map(k => [k, { type: 'string' }])), required: dimensionKeys },
        strengths: { type: 'array', items: { type: 'string' } },
        concerns: { type: 'array', items: { type: 'string' } },
        calculation_errors: { type: 'array', items: { type: 'string' } },
        contradictions: { type: 'array', items: { type: 'string' } },
        integrity_flags: { type: 'array', items: { type: 'string' } },
        technical_flags: { type: 'array', items: { type: 'string' } },
      },
      required: ['dimension_scores', 'dimension_evidence', 'strengths', 'concerns', 'calculation_errors', 'contradictions', 'integrity_flags', 'technical_flags'],
    };

    let scored;
    try {
      const llmRes = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: scoringPrompt,
        response_json_schema: schema,
      });
      scored = llmRes && typeof llmRes === 'object' ? llmRes : null;
    } catch (_e) {
      scored = null;
    }

    // Fallback neutral scores if LLM fails — never block submission on scoring failure.
    const dimScores = scored?.dimension_scores || Object.fromEntries(dimensionKeys.map(k => [k, 3]));
    const dimEvidence = scored?.dimension_evidence || Object.fromEntries(dimensionKeys.map(k => [k, 'Scoring unavailable; flagged for human review.']));
    let overall = 0;
    for (const k of dimensionKeys) overall += (Number(dimScores[k]) || 0) * WEIGHTS[k];
    overall = Math.round((overall / 5) * 100);

    const integrityFlags = scored?.integrity_flags || [];
    const integrityScore = Number(dimScores.integrity_communication) || 3;
    let recommendation;
    if (integrityFlags.length > 0) recommendation = 'Borderline'; // integrity flag → mandatory human review
    else if (overall >= 75 && integrityScore >= 3) recommendation = 'Recommended';
    else if (overall >= 60) recommendation = 'Borderline';
    else recommendation = 'Not recommended';

    const result = await base44.asServiceRole.entities.InterviewResult.create({
      session_id,
      applicant_id: applicantId,
      variant_id: interviewSession.variant_id,
      overall_score: overall,
      dimension_scores: dimScores,
      dimension_evidence: dimEvidence,
      strengths: scored?.strengths || [],
      concerns: scored?.concerns || [],
      calculation_errors: scored?.calculation_errors || [],
      contradictions: scored?.contradictions || [],
      integrity_flags: integrityFlags,
      technical_flags: scored?.technical_flags || [],
      ai_recommendation: recommendation,
      recommendation_score: overall,
      admin_decision: 'pending',
      outcome_letter_status: 'not_required',
    });

    await base44.asServiceRole.entities.InterviewSession.update(session_id, {
      status: 'completed',
      completed_at: now,
      completion_time_seconds: completionSeconds,
      result_id: result.id,
    });
    await base44.asServiceRole.entities.Applicant.updateMany({ id: applicantId }, { $set: { candidate_stage: 'AI Interview Completed' } });

    // Applicant sees only a generic confirmation — no scores, rubric, or recommendation exposed.
    return Response.json({ success: true, status: 'completed' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});