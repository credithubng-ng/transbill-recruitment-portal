import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { token, slotId } = await req.json();

    if (!token || !slotId) {
      return Response.json({ error: 'token and slotId are required' }, { status: 400 });
    }

    // Delegate to bookInterviewSlot
    const result = await base44.asServiceRole.functions.invoke('bookInterviewSlot', { token, slotId });
    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});