import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const TOKEN_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours

async function hmac(data, secret) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function createToken(secret) {
  const exp = Date.now() + TOKEN_TTL_MS;
  const payload = `admin:${exp}`;
  const sig = await hmac(payload, secret);
  return `${payload}.${sig}`;
}

async function verifyToken(token, secret) {
  if (!token) return false;
  const dotIndex = token.lastIndexOf('.');
  if (dotIndex === -1) return false;
  const payload = token.substring(0, dotIndex);
  const sig = token.substring(dotIndex + 1);
  // Check expiry
  const exp = parseInt(payload.split(':')[1], 10);
  if (!exp || Date.now() > exp) return false;
  // Verify signature
  const expected = await hmac(payload, secret);
  return sig === expected;
}

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const adminPassword = Deno.env.get('ADMIN_PASSWORD');
    if (!adminPassword) {
      return Response.json({ error: 'Server configuration error' }, { status: 500 });
    }

    if (body.action === 'verify') {
      const valid = await verifyToken(body.token, adminPassword);
      return Response.json({ valid });
    }

    if (body.password !== adminPassword) {
      return Response.json({ error: 'Invalid password' }, { status: 401 });
    }

    const token = await createToken(adminPassword);
    return Response.json({ success: true, token });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});