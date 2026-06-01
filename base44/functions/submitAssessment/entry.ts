import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { applicantId, score, status, finalAnswers, sessionQuestions, signature } = await req.json();

    if (!applicantId) {
      return Response.json({ error: 'applicantId is required' }, { status: 400 });
    }

    // Check for duplicate signature (service role to bypass RLS)
    let signatureNote = signature;
    const existing = await base44.asServiceRole.entities.Applicant.filter({ question_set_signature: signature });
    if (existing.length > 0) {
      signatureNote = signature + '__duplicate_allowed';
    }

    // Build option order map
    const optionOrderMap = {};
    sessionQuestions.forEach(q => { optionOrderMap[q.id] = q.options; });

    await base44.asServiceRole.entities.Applicant.update(applicantId, {
      assessment_score: score,
      assessment_answers: finalAnswers,
      assessment_question_ids: sessionQuestions.map(q => q.id),
      assessment_option_order: optionOrderMap,
      assessment_completed: true,
      question_set_signature: signatureNote,
      status
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});