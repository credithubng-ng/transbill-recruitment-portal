import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const ADMIN_SECRET = Deno.env.get('ADMIN_PASSWORD') || '';

async function hmac(secret, data) {
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function verifyToken(token) {
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  const [ts, exp, sig] = parts;
  if (Date.now() > parseInt(exp)) return false;
  const expected = await hmac(ADMIN_SECRET, `${ts}.${exp}`);
  return sig === expected;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { token } = await req.json();

    const valid = await verifyToken(token);
    if (!valid) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const applicants = await base44.asServiceRole.entities.Applicant.list('-created_date', 10000);
    return Response.json({ applicants });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});