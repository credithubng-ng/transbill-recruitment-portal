import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { verifyAdmin } from '../../shared/interviewSession.ts';
import { emitFunnelEvent } from '../../shared/funnelAnalytics.ts';

// Owner-only idempotent backfill: creates FunnelEvent records for stages 2–7
// from existing authoritative timestamps/statuses. Does NOT change any workflow
// records. Does NOT invent landing-page visits. Supports dry_run mode.

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { token, dry_run } = await req.json();

    const admin = await verifyAdmin(token);
    if (!admin) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (admin.role !== 'owner') {
      return Response.json({ error: 'Only owners may run the backfill.' }, { status: 403 });
    }

    const isDryRun = dry_run === true;

    // Fetch all applicants and related entities
    const applicants = await base44.asServiceRole.entities.Applicant.list('-created_date', 10000);
    const bookings = await base44.asServiceRole.entities.InterviewBooking.list('-created_date', 10000);
    const sessions = await base44.asServiceRole.entities.InterviewSession.list('-created_date', 10000);

    const projected: Record<string, number> = {
      application_started: 0,
      assessment_started: 0,
      interview_ready: 0,
      interview_booked: 0,
      interview_completed: 0,
      training_invited: 0,
    };
    const created: Record<string, number> = { ...projected };

    // ── Stage 2: application_started (every applicant) ──
    for (const a of applicants) {
      const occurredAt = a.created_date || new Date().toISOString();
      projected.application_started++;
      if (!isDryRun) {
        const { duplicate } = await emitFunnelEvent(base44, {
          event_type: 'application_started',
          applicant_id: a.id,
          source: a.referral_source || undefined,
          occurred_at: occurredAt,
          is_backfilled: true,
        });
        if (!duplicate) created.application_started++;
      }
    }

    // ── Stage 3: assessment_started (every applicant with candidate_stage >= Assessment Started) ──
    // All applicants start at 'Assessment Started', so this is all applicants.
    // Use created_date as the closest authoritative timestamp.
    for (const a of applicants) {
      if (!a.candidate_stage || a.candidate_stage === 'Applied') continue;
      const occurredAt = a.created_date || new Date().toISOString();
      projected.assessment_started++;
      if (!isDryRun) {
        const { duplicate } = await emitFunnelEvent(base44, {
          event_type: 'assessment_started',
          applicant_id: a.id,
          occurred_at: occurredAt,
          is_backfilled: true,
        });
        if (!duplicate) created.assessment_started++;
      }
    }

    // ── Stage 4: interview_ready (applicants with ai_interview_shortlisted_at) ──
    for (const a of applicants) {
      if (!a.ai_interview_shortlisted_at) continue;
      projected.interview_ready++;
      if (!isDryRun) {
        const { duplicate } = await emitFunnelEvent(base44, {
          event_type: 'interview_ready',
          applicant_id: a.id,
          occurred_at: a.ai_interview_shortlisted_at,
          is_backfilled: true,
        });
        if (!duplicate) created.interview_ready++;
      }
    }

    // ── Stage 5: interview_booked (structured_digital bookings with status=booked) ──
    const digitalBookings = bookings.filter(
      (b: any) => b.interview_mode === 'structured_digital' && b.status === 'booked'
    );
    for (const b of digitalBookings) {
      if (!b.applicant_id) continue;
      projected.interview_booked++;
      if (!isDryRun) {
        const { duplicate } = await emitFunnelEvent(base44, {
          event_type: 'interview_booked',
          applicant_id: b.applicant_id,
          occurred_at: b.created_date || new Date().toISOString(),
          is_backfilled: true,
        });
        if (!duplicate) created.interview_booked++;
      }
    }

    // ── Stage 6: interview_completed (sessions with status=completed) ──
    const completedSessions = sessions.filter((s: any) => s.status === 'completed');
    for (const s of completedSessions) {
      if (!s.applicant_id) continue;
      projected.interview_completed++;
      if (!isDryRun) {
        const { duplicate } = await emitFunnelEvent(base44, {
          event_type: 'interview_completed',
          applicant_id: s.applicant_id,
          occurred_at: s.completed_at || s.created_date || new Date().toISOString(),
          is_backfilled: true,
        });
        if (!duplicate) created.interview_completed++;
      }
    }

    // ── Stage 7: training_invited (applicants with progression_letter_sent=true) ──
    for (const a of applicants) {
      if (!a.progression_letter_sent || !a.progression_letter_sent_at) continue;
      projected.training_invited++;
      if (!isDryRun) {
        const { duplicate } = await emitFunnelEvent(base44, {
          event_type: 'training_invited',
          applicant_id: a.id,
          occurred_at: a.progression_letter_sent_at,
          is_backfilled: true,
        });
        if (!duplicate) created.training_invited++;
      }
    }

    const totalProjected = Object.values(projected).reduce((s, n) => s + n, 0);
    const totalCreated = Object.values(created).reduce((s, n) => s + n, 0);

    return Response.json({
      success: true,
      dry_run: isDryRun,
      projected,
      created: isDryRun ? null : created,
      totalProjected,
      totalCreated: isDryRun ? null : totalCreated,
      lastBackfillAt: isDryRun ? null : new Date().toISOString(),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});