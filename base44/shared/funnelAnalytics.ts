// Shared server-side funnel analytics module.
// Centralises canonical stage definitions, idempotent event emission,
// PII scrubbing, and Lagos-timezone helpers so that cards, charts, and
// drill-downs always agree on metric mappings.

// ─── Canonical stage definitions (single source of truth) ───────────────
export const FUNNEL_STAGES = [
  { key: 'landing_page_visit',  label: 'Landing Page Visits',  order: 1, identity: 'visitor_id' },
  { key: 'application_started',  label: 'Started Application',  order: 2, identity: 'applicant_id' },
  { key: 'assessment_started',  label: 'Started Assessment',   order: 3, identity: 'applicant_id' },
  { key: 'interview_ready',      label: 'Interview Ready',      order: 4, identity: 'applicant_id' },
  { key: 'interview_booked',    label: 'Interview Booked',     order: 5, identity: 'applicant_id' },
  { key: 'interview_completed', label: 'Interview Completed',  order: 6, identity: 'applicant_id' },
  { key: 'training_invited',    label: 'Invited for Training', order: 7, identity: 'applicant_id' },
] as const;

export const STAGE_DEFINITIONS: Record<string, string> = {
  landing_page_visit:  'Unique first-party visitor IDs that viewed the landing page within the selected period.',
  application_started: 'Unique application/applicant identity whose first application draft or application-start event occurred.',
  assessment_started:  'Unique applicant whose assessment session was started.',
  interview_ready:     'Unique applicant who became eligible/shortlisted for the Structured Digital Interview.',
  interview_booked:    'Unique applicant with a confirmed structured_digital booking.',
  interview_completed: 'Unique applicant with a submitted/completed Structured Digital Interview session/result.',
  training_invited:    'Unique applicant for whom the training invitation/progression letter was successfully issued.',
};

// Privileged stages — public clients may NEVER emit these.
export const PRIVILEGED_STAGES = new Set([
  'assessment_started', 'interview_ready', 'interview_booked',
  'interview_completed', 'training_invited',
]);
export const PUBLIC_STAGES = new Set(['landing_page_visit', 'application_started']);

// ─── Lagos timezone helpers (UTC+1, no DST) ──────────────────────────────
const LAGOS_OFFSET_MS = 60 * 60 * 1000;

/** Returns the current Lagos date as YYYY-MM-DD. */
export function lagosToday(): string {
  return new Date(Date.now() + LAGOS_OFFSET_MS).toISOString().slice(0, 10);
}

/** Converts a UTC ISO timestamp to a Lagos date string (YYYY-MM-DD). */
export function utcToLagosDate(isoStr: string): string {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  if (isNaN(d.getTime())) return '';
  return new Date(d.getTime() + LAGOS_OFFSET_MS).toISOString().slice(0, 10);
}

/**
 * Converts a Lagos date range to UTC ISO strings for filtering.
 * A Lagos day runs 00:00–23:59:59 Lagos time (= 23:00 prev-day UTC to 22:59:59 same-day UTC).
 */
export function lagosDateRangeToUtc(startLagos: string, endLagos: string): { startUtc: string; endUtc: string } {
  const startUtc = new Date(`${startLagos}T00:00:00+01:00`).toISOString();
  const endUtc = new Date(`${endLagos}T23:59:59.999+01:00`).toISOString();
  return { startUtc, endUtc };
}

/** Computes the Lagos date range for a preset. */
export function getLagosDateRange(
  preset: string,
  customFrom?: string,
  customTo?: string,
): { startUtc: string; endUtc: string; startLagos: string; endLagos: string } {
  const today = lagosToday();
  let startLagos: string, endLagos: string;

  switch (preset) {
    case 'today':
      startLagos = today; endLagos = today; break;
    case '7days': {
      const d = new Date(Date.now() + LAGOS_OFFSET_MS - 7 * 24 * 60 * 60 * 1000);
      startLagos = d.toISOString().slice(0, 10); endLagos = today; break;
    }
    case '30days': {
      const d = new Date(Date.now() + LAGOS_OFFSET_MS - 30 * 24 * 60 * 60 * 1000);
      startLagos = d.toISOString().slice(0, 10); endLagos = today; break;
    }
    case 'all':
      startLagos = '2020-01-01'; endLagos = today; break;
    case 'custom':
      startLagos = customFrom || '2020-01-01'; endLagos = customTo || today; break;
    default:
      startLagos = today; endLagos = today;
  }

  const { startUtc, endUtc } = lagosDateRangeToUtc(startLagos, endLagos);
  return { startUtc, endUtc, startLagos, endLagos };
}

// ─── PII scrubbing ──────────────────────────────────────────────────────
const PII_PATTERNS = [
  'email', 'phone', 'name', 'full_name', 'lasrra', 'ip', 'otp', 'token',
  'password', 'secret', 'answer', 'audio', 'transcript', 'address', 'dob',
  'date_of_birth', 'nin',
];

/** Removes any key whose name matches a PII pattern. */
export function scrubMetadata(metadata: any): Record<string, any> {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) return {};
  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(metadata)) {
    const lower = key.toLowerCase();
    if (PII_PATTERNS.some(p => lower.includes(p))) continue;
    if (typeof value === 'string' && value.length > 500) continue; // reject oversized values
    clean[key] = value;
  }
  return clean;
}

// ─── Deterministic dedupe key ────────────────────────────────────────────
export function makeDedupeKey(
  event_type: string,
  ids: { visitor_id?: string; session_id?: string; applicant_id?: string },
): string {
  const a = ids.applicant_id || '';
  switch (event_type) {
    case 'landing_page_visit':  return `lpv:${ids.visitor_id || ''}:${ids.session_id || ''}`;
    case 'application_started':  return `as:${a}`;
    case 'assessment_started':  return `asm:${a}`;
    case 'interview_ready':     return `ir:${a}`;
    case 'interview_booked':    return `ib:${a}`;
    case 'interview_completed': return `ic:${a}`;
    case 'training_invited':    return `ti:${a}`;
    default:                    return `${event_type}:${a || ids.visitor_id || ''}`;
  }
}

// ─── Idempotent event emission ──────────────────────────────────────────
export async function emitFunnelEvent(base44: any, params: {
  event_type: string;
  occurred_at?: string;
  visitor_id?: string;
  session_id?: string;
  application_id?: string;
  applicant_id?: string;
  source?: string;
  medium?: string;
  campaign?: string;
  metadata?: Record<string, any>;
  is_backfilled?: boolean;
}): Promise<{ event: any; duplicate: boolean }> {
  const dedupe_key = makeDedupeKey(params.event_type, {
    visitor_id: params.visitor_id,
    session_id: params.session_id,
    applicant_id: params.applicant_id || params.application_id,
  });

  // Idempotent: check for existing event with the same dedupe key.
  const existing = await base44.asServiceRole.entities.FunnelEvent.filter(
    { dedupe_key },
    '-created_date',
    1,
  );
  if (existing && existing.length > 0) {
    return { event: existing[0], duplicate: true };
  }

  const event = await base44.asServiceRole.entities.FunnelEvent.create({
    event_type: params.event_type,
    occurred_at: params.occurred_at || new Date().toISOString(),
    visitor_id: params.visitor_id || null,
    session_id: params.session_id || null,
    application_id: params.application_id || null,
    applicant_id: params.applicant_id || null,
    source: params.source || null,
    medium: params.medium || null,
    campaign: params.campaign || null,
    metadata: scrubMetadata(params.metadata || {}),
    dedupe_key,
    is_backfilled: params.is_backfilled || false,
  });

  return { event, duplicate: false };
}