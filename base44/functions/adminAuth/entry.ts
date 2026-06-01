import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const { password } = await req.json();

  const adminPassword = Deno.env.get('ADMIN_PASSWORD');
  if (!adminPassword) {
    return Response.json({ error: 'Server configuration error' }, { status: 500 });
  }

  if (password !== adminPassword) {
    return Response.json({ error: 'Invalid password' }, { status: 401 });
  }

  return Response.json({ success: true });
});