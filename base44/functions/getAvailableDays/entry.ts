import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { token } = await req.json();
    if (!token || !/^(?:[0-9a-f]{32}|[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})$/i.test(token)) {
      return Response.json({ error: 'Valid booking token required' }, { status: 401 });
    }
    const applicants = await base44.asServiceRole.entities.Applicant.filter({ booking_token: token });
    const applicant = applicants?.[0];
    if (!applicant || applicant.booking_used || !applicant.booking_token_expires_at ||
        new Date(applicant.booking_token_expires_at) < new Date()) {
      return Response.json({ error: 'Invalid or expired booking token' }, { status: 403 });
    }

    // Fetch all unbooked future slots
    const now = new Date().toISOString();
    const allSlots = await base44.asServiceRole.entities.InterviewSlot.filter({ is_booked: false });

    // Filter to future slots only
    const futureSlots = allSlots.filter(s => s.slot_datetime && s.slot_datetime > now);

    // Group by date
    const dateMap = {};
    for (const slot of futureSlots) {
      const dateObj = new Date(slot.slot_datetime);
      const dateStr = dateObj.toLocaleDateString('en-CA', { timeZone: 'Africa/Lagos' }); // YYYY-MM-DD
      if (!dateMap[dateStr]) dateMap[dateStr] = 0;
      dateMap[dateStr]++;
    }

    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Africa/Lagos' });
    const tomorrow = new Date(Date.now() + 86400000).toLocaleDateString('en-CA', { timeZone: 'Africa/Lagos' });

    const availableDays = Object.keys(dateMap)
      .sort()
      .map(dateStr => {
        const d = new Date(dateStr + 'T12:00:00');
        const label = d.toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long' });
        return {
          dateStr,
          label,
          count: dateMap[dateStr],
          isToday: dateStr === today,
          isTomorrow: dateStr === tomorrow,
        };
      });

    return Response.json({ availableDays });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
