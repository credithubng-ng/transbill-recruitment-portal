import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { dateStr, token } = await req.json(); // YYYY-MM-DD

    if (!token || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(token)) {
      return Response.json({ error: 'Valid booking token required' }, { status: 401 });
    }
    const applicants = await base44.asServiceRole.entities.Applicant.filter({ booking_token: token });
    const applicant = applicants?.[0];
    if (!applicant || applicant.booking_used || !applicant.booking_token_expires_at ||
        new Date(applicant.booking_token_expires_at) < new Date()) {
      return Response.json({ error: 'Invalid or expired booking token' }, { status: 403 });
    }

    if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return Response.json({ error: 'A valid dateStr is required' }, { status: 400 });
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
