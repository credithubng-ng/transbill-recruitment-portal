import { createClient } from 'npm:@base44/sdk@0.8.31';

const APP_ID = Deno.env.get('BASE44_APP_ID') || '';

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
    const { token } = await req.json();
    const adminPassword = Deno.env.get('ADMIN_PASSWORD');

    const valid = await verifyToken(token, adminPassword);
    if (!valid) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const base44 = createClient({ appId: APP_ID });
    const applicants = await base44.asServiceRole.entities.Applicant.list('-created_date', 10000);
    return Response.json({ applicants });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});