import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

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
    if (!email) {
      return Response.json({ error: 'Email is required.' }, { status: 400 });
    }
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
    if (!Number.isFinite(dob.getTime()) || age < 18) {
      return Response.json({ error: 'Applicants must be at least 18 years old.' }, { status: 400 });
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
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: email,
        from_name: 'Transbill Programme Team',
        subject: 'Application Received – Digital Marketing & Workforce Development Programme',
        body: `Dear ${firstName},\n\nThank you for applying to the free Digital Marketing & Workforce Development Programme delivered by Transbill Solutions Limited with funding support from Lagos Innovates | LSETF.\n\nYour application has been received. The next step is a short pre-screening covering digital marketing knowledge, learning potential, Affiliate Banker recruitment and performance management.\n\nImportant: if selected, you must present your original LASRRA card, LASRRA printout or another approved proof of Lagos residency before training begins on Day 1. Online record confirmation does not complete physical verification.\n\nTraining does not guarantee employment. Only participants who successfully complete the programme and meet Transbill's employment selection requirements will be offered employment by Transbill to support the FirstBank SME Account Acquisition Project. Successful candidates will be employed by Transbill, not Lagos Innovates, LSETF or FirstBank.\n\nWarm regards,\nTransbill Programme Team`
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

    return Response.json({ id: applicant.id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
