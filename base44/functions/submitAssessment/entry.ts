import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const NEXT_STEP_URL = 'https://transbill.ng';
const SUCCESS_EMAIL_SUBJECT = 'Assessment Successful – Next Step';
const FAIL_EMAIL_SUBJECT = 'Assessment Update';
const REGISTRATION_DEADLINE_DAYS = 7;
const SUPPORT_EMAIL = 'support@transbill.ng';
const COMPANY_NAME = 'Transbill';

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

    // Fetch applicant for email/name
    const applicant = await base44.asServiceRole.entities.Applicant.get(applicantId);
    const firstName = applicant?.full_name?.split(' ')[0] || 'Candidate';
    const email = applicant?.email;

    // Signature duplicate check
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

    // Determine candidate_stage and email content
    const now = new Date().toISOString();
    let candidate_stage;
    let emailSubject;
    let emailBody;
    let assessment_email_sent = false;
    let assessment_email_sent_at = null;

    if (status === 'Interview Ready' || status === 'Reserve List') {
      candidate_stage = 'Email Sent';
      emailSubject = SUCCESS_EMAIL_SUBJECT;
      emailBody = `Hello ${firstName},

Thank you for participating in the Transbill Digital Marketing Assessment.

We are pleased to inform you that you have successfully completed this stage.

The next step requires registration on Transbill.ng.

Registration Link:
${NEXT_STEP_URL}

Complete registration within ${REGISTRATION_DEADLINE_DAYS} days.

Please note:
• Registration is mandatory
• Registration does not guarantee final selection
• Additional screening and interviews may follow

Support:
${SUPPORT_EMAIL}

Regards
Recruitment Team
${COMPANY_NAME}`;
    } else {
      candidate_stage = 'Closed – Not Progressed';
      emailSubject = FAIL_EMAIL_SUBJECT;
      emailBody = `Hello ${firstName},

Thank you for taking part in the Transbill Digital Marketing Assessment.

Following review of this assessment stage, you will not be progressing further at this time.

We appreciate your effort and interest.

This outcome applies only to the present assessment and does not prevent future applications.

We wish you success.

Regards
Recruitment Team
${COMPANY_NAME}`;
    }

    // Send email (wrapped so it never blocks the record update)
    if (email) {
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: email,
          subject: emailSubject,
          body: emailBody,
        });
        assessment_email_sent = true;
        assessment_email_sent_at = now;
        // After email sent, update stage for passing candidates
        if (status === 'Interview Ready' || status === 'Reserve List') {
          candidate_stage = 'Awaiting Registration';
        }
      } catch (emailErr) {
        console.error('Email send failed:', emailErr.message);
      }
    }

    await base44.asServiceRole.entities.Applicant.update(applicantId, {
      assessment_score: score,
      assessment_answers: finalAnswers,
      assessment_question_ids: sessionQuestions.map(q => q.id),
      assessment_option_order: optionOrderMap,
      assessment_correct_answers: correctAnswersMap,
      assessment_completed: true,
      assessment_completion_time: completionTime || null,
      assessment_completed_at: now,
      question_set_signature: finalSignature,
      status,
      rapid_completion_flag,
      very_rapid_completion_flag,
      experience_inflation_flag,
      duplicate_signature_flag: duplicateFlag,
      review_required_flag,
      assessment_email_sent,
      assessment_email_sent_at,
      candidate_stage,
      registration_completed: false,
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});