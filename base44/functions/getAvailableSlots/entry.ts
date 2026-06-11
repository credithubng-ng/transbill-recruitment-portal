import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { dateStr } = await req.json(); // YYYY-MM-DD

    if (!dateStr) {
      return Response.json({ error: 'dateStr is required' }, { status: 400 });
    }

    const allSlots = await base44.asServiceRole.entities.InterviewSlot.filter({ is_booked: false });

    const now = new Date();

    // Filter slots matching the requested date
    const daySlots = allSlots.filter(s => {
      if (!s.slot_datetime) return false;
      const slotDate = new Date(s.slot_datetime).toLocaleDateString('en-CA', { timeZone: 'Africa/Lagos' });
      return slotDate === dateStr && new Date(s.slot_datetime) > now;
    });

    // Sort and format
    const slots = daySlots
      .sort((a, b) => new Date(a.slot_datetime) - new Date(b.slot_datetime))
      .map(s => ({
        slotId: s.id,
        datetime: s.slot_datetime,
        timeStr: new Date(s.slot_datetime).toLocaleTimeString('en-NG', {
          hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Africa/Lagos'
        }),
        location: s.location || '',
        interviewer: s.interviewer || '',
      }));

    return Response.json({ slots });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});