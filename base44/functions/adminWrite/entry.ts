import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function hmac(data, secret) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function verifyToken(token, secret) {
  if (!token) return false;
  const dotIndex = token.lastIndexOf('.');
  if (dotIndex === -1) return false;
  const payload = token.substring(0, dotIndex);
  const sig = token.substring(dotIndex + 1);
  const parts = payload.split(':');
  const exp = parseInt(parts[2], 10);
  if (!exp || Date.now() > exp) return false;
  const expected = await hmac(payload, secret);
  return sig === expected;
}

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const masterPassword = Deno.env.get('ADMIN_PASSWORD');
    if (!masterPassword) return Response.json({ error: 'Server configuration error' }, { status: 500 });

    const valid = await verifyToken(body.token, masterPassword);
    if (!valid) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const base44 = createClientFromRequest(req);
    const { entity, action, id, data } = body;

    const allowed = ['Applicant', 'AppSettings', 'InterviewSlot', 'Interviewer', 'AdminUser'];
    if (!allowed.includes(entity)) return Response.json({ error: 'Entity not allowed' }, { status: 400 });

    let result;
    if (action === 'update') {
      result = await base44.asServiceRole.entities[entity].update(id, data);
    } else if (action === 'create') {
      result = await base44.asServiceRole.entities[entity].create(data);
    } else if (action === 'delete') {
      result = await base44.asServiceRole.entities[entity].delete(id);
    } else if (action === 'list') {
      result = await base44.asServiceRole.entities[entity].list();
    } else {
      return Response.json({ error: 'Invalid action' }, { status: 400 });
    }

    return Response.json({ result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});