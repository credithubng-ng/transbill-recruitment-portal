import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

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