import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { BANK_VERSION_V1, BANK_VERSION_V2, QUESTION_BY_ID_V1, QUESTION_BY_ID_V2, TIER_MAP } from './screeningQuestionBank.ts';
import { getApplicantFromSession, getApplicationDeadline } from './applicantSession.ts';

const APP_DOMAIN = Deno.env.get('APP_DOMAIN') || 'https://jobs.transbill.ng';
const SUCCESS_EMAIL_SUBJECT = 'Pre-screening Successful – Transbill Digital Marketing Programme';
const FAIL_EMAIL_SUBJECT = 'Your Transbill Programme Application';
const encoder = new TextEncoder();
const keys = ['A', 'B', 'C', 'D'];
const fromBase64Url = (value: string) => {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  return atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '='));
};

async function verifyAttempt(token: string, secret: string) {
  if (!token || !secret) return null;
  const dotIndex = token.lastIndexOf('.');
  if (dotIndex < 1) return null;
  const payload = token.substring(0, dotIndex);
  const supplied = token.substring(dotIndex + 1);
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const bytes = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  const expected = Array.from(new Uint8Array(bytes)).map(byte => byte.toString(16).padStart(2, '0')).join('');
  if (supplied !== expected) return null;
  const attempt = JSON.parse(fromBase64Url(payload));
  if (attempt.expiresAt < Date.now()) return null;
  // Accept both legacy v1 and production v2 attempts.
  if (attempt.version !== BANK_VERSION_V1 && attempt.version !== BANK_VERSION_V2) return null;
  return attempt;
}

