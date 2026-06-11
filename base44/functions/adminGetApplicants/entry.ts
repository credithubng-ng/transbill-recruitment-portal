import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

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
  const exp = parseInt(payload.split(':')[1], 10);
  if (!exp || Date.now() > exp) return false;
  const expected = await hmac(payload, secret);
  return sig === expected;
}

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const token = body.token;
    const adminPassword = Deno.env.get('ADMIN_PASSWORD');

    if (!adminPassword) {
      return Response.json({ error: 'Server configuration error: ADMIN_PASSWORD not set' }, { status: 500 });
    }

    const valid = await verifyToken(token, adminPassword);
    if (!valid) {
      return Response.json({ error: 'Unauthorized: invalid or expired token' }, { status: 401 });
    }

    const base44 = createClientFromRequest(req);
    const applicants = await base44.asServiceRole.entities.Applicant.list('-created_date', 10000);
    return Response.json({ applicants });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});