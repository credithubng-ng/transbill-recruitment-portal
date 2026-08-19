// Shared helpers for AI interview backend functions.
// Plain module — no Deno.serve. Imported via relative path from function entry files.

const encoder = new TextEncoder();

export const toBase64Url = (v: string) => btoa(v).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
export const fromBase64Url = (v: string) => {
  const b = v.replace(/-/g, '+').replace(/_/g, '/');
  return atob(b.padEnd(Math.ceil(b.length / 4) * 4, '='));
};

export async function hmac(v: string, secret: string) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const bytes = await crypto.subtle.sign('HMAC', key, encoder.encode(v));
  return Array.from(new Uint8Array(bytes)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export function getApplicantSecret() {
  const s = Deno.env.get('APPLICANT_SESSION_SECRET') || Deno.env.get('ASSESSMENT_SIGNING_SECRET') || '';
  if (s.length < 32) throw new Error('Applicant session secret is not configured');
  return s;
}

export async function verifyApplicantSession(token: string) {
  if (!token) return null;
  const sep = token.lastIndexOf('.');
  if (sep < 1) return null;
  const payload = token.substring(0, sep);
  const supplied = token.substring(sep + 1);
  const expected = await hmac(payload, getApplicantSecret());
  if (supplied !== expected) return null;
  const session = JSON.parse(fromBase64Url(payload));
  // Accept both the full applicant-session token (incomplete applicants) and the
  // narrowly scoped completed-status token (completed applicants shortlisted for
  // the AI interview). Both are signed with APPLICANT_SESSION_SECRET.
  if (!['applicant-session', 'completed-status'].includes(session.purpose) || session.expiresAt < Date.now()) return null;
  return session;
}

export async function getApplicantFromSession(base44: any, applicantId: string, token: string) {
  const session = await verifyApplicantSession(token);
  if (!session || session.applicantId !== applicantId) return null;
  const applicant = await base44.asServiceRole.entities.Applicant.get(applicantId);
  if (!applicant || applicant.email?.toLowerCase() !== session.email) return null;
  return applicant;
}

// --- Admin session token (carries uid/email/role, signed with ADMIN_PASSWORD) ---
const ADMIN_SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours

export async function createAdminSession(userId: string, email: string, role: string) {
  const secret = Deno.env.get('ADMIN_PASSWORD');
  if (!secret) throw new Error('Admin secret is not configured');
  const payload = toBase64Url(JSON.stringify({ uid: userId, email, role, exp: Date.now() + ADMIN_SESSION_TTL_MS }));
  const sig = await hmac(payload, secret);
  return `${payload}.${sig}`;
}

// Returns { uid, email, role } for a valid signed session, or null.
export async function verifyAdmin(token: string) {
  if (!token) return null;
  const secret = Deno.env.get('ADMIN_PASSWORD');
  if (!secret) return null;
  const dotIndex = token.lastIndexOf('.');
  if (dotIndex < 1) return null;
  const payload = token.substring(0, dotIndex);
  const sig = token.substring(dotIndex + 1);
  const expected = await hmac(payload, secret);
  if (sig !== expected) return null;
  try {
    const session = JSON.parse(fromBase64Url(payload));
    if (!session.exp || session.exp < Date.now()) return null;
    return { uid: session.uid, email: session.email, role: session.role };
  } catch (_e) {
    return null;
  }
}

// Cryptographically random 6-digit OTP
export function generateOtp(): string {
  const bytes = new Uint8Array(4);
  crypto.getRandomValues(bytes);
  const num = ((bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3]) >>> 0;
  return String(num % 1000000).padStart(6, '0');
}

// HMAC-SHA256 of the OTP — plaintext is never persisted
export async function hashOtp(otp: string): Promise<string> {
  const secret = Deno.env.get('ADMIN_PASSWORD') || '';
  return await hmac(`otp:${otp}`, secret);
}

// Extracts only candidate-safe preparation fields from an InterviewCase record.
// Never includes follow_up_questions, rubric_focus, competency weights, or other variants.
export function candidateSafeCaseFields(caseRec: any) {
  if (!caseRec) return null;
  return {
    case_title: caseRec.title,
    case_scenario: caseRec.scenario,
    case_common_rules: caseRec.common_rules,
    case_slides: Array.isArray(caseRec.slides) ? caseRec.slides : [],
  };
}

export async function sendBrevoEmail({ to, subject, body }: { to: string; subject: string; body: string }) {
  const apiKey = Deno.env.get('BREVO_API_KEY');
  const fromEmail = Deno.env.get('BREVO_FROM_EMAIL');
  const fromName = Deno.env.get('BREVO_FROM_NAME') || 'Transbill Programme Team';
  if (!apiKey || !fromEmail) throw new Error('Email delivery is not configured.');
  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': apiKey, 'Content-Type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({ sender: { name: fromName, email: fromEmail }, to: [{ email: to }], subject, textContent: body }),
  });
  if (!response.ok) throw new Error('Email delivery failed.');
}