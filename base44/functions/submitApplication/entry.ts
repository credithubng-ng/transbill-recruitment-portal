import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const APP_DOMAIN = Deno.env.get('APP_DOMAIN') || 'https://jobs.transbill.ng';

// Inlined from base44/functions/_shared/applicantSession.ts (Base44 cannot bundle sibling relative imports)
const _encoder = new TextEncoder();
const _toBase64Url = (value: string) => btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
async function _hmac(value: string, secret: string) {
  const key = await crypto.subtle.importKey('raw', _encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const bytes = await crypto.subtle.sign('HMAC', key, _encoder.encode(value));
  return Array.from(new Uint8Array(bytes)).map(byte => byte.toString(16).padStart(2, '0')).join('');
}
function _getApplicantSecret() {
  const secret = Deno.env.get('APPLICANT_SESSION_SECRET') || Deno.env.get('ASSESSMENT_SIGNING_SECRET') || '';
  if (secret.length < 32) throw new Error('Applicant session secret is not configured');
  return secret;
}
async function createApplicantSession(applicantId: string, email: string, expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000) {
  const payload = _toBase64Url(JSON.stringify({ applicantId, email: email.toLowerCase(), expiresAt, purpose: 'applicant-session' }));
  return `${payload}.${await _hmac(payload, _getApplicantSecret())}`;
}
async function hashApplicantOtp(applicantId: string, code: string) {
  return _hmac(`applicant-otp:${applicantId}:${code}`, _getApplicantSecret());
}
async function getApplicationDeadline(base44) {
  const settings = await base44.asServiceRole.entities.AppSettings.filter({ settings_id: 'main' });
  const value = settings?.[0]?.application_closes_at;
  const timestamp = value ? new Date(value).getTime() : null;
  return Number.isFinite(timestamp) ? timestamp : null;
}

// Brevo transactional email helper — reaches external (non-registered) applicant addresses.
// Never logs secrets or provider response bodies; surfaces a generic message on failure.
async function sendBrevoEmail({ to, subject, body }) {
  const apiKey = Deno.env.get('BREVO_API_KEY');
  const fromEmail = Deno.env.get('BREVO_FROM_EMAIL');
  const fromName = Deno.env.get('BREVO_FROM_NAME') || 'Transbill Programme Team';
  if (!apiKey || !fromEmail) throw new Error('Email delivery is not configured.');
  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': apiKey, 'Content-Type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({ sender: { name: fromName, email: fromEmail }, to: [{ email: to }], subject, textContent: body }),
  });
  if (!response.ok) throw new Error('Email delivery failed. Please try again.');
}

async function getLatestOtp(base44, applicantId: string) {
  const records = await base44.asServiceRole.entities.ApplicantLoginOtp.filter(
    { applicant_id: applicantId },
    '-created_date',
    1
  );
  return records?.[0] || null;
}

async function requestLoginOtp(base44, email: string) {
  const applicants = await base44.asServiceRole.entities.Applicant.filter({ email });
  const applicant = applicants?.[0];
  const publicResult = { success: true, message: 'If an incomplete application exists, a code has been sent.' };
  if (!applicant || applicant.assessment_completed === true) return Response.json(publicResult);

  const latest = await getLatestOtp(base44, applicant.id);
  const lastSent = latest?.sent_at ? new Date(latest.sent_at).getTime() : 0;
  if (lastSent && Date.now() - lastSent < 60_000) return Response.json(publicResult);

  const code = String(crypto.getRandomValues(new Uint32Array(1))[0] % 1_000_000).padStart(6, '0');
  await base44.asServiceRole.entities.ApplicantLoginOtp.create({
    applicant_id: applicant.id,
    email,
    otp_hash: await hashApplicantOtp(applicant.id, code),
    expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    sent_at: new Date().toISOString(),
    attempts: 0,
  });
  const firstName = applicant.full_name?.split(' ')[0] || 'Applicant';
  await sendBrevoEmail({
    to: email,
    subject: 'Your Transbill application login code',
    body: `Hello ${firstName},\n\nYour one-time login code is: ${code}\n\nThis code expires in 10 minutes. Use it at ${APP_DOMAIN}/login to continue your incomplete assessment before the call for applications closes.\n\nIf you did not request this code, you can ignore this email.\n\nTransbill Programme Team`,
  });
  return Response.json(publicResult);
}

