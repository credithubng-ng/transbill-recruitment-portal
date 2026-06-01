import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const body = await req.json();

  const adminPassword = Deno.env.get('ADMIN_PASSWORD');
  if (!adminPassword) {
    return Response.json({ error: 'Server configuration error' }, { status: 500 });
  }

  // verify: called on every page load with the stored token
  if (body.action === 'verify') {
    const valid = body.token && body.token === adminPassword;
    return Response.json({ valid });
  }

  // login: called when the user submits the password form
  if (body.password !== adminPassword) {
    return Response.json({ error: 'Invalid password' }, { status: 401 });
  }

  // Return the token (the password itself acts as a bearer secret)
  return Response.json({ success: true, token: adminPassword });
});