import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

function buildLetterHtml(name) {
  return `<div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; color: #1A1A1A;">
  <div style="background: #2D6A2F; padding: 24px 32px; border-radius: 12px 12px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 20px; font-weight: bold;">Progression to Final Selection Stage</h1>
    <p style="color: #c8e6c9; margin: 6px 0 0; font-size: 13px;">Digital Marketing &amp; Growth Associates Programme — Transbill Solutions Limited</p>
  </div>
  <div style="background: white; padding: 32px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
    <p>Dear <strong>${name}</strong>,</p>
    <p><strong>Congratulations.</strong></p>
    <p>Following the successful completion of your interview, we are pleased to inform you that you have been shortlisted and progressed to the final stage of our recruitment process for the position of <strong>Digital Marketing &amp; Growth Associate</strong> with <strong>Transbill Solutions Limited</strong>.</p>
    <p>This progression reflects the positive assessment of your application and interview performance. However, please note that this communication does not constitute a final employment offer.</p>
    <p>The next phase of the selection process is a compulsory <strong>Two-Week Hybrid Training Programme</strong> comprising both online and physical sessions in Lagos. The venue and commencement date will be communicated to all shortlisted candidates in due course.</p>
    <p><strong>The purpose of this training programme is to:</strong></p>
    <ul>
      <li>Equip candidates with the practical knowledge required for the role</li>
      <li>Assess competence, commitment, teamwork and performance</li>
      <li>Prepare successful candidates for immediate deployment upon engagement</li>
    </ul>
    <h3 style="margin-top: 24px; color: #2D6A2F;">Role Overview</h3>
    <p>Successful candidates will be responsible for supporting Transbill's nationwide business growth initiatives through the recruitment, activation, support and management of Affiliate Bankers operating across various markets and commercial clusters in Nigeria.</p>
    <h3 style="color: #2D6A2F;">Compensation</h3>
    <p>The proposed annual salary for successful candidates is <strong>&#8358;1,800,000 per annum</strong>, payable monthly, in addition to performance-based incentives and team production bonuses.</p>
    <h3 style="color: #2D6A2F;">Important Notice</h3>
    <p>Please note that:</p>
    <ul>
      <li>Participation in the Two-Week Hybrid Training Programme is mandatory.</li>
      <li>Only candidates who successfully complete and pass the training programme will be issued a Final Employment Offer Letter.</li>
      <li>Transbill Solutions Limited reserves the right to determine final selection based on training performance, conduct, attendance and overall suitability for the role.</li>
    </ul>
    <h3 style="color: #2D6A2F;">Information Required</h3>
    <p>To proceed to the next stage, kindly submit the following information <strong>within the next 72 hours</strong>:</p>
    <ol>
      <li>National Identification Number (NIN) for age verification and record purposes.</li>
      <li>Your 3MTT Fellow Number.</li>
    </ol>
    <p>If you do not yet have a 3MTT Fellow Number or have not registered with 3MTT, you may still continue with this process. We encourage you to begin your registration immediately using the link below:</p>
    <p><a href="https://3mtt.nitda.gov.ng" style="color: #2D6A2F; font-weight: bold;">Apply to 3MTT and generate your Fellow ID Number immediately &#8594;</a></p>
    <p>Kindly send the requested information by replying to this email.</p>
    <p>We appreciate your interest in joining Transbill Solutions Limited and look forward to your participation in the final stage of the selection process.</p>
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
          subject: 'Progression to Final Selection Stage — Transbill Solutions Limited',
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