import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { verifyAdmin } from '../../shared/interviewSession.ts';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { token, applicant_id } = await req.json();

    const admin = await verifyAdmin(token);
    if (!admin) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (admin.role === 'read_only') {
      return Response.json({ error: 'Read-only users cannot refer applicants to live panel interviews.' }, { status: 403 });
    }
    if (!applicant_id) return Response.json({ error: 'applicant_id is required' }, { status: 400 });

    const applicant = await base44.asServiceRole.entities.Applicant.get(applicant_id);
    if (!applicant) return Response.json({ error: 'Applicant not found' }, { status: 404 });

    // Idempotent: if already referred, just return success (check BEFORE stage
    // gate — after the first referral the stage moves to 'Live Panel Referred'
    // which is not in the digital-stages list, so checking idempotency after the
    // stage gate would cause a false 400 on a duplicate referral request).
    if (applicant.interview_mode === 'live_panel' && applicant.live_panel_referred_at) {
      return Response.json({
        success: true,
        already_referred: true,
        message: 'Applicant already referred to live panel interview.',
      });
    }

    await base44.asServiceRole.entities.Applicant.updateMany({ id: applicant_id }, { $set: {
      interview_mode: 'live_panel',
      live_panel_referred_at: new Date().toISOString(),
      live_panel_referred_by: admin.email,
      candidate_stage: 'Live Panel Referred',
    } });

    return Response.json({
      success: true,
      message: 'Applicant referred to live panel interview. You can now schedule the panel interview.',
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});