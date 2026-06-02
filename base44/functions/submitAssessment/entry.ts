import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const {
      applicantId, score, status, finalAnswers, sessionQuestions,
      signature, completionTime, yearsExperience
    } = await req.json();

    if (!applicantId) {
      return Response.json({ error: 'applicantId is required' }, { status: 400 });
    }

    // Signature duplicate check — up to 20 regen attempts handled on frontend
    // Here we just flag if duplicate
    let finalSignature = signature;
    let duplicateFlag = false;
    const existing = await base44.asServiceRole.entities.Applicant.filter({ question_set_signature: signature });
    if (existing.length > 0) {
      finalSignature = signature + '__dup_' + Date.now();
      duplicateFlag = true;
    }

    // Build option order map: questionId -> array of option texts in shown order
    const optionOrderMap = {};
    sessionQuestions.forEach(q => {
      optionOrderMap[q.id] = q.options.map(o => o.text);
    });

    // Build correct answers map for admin review: questionId -> correct key
    const correctAnswersMap = {};
    sessionQuestions.forEach(q => {
      correctAnswersMap[q.id] = q.correctAnswer;
    });

    // Risk flags
    const rapid_completion_flag = completionTime !== undefined && completionTime < 7 * 60;
    const very_rapid_completion_flag = completionTime !== undefined && completionTime < 4 * 60;
    const scorePercent = (score / 25) * 100;
    let experience_inflation_flag = false;
    if (yearsExperience === '3–5 years' && scorePercent < 60) experience_inflation_flag = true;
    if (yearsExperience === '5+ years' && scorePercent < 70) experience_inflation_flag = true;
    const review_required_flag = rapid_completion_flag || experience_inflation_flag || duplicateFlag;

    await base44.asServiceRole.entities.Applicant.update(applicantId, {
      assessment_score: score,
      assessment_answers: finalAnswers,
      assessment_question_ids: sessionQuestions.map(q => q.id),
      assessment_option_order: optionOrderMap,
      assessment_correct_answers: correctAnswersMap,
      assessment_completed: true,
      assessment_completion_time: completionTime || null,
      question_set_signature: finalSignature,
      status,
      rapid_completion_flag,
      very_rapid_completion_flag,
      experience_inflation_flag,
      duplicate_signature_flag: duplicateFlag,
      review_required_flag,
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});