function pct(correct: number, total: number) {
  return total ? Math.round((correct / total) * 100) : 0;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { applicantId, finalAnswers, attemptToken, completionTime, applicantSessionToken } = await req.json();

    if (!applicantId) {
      return Response.json({ error: 'applicantId is required' }, { status: 400 });
    }

    const deadline = await getApplicationDeadline(base44);
    if (deadline && Date.now() > deadline) return Response.json({ error: 'The call for applications has closed.' }, { status: 403 });

    const attempt = await verifyAttempt(attemptToken, Deno.env.get('ASSESSMENT_SIGNING_SECRET') || '');
    if (!attempt || attempt.applicantId !== applicantId) return Response.json({ error: 'Invalid or expired assessment attempt' }, { status: 403 });
    const questionIds = attempt.items.map((item: any) => item.id);
    if (!Array.isArray(finalAnswers) || finalAnswers.length !== questionIds.length) return Response.json({ error: 'A complete assessment submission is required' }, { status: 400 });

    // Thresholds are loaded server-side and can never be overridden by an applicant.
    const settings = await base44.asServiceRole.entities.AppSettings.list();
    const thresholds = settings?.[0] || {};
    const interviewReadyMin = thresholds.interview_ready_min ?? 20;
    const reserveListMin = thresholds.reserve_list_min ?? 15;
    const rapidMinutes = thresholds.rapid_minutes ?? 7;
    const veryRapidMinutes = thresholds.very_rapid_minutes ?? 4;

    // Fetch applicant for email/name
    let applicant = await getApplicantFromSession(base44, applicantId, applicantSessionToken);
    if (!applicant) {
      const user = await base44.auth.me().catch(() => null);
      const legacyApplicant = user ? await base44.asServiceRole.entities.Applicant.get(applicantId) : null;
      if (legacyApplicant?.email?.toLowerCase() === user?.email?.toLowerCase()) applicant = legacyApplicant;
    }
    if (!applicant) return Response.json({ error: 'Applicant not found' }, { status: 404 });
    if (applicant.lagos_resident !== 'Yes') {
      return Response.json({ error: 'This programme is open to Lagos residents only' }, { status: 403 });
    }
    if (applicant.assessment_completed === true) {
      return Response.json({ error: 'Assessment already completed' }, { status: 409 });
    }

    const firstName = applicant?.full_name?.split(' ')[0] || 'Candidate';
    const email = applicant?.email;
    const rapid_completion_flag = completionTime !== undefined && completionTime < rapidMinutes * 60;
    const very_rapid_completion_flag = completionTime !== undefined && completionTime < veryRapidMinutes * 60;

    let score = 0;
    let status = 'Not Progressed';
    let screeningRecommendation = 'Not currently suitable';
    let candidate_stage;
    let emailSubject;
    let emailBody;
    let assessment_email_sent = false;
    let assessment_email_sent_at = null;
    let booking_token = null;
    let booking_token_expires_at = null;
    let bookingUrl = null;

    // Component scores (v2) — null for v1 legacy attempts.
    let common_core_score: number | null = null;
    let common_core_max: number | null = null;
    let digital_validation_score: number | null = null;
    let digital_validation_max: number | null = null;
    let sales_validation_score: number | null = null;
    let sales_validation_max: number | null = null;
    let learning_agility_score: number | null = null;
    let learning_agility_max: number | null = null;
    let assessment_category_scores: Record<string, number> = {};
    let assessment_category_maximums: Record<string, number> = {};
    let experience_inflation_flag = false;
    let review_required_flag = rapid_completion_flag;

    if (attempt.version === BANK_VERSION_V1) {
      // ----- Legacy v1 grading: keep existing answer map/logic exactly. -----
      const correctness: boolean[] = [];
      questionIds.forEach((id: number, index: number) => {
        const question = QUESTION_BY_ID_V1.get(id);
        const correctOriginalIndex = question.options.findIndex(option => option.key === question.correctAnswer);
        const correctDisplayIndex = attempt.items[index].order.indexOf(correctOriginalIndex);
        const isCorrect = finalAnswers[index] === keys[correctDisplayIndex];
        correctness.push(isCorrect);
        if (isCorrect) score++;
      });
      questionIds.forEach((id: number, index: number) => {
        const category = QUESTION_BY_ID_V1.get(id).category;
        assessment_category_maximums[category] = (assessment_category_maximums[category] || 0) + 1;
        assessment_category_scores[category] = (assessment_category_scores[category] || 0) + (correctness[index] ? 1 : 0);
      });
      const p = (c: string) => pct(assessment_category_scores[c] || 0, assessment_category_maximums[c] || 0);
      if (score >= interviewReadyMin && p('learnability') >= 67 && p('affiliate') >= 50) screeningRecommendation = 'Ready for training';
      else if (score >= reserveListMin && p('learnability') >= 67) screeningRecommendation = 'High potential – foundational support needed';
      else if (score >= reserveListMin || p('learnability') >= 83) screeningRecommendation = 'Manual review';
      if (screeningRecommendation === 'Ready for training') status = 'Interview Ready';
      else if (screeningRecommendation === 'High potential – foundational support needed' || screeningRecommendation === 'Manual review') status = 'Reserve List';
      else status = 'Not Progressed';
      review_required_flag = rapid_completion_flag;
    } else {
      // ----- v2 production grading with component scores. -----
      const buckets: Record<string, { correct: number; total: number }> = {
        common: { correct: 0, total: 0 },
        digital_validation: { correct: 0, total: 0 },
        sales_validation: { correct: 0, total: 0 },
        learning_agility: { correct: 0, total: 0 },
      };
      let criticalMissed = false;
      questionIds.forEach((id: number, index: number) => {
        const question = QUESTION_BY_ID_V2.get(id);
        const correctOriginalIndex = question.options.findIndex(option => option.key === question.correctAnswer);
        const correctDisplayIndex = attempt.items[index].order.indexOf(correctOriginalIndex);
        const isCorrect = finalAnswers[index] === keys[correctDisplayIndex];
        if (isCorrect) score++;
        const bucket = attempt.items[index].bucket || 'common';
        if (buckets[bucket]) {
          buckets[bucket].total++;
          if (isCorrect) buckets[bucket].correct++;
        }
        if (question.critical && !isCorrect) criticalMissed = true;
      });
      common_core_score = buckets.common.correct;
      common_core_max = buckets.common.total;
      digital_validation_score = buckets.digital_validation.correct;
      digital_validation_max = buckets.digital_validation.total;
      sales_validation_score = buckets.sales_validation.correct;
      sales_validation_max = buckets.sales_validation.total;
      learning_agility_score = buckets.learning_agility.correct;
      learning_agility_max = buckets.learning_agility.total;
      assessment_category_scores = {
        common: buckets.common.correct,
        digital_validation: buckets.digital_validation.correct,
        sales_validation: buckets.sales_validation.correct,
        learning_agility: buckets.learning_agility.correct,
      };
      assessment_category_maximums = {
        common: buckets.common.total,
        digital_validation: buckets.digital_validation.total,
        sales_validation: buckets.sales_validation.total,
        learning_agility: buckets.learning_agility.total,
      };

      const commonPct = pct(common_core_score, common_core_max);
      const learnPct = pct(learning_agility_score, learning_agility_max);
      const digitalPct = pct(digital_validation_score, digital_validation_max);
      const salesPct = pct(sales_validation_score, sales_validation_max);

      if (score >= interviewReadyMin && learnPct >= 67 && commonPct >= 60) screeningRecommendation = 'Ready for training';
      else if (score >= reserveListMin && learnPct >= 67) screeningRecommendation = 'High potential – foundational support needed';
      else if (score >= reserveListMin || learnPct >= 83) screeningRecommendation = 'Manual review';
      if (screeningRecommendation === 'Ready for training') status = 'Interview Ready';
      else if (screeningRecommendation === 'High potential – foundational support needed' || screeningRecommendation === 'Manual review') status = 'Reserve List';
      else status = 'Not Progressed';

      // Experience-inflation flags use the relevant validation score, not the overall score.
      const dmTier = TIER_MAP[applicant.years_experience] || 'foundation';
      const salesExp = applicant.direct_sales_experience
        || (applicant.affiliate_experience === 'Yes' ? 'Less than 1 year' : 'No formal experience');
      const salesTier = TIER_MAP[salesExp] || 'foundation';
      const advancedTiers = ['advanced', 'expert'];
      if (advancedTiers.includes(dmTier) && digitalPct < 50) experience_inflation_flag = true;
      if (advancedTiers.includes(salesTier) && salesPct < 50) experience_inflation_flag = true;
      // Low validation flags review, never an automatic rejection.
      review_required_flag = rapid_completion_flag || experience_inflation_flag || criticalMissed;
    }

    const now = new Date().toISOString();

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
    <h1 style="color:white;margin:0;font-size:22px;">Congratulations, ${firstName}!</h1>
  </div>
  <div style="background:#F8FAF8;padding:28px;border-radius:0 0 12px 12px;">
    <p style="font-size:16px;">Thank you for completing the pre-screening for the Transbill Digital Marketing &amp; Workforce Development Programme, delivered with funding support from Lagos Innovates | LSETF.</p>
    <p>Your result indicates that you may have the foundation and learning potential required for the two-week practical training.</p>
    <div style="background:#EBF5EB;border-radius:10px;padding:20px;margin:20px 0;text-align:center;">
      <p style="font-weight:bold;font-size:16px;color:#2D6A2F;margin:0 0 12px;">Next Step: Book Your Selection Interview</p>
      <p style="margin:0 0 16px;font-size:14px;color:#555555;">Please select an available interview time. Successful completion of this stage may lead to admission into the training programme.</p>
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
    <p style="line-height: 1.6;">Thank you for completing the Transbill Digital Marketing &amp; Workforce Development Programme pre-screening.</p>
    <p style="line-height: 1.6;">Your result did not meet the current threshold to progress to the next selection stage.</p>
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
      assessment_question_ids: questionIds,
      assessment_completed: true,
      assessment_completion_time: completionTime || null,
      assessment_completed_at: now,
      question_set_signature: questionIds.join(','),
      assessment_category_scores,
      assessment_category_maximums,
      screening_recommendation: screeningRecommendation,
      assessment_bank_version: attempt.version,
      assessment_question_count: questionIds.length,
      status,
      rapid_completion_flag,
      very_rapid_completion_flag,
      experience_inflation_flag,
      duplicate_signature_flag: false,
      review_required_flag,
      assessment_email_sent,
      assessment_email_sent_at,
      candidate_stage,
      common_core_score,
      common_core_max,
      digital_validation_score,
      digital_validation_max,
      sales_validation_score,
      sales_validation_max,
      learning_agility_score,
      learning_agility_max,
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