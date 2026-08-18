import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { BANK_VERSION, QUESTION_BY_ID, selectAssessmentQuestions } from './screeningQuestionBank.ts';
import { getApplicantFromSession, getApplicationDeadline } from './applicantSession.ts';

const encoder = new TextEncoder();
const toBase64Url = (value: string) => btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const keys = ['A', 'B', 'C', 'D'];

async function sign(payload: string, secret: string) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const bytes = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  return Array.from(new Uint8Array(bytes)).map(byte => byte.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  try {
    const secret = Deno.env.get('ASSESSMENT_SIGNING_SECRET');
    if (!secret || secret.length < 32) return Response.json({ error: 'Assessment signing secret is not configured' }, { status: 500 });
    const base44 = createClientFromRequest(req);
    const { applicantId, applicantSessionToken } = await req.json();
    const deadline = await getApplicationDeadline(base44);
    if (deadline && Date.now() > deadline) return Response.json({ error: 'The call for applications has closed.' }, { status: 403 });
    let applicant = await getApplicantFromSession(base44, applicantId, applicantSessionToken);
    if (!applicant) {
      const user = await base44.auth.me().catch(() => null);
      const legacyApplicant = user ? await base44.asServiceRole.entities.Applicant.get(applicantId) : null;
      if (legacyApplicant?.email?.toLowerCase() === user?.email?.toLowerCase()) applicant = legacyApplicant;
    }
    if (!applicant) return Response.json({ error: 'Your session has expired. Request a new email code to continue.' }, { status: 401 });
    if (applicant.assessment_completed) return Response.json({ error: 'Assessment already completed' }, { status: 409 });

    // Infer a safe direct-sales experience default for legacy applicants without the field.
    const salesExperience = applicant.direct_sales_experience
      || (applicant.affiliate_experience === 'Yes' ? 'Less than 1 year' : 'No formal experience');
    const items = selectAssessmentQuestions(applicant.years_experience || 'No formal experience', salesExperience);

    const payload = toBase64Url(JSON.stringify({
      applicantId,
      version: BANK_VERSION,
      expiresAt: Date.now() + 45 * 60 * 1000,
      items,
    }));
    const signature = await sign(payload, secret);
    const questions = items.map(item => {
      const question = QUESTION_BY_ID.get(item.id)!;
      return {
        id: question.id,
        category: question.category,
        difficulty: question.difficulty,
        questionText: question.questionText,
        options: item.order.map((originalIndex, displayIndex) => ({
          key: keys[displayIndex],
          text: question.options[originalIndex].text,
        })),
      };
    });
    return Response.json({ attemptToken: `${payload}.${signature}`, questions, bankVersion: BANK_VERSION, durationSeconds: 1800 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});