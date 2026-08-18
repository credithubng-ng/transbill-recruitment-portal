import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

function buildLetterHtml(name) {
  return `<div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; color: #1A1A1A;">
  <div style="background: #2D6A2F; padding: 24px 32px; border-radius: 12px 12px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 20px; font-weight: bold;">Admission to the Training Stage</h1>
    <p style="color: #c8e6c9; margin: 6px 0 0; font-size: 13px;">Digital Marketing &amp; Workforce Development Programme</p>
  </div>
  <div style="background: white; padding: 32px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
    <p>Dear <strong>${name}</strong>,</p>
    <p><strong>Congratulations.</strong></p>
    <p>Following your application, pre-screening and interview, we are pleased to offer you a place in the training stage of the <strong>Digital Marketing &amp; Workforce Development Programme</strong>, delivered by Transbill Solutions Limited with funding support from Lagos Innovates | LSETF.</p>
    <p>This is a training admission and does not constitute an employment offer.</p>
    <p>The next phase is a compulsory <strong>two-week practical training programme</strong> in Lagos. The venue, delivery format and commencement date will be communicated separately.</p>
    <p><strong>The purpose of this training programme is to:</strong></p>
    <ul>
      <li>Equip candidates with the practical knowledge required for the role</li>
      <li>Assess competence, commitment, teamwork and performance</li>
      <li>Prepare successful participants for potential employment with Transbill</li>
    </ul>
    <h3 style="margin-top: 24px; color: #2D6A2F;">Employment Pathway</h3>
    <p>Only participants who successfully complete the programme and meet Transbill's employment selection requirements will be offered employment by Transbill to recruit, activate, support and manage Affiliate Bankers for the FirstBank SME Account Acquisition Project.</p>
    <h3 style="color: #2D6A2F;">Important Notice</h3>
    <p>Please note that:</p>
    <ul>
      <li>Participation in the Two-Week Hybrid Training Programme is mandatory.</li>
      <li>You must present your original LASRRA card, LASRRA printout or another approved proof of Lagos residency before training begins on Day 1.</li>
      <li>Training participation does not guarantee employment.</li>
      <li>Transbill will determine any employment selection based on training performance, conduct, attendance, business need and overall suitability.</li>
      <li>Successful candidates will be employed by Transbill Solutions Limited, not Lagos Innovates, LSETF or FirstBank.</li>
    </ul>
    <p>Please reply to this email to confirm your availability when the programme schedule is communicated.</p>
    <p>We look forward to your participation in the training programme.</p>
    <p style="margin-top: 32px; border-top: 1px solid #e5e7eb; padding-top: 20px;">Yours sincerely,<br/><br/><strong>For: Transbill Solutions Limited</strong><br/>Human Resources Team</p>
  </div>
</div>`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { applicantId } = await req.json();

    let candidates;
    if (applicantId) {
      const applicant = await base44.asServiceRole.entities.Applicant.get(applicantId);
      candidates = applicant ? [applicant] : [];
    } else {
      // Bulk: all Pass candidates
      const all = await base44.asServiceRole.entities.Applicant.filter({ interview_outcome: 'Pass' }, '-created_date', 500);
      // Only those who haven't received the letter yet
      candidates = all.filter(a => !a.progression_letter_sent);
    }

    let sent = 0;
    let failed = 0;
    const now = new Date().toISOString();

    for (const applicant of candidates) {
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: applicant.email,
          subject: 'Admission to the Training Stage — Transbill Programme',
          body: buildLetterHtml(applicant.full_name)
        });
        await base44.asServiceRole.entities.Applicant.update(applicant.id, {
          progression_letter_sent: true,
          progression_letter_sent_at: now
        });
        sent++;
      } catch (e) {
        failed++;
      }
    }

    return Response.json({ success: true, sent, failed, total: candidates.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
