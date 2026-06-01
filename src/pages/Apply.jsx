import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import TransbillLogo from '../components/TransbillLogo';
import ProgressIndicator from '../components/ProgressIndicator';
import Footer from '../components/landing/Footer';
import { NIGERIA_STATES } from '../lib/nigeriaStates';
import { CheckCircle2 } from 'lucide-react';

const SOCIAL_PLATFORMS = ['WhatsApp Business', 'Instagram', 'Facebook', 'TikTok', 'X (Twitter)', 'LinkedIn', 'YouTube', 'Others'];
const EDUCATION_OPTIONS = ['SSCE', 'OND', 'HND', 'BSc', 'MSc', 'PhD', 'Professional Certification', 'Other'];
const EXPERIENCE_OPTIONS = ['Less than 1 year', '1–3 years', '3–5 years', '5+ years'];
const REFERRAL_OPTIONS = ['SAIL Alumni Network', '3MTT Community', 'Social Media — Instagram', 'Social Media — Facebook', 'Social Media — WhatsApp', 'Referral from a friend', 'Google Search', 'Other'];

export default function Apply() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: '', email: '', phone: '', gender: '', state_of_origin: '', current_lga: '',
    lagos_resident: '', education: '', years_experience: '', is_3mtt: '', is_sail: '',
    social_platforms: [], affiliate_experience: '', affiliate_experience_desc: '',
    motivation: '', linkedin_url: '', referral_source: ''
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [applicantId, setApplicantId] = useState(null);

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
    if (!form.state_of_origin) errs.state_of_origin = 'Required';
    if (!form.current_lga.trim()) errs.current_lga = 'Required';
    if (!form.lagos_resident) errs.lagos_resident = 'Required';
    if (!form.education) errs.education = 'Required';
    if (!form.years_experience) errs.years_experience = 'Required';
    if (!form.is_3mtt) errs.is_3mtt = 'Required';
    if (!form.is_sail) errs.is_sail = 'Required';
    if (form.social_platforms.length === 0) errs.social_platforms = 'Select at least one';
    if (!form.affiliate_experience) errs.affiliate_experience = 'Required';
    if (wordCount < 100 || wordCount > 300) errs.motivation = 'Must be 100–300 words';
    if (!form.referral_source) errs.referral_source = 'Required';
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
      // Check duplicate email
      const existing = await base44.entities.Applicant.filter({ email: form.email.trim().toLowerCase() });
      if (existing.length > 0) {
        setErrors({ email: 'Our records show this email address has already been used to apply. Each candidate may only apply once.' });
        setSubmitting(false);
        return;
      }
      const applicant = await base44.entities.Applicant.create({
        ...form,
        email: form.email.trim().toLowerCase(),
        status: 'Applied',
        assessment_completed: false
      });
      setApplicantId(applicant.id);
      setSubmitted(true);
    } catch (err) {
      setErrors({ submit: 'Something went wrong. Please check your connection and try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    const firstName = form.full_name.split(' ')[0];
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-16">
        <div className="w-20 h-20 rounded-full bg-[#2D6A2F] flex items-center justify-center mb-6">
          <CheckCircle2 className="w-10 h-10 text-white" />
        </div>
        <h1 className="font-extrabold text-2xl sm:text-3xl tracking-[-1px] text-[#1A1A1A] text-center mb-3">
          Application Received, {firstName}!
        </h1>
        <p className="text-[#555555] text-center max-w-md text-[15px] leading-relaxed mb-8">
          You will now complete a short competency assessment. This test has 25 questions and must be completed within 30 minutes. You cannot pause or go back. Make sure you are in a quiet place with a stable internet connection before you begin.
        </p>
        <button
          onClick={() => navigate(`/assessment?id=${applicantId}`)}
          className="bg-[#3A7D3C] hover:bg-[#4A9A4D] text-white font-bold text-base px-8 py-3.5 rounded-full transition-all shadow-md"
        >
          I'm Ready — Start the Assessment →
        </button>
        <p className="text-[#7A7A8A] text-xs text-center max-w-sm mt-5">
          If you close this page before completing the test, your application will remain saved but you will need to re-enter your email to resume the assessment.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#E2E8E2]">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <TransbillLogo />
        </div>
      </div>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4">
        <ProgressIndicator currentStep={1} />
        <h1 className="font-extrabold text-2xl sm:text-3xl tracking-[-1px] text-[#1A1A1A] text-center mb-1">
          Tell Us About <span className="text-[#2D6A2F]">Yourself</span>
        </h1>
        <p className="text-[#7A7A8A] text-center text-sm mb-8">Complete all required fields. This takes about 5 minutes.</p>

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
          <Field label="State of Origin" error={errors.state_of_origin}>
            <select className="form-input" value={form.state_of_origin} onChange={e => handleChange('state_of_origin', e.target.value)}>
              <option value="">Select state</option>
              {NIGERIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Current LGA of Residence" error={errors.current_lga}>
            <input className="form-input" value={form.current_lga} onChange={e => handleChange('current_lga', e.target.value)} placeholder="Your LGA" />
          </Field>
          <Field label="Are you currently resident in Lagos State?" error={errors.lagos_resident}>
            <RadioGroup options={['Yes', 'No']} value={form.lagos_resident} onChange={v => handleChange('lagos_resident', v)} />
            {form.lagos_resident === 'No' && (
              <div className="mt-2 bg-[#FFF8E1] border border-[#FFE082] rounded-lg p-3 text-sm text-[#333333]">
                Initial deployment is Lagos-based. You may still apply — we plan expansion to additional states.
              </div>
            )}
          </Field>
          <Field label="Highest Educational Qualification" error={errors.education}>
            <select className="form-input" value={form.education} onChange={e => handleChange('education', e.target.value)}>
              <option value="">Select qualification</option>
              {EDUCATION_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </Field>
          <Field label="Years of digital marketing experience" error={errors.years_experience}>
            <RadioGroup options={EXPERIENCE_OPTIONS} value={form.years_experience} onChange={v => handleChange('years_experience', v)} />
          </Field>
          <Field label="Have you completed a 3MTT Digital Marketing programme?" error={errors.is_3mtt}>
            <RadioGroup options={['Yes', 'No']} value={form.is_3mtt} onChange={v => handleChange('is_3mtt', v)} />
          </Field>
          <Field label="Are you a SAIL Innovation Lab alumnus?" error={errors.is_sail}>
            <RadioGroup options={['Yes', 'No']} value={form.is_sail} onChange={v => handleChange('is_sail', v)} />
          </Field>
          <Field label="Which social media platforms do you manage professionally?" error={errors.social_platforms}>
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
          <Field label="Why do you want this role at Transbill? (100–300 words)" error={errors.motivation}>
            <textarea className="form-input min-h-[140px]" value={form.motivation} onChange={e => handleChange('motivation', e.target.value)} placeholder="Tell us why you're the right fit..." />
            <div className={`text-xs mt-1 font-medium ${wordCount < 100 || wordCount > 300 ? 'text-[#D32F2F]' : 'text-[#2D6A2F]'}`}>
              {wordCount}/300 words {wordCount < 100 && `(minimum 100)`}
            </div>
          </Field>
          <Field label="LinkedIn profile or portfolio link (optional)">
            <input className="form-input" value={form.linkedin_url} onChange={e => handleChange('linkedin_url', e.target.value)} placeholder="https://" />
          </Field>
          <Field label="How did you hear about this role?" error={errors.referral_source}>
            <select className="form-input" value={form.referral_source} onChange={e => handleChange('referral_source', e.target.value)}>
              <option value="">Select</option>
              {REFERRAL_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
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