async function verifyLoginOtp(base44, email: string, code: string) {
  if (!/^\d{6}$/.test(code)) return Response.json({ error: 'Invalid or expired code.' }, { status: 400 });
  const applicants = await base44.asServiceRole.entities.Applicant.filter({ email });
  const applicant = applicants?.[0];
  if (!applicant || applicant.assessment_completed === true) {
    return Response.json({ error: 'Invalid or expired code.' }, { status: 401 });
  }
  const latest = await getLatestOtp(base44, applicant.id);
  const attempts = latest?.attempts || 0;
  const expired = !latest?.expires_at || new Date(latest.expires_at).getTime() < Date.now();
  const consumed = !!latest?.consumed_at;
  const suppliedHash = latest ? await hashApplicantOtp(applicant.id, code) : '';
  if (!latest || consumed || expired || attempts >= 5 || suppliedHash !== latest.otp_hash) {
    if (latest && !consumed && attempts < 5) {
      await base44.asServiceRole.entities.ApplicantLoginOtp.update(latest.id, { attempts: attempts + 1 });
    }
    return Response.json({ error: 'Invalid or expired code.' }, { status: 401 });
  }
  await base44.asServiceRole.entities.ApplicantLoginOtp.update(latest.id, {
    consumed_at: new Date().toISOString(),
    attempts: 0,
  });
  return Response.json({ applicantId: applicant.id, sessionToken: await createApplicantSession(applicant.id, applicant.email) });
}

