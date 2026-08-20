import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import TransbillLogo from '../components/TransbillLogo';
import ProgressIndicator from '../components/ProgressIndicator';
import Footer from '../components/landing/Footer';
import { NIGERIA_STATES } from '../lib/nigeriaStates';

const SOCIAL_PLATFORMS = ['WhatsApp Business', 'Instagram', 'Facebook', 'TikTok', 'X (Twitter)', 'LinkedIn', 'YouTube', 'Others'];
const EDUCATION_OPTIONS = ['SSCE', 'OND', 'HND', 'BSc', 'MSc', 'PhD', 'Professional Certification', 'Other'];
const EXPERIENCE_OPTIONS = ['No formal experience', 'Less than 1 year', '1–3 years', '3–5 years', '5+ years'];
const REFERRAL_OPTIONS = ['LSETF', 'Lagos Innovates', 'Transbill', 'Instagram', 'Facebook', 'WhatsApp', 'LinkedIn', 'Referral from a friend', 'Other'];
const LAGOS_LGAS = ['Agege', 'Ajeromi-Ifelodun', 'Alimosho', 'Amuwo-Odofin', 'Apapa', 'Badagry', 'Epe', 'Eti-Osa', 'Ibeju-Lekki', 'Ifako-Ijaiye', 'Ikeja', 'Ikorodu', 'Kosofe', 'Lagos Island', 'Lagos Mainland', 'Mushin', 'Ojo', 'Oshodi-Isolo', 'Shomolu', 'Surulere'];

