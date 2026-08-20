import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { verifyAdmin } from '../../shared/interviewSession.ts';

// All date/time inputs are interpreted as Africa/Lagos (UTC+1).
const LAGOS_OFFSET = '+01:00';
const MAX_BATCH = 500;

function lagosToUtc(dateStr: string, timeStr: string): string {
  return new Date(`${dateStr}T${timeStr}:00${LAGOS_OFFSET}`).toISOString();
}

// Iterate YYYY-MM-DD calendar days from dateFrom to dateTo (inclusive) using
// Date.UTC for both construction and extraction — never new Date('YYYY-MM-DD')
// or toISOString().slice(0,10), which shift the day via the server's local tz.
function eachYmd(dateFrom: string, dateTo: string): string[] {
  const [fy, fm, fd] = dateFrom.split('-').map(Number);
  const [ey, em, ed] = dateTo.split('-').map(Number);
  const out: string[] = [];
  let ms = Date.UTC(fy, fm - 1, fd);
  const endMs = Date.UTC(ey, em - 1, ed);
  while (ms <= endMs) {
    const dt = new Date(ms);
    out.push(`${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, '0')}-${String(dt.getUTCDate()).padStart(2, '0')}`);
    ms += 86400000;
  }
  return out;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { token, action } = body;

    // Authenticate via the shared admin-session verifier (returns uid/email/role).
    const admin = await verifyAdmin(token);
    if (!admin) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (admin.role === 'read_only') {
      return Response.json({ error: 'Read-only users cannot manage slots.' }, { status: 403 });
    }

    // ---- DELETE (unbooked only) ----
    if (action === 'delete') {
      const { slotId } = body;
      if (!slotId) return Response.json({ error: 'slotId is required.' }, { status: 400 });
      const slot = await base44.asServiceRole.entities.InterviewSlot.get(slotId);
      if (!slot) return Response.json({ error: 'Slot not found.' }, { status: 404 });
      if (slot.is_booked) return Response.json({ error: 'Cannot delete a slot that has already been booked.' }, { status: 409 });
      await base44.asServiceRole.entities.InterviewSlot.delete(slotId);
      return Response.json({ success: true });
    }

    // ---- CREATE SINGLE ----
    if (action === 'create') {
      const { date, time, interviewer, location } = body;
      if (!date || !time) return Response.json({ error: 'Date and time are required.' }, { status: 400 });
      const iso = lagosToUtc(date, time);
      if (new Date(iso).getTime() <= Date.now()) {
        return Response.json({ error: 'Cannot create a slot in the past. Please choose a future date and time.' }, { status: 400 });
      }
      // Interviewer is optional. Never accept is_booked / booked_by_applicant_id / pending_lock.
      const safeInterviewer = typeof interviewer === 'string' ? interviewer.trim() : '';
      const safeLocation = typeof location === 'string' ? location.trim() : '';

      // Duplicate check: same datetime + same interviewer
      const existing = await base44.asServiceRole.entities.InterviewSlot.filter({ slot_datetime: iso });
      const dup = existing.find((s: any) => (s.interviewer || '') === safeInterviewer);
      if (dup) return Response.json({ error: 'A slot already exists for this date, time, and interviewer.' }, { status: 409 });

      // Admin-created slots are live_panel by default (digital slots are auto-generated).
      const slotMode = typeof body.interview_mode === 'string' && ['structured_digital', 'live_panel'].includes(body.interview_mode)
        ? body.interview_mode : 'live_panel';
      const created = await base44.asServiceRole.entities.InterviewSlot.create({
        slot_datetime: iso,
        location: safeLocation,
        interviewer: safeInterviewer,
        is_booked: false,
        interview_mode: slotMode,
      });
      return Response.json({ success: true, slot: created });
    }

    // ---- BULK CREATE ----
    if (action === 'bulkCreate') {
      const { dateFrom, dateTo, fromTime, toTime, intervalMins, interviewers, location } = body;
      if (!dateFrom || !dateTo) return Response.json({ error: 'From Date and To Date are required.' }, { status: 400 });
      if (dateTo < dateFrom) return Response.json({ error: 'To Date must be on or after From Date.' }, { status: 400 });
      if (!fromTime || !toTime) return Response.json({ error: 'From and To times are required.' }, { status: 400 });

      const [fH, fM] = String(fromTime).split(':').map(Number);
      const [tH, tM] = String(toTime).split(':').map(Number);
      if (fH * 60 + fM >= tH * 60 + tM) return Response.json({ error: 'To time must be after From time.' }, { status: 400 });

      const interval = Number(intervalMins);
      if (!interval || interval < 1) return Response.json({ error: 'Interval must be at least 1 minute.' }, { status: 400 });
      if (interval > 480) return Response.json({ error: 'Interval is too large (max 480 minutes).' }, { status: 400 });

      // Interviewers: optional. Blank → one slot per time block. Comma-separated → one each.
      let interviewerList: string[] = [];
      if (typeof interviewers === 'string' && interviewers.trim()) {
        interviewerList = interviewers.split(',').map((s: string) => s.trim()).filter(Boolean);
      }
      if (!interviewerList.length) interviewerList = [''];

      const safeLocation = typeof location === 'string' ? location.trim() : '';

      // First slot must be in the future
      const firstIso = lagosToUtc(dateFrom, fromTime);
      if (new Date(firstIso).getTime() <= Date.now()) {
        return Response.json({ error: 'The first slot would be in the past. Please choose a future From Date or time.' }, { status: 400 });
      }

      // Generate slot objects (server-side, never trusting client-supplied is_booked/applicant data)
      const slots: any[] = [];
      const startMins = fH * 60 + fM;
      const endMins = tH * 60 + tM;
      for (const dateStr of eachYmd(dateFrom, dateTo)) {
        for (let mins = startMins; mins + interval <= endMins; mins += interval) {
          const h = String(Math.floor(mins / 60)).padStart(2, '0');
          const m = String(mins % 60).padStart(2, '0');
          const iso = lagosToUtc(dateStr, `${h}:${m}`);
          interviewerList.forEach((interviewer) => {
            slots.push({ slot_datetime: iso, location: safeLocation, interviewer, is_booked: false, interview_mode: 'live_panel' });
          });
        }
      }

      if (slots.length === 0) return Response.json({ error: 'No slots would be created with the given range and interval.' }, { status: 400 });
      if (slots.length > MAX_BATCH) return Response.json({ error: `Batch too large: ${slots.length} slots exceed the ${MAX_BATCH} limit. Please narrow the range.` }, { status: 400 });

      // Duplicate check against existing slots
      const allSlots = await base44.asServiceRole.entities.InterviewSlot.list('slot_datetime', 1000);
      const existingKeys = new Set(allSlots.map((s: any) => `${s.slot_datetime}|${(s.interviewer || '').trim()}`));
      const duplicates = slots.filter((p) => existingKeys.has(`${p.slot_datetime}|${(p.interviewer || '').trim()}`));
      if (duplicates.length) {
        return Response.json({ error: `${duplicates.length} slot(s) already exist with the same datetime and interviewer. Please remove duplicates or change the times.` }, { status: 409 });
      }

      const created = await base44.asServiceRole.entities.InterviewSlot.bulkCreate(slots);
      return Response.json({ success: true, created: Array.isArray(created) ? created.length : slots.length });
    }

    return Response.json({ error: 'Unknown action. Use create, bulkCreate, or delete.' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});