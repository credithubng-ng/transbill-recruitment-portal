import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    const email = body.email?.trim().toLowerCase();
    if (!email) {
      return Response.json({ error: 'Email is required.' }, { status: 400 });
    }

    // Duplicate check using service role (bypasses RLS)
    const existing = await base44.asServiceRole.entities.Applicant.filter({ email });
    if (existing.length > 0) {
      return Response.json({ error: 'duplicate' }, { status: 409 });
    }

    // Create applicant using service role
    const applicant = await base44.asServiceRole.entities.Applicant.create({
      ...body,
      email,
      status: 'Applied',
      assessment_completed: false
    });

    // Send confirmation email
    const firstName = (body.full_name || '').split(' ')[0] || 'Applicant';
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: email,
      from_name: 'Transbill Recruitment',
      subject: 'Application Received – Transbill Solutions Limited',
      body: `Dear ${firstName},\n\nThank you for applying to the Digital Marketing Associate role at Transbill Solutions Limited.\n\nYour application has been successfully received. The next step is to complete a short competency assessment. Please check the confirmation page for your assessment link, or contact us if you need assistance.\n\nWe will be in touch with further updates.\n\nWarm regards,\nTransbill Recruitment Team`
    });

    // Append row to Google Sheet
    const { accessToken } = await base44.asServiceRole.connectors.getConnection('googlesheets');
    const sheetId = '1YkPLYtvmNlycnqtEKqjFDK5DANEu4qO7GKHuCJjIGpA';
    const row = [
      new Date().toISOString(),
      body.full_name || '',
      email,
      body.phone || '',
      body.gender || '',
      body.state_of_origin || '',
      body.current_lga || '',
      body.lagos_resident || '',
      body.education || '',
      body.years_experience || '',
      body.is_3mtt || '',
      body.is_sail || '',
      (body.social_platforms || []).join(', '),
      body.affiliate_experience || '',
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

    return Response.json({ id: applicant.id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});