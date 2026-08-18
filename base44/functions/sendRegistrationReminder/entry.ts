import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { getApplicationDeadline } from '../_shared/applicantSession.ts';

const APP_DOMAIN = Deno.env.get('APP_DOMAIN') || 'https://jobs.transbill.ng';

async function hmac(data: string, secret: string) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
  return Array.from(new Uint8Array(signature)).map(byte => byte.toString(16).padStart(2, '0')).join('');
}

async function validAdminToken(token: string, secret: string) {
  if (!token || !secret) return false;
  const separator = token.lastIndexOf('.');
  if (separator < 1) return false;
  const payload = token.substring(0, separator);
  const expiresAt = Number(payload.split(':')[1]);
  return expiresAt > Date.now() && token.substring(separator + 1) === await hmac(payload, secret);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { token } = await req.json();
    if (!await validAdminToken(token, Deno.env.get('ADMIN_PASSWORD') || '')) {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const deadline = await getApplicationDeadline(base44);
    if (deadline && Date.now() > deadline) {
      return Response.json({ error: 'The call for applications has closed. No reminders were sent.' }, { status: 409 });
    }

    const candidates = await base44.asServiceRole.entities.Applicant.filter({ assessment_completed: false });
    const reminderCutoff = Date.now() - 24 * 60 * 60 * 1000;
    let sent = 0;

    for (const candidate of candidates) {
      if (candidate.candidate_stage !== 'Assessment Started' || !candidate.email) continue;
      const lastReminder = candidate.registration_reminder_sent_at
        ? new Date(candidate.registration_reminder_sent_at).getTime()
        : 0;
      if (lastReminder && lastReminder > reminderCutoff) continue;

      const firstName = candidate.full_name?.split(' ')[0] || 'Applicant';
      const deadlineText = deadline
        ? new Date(deadline).toLocaleString('en-NG', { dateStyle: 'long', timeStyle: 'short', timeZone: 'Africa/Lagos' })
        : 'the published application deadline';
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: candidate.email,
          from_name: 'Transbill Programme Team',
          subject: 'Reminder: Complete your Transbill application assessment',
          body: `Hello ${firstName},\n\nYour registration details were received, but your pre-screening assessment is not yet complete.\n\nContinue here: ${APP_DOMAIN}/login\n\nEnter the same email address and we will send you a one-time login code. Please complete the assessment before ${deadlineText}.\n\nTransbill Programme Team`,
        });
        await base44.asServiceRole.entities.Applicant.update(candidate.id, {
          registration_reminder_sent_at: new Date().toISOString(),
          registration_reminder_count: (candidate.registration_reminder_count || 0) + 1,
        });
        sent++;
      } catch (emailError) {
        console.error(`Reminder failed for ${candidate.id}:`, emailError.message);
      }
    }

    return Response.json({ success: true, reminders_sent: sent, incomplete_candidates: candidates.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
