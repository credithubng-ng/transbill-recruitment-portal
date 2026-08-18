import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { verifyApplicantSession } from '../../shared/interviewSession.ts';

const ADAPTIVE_MAX = 2;
const RATE_LIMIT_MS = 10 * 1000;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { applicantId, applicantSessionToken, session_id, previous_claims } = await req.json();
    const session = await verifyApplicantSession(applicantSessionToken);
    if (!session || session.applicantId !== applicantId) return Response.json({ error: 'Invalid or expired session' }, { status: 401 });

    const interviewSession = await base44.asServiceRole.entities.InterviewSession.get(session_id);
    if (!interviewSession || interviewSession.applicant_id !== applicantId) {
      return Response.json({ error: 'Session not found.' }, { status: 404 });
    }
    if (interviewSession.status !== 'in_progress') return Response.json({ error: 'Session is not active.' }, { status: 400 });
    if (!interviewSession.consent_given) return Response.json({ error: 'Consent is required before the interview can continue.' }, { status: 403 });
    if ((interviewSession.adaptive_question_count || 0) >= ADAPTIVE_MAX) {
      return Response.json({ error: 'Maximum adaptive questions reached.' }, { status: 400 });
    }
    // Rate limit
    const last = interviewSession.last_adaptive_at ? new Date(interviewSession.last_adaptive_at).getTime() : 0;
    if (last && Date.now() - last < RATE_LIMIT_MS) {
      return Response.json({ error: 'Please wait a few seconds before requesting the next adaptive question.' }, { status: 429 });
    }

    const caseRec = await base44.asServiceRole.entities.InterviewCase.filter({ variant_id: interviewSession.variant_id }, '-created_date', 1);
    const caseScenario = caseRec[0]?.scenario || '';
    const claims = Array.isArray(previous_claims) ? previous_claims.slice(-6).join('\n') : '';

    const prompt = `You are an interviewer assessing a candidate for an Affiliate Banker Manager role on the FirstBank SME Account Acquisition Project. The candidate is working through a case interview.

CASE SCENARIO:
${caseScenario}

CANDIDATE'S PREVIOUS ANSWERS (claims to probe):
${claims || '(no prior answers yet)'}

Generate ONE adaptive follow-up question that is grounded ONLY in the candidate's stated claims and the case scenario. The question should probe a specific claim, test a changed assumption, ask for a concrete next action, request a metric, or check ethics/defence of numbers.

STRICT RULES:
- Ask exactly ONE question. Return only the question text.
- Do NOT reveal, hint at, or reference any scoring rubric, answer key, or evaluator criteria.
- Do NOT infer or comment on accent, emotion, confidence, tone, gender, ethnicity, disability, appearance, age, or background noise.
- Do NOT coach or signal the expected answer.
- Keep it concise and specific.`;

    const res = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: { type: 'object', properties: { question: { type: 'string' } }, required: ['question'] },
    });
    const question = (res && typeof res === 'object' && res.question) ? res.question : (typeof res === 'string' ? res : 'Can you walk through the specific numbers behind your last answer?');

    await base44.asServiceRole.entities.InterviewSession.update(session_id, {
      adaptive_question_count: (interviewSession.adaptive_question_count || 0) + 1,
      last_adaptive_at: new Date().toISOString(),
    });

    return Response.json({ question, adaptive_count: (interviewSession.adaptive_question_count || 0) + 1 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});