export default function Apply() {
  React.useEffect(() => { window.scrollTo(0, 0); }, []);

  const [form, setForm] = useState({
    full_name: '', email: '', phone: '', gender: '', date_of_birth: '', state_of_origin: '', current_lga: '', lasrra_id: '',
    lagos_resident: '', education: '', employment_status: '', years_experience: '', direct_sales_experience: '',
    social_platforms: [], affiliate_experience: '', affiliate_experience_desc: '',
    availability_2_weeks: '', has_smartphone: '', has_laptop: '', internet_access: '',
    willing_affiliate_role: '', motivation: '', linkedin_url: '', referral_source: '', data_processing_consent: false
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const wordCount = form.motivation.trim().split(/\s+/).filter(Boolean).length;

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  const togglePlatform = (platform) => {
    setForm(prev => ({
      ...prev,
      social_platforms: prev.social_platforms.includes(platform)
        ? prev.social_platforms.filter(p => p !== platform)
        : [...prev.social_platforms, platform]
    }));
  };

  const validate = () => {
    const errs = {};
    if (!form.full_name.trim()) errs.full_name = 'Required';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Valid email required';
    if (!form.phone.trim()) errs.phone = 'Required';
    if (!form.gender) errs.gender = 'Required';
    if (!form.date_of_birth) {
      errs.date_of_birth = 'Required';
    } else {
      const dob = new Date(form.date_of_birth);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const m = today.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
      if (age < 18 || age > 36) errs.date_of_birth = 'Applicants must be between 18 and 36 years old.';
    }
    if (!form.state_of_origin) errs.state_of_origin = 'Required';
    if (!form.current_lga) errs.current_lga = 'Required';
    if (form.lasrra_id.trim() && !/^LA[A-Z0-9]{10}$/.test(form.lasrra_id.trim().toUpperCase())) {
      errs.lasrra_id = 'Enter a valid 12-character LASRRA ID (starts with LA followed by 10 characters)';
    }
    if (form.lagos_resident !== 'Yes') errs.lagos_resident = 'This programme is open to current Lagos State residents only.';
    if (!form.education) errs.education = 'Required';
    if (!form.employment_status) errs.employment_status = 'Required';
    if (!form.years_experience) errs.years_experience = 'Required';
    if (!form.direct_sales_experience) errs.direct_sales_experience = 'Required';
    if (form.social_platforms.length === 0) errs.social_platforms = 'Select at least one';
    if (!form.affiliate_experience) errs.affiliate_experience = 'Required';
    if (!form.availability_2_weeks) errs.availability_2_weeks = 'Required';
    if (!form.has_smartphone) errs.has_smartphone = 'Required';
    if (!form.has_laptop) errs.has_laptop = 'Required';
    if (!form.internet_access) errs.internet_access = 'Required';
    if (!form.willing_affiliate_role) errs.willing_affiliate_role = 'Required';
    if (wordCount < 50 || wordCount > 200) errs.motivation = 'Must be 50–200 words';
    if (!form.referral_source) errs.referral_source = 'Required';
    if (!form.data_processing_consent) errs.data_processing_consent = 'Consent is required to verify your residency and process your application';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setSubmitting(true);
    try {
      const visitor_id = localStorage.getItem('transbill_visitor_id') || '';
      const res = await base44.functions.invoke('submitApplication', {
        ...form,
        email: form.email.trim().toLowerCase(),
        visitor_id,
      });
      if (res.data?.error === 'duplicate') {
        setErrors({ email: 'Our records show this email address has already been used to apply. Each candidate may only apply once.' });
        return;
      }
      sessionStorage.setItem('transbill_applicant_session', res.data.sessionToken);
      window.location.href = `/assessment?id=${res.data.id}`;
    } catch (err) {
      const msg = err?.response?.data?.error || err?.message || '';
      if (msg === 'duplicate' || err?.response?.status === 409) {
        setErrors({ email: 'Our records show this email address has already been used to apply. Each candidate may only apply once.' });
      } else {
        setErrors({ submit: `Something went wrong: ${msg || 'Please check your connection and try again.'}` });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#E2E8E2]">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <TransbillLogo />
          <a href="/login" className="text-sm text-[#2D6A2F] font-medium hover:underline">Already applied? Continue →</a>
        </div>
      </div>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4">
        <ProgressIndicator currentStep={1} />
        <h1 className="font-extrabold text-2xl sm:text-3xl tracking-[-1px] text-[#1A1A1A] text-center mb-1">
          Tell Us About <span className="text-[#2D6A2F]">Yourself</span>
        </h1>
        <p className="text-[#7A7A8A] text-center text-sm mb-8">Complete all required fields. This takes about 5 minutes.</p>

        {/* NIN Notice Banner */}
        <div className="bg-[#FFF3E0] border-2 border-[#FF8F00] rounded-[12px] p-4 flex gap-3">
          <span className="text-2xl flex-shrink-0">⚠️</span>
          <div>
            <p className="font-bold text-[#BF360C] text-sm mb-1">Age Requirement & LASRRA Verification Notice</p>
            <p className="text-[#5D3F00] text-sm leading-relaxed">
              Applicants must be <strong>between 18 and 36 years old</strong> and currently resident in <strong>Lagos State</strong>. Eligibility information may be verified before admission to the programme.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Field label="Full Legal Name" error={errors.full_name}>
            <input className="form-input" value={form.full_name} onChange={e => handleChange('full_name', e.target.value)} placeholder="Enter your full name" />
          </Field>
          <Field label="Email Address" error={errors.email}>
            <input className="form-input" type="email" value={form.email} onChange={e => handleChange('email', e.target.value)} placeholder="you@example.com" />
          </Field>
          <Field label="Phone Number" error={errors.phone}>
            <input className="form-input" value={form.phone} onChange={e => handleChange('phone', e.target.value)} placeholder="WhatsApp-enabled number preferred" />
          </Field>
          <Field label="Gender" error={errors.gender}>
            <RadioGroup options={['Male', 'Female', 'Prefer not to say']} value={form.gender} onChange={v => handleChange('gender', v)} />
          </Field>
          <Field label="Date of Birth" error={errors.date_of_birth}>
            <input className="form-input" type="date" value={form.date_of_birth}
              onChange={e => handleChange('date_of_birth', e.target.value)}
              max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
            />
            {form.date_of_birth && (() => {
              const dob = new Date(form.date_of_birth);
              const today = new Date();
              let age = today.getFullYear() - dob.getFullYear();
              const m = today.getMonth() - dob.getMonth();
              if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
              if (age >= 18 && age <= 36) return <p className="text-[#2D6A2F] text-xs mt-1 font-medium">Age: {age} years ✓</p>;
              return null;
            })()}
          </Field>
          <Field label="State of Origin" error={errors.state_of_origin}>
            <select className="form-input" value={form.state_of_origin} onChange={e => handleChange('state_of_origin', e.target.value)}>
              <option value="">Select state</option>
              {NIGERIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Current Lagos LGA of Residence" error={errors.current_lga}>
            <select className="form-input" value={form.current_lga} onChange={e => handleChange('current_lga', e.target.value)}>
              <option value="">Select your LGA</option>
              {LAGOS_LGAS.map(lga => <option key={lga} value={lga}>{lga}</option>)}
            </select>
          </Field>
          <Field label="LASRRA / LAG-ID Number (optional)" error={errors.lasrra_id}>
            <input
              className="form-input uppercase"
              value={form.lasrra_id}
              onChange={e => handleChange('lasrra_id', e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12))}
              placeholder="LAxxxxxxxxxx"
              pattern="LA[A-Z0-9]{10}"
              maxLength={12}
              autoComplete="off"
            />
            <p className="text-[#7A7A8A] text-xs mt-1">
              You can apply without a LASRRA ID. If you have one, use the 12-character format shown on your resident record and you may first{' '}
              <a
                href="https://registration.lagosresidents.gov.ng/validation/"
                target="_blank"
                rel="noreferrer"
                className="text-[#006838] underline font-medium"
              >
                confirm that LASRRA finds your record
              </a>.
              {' '}Providing it now helps us confirm your record, but it is not required to submit your application.
            </p>
            <div className="mt-3 rounded-lg border border-[#F0B429] bg-[#FFF8E1] p-3 text-sm text-[#5D4700]">
              <strong>Residency verification before training:</strong> If selected, you must present your original LASRRA card, LASRRA printout or another approved proof of Lagos residency before training begins on Day 1.
            </div>
          </Field>
          <Field label="Are you currently resident in Lagos State?" error={errors.lagos_resident}>
            <RadioGroup options={['Yes', 'No']} value={form.lagos_resident} onChange={v => handleChange('lagos_resident', v)} />
            {form.lagos_resident === 'No' && (
              <div className="mt-2 bg-[#FFF8E1] border border-[#FFE082] rounded-lg p-3 text-sm text-[#333333]">
                Funding support is provided to train Lagos residents, so non-residents are not eligible for this application round.
              </div>
            )}
          </Field>
          <Field label="Highest Educational Qualification" error={errors.education}>
            <select className="form-input" value={form.education} onChange={e => handleChange('education', e.target.value)}>
              <option value="">Select qualification</option>
              {EDUCATION_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </Field>
          <Field label="Current employment status" error={errors.employment_status}>
            <RadioGroup options={['Unemployed', 'Self-employed', 'Employed part-time', 'Employed full-time', 'Student']} value={form.employment_status} onChange={v => handleChange('employment_status', v)} />
          </Field>
          <Field label="Years of digital marketing experience" error={errors.years_experience}>
            <RadioGroup options={EXPERIENCE_OPTIONS} value={form.years_experience} onChange={v => handleChange('years_experience', v)} />
          </Field>
          <Field label="Years of direct sales, field sales, agent banking or affiliate recruitment experience" error={errors.direct_sales_experience}>
            <RadioGroup options={EXPERIENCE_OPTIONS} value={form.direct_sales_experience} onChange={v => handleChange('direct_sales_experience', v)} />
          </Field>
          <Field label="Which digital platforms have you used?" error={errors.social_platforms}>
            <div className="flex flex-wrap gap-2">
              {SOCIAL_PLATFORMS.map(p => (
                <button type="button" key={p} onClick={() => togglePlatform(p)}
                  className={`px-3.5 py-2 rounded-full text-sm font-medium border transition-all ${
                    form.social_platforms.includes(p) ? 'bg-[#2D6A2F] text-white border-[#2D6A2F]' : 'bg-white text-[#333333] border-[#E2E8E2] hover:border-[#2D6A2F]'
                  }`}>
                  {p}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Have you ever worked in affiliate marketing, agent banking, or field sales?" error={errors.affiliate_experience}>
            <RadioGroup options={['Yes', 'No']} value={form.affiliate_experience} onChange={v => handleChange('affiliate_experience', v)} />
          </Field>
          {form.affiliate_experience === 'Yes' && (
            <Field label="Briefly describe that experience (optional, 20–200 words)">
              <textarea className="form-input min-h-[100px]" value={form.affiliate_experience_desc} onChange={e => handleChange('affiliate_experience_desc', e.target.value)} placeholder="Describe your experience..." />
            </Field>
          )}
          <Field label="Can you attend and fully participate in two weeks of intensive practical training?" error={errors.availability_2_weeks}>
            <RadioGroup options={['Yes', 'No']} value={form.availability_2_weeks} onChange={v => handleChange('availability_2_weeks', v)} />
          </Field>
          <Field label="Do you have reliable access to a smartphone?" error={errors.has_smartphone}>
            <RadioGroup options={['Yes', 'No']} value={form.has_smartphone} onChange={v => handleChange('has_smartphone', v)} />
          </Field>
          <Field label="Do you have access to a laptop?" error={errors.has_laptop}>
            <RadioGroup options={['Yes', 'No', 'Occasionally']} value={form.has_laptop} onChange={v => handleChange('has_laptop', v)} />
          </Field>
          <Field label="Do you have reliable internet access for training and assignments?" error={errors.internet_access}>
            <RadioGroup options={['Yes', 'No', 'Sometimes']} value={form.internet_access} onChange={v => handleChange('internet_access', v)} />
          </Field>
          <Field label="If offered employment by Transbill after training, are you willing to recruit Affiliate Bankers and manage their performance for the FirstBank SME Account Acquisition Project?" error={errors.willing_affiliate_role}>
            <RadioGroup options={['Yes', 'No']} value={form.willing_affiliate_role} onChange={v => handleChange('willing_affiliate_role', v)} />
          </Field>
          <Field label="Why should you be selected for this programme? (50–200 words)" error={errors.motivation}>
            <textarea className="form-input min-h-[140px]" value={form.motivation} onChange={e => handleChange('motivation', e.target.value)} placeholder="Describe your interest, learning commitment and relevant potential..." />
            <div className={`text-xs mt-1 font-medium ${wordCount < 50 || wordCount > 200 ? 'text-[#D32F2F]' : 'text-[#2D6A2F]'}`}>
              {wordCount}/200 words {wordCount < 50 && `(minimum 50)`}
            </div>
          </Field>
          <Field label="LinkedIn profile or portfolio link (optional)">
            <input className="form-input" value={form.linkedin_url} onChange={e => handleChange('linkedin_url', e.target.value)} placeholder="https://" />
          </Field>
          <Field label="How did you hear about this programme?" error={errors.referral_source}>
            <select className="form-input" value={form.referral_source} onChange={e => handleChange('referral_source', e.target.value)}>
              <option value="">Select</option>
              {REFERRAL_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </Field>
          <Field label="Applicant Consent" error={errors.data_processing_consent}>
            <label className="flex items-start gap-3 rounded-[10px] border border-[#E2E8E2] p-4 cursor-pointer">
              <input
                type="checkbox"
                className="mt-1"
                checked={form.data_processing_consent}
                onChange={e => handleChange('data_processing_consent', e.target.checked)}
              />
              <span className="text-sm text-[#333333] leading-relaxed">
                I consent to Transbill processing my application information and, if I provide a LASRRA/LAG-ID, checking whether the record exists. I understand that I must present approved proof of Lagos residency before training begins on Day 1. I also understand that training does not guarantee employment and that employment offers from Transbill will be made only to successful participants who meet Transbill&apos;s selection requirements.
              </span>
            </label>
          </Field>
          {errors.submit && <p className="text-[#D32F2F] text-sm font-medium text-center">{errors.submit}</p>}
          <button type="submit" disabled={submitting}
            className="w-full bg-[#3A7D3C] hover:bg-[#4A9A4D] disabled:opacity-50 text-white font-bold text-base py-3.5 rounded-full transition-all shadow-md mt-4">
            {submitting ? 'Submitting...' : 'Submit Application →'}
          </button>
        </form>
      </div>
      <Footer />
      <style>{`
        .form-input {
          width: 100%;
          padding: 0.7rem 0.9rem;
          border-radius: 10px;
          border: 1.5px solid #E2E8E2;
          font-size: 0.9rem;
          color: #1A1A1A;
          background: white;
          outline: none;
          transition: border-color 0.2s;
        }
        .form-input:focus { border-color: #2D6A2F; }
        .form-input::placeholder { color: #7A7A8A; }
        select.form-input { appearance: auto; }
      `}</style>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">{label}</label>
      {children}
      {error && <p className="text-[#D32F2F] text-xs mt-1 font-medium">{error}</p>}
    </div>
  );
}

function RadioGroup({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(o => (
        <button type="button" key={o} onClick={() => onChange(o)}
          className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
            value === o ? 'bg-[#2D6A2F] text-white border-[#2D6A2F]' : 'bg-white text-[#333333] border-[#E2E8E2] hover:border-[#2D6A2F]'
          }`}>
          {o}
        </button>
      ))}
    </div>
  );
}