import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const NEXT_STEP_URL = 'https://transbill.ng';
const APP_DOMAIN = Deno.env.get('APP_DOMAIN') || 'https://your-app-domain';
const SUCCESS_EMAIL_SUBJECT = 'Assessment Successful – Next Step';
const FAIL_EMAIL_SUBJECT = 'Assessment Update';
const REGISTRATION_DEADLINE_DAYS = 7;
const SUPPORT_EMAIL = 'support@transbill.ng';
const COMPANY_NAME = 'Transbill';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const {
      applicantId, finalAnswers, sessionQuestions,
      signature, completionTime, yearsExperience,
      thresholds
    } = await req.json();

    if (!applicantId) {
      return Response.json({ error: 'applicantId is required' }, { status: 400 });
    }

    // Use passed thresholds or fall back to defaults
    const interviewReadyMin = thresholds?.interview_ready_min ?? 21;
    const reserveListMin = thresholds?.reserve_list_min ?? 16;
    const rapidMinutes = thresholds?.rapid_minutes ?? 7;
    const veryRapidMinutes = thresholds?.very_rapid_minutes ?? 4;
    const inflation35Pct = thresholds?.inflation_3_5_pct ?? 60;
    const inflation5Pct = thresholds?.inflation_5plus_pct ?? 70;

    // Calculate score server-side — never trust browser-sent score
    let score = 0;
    finalAnswers.forEach((answer, i) => {
      if (answer === sessionQuestions[i]?.correctAnswer) score++;
    });

    let status;
    if (score >= interviewReadyMin) status = 'Interview Ready';
    else if (score >= reserveListMin) status = 'Reserve List';
    else status = 'Not Progressed';

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
    const rapid_completion_flag = completionTime !== undefined && completionTime < rapidMinutes * 60;
    const very_rapid_completion_flag = completionTime !== undefined && completionTime < veryRapidMinutes * 60;
    const scorePercent = (score / 25) * 100;
    let experience_inflation_flag = false;
    if (yearsExperience === '3–5 years' && scorePercent < inflation35Pct) experience_inflation_flag = true;
    if (yearsExperience === '5+ years' && scorePercent < inflation5Pct) experience_inflation_flag = true;
    const review_required_flag = rapid_completion_flag || experience_inflation_flag || duplicateFlag;

    // Determine candidate_stage and email content
    const now = new Date().toISOString();
    let candidate_stage;
    let emailSubject;
    let emailBody;
    let assessment_email_sent = false;
    let assessment_email_sent_at = null;

    // Generate booking token for passing candidates
    let booking_token = null;
    let booking_token_expires_at = null;
    let bookingUrl = null;
    if (status === 'Interview Ready' || status === 'Reserve List') {
      booking_token = crypto.randomUUID().replace(/-/g, '');
      booking_token_expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      bookingUrl = `${APP_DOMAIN}/book-interview?token=${booking_token}`;
    }

    if (status === 'Interview Ready' || status === 'Reserve List') {
      candidate_stage = 'Email Sent';
      emailSubject = SUCCESS_EMAIL_SUBJECT;
      emailBody = `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1A1A1A;">
  <div style="background:#3A7D3C;padding:24px;border-radius:12px 12px 0 0;text-align:center;">
    <h1 style="color:white;margin:0;font-size:22px;">Congratulations, ${firstName}! 🎉</h1>
  </div>
  <div style="background:#F8FAF8;padding:28px;border-radius:0 0 12px 12px;">
    <p style="font-size:16px;">Thank you for participating in the Transbill Digital Marketing Assessment.</p>
    <p>We are pleased to inform you that you have successfully passed this stage.</p>

    <div style="background:#EBF5EB;border-radius:10px;padding:20px;margin:20px 0;text-align:center;">
      <p style="font-weight:bold;font-size:16px;color:#2D6A2F;margin:0 0 12px;">Next Step: Book Your Interview</p>
      <p style="margin:0 0 16px;font-size:14px;color:#555555;">Please click below to select your interview date and time. All interviews are 30 minutes via Google Meet.</p>
      <a href="${bookingUrl}" style="background:#3A7D3C;color:white;padding:14px 32px;border-radius:30px;text-decoration:none;font-weight:bold;font-size:16px;display:inline-block;">
        Book Your Interview Slot
      </a>
      <p style="margin:12px 0 0;font-size:12px;color:#E65100;"><strong>⏰ This link expires in 7 days.</strong> Book early to secure your preferred time.</p>
    </div>

    <p style="font-size:13px;color:#555555;">Questions? Contact us at <a href="mailto:recruitment@transbill.ng">recruitment@transbill.ng</a></p>
    <p style="font-size:13px;color:#7A7A8A;">Regards,<br><strong>Recruitment Team</strong><br>Transbill</p>
  </div>
</div>`;
    } else {
      candidate_stage = 'Closed – Not Progressed';
      emailSubject = FAIL_EMAIL_SUBJECT;
      emailBody = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1A1A1A;">
  <div style="background: #2D6A2F; padding: 24px 32px; border-radius: 12px 12px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 20px;">Assessment Outcome</h1>
    <p style="color: #c8e6c9; margin: 6px 0 0; font-size: 13px;">Transbill Digital Marketing Recruitment</p>
  </div>
  <div style="background: #f9fafb; padding: 32px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb; border-top: none;">
    <p style="font-size: 16px;">Dear <strong>${firstName}</strong>,</p>
    <p style="line-height: 1.6;">Thank you for taking the time to complete the Transbill Digital Marketing Assessment. We appreciate your interest in joining our team.</p>
    <p style="line-height: 1.6;">After careful review of your assessment results, we regret to inform you that you have not met the required threshold to progress to the next stage of this recruitment exercise.</p>
    <p style="line-height: 1.6;">This decision is based solely on your performance in this assessment and does not reflect your overall abilities or potential. We encourage you to keep developing your skills and to consider applying again in the future.</p>
    <p style="line-height: 1.6;">We wish you the very best in your career journey.</p>
    <p style="margin-top: 28px; font-size: 13px; color: #555555;">If you have any questions, please contact us at <a href="mailto:recruitment@transbill.ng" style="color: #2D6A2F;">recruitment@transbill.ng</a>.</p>
    <p style="margin-top: 16px; font-size: 13px;">Kind regards,<br/><strong>The Transbill Recruitment Team</strong></p>
  </div>
</div>`;
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
          candidate_stage = 'Interview Scheduling';
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
      ...(booking_token ? {
        booking_token,
        booking_token_expires_at,
        booking_used: false,
        booking_link_sent_at: assessment_email_sent ? now : null,
      } : {}),
    });

    return Response.json({ success: true, score, status });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});