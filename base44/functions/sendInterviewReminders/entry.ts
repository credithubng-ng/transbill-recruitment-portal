import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

function formatWATDateTime(iso) {
  return new Date(iso).toLocaleString('en-NG', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
    timeZone: 'Africa/Lagos'
  });
}

function formatWATTime(iso) {
  return new Date(iso).toLocaleString('en-NG', {
    hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Africa/Lagos'
  });
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const now = new Date();

    // --- 24-HOUR CANDIDATE REMINDERS ---
    const in24hStart = new Date(now.getTime() + 23 * 60 * 60 * 1000);
    const in24hEnd = new Date(now.getTime() + 25 * 60 * 60 * 1000);

    const bookedApplicants = await base44.asServiceRole.entities.Applicant.filter({ booking_used: true });

    let candidateRemindersSent = 0;
    let interviewerRemindersSent = 0;

    // Load interviewers once
    const interviewers = await base44.asServiceRole.entities.Interviewer.list();
    const interviewerMap = {};
    interviewers.forEach(iv => { interviewerMap[iv.id] = iv; });

    for (const applicant of bookedApplicants) {
      if (!applicant.interview_scheduled_at) continue;
      const interviewTime = new Date(applicant.interview_scheduled_at);

      // 24-hour candidate reminder
      if (interviewTime >= in24hStart && interviewTime < in24hEnd && applicant.email) {
        const watDateTime = formatWATDateTime(applicant.interview_scheduled_at);
        const watTime = formatWATTime(applicant.interview_scheduled_at);
        const meetLink = applicant.interview_meet_link || '#';

        const body = `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1A1A1A;">
  <div style="background:#3A7D3C;padding:24px;border-radius:12px 12px 0 0;text-align:center;">
    <h1 style="color:white;margin:0;font-size:20px;">Interview Tomorrow — Don't Forget!</h1>
  </div>
  <div style="background:#F8FAF8;padding:28px;border-radius:0 0 12px 12px;">
    <p style="font-size:16px;">Hello <strong>${applicant.full_name?.split(' ')[0] || 'Candidate'}</strong>,</p>
    <p>This is a reminder that your Transbill interview is <strong>tomorrow</strong>.</p>
    
    <div style="background:white;border:1.5px solid #E2E8E2;border-radius:10px;padding:20px;margin:20px 0;">
      <p style="margin:6px 0;"><strong>📅 Date &amp; Time:</strong> ${watDateTime}</p>
      <p style="margin:6px 0;"><strong>🎥 Format:</strong> Google Meet — 30 minutes</p>
    </div>

    <div style="text-align:center;margin:24px 0;">
      <a href="${meetLink}" style="background:#3A7D3C;color:white;padding:14px 32px;border-radius:30px;text-decoration:none;font-weight:bold;font-size:16px;display:inline-block;">
        Join Interview
      </a>
    </div>

    <div style="background:#EBF5EB;border-radius:10px;padding:16px;">
      <p style="font-weight:bold;margin:0 0 8px;color:#2D6A2F;">Preparation tips:</p>
      <ul style="margin:0;padding-left:20px;line-height:2;color:#2D6A2F;">
        <li>Test your camera and microphone beforehand</li>
        <li>Join 5 minutes early</li>
        <li>Ensure a stable internet connection</li>
        <li>Be in a quiet environment</li>
        <li>Dress professionally</li>
      </ul>
    </div>

    <p style="margin-top:20px;font-size:13px;color:#555555;">Need to reschedule? Contact <a href="mailto:recruitment@transbill.ng">recruitment@transbill.ng</a></p>
    <p style="font-size:13px;color:#7A7A8A;">Regards,<br><strong>Recruitment Team</strong><br>Transbill</p>
  </div>
</div>`;

        await base44.asServiceRole.integrations.Core.SendEmail({
          to: applicant.email,
          subject: `Reminder: Your Transbill Interview Tomorrow at ${watTime}`,
          body,
        }).catch(e => console.error('Candidate reminder failed:', e.message));
        candidateRemindersSent++;
      }

      // 1-hour interviewer reminder
      const in1hStart = new Date(now.getTime() + 55 * 60 * 1000);
      const in1hEnd = new Date(now.getTime() + 65 * 60 * 1000);

      if (interviewTime >= in1hStart && interviewTime < in1hEnd && applicant.interview_interviewer_id) {
        const iv = interviewerMap[applicant.interview_interviewer_id];
        if (iv?.email) {
          const watDateTime = formatWATDateTime(applicant.interview_scheduled_at);
          const meetLink = applicant.interview_meet_link || '#';
          const scorePercent = applicant.assessment_completed
            ? Math.round((applicant.assessment_score / 25) * 100) + '%'
            : 'N/A';
          const flags = [
            applicant.rapid_completion_flag && 'Rapid completion',
            applicant.experience_inflation_flag && 'Experience inflation',
            applicant.duplicate_signature_flag && 'Duplicate signature',
          ].filter(Boolean);

          const body = `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1A1A1A;">
  <div style="background:#1A1A2E;padding:24px;border-radius:12px 12px 0 0;">
    <h1 style="color:white;margin:0;font-size:20px;">Interview in 1 Hour — ${applicant.full_name}</h1>
  </div>
  <div style="background:#F8FAF8;padding:28px;border-radius:0 0 12px 12px;">
    <div style="background:white;border:1.5px solid #E2E8E2;border-radius:10px;padding:20px;margin-bottom:16px;">
      <p style="margin:5px 0;"><strong>Candidate:</strong> ${applicant.full_name}</p>
      <p style="margin:5px 0;"><strong>Time:</strong> ${watDateTime}</p>
      <p style="margin:5px 0;"><strong>Meet:</strong> <a href="${meetLink}">${meetLink}</a></p>
    </div>
    <div style="background:white;border:1.5px solid #E2E8E2;border-radius:10px;padding:20px;margin-bottom:16px;">
      <p style="margin:5px 0;"><strong>Score:</strong> ${scorePercent}</p>
      <p style="margin:5px 0;"><strong>Experience:</strong> ${applicant.years_experience || 'N/A'}</p>
      <p style="margin:5px 0;"><strong>Lagos:</strong> ${applicant.lagos_resident || 'N/A'}</p>
      <p style="margin:5px 0;"><strong>3MTT:</strong> ${applicant.is_3mtt || 'N/A'}</p>
      ${flags.length ? `<p style="margin:8px 0 0;color:#D32F2F;font-weight:bold;">⚠ Flags: ${flags.join(', ')}</p>` : ''}
    </div>
    <p style="font-size:13px;color:#7A7A8A;">Transbill Recruitment System</p>
  </div>
</div>`;

          await base44.asServiceRole.integrations.Core.SendEmail({
            to: iv.email,
            subject: `Interview in 1 Hour — ${applicant.full_name}`,
            body,
          }).catch(e => console.error('Interviewer reminder failed:', e.message));
          interviewerRemindersSent++;
        }
      }
    }

    return Response.json({ success: true, candidateRemindersSent, interviewerRemindersSent });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});