import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { verifyAdmin } from '../../shared/interviewSession.ts';
import {
  FUNNEL_STAGES, STAGE_DEFINITIONS, getLagosDateRange, utcToLagosDate,
} from '../../shared/funnelAnalytics.ts';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { token, preset, custom_from, custom_to, mode, drilldown_stage, drilldown_page, drilldown_limit } = await req.json();

    const admin = await verifyAdmin(token);
    if (!admin) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    // owner, admin, read_only may all view the dashboard.

    const { startUtc, endUtc, startLagos, endLagos } = getLagosDateRange(preset || '30days', custom_from, custom_to);
    const aggMode = mode === 'events' ? 'events' : 'cohort';
    const now = new Date().toISOString();

    // ── Fetch all funnel events (up to 50k) ──
    const allEvents = await base44.asServiceRole.entities.FunnelEvent.list('-occurred_at', 50000);

    // ── Fetch all applicants for drill-down joins ──
    const allApplicants = await base44.asServiceRole.entities.Applicant.list('-created_date', 10000);
    const applicantMap = new Map(allApplicants.map(a => [a.id, a]));

    // ── Date-range filter helper ──
    const startTime = new Date(startUtc).getTime();
    const endTime = new Date(endUtc).getTime();
    const inRange = (e: any) => {
      const t = new Date(e.occurred_at).getTime();
      return t >= startTime && t <= endTime;
    };

    // ── Build aggregates ──
    const stageCounts: Record<string, number> = {};
    const stagePersonIds: Record<string, Set<string>> = {};

    if (aggMode === 'cohort') {
      // Cohort: applicants whose application_started occurred in the period.
      // Then count their progression through all later stages (at any time).
      const appStartedInRange = allEvents.filter(e => e.event_type === 'application_started' && inRange(e));
      const cohortApplicantIds = new Set(appStartedInRange.map(e => e.applicant_id).filter(Boolean));

      // Landing visits in the period (separate cohort, not applicant-linked).
      const landingInRange = allEvents.filter(e => e.event_type === 'landing_page_visit' && inRange(e));
      const landingVisitorIds = new Set(landingInRange.map(e => e.visitor_id).filter(Boolean));

      stageCounts['landing_page_visit'] = landingVisitorIds.size;
      stagePersonIds['landing_page_visit'] = landingVisitorIds;

      // For stages 2-7: count cohort members who have each event (at any time).
      for (const stage of FUNNEL_STAGES) {
        if (stage.key === 'landing_page_visit') continue;
        const stageEvents = allEvents.filter(e => e.event_type === stage.key);
        const personIds = new Set(stageEvents.map(e => e.applicant_id).filter(Boolean));
        const cohortMembers = new Set([...personIds].filter(id => cohortApplicantIds.has(id)));
        stageCounts[stage.key] = cohortMembers.size;
        stagePersonIds[stage.key] = cohortMembers;
      }
    } else {
      // Events-in-period: count unique people with each event type in the period.
      for (const stage of FUNNEL_STAGES) {
        const stageEvents = allEvents.filter(e => e.event_type === stage.key && inRange(e));
        if (stage.identity === 'visitor_id') {
          const ids = new Set(stageEvents.map(e => e.visitor_id).filter(Boolean));
          stageCounts[stage.key] = ids.size;
          stagePersonIds[stage.key] = ids;
        } else {
          const ids = new Set(stageEvents.map(e => e.applicant_id).filter(Boolean));
          stageCounts[stage.key] = ids.size;
          stagePersonIds[stage.key] = ids;
        }
      }
    }

    // ── Build aggregate array with conversions ──
    const aggregates = FUNNEL_STAGES.map((stage, i) => {
      const count = stageCounts[stage.key] || 0;
      const prevCount = i > 0 ? (stageCounts[FUNNEL_STAGES[i - 1].key] || 0) : 0;
      const landingCount = stageCounts['landing_page_visit'] || 0;

      const conversionFromPrevious = i > 0 && prevCount > 0
        ? Math.min(100, Math.round((count / prevCount) * 1000) / 10)
        : (i === 0 ? 100 : 0);
      const conversionFromLanding = landingCount > 0
        ? Math.min(100, Math.round((count / landingCount) * 1000) / 10)
        : (stage.key === 'landing_page_visit' ? 100 : 0);
      const dropOff = i > 0 ? Math.max(0, prevCount - count) : 0;
      const dropOffRate = i > 0 && prevCount > 0
        ? Math.round((dropOff / prevCount) * 1000) / 10
        : 0;

      return {
        stage: stage.key,
        label: stage.label,
        order: stage.order,
        count,
        conversionFromPrevious,
        conversionFromLanding,
        dropOff,
        dropOffRate,
      };
    });

    // ── Time series: daily counts per stage ──
    const timeSeriesMap: Record<string, Record<string, number>> = {};
    const eventsInRange = allEvents.filter(inRange);
    for (const e of eventsInRange) {
      const lagosDate = utcToLagosDate(e.occurred_at);
      if (!lagosDate) continue;
      if (!timeSeriesMap[lagosDate]) timeSeriesMap[lagosDate] = {};
      const stage = e.event_type;
      timeSeriesMap[lagosDate][stage] = (timeSeriesMap[lagosDate][stage] || 0) + 1;
    }

    // Build complete date range
    const timeSeries: Array<Record<string, any>> = [];
    const cursor = new Date(startLagos + 'T00:00:00Z');
    const endCursor = new Date(endLagos + 'T00:00:00Z');
    while (cursor <= endCursor) {
      const dateStr = cursor.toISOString().slice(0, 10);
      const dayData: Record<string, any> = { date: dateStr };
      for (const stage of FUNNEL_STAGES) {
        dayData[stage.key] = timeSeriesMap[dateStr]?.[stage.key] || 0;
      }
      timeSeries.push(dayData);
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }

    // ── Data quality ──
    const allLandingEvents = allEvents.filter(e => e.event_type === 'landing_page_visit');
    const earliestVisitDate = allLandingEvents.length > 0
      ? allLandingEvents.map(e => e.occurred_at).sort()[0]
      : null;

    const backfilledEvents = allEvents.filter(e => e.is_backfilled).length;
    const allDedupeKeys = allEvents.map(e => e.dedupe_key);
    const uniqueDedupeKeys = new Set(allDedupeKeys).size;
    const duplicatesSuppressed = allDedupeKeys.length - uniqueDedupeKeys;

    // Unattributed applicants: applicants with application_started but no linked landing visit
    const appStartedEvents = allEvents.filter(e => e.event_type === 'application_started');
    const appStartedVisitorIds = new Set(appStartedEvents.map(e => e.visitor_id).filter(Boolean));
    const landingVisitorIds = new Set(allLandingEvents.map(e => e.visitor_id).filter(Boolean));
    const attributedVisitorIds = [...appStartedVisitorIds].filter(v => landingVisitorIds.has(v));
    const unattributedApplicants = appStartedEvents.length - attributedVisitorIds.length;

    // Last backfill time
    const backfilledCreated = allEvents.filter(e => e.is_backfilled).map(e => e.created_date).sort();
    const lastBackfillAt = backfilledCreated.length > 0 ? backfilledCreated[backfilledCreated.length - 1] : null;

    const dataQuality = {
      unattributedApplicants: Math.max(0, unattributedApplicants),
      backfilledEvents,
      earliestVisitDate: earliestVisitDate ? utcToLagosDate(earliestVisitDate) : null,
      duplicatesSuppressed,
      lastBackfillAt,
      totalEvents: allEvents.length,
      trackingNote: earliestVisitDate
        ? `Tracking began ${utcToLagosDate(earliestVisitDate)}`
        : 'Landing-page tracking has not yet recorded any visits.',
    };

    // ── Drill-down (paginated) ──
    let drilldown: any = null;
    if (drilldown_stage) {
      const page = Math.max(0, Number(drilldown_page) || 0);
      const limit = Math.min(200, Math.max(10, Number(drilldown_limit) || 50));
      const personIds = stagePersonIds[drilldown_stage] || new Set<string>();
      const idList = [...personIds];

      const pageStart = page * limit;
      const pageIds = idList.slice(pageStart, pageStart + limit);

      let records: any[] = [];
      if (drilldown_stage === 'landing_page_visit') {
        // Anonymous: visitor_id, time, source only — no PII
        const landingEvents = allEvents.filter(e =>
          e.event_type === 'landing_page_visit' && personIds.has(e.visitor_id)
        ).sort((a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime());
        const pageEvents = landingEvents.slice(pageStart, pageStart + limit);
        records = pageEvents.map(e => ({
          visitor_id: e.visitor_id,
          occurred_at: e.occurred_at,
          source: e.source || '',
          medium: e.medium || '',
          campaign: e.campaign || '',
        }));
      } else {
        // Applicant stages: permitted summary only
        records = pageIds.map(id => {
          const a = applicantMap.get(id);
          if (!a) return { applicant_id: id, occurred_at: null };
          const stageEvent = allEvents.filter(e =>
            e.event_type === drilldown_stage && e.applicant_id === id
          ).sort((x, y) => new Date(x.occurred_at).getTime() - new Date(y.occurred_at).getTime())[0];
          return {
            applicant_id: id,
            full_name: a.full_name,
            email: a.email,
            candidate_stage: a.candidate_stage,
            assessment_completed: a.assessment_completed,
            assessment_score: a.assessment_score,
            interview_outcome: a.interview_outcome,
            occurred_at: stageEvent?.occurred_at || null,
          };
        });
      }

      drilldown = {
        stage: drilldown_stage,
        total: idList.length,
        page,
        limit,
        records,
      };
    }

    return Response.json({
      mode: aggMode,
      dateRange: { startLagos, endLagos },
      lastRefreshed: now,
      aggregates,
      timeSeries,
      dataQuality,
      definitions: STAGE_DEFINITIONS,
      drilldown,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});