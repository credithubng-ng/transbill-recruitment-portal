import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Sign a token: HMAC-SHA256 of payload using the admin password as secret
async function signToken(payload, secret) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const data = encoder.encode(payload);
  const sig = await crypto.subtle.sign('HMAC', key, data);
  const sigHex = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
  return `${payload}.${sigHex}`;
}

// Verify a token: re-sign and compare
async function verifyToken(token, secret) {
  if (!token) return false;
  const dotIndex = token.lastIndexOf('.');
  if (dotIndex === -1) return false;
  const payload = token.substring(0, dotIndex);
  const expected = await signToken(payload, secret);
  return token === expected;
}

Deno.serve(async (req) => {
  try {
    const body = await req.json();

    const adminPassword = Deno.env.get('ADMIN_PASSWORD');
    if (!adminPassword) {
      return Response.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // verify: called on every page load with the stored token
    if (body.action === 'verify') {
      const valid = await verifyToken(body.token, adminPassword);
      return Response.json({ valid });
    }

    // login: check password and issue a signed token (never return the password)
    if (body.password !== adminPassword) {
      return Response.json({ error: 'Invalid password' }, { status: 401 });
    }

    const payload = `admin:${Date.now()}`;
    const token = await signToken(payload, adminPassword);
    return Response.json({ success: true, token });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});