async function findLasrraRecord(body) {
  const endpoint = Deno.env.get('LASRRA_VERIFICATION_URL');
  const apiKey = Deno.env.get('LASRRA_API_KEY');
  if (!endpoint || !apiKey) throw new Error('LASRRA verification service is not configured');
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      lasrra_id: body.lasrra_id?.trim().toUpperCase(),
      full_name: body.full_name?.trim(),
      date_of_birth: body.date_of_birth,
    }),
  });
  if (!response.ok) throw new Error('LASRRA verification service is temporarily unavailable');
  const result = await response.json();
  const message = String(result.message || result.data?.message || '').toLowerCase();
  return result.exists === true || result.found === true || result.valid === true ||
    result.data?.exists === true || result.data?.found === true ||
    ['found', 'valid', 'verified'].includes(String(result.status || '').toLowerCase()) ||
    message.includes('resident record was found');
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    const email = body.email?.trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: 'A valid email is required.' }, { status: 400 });
    }
    const deadline = await getApplicationDeadline(base44);
    if (deadline && Date.now() > deadline) {
      return Response.json({ error: 'The call for applications has closed.' }, { status: 403 });
    }
    if (body.action === 'request_login_otp') return requestLoginOtp(base44, email);
    if (body.action === 'verify_login_otp') return verifyLoginOtp(base44, email, String(body.code || '').trim());
    if (body.lagos_resident !== 'Yes') {
      return Response.json({ error: 'This programme is open to current Lagos State residents only.' }, { status: 400 });
    }
    const lasrraId = body.lasrra_id?.trim().toUpperCase() || '';
    if (lasrraId && !/^LA[A-Z0-9]{10}$/.test(lasrraId)) {
      return Response.json({ error: 'Enter a valid LASRRA ID in the format LA0F10020751.' }, { status: 400 });
    }
    if (body.data_processing_consent !== true) {
      return Response.json({ error: 'Consent is required to process the application and verify eligibility.' }, { status: 400 });
    }
    const dob = new Date(body.date_of_birth);
    const today = new Date();
    let age = today.getUTCFullYear() - dob.getUTCFullYear();
    const birthdayPassed = today.getUTCMonth() > dob.getUTCMonth() ||
      (today.getUTCMonth() === dob.getUTCMonth() && today.getUTCDate() >= dob.getUTCDate());
    if (!birthdayPassed) age--;
    if (!Number.isFinite(dob.getTime()) || age < 18 || age > 36) {
      return Response.json({ error: 'Applicants must be between 18 and 36 years old.' }, { status: 400 });
    }
    const required = ['full_name', 'phone', 'current_lga', 'education', 'employment_status', 'years_experience',
      'availability_2_weeks', 'has_smartphone', 'has_laptop', 'internet_access', 'willing_affiliate_role',
      'affiliate_experience', 'motivation', 'referral_source'];
    if (required.some(field => !body[field])) {
      return Response.json({ error: 'Please complete all required fields.' }, { status: 400 });
    }
    const lasrraRecordFound = lasrraId ? await findLasrraRecord(body) : false;
    if (lasrraId && !lasrraRecordFound) {
      return Response.json({ error: 'We could not find this LASRRA/LAG-ID. Check the number and try again.' }, { status: 422 });
    }

    // Duplicate check using service role (bypasses RLS)
    const existing = await base44.asServiceRole.entities.Applicant.filter({ email });
    if (existing.length > 0) {
      return Response.json({ error: 'duplicate' }, { status: 409 });
    }

    // Whitelist candidate-supplied fields only — prevents mass assignment of privileged fields
    // (assessment_score, interview_outcome, screening_recommendation, flags, etc.)
    const candidateInput = {
      full_name: body.full_name,
      phone: body.phone,
      gender: body.gender,
      date_of_birth: body.date_of_birth,
      state_of_origin: body.state_of_origin,
      current_lga: body.current_lga,
      lagos_resident: body.lagos_resident,
      education: body.education,
      employment_status: body.employment_status,
      years_experience: body.years_experience,
      is_3mtt: body.is_3mtt,
      is_sail: body.is_sail,
      social_platforms: Array.isArray(body.social_platforms) ? body.social_platforms : [],
      affiliate_experience: body.affiliate_experience,
      affiliate_experience_desc: body.affiliate_experience_desc,
      availability_2_weeks: body.availability_2_weeks,
      has_smartphone: body.has_smartphone,
      has_laptop: body.has_laptop,
      internet_access: body.internet_access,
      willing_affiliate_role: body.willing_affiliate_role,
      motivation: body.motivation,
      linkedin_url: body.linkedin_url,
      referral_source: body.referral_source,
    };

    const applicant = await base44.asServiceRole.entities.Applicant.create({
      ...candidateInput,
      email,
      status: 'Applied',
      candidate_stage: 'Assessment Started',
      assessment_completed: false,
      lasrra_id: lasrraId,
      lasrra_verified: lasrraRecordFound,
      ...(lasrraRecordFound ? { lasrra_verified_at: new Date().toISOString() } : {}),
      lasrra_physical_card_verified: false,
      data_processing_consent: true,
      data_processing_consented_at: new Date().toISOString(),
      eligibility_status: body.availability_2_weeks === 'Yes' && body.willing_affiliate_role === 'Yes'
        ? 'Eligible for screening'
        : 'Manual review required'
    });

    // Send confirmation email (best-effort — don't block submission if it fails)
    const firstName = (body.full_name || '').split(' ')[0] || 'Applicant';
    try {
      await sendBrevoEmail({
        to: email,
        subject: 'Application Received – Digital Marketing & Workforce Development Programme',
        body: `Dear ${firstName},\n\nThank you for applying to the free Digital Marketing & Workforce Development Programme delivered by Transbill Solutions Limited with funding support from Lagos Innovates | LSETF.\n\nYour registration details have been received and you can proceed immediately to the pre-screening assessment. If you leave before completing it, return to https://jobs.transbill.ng/login and enter this email address. We will send you a one-time login code so you can continue before the call for applications closes.\n\nThe pre-screening covers digital marketing knowledge, learning potential, Affiliate Banker recruitment and performance management.\n\nImportant: if selected, you must present your original LASRRA card, LASRRA printout or another approved proof of Lagos residency before training begins on Day 1. Online record confirmation does not complete physical verification.\n\nTraining does not guarantee employment. Only participants who successfully complete the programme and meet Transbill's employment selection requirements will be offered employment by Transbill to support the FirstBank SME Account Acquisition Project. Successful candidates will be employed by Transbill, not Lagos Innovates, LSETF or FirstBank.\n\nWarm regards,\nTransbill Programme Team`
      });
    } catch (_emailErr) {
      // Email failed silently — applicant record still created
    }

    // Append row to Google Sheet (best-effort)
    try {
      const { accessToken } = await base44.asServiceRole.connectors.getConnection('googlesheets');
      const sheetId = Deno.env.get('GOOGLE_SHEET_ID');
      const row = [
        new Date().toISOString(),
        body.full_name || '',
        email,
        body.phone || '',
        body.gender || '',
        body.state_of_origin || '',
        body.current_lga || '',
        lasrraId,
        lasrraRecordFound ? 'Record found — physical verification pending' : 'Not provided — residency evidence pending',
        body.lagos_resident || '',
        body.education || '',
        body.employment_status || '',
        body.years_experience || '',
        (body.social_platforms || []).join(', '),
        body.affiliate_experience || '',
        body.availability_2_weeks || '',
        body.has_smartphone || '',
        body.has_laptop || '',
        body.internet_access || '',
        body.willing_affiliate_role || '',
        body.motivation || '',
        body.linkedin_url || '',
        body.referral_source || '',
      ];
      await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sheet1!A1:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ values: [row] }),
        }
      );
    } catch (_sheetErr) {
      // Sheet write failed silently — applicant record still created
    }

    return Response.json({
      id: applicant.id,
      sessionToken: await createApplicantSession(applicant.id, email),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});