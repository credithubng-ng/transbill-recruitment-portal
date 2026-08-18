import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Inlined HMAC session verification (Base44 cannot bundle sibling relative imports).
const encoder = new TextEncoder();
const fromBase64Url = (value: string) => {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  return atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '='));
};
async function hmac(value: string, secret: string) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const bytes = await crypto.subtle.sign('HMAC', key, encoder.encode(value));
  return Array.from(new Uint8Array(bytes)).map(byte => byte.toString(16).padStart(2, '0')).join('');
}
function getSecret() {
  const secret = Deno.env.get('APPLICANT_SESSION_SECRET') || Deno.env.get('ASSESSMENT_SIGNING_SECRET') || '';
  if (secret.length < 32) throw new Error('Applicant session secret is not configured');
  return secret;
}
// Accepts both the full applicant-session token (incomplete applicants) and the
// narrowly scoped completed-status token (completed applicants). Both are signed
// with APPLICANT_SESSION_SECRET; neither is a plain applicant ID.
async function verifySession(token: string) {
  if (!token) return null;
  const separator = token.lastIndexOf('.');
  if (separator < 1) return null;
  const payload = token.substring(0, separator);
  const supplied = token.substring(separator + 1);
  const expected = await hmac(payload, getSecret());
  if (supplied !== expected) return null;
  const session = JSON.parse(fromBase64Url(payload));
  if (!['applicant-session', 'completed-status'].includes(session.purpose)) return null;
  if (session.expiresAt < Date.now()) return null;
  return session;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { sessionToken } = await req.json();
    const session = await verifySession(sessionToken);
    if (!session || !session.applicantId) {
      return Response.json({ error: 'Invalid or expired session' }, { status: 401 });
    }
    const applicant = await base44.asServiceRole.entities.Applicant.get(session.applicantId);
    if (!applicant || applicant.email?.toLowerCase() !== session.email?.toLowerCase()) {
      return Response.json({ error: 'Applicant not found' }, { status: 404 });
    }
    return Response.json({ applicant });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});