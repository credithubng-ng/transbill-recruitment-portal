import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { emitFunnelEvent, makeDedupeKey } from '../../shared/funnelAnalytics.ts';

// Public endpoint: records a landing-page visit once per random first-party
// visitor/session. No fingerprinting, no IP storage, no PII. Server-validated
// and rate-limited to prevent event inflation.

const VISITOR_ID_RE = /^[A-Za-z0-9_-]{8,100}$/;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { visitor_id, session_id, source, medium, campaign } = await req.json();

    // ── Server validation ──
    if (!visitor_id || !VISITOR_ID_RE.test(visitor_id)) {
      return Response.json({ error: 'Invalid visitor ID.' }, { status: 400 });
    }
    if (!session_id || !VISITOR_ID_RE.test(session_id)) {
      return Response.json({ error: 'Invalid session ID.' }, { status: 400 });
    }

    // ── Rate limiting: max 10 landing events per visitor_id per hour ──
    const recent = await base44.asServiceRole.entities.FunnelEvent.filter(
      { visitor_id, event_type: 'landing_page_visit' },
      '-occurred_at',
      10,
    );
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    const recentInLastHour = recent.filter(
      (e: any) => new Date(e.occurred_at).getTime() > oneHourAgo,
    );
    if (recentInLastHour.length >= 10) {
      return Response.json({ error: 'Rate limit exceeded.' }, { status: 429 });
    }

    // ── Idempotent emission (dedupes by visitor_id + session_id) ──
    const dedupe_key = makeDedupeKey('landing_page_visit', { visitor_id, session_id });
    const existing = await base44.asServiceRole.entities.FunnelEvent.filter(
      { dedupe_key },
      '-created_date',
      1,
    );
    if (existing && existing.length > 0) {
      return Response.json({ success: true, duplicate: true });
    }

    await base44.asServiceRole.entities.FunnelEvent.create({
      event_type: 'landing_page_visit',
      occurred_at: new Date().toISOString(),
      visitor_id,
      session_id,
      source: typeof source === 'string' ? source.slice(0, 200) : null,
      medium: typeof medium === 'string' ? medium.slice(0, 100) : null,
      campaign: typeof campaign === 'string' ? campaign.slice(0, 200) : null,
      metadata: {},
      dedupe_key,
      is_backfilled: false,
    });

    return Response.json({ success: true, duplicate: false });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});