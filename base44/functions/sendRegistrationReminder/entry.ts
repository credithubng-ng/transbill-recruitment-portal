import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { verifyAdmin } from '../../shared/interviewSession.ts';

const APP_DOMAIN = Deno.env.get('APP_DOMAIN') || 'https://jobs.transbill.ng';

async function getApplicationDeadline(base44) {
  const settings = await base44.asServiceRole.entities.AppSettings.filter({ settings_id: 'main' });
  const value = settings?.[0]?.application_closes_at;
  const timestamp = value ? new Date(value).getTime() : null;
  return Number.isFinite(timestamp) ? timestamp : null;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { token } = await req.json();
    const admin = await verifyAdmin(token);
    if (!admin) {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }
    if (admin.role === 'read_only') {
      return Response.json({ error: 'Read-only users cannot send reminders.' }, { status: 403 });
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