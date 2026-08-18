const encoder = new TextEncoder();

const toBase64Url = (value: string) => btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const fromBase64Url = (value: string) => {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  return atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '='));
};

async function hmac(value: string, secret: string) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const bytes = await crypto.subtle.sign('HMAC', key, encoder.encode(value));
  return Array.from(new Uint8Array(bytes)).map(byte => byte.toString(16).padStart(2, '0')).join('');
}

export function getApplicantSecret() {
  const secret = Deno.env.get('APPLICANT_SESSION_SECRET') || Deno.env.get('ASSESSMENT_SIGNING_SECRET') || '';
  if (secret.length < 32) throw new Error('Applicant session secret is not configured');
  return secret;
}

export async function createApplicantSession(applicantId: string, email: string, expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000) {
  const payload = toBase64Url(JSON.stringify({ applicantId, email: email.toLowerCase(), expiresAt, purpose: 'applicant-session' }));
  return `${payload}.${await hmac(payload, getApplicantSecret())}`;
}

export async function verifyApplicantSession(token: string) {
  if (!token) return null;
  const separator = token.lastIndexOf('.');
  if (separator < 1) return null;
  const payload = token.substring(0, separator);
  const supplied = token.substring(separator + 1);
  const expected = await hmac(payload, getApplicantSecret());
  if (supplied !== expected) return null;
  const session = JSON.parse(fromBase64Url(payload));
  if (session.purpose !== 'applicant-session' || session.expiresAt < Date.now()) return null;
  return session;
}

export async function hashApplicantOtp(applicantId: string, code: string) {
  return hmac(`applicant-otp:${applicantId}:${code}`, getApplicantSecret());
}

export async function getApplicationDeadline(base44) {
  const settings = await base44.asServiceRole.entities.AppSettings.filter({ settings_id: 'main' });
  const value = settings?.[0]?.application_closes_at;
  const timestamp = value ? new Date(value).getTime() : null;
  return Number.isFinite(timestamp) ? timestamp : null;
}

export async function getApplicantFromSession(base44, applicantId: string, token: string) {
  const session = await verifyApplicantSession(token);
  if (!session || session.applicantId !== applicantId) return null;
  const applicant = await base44.asServiceRole.entities.Applicant.get(applicantId);
  if (!applicant || applicant.email?.toLowerCase() !== session.email) return null;
  return applicant;
}