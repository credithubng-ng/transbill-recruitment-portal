import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { BANK_VERSION, QUESTION_BY_ID } from '../_shared/screeningQuestionBank.ts';

const APP_DOMAIN = Deno.env.get('APP_DOMAIN') || 'https://your-app-domain';
const SUCCESS_EMAIL_SUBJECT = 'Pre-screening Successful – Transbill Digital Marketing Programme';
const FAIL_EMAIL_SUBJECT = 'Your Transbill Programme Application';
const encoder = new TextEncoder();
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
  if (attempt.expiresAt < Date.now() || attempt.version !== BANK_VERSION) return null;
  return attempt;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { applicantId, finalAnswers, attemptToken, completionTime } = await req.json();

    if (!applicantId) {
      return Response.json({ error: 'applicantId is required' }, { status: 400 });
    }

    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const attempt = await verifyAttempt(attemptToken, Deno.env.get('ASSESSMENT_SIGNING_SECRET') || '');
    if (!attempt || attempt.applicantId !== applicantId) return Response.json({ error: 'Invalid or expired assessment attempt' }, { status: 403 });
    const questionIds = attempt.items.map(item => item.id);
    if (!Array.isArray(finalAnswers) || finalAnswers.length !== questionIds.length) return Response.json({ error: 'A complete assessment submission is required' }, { status: 400 });

    // Thresholds are loaded server-side and can never be overridden by an applicant.
    const settings = await base44.asServiceRole.entities.AppSettings.list();
    const thresholds = settings?.[0] || {};
    const interviewReadyMin = thresholds.interview_ready_min ?? 20;
    const reserveListMin = thresholds.reserve_list_min ?? 15;
    const rapidMinutes = thresholds.rapid_minutes ?? 7;
    const veryRapidMinutes = thresholds.very_rapid_minutes ?? 4;

    let score = 0;
    const correctness = [];
    questionIds.forEach((id, index) => {
      const question = QUESTION_BY_ID.get(id);
      const correctOriginalIndex = question.options.findIndex(option => option.key === question.correctAnswer);
      const correctDisplayIndex = attempt.items[index].order.indexOf(correctOriginalIndex);
      const isCorrect = finalAnswers[index] === ['A', 'B', 'C', 'D'][correctDisplayIndex];
      correctness.push(isCorrect);
      if (isCorrect) score++;
    });

    let status = 'Not Progressed';

    // Fetch applicant for email/name
    const applicant = await base44.asServiceRole.entities.Applicant.get(applicantId);
    if (!applicant) return Response.json({ error: 'Applicant not found' }, { status: 404 });
    if (applicant.email?.toLowerCase() !== user.email?.toLowerCase()) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (applicant.lagos_resident !== 'Yes') {
      return Response.json({ error: 'This programme is open to Lagos residents only' }, { status: 403 });
    }

    // Block re-submission if already completed
    if (applicant.assessment_completed === true) {
      return Response.json({ error: 'Assessment already completed' }, { status: 409 });
    }

    const firstName = applicant?.full_name?.split(' ')[0] || 'Candidate';
    const email = applicant?.email;

    // Risk flags
    const rapid_completion_flag = completionTime !== undefined && completionTime < rapidMinutes * 60;
    const very_rapid_completion_flag = completionTime !== undefined && completionTime < veryRapidMinutes * 60;
    const categoryScores = {};
    const categoryMaximums = {};
    questionIds.forEach((id, index) => {
      const category = QUESTION_BY_ID.get(id).category;
      categoryMaximums[category] = (categoryMaximums[category] || 0) + 1;
      categoryScores[category] = (categoryScores[category] || 0) + (correctness[index] ? 1 : 0);
    });
    const pct = (category: string) => Math.round(((categoryScores[category] || 0) / (categoryMaximums[category] || 1)) * 100);
    let screeningRecommendation = 'Not currently suitable';
    if (score >= interviewReadyMin && pct('learnability') >= 67 && pct('affiliate') >= 50) screeningRecommendation = 'Ready for training';
    else if (score >= reserveListMin && pct('learnability') >= 67) screeningRecommendation = 'High potential – foundational support needed';
    else if (score >= reserveListMin || pct('learnability') >= 83) screeningRecommendation = 'Manual review';
    if (screeningRecommendation === 'Ready for training') status = 'Interview Ready';
    else if (screeningRecommendation === 'High potential – foundational support needed' || screeningRecommendation === 'Manual review') status = 'Reserve List';
    else status = 'Not Progressed';
    const review_required_flag = rapid_completion_flag;

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
	      assessment_question_ids: questionIds,
      assessment_completed: true,
      assessment_completion_time: completionTime || null,
      assessment_completed_at: now,
	      question_set_signature: questionIds.join(','),
	      assessment_category_scores: categoryScores,
	      assessment_category_maximums: categoryMaximums,
	      screening_recommendation: screeningRecommendation,
	      assessment_bank_version: BANK_VERSION,
	      assessment_question_count: questionIds.length,
      status,
      rapid_completion_flag,
      very_rapid_completion_flag,
	      experience_inflation_flag: false,
	      duplicate_signature_flag: false,
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
