import { verifyAdmin } from '../../shared/interviewSession.ts';

Deno.serve(async (req) => {
  try {
    const body = await req.json();

    // Verify an existing signed session token
    if (body.action === 'verify') {
      const admin = await verifyAdmin(body.token);
      return Response.json({ valid: !!admin, admin });
    }

    // Legacy shared-password login is disabled — use email OTP instead.
    return Response.json({
      error: 'Password login is no longer available. Please use your email to receive a verification code.',
    }, { status: 403 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});