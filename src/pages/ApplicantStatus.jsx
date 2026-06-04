import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import TransbillLogo from '../components/TransbillLogo';
import InterviewSlotPicker from '../components/status/InterviewSlotPicker';
import { CheckCircle2, Clock, XCircle, AlertCircle, LogOut, ChevronRight } from 'lucide-react';

const STAGE_CONFIG = {
  'Assessment Started': { color: 'text-[#F57C00]', bg: 'bg-[#FFF3E0]', icon: Clock, label: 'Assessment In Progress' },
  'Assessment Completed': { color: 'text-[#1565C0]', bg: 'bg-[#E3F2FD]', icon: Clock, label: 'Assessment Completed' },
  'Interview Ready': { color: 'text-[#2D6A2F]', bg: 'bg-[#EBF5EB]', icon: CheckCircle2, label: 'Interview Ready' },
  'Reserve List': { color: 'text-[#F57C00]', bg: 'bg-[#FFF3E0]', icon: AlertCircle, label: 'Reserve List' },
  'Not Progressed': { color: 'text-[#9E9E9E]', bg: 'bg-[#F5F5F5]', icon: XCircle, label: 'Not Progressed' },
  'Email Sent': { color: 'text-[#1565C0]', bg: 'bg-[#E3F2FD]', icon: CheckCircle2, label: 'Outcome Email Sent' },

  'Interview Scheduling': { color: 'text-[#1565C0]', bg: 'bg-[#E3F2FD]', icon: Clock, label: 'Interview Being Scheduled' },
  'Interview Scheduled': { color: 'text-[#2D6A2F]', bg: 'bg-[#EBF5EB]', icon: CheckCircle2, label: 'Interview Scheduled' },
  'Interview Outcome – Pass': { color: 'text-[#2D6A2F]', bg: 'bg-[#EBF5EB]', icon: CheckCircle2, label: 'Interview Passed' },
  'Interview Outcome – Hold': { color: 'text-[#F57C00]', bg: 'bg-[#FFF3E0]', icon: AlertCircle, label: 'Interview – On Hold' },
  'Final Hiring Decision': { color: 'text-[#1565C0]', bg: 'bg-[#E3F2FD]', icon: Clock, label: 'Final Hiring Decision' },
  'Closed – Not Progressed': { color: 'text-[#9E9E9E]', bg: 'bg-[#F5F5F5]', icon: XCircle, label: 'Application Closed' },
};

const STEPS = [
  { key: 'apply', label: 'Application Submitted' },
  { key: 'assessment', label: 'Assessment' },
  { key: 'interview', label: 'Interview' },
  { key: 'decision', label: 'Final Decision' },
];

function getActiveStep(stage, status, assessmentCompleted) {
  if (!stage && !status) return 0;
  if (['Closed – Not Progressed', 'Final Hiring Decision', 'Interview Outcome – Pass', 'Interview Outcome – Hold'].includes(stage)) return 3;
  if (['Interview Scheduling', 'Interview Scheduled'].includes(stage)) return 2;
  if (['Assessment Started', 'Assessment Completed', 'Email Sent', 'Interview Ready', 'Reserve List', 'Not Progressed'].includes(stage)) return 1;
  // Fallback: if assessment is completed but stage is unrecognised (e.g. legacy value), still show step 1
  if (assessmentCompleted) return 1;
  return 0;
}

export default function ApplicantStatus() {
  const [applicant, setApplicant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function load() {
      const authed = await base44.auth.isAuthenticated();
      if (!authed) {
        window.location.href = '/login?next=/status';
        return;
      }
      const me = await base44.auth.me();
      setUser(me);

      // Find applicant by email (created_by_id or email match)
      const results = await base44.entities.Applicant.filter({ email: me.email });
      if (results && results.length > 0) {
        setApplicant(results[0]);
      }
      setLoading(false);
    }
    load();
  }, []);

  const handleLogout = () => {
    base44.auth.logout('/');
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#E2E8E2] border-t-[#2D6A2F] rounded-full animate-spin" />
      </div>
    );
  }

  const stage = applicant?.candidate_stage;
  const stageConfig = STAGE_CONFIG[stage] || { color: 'text-[#7A7A8A]', bg: 'bg-[#F8FAF8]', icon: Clock, label: stage || 'Application Received' };
  const StageIcon = stageConfig.icon;
  const activeStep = getActiveStep(stage, applicant?.status, applicant?.assessment_completed);

  const scorePercent = applicant?.assessment_completed
    ? Math.round((applicant.assessment_score / 25) * 100)
    : null;

  return (
    <div className="min-h-screen bg-[#F8FAF8]">
      {/* Header */}
      <div className="bg-white border-b border-[#E2E8E2]">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <TransbillLogo />
          <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm text-[#7A7A8A] hover:text-[#1A1A1A]">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Greeting */}
        <div>
          <h1 className="font-extrabold text-2xl tracking-[-0.5px] text-[#1A1A1A]">
            Hello, {user?.full_name?.split(' ')[0] || 'Applicant'} 👋
          </h1>
          <p className="text-[#7A7A8A] text-sm mt-1">Here's your application status.</p>
        </div>

        {!applicant ? (
          /* No application found */
          <div className="bg-white rounded-[14px] border border-[#E2E8E2] p-8 text-center">
            <AlertCircle className="w-12 h-12 text-[#F57C00] mx-auto mb-3" />
            <h2 className="font-bold text-lg text-[#1A1A1A] mb-2">No Application Found</h2>
            <p className="text-[#7A7A8A] text-sm mb-6">We couldn't find an application linked to this account.</p>
            <a href="/apply"
              className="inline-flex items-center gap-2 bg-[#3A7D3C] hover:bg-[#4A9A4D] text-white font-bold text-sm px-6 py-3 rounded-full transition-all">
              Start Application <ChevronRight className="w-4 h-4" />
            </a>
          </div>
        ) : (
          <>
            {/* Current Status Card */}
            <div className="bg-white rounded-[14px] border border-[#E2E8E2] p-6">
              <p className="text-xs font-semibold text-[#7A7A8A] uppercase tracking-wide mb-3">Current Status</p>
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${stageConfig.bg}`}>
                <StageIcon className={`w-4 h-4 ${stageConfig.color}`} />
                <span className={`font-bold text-sm ${stageConfig.color}`}>{stageConfig.label}</span>
              </div>

              {/* Progress Steps */}
              <div className="mt-6 flex items-center gap-0">
                {STEPS.map((step, i) => (
                  <React.Fragment key={step.key}>
                    <div className="flex flex-col items-center flex-1">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                        i < activeStep ? 'bg-[#2D6A2F] border-[#2D6A2F] text-white'
                        : i === activeStep ? 'bg-white border-[#2D6A2F] text-[#2D6A2F]'
                        : 'bg-white border-[#E2E8E2] text-[#BDBDBD]'
                      }`}>
                        {i < activeStep ? '✓' : i + 1}
                      </div>
                      <p className={`text-[10px] mt-1 text-center leading-tight ${i <= activeStep ? 'text-[#1A1A1A] font-medium' : 'text-[#BDBDBD]'}`}>
                        {step.label}
                      </p>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className={`h-0.5 flex-1 mb-4 ${i < activeStep ? 'bg-[#2D6A2F]' : 'bg-[#E2E8E2]'}`} />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Application Details */}
            <div className="bg-white rounded-[14px] border border-[#E2E8E2] p-6 space-y-3">
              <p className="text-xs font-semibold text-[#7A7A8A] uppercase tracking-wide mb-1">Application Details</p>
              <Row label="Full Name" value={applicant.full_name} />
              <Row label="Email" value={applicant.email} />
              <Row label="Phone" value={applicant.phone} />
              <Row label="Education" value={applicant.education} />
              <Row label="Experience" value={applicant.years_experience} />
              <Row label="Lagos Resident" value={applicant.lagos_resident} />
              <Row label="Applied" value={applicant.created_date ? new Date(applicant.created_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'} />
            </div>

            {/* Assessment Results */}
            {applicant.assessment_completed && (
              <div className="bg-white rounded-[14px] border border-[#E2E8E2] p-6">
                <p className="text-xs font-semibold text-[#7A7A8A] uppercase tracking-wide mb-4">Assessment Results</p>
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-full flex flex-col items-center justify-center font-extrabold text-lg border-4 ${
                    scorePercent >= 84 ? 'border-[#2D6A2F] text-[#2D6A2F]'
                    : scorePercent >= 64 ? 'border-[#F57C00] text-[#F57C00]'
                    : 'border-[#9E9E9E] text-[#9E9E9E]'
                  }`}>
                    {scorePercent}%
                  </div>
                  <div>
                    <p className="font-bold text-[#1A1A1A]">{applicant.assessment_score}/25 questions correct</p>
                    <p className="text-sm text-[#7A7A8A]">Assessment completed</p>
                  </div>
                </div>
              </div>
            )}

            {/* Interview Slot Picker */}
            {applicant.candidate_stage === 'Interview Scheduling' && !applicant.interview_scheduled_at && (
              <div className="bg-white rounded-[14px] border border-[#E2E8E2] p-6">
                <p className="text-xs font-semibold text-[#7A7A8A] uppercase tracking-wide mb-3">Book Your Interview</p>
                <InterviewSlotPicker
                  applicant={applicant}
                  onBooked={(slot_datetime, location) => {
                    setApplicant(prev => ({
                      ...prev,
                      interview_scheduled_at: slot_datetime,
                      interview_location: location,
                      candidate_stage: 'Interview Scheduled',
                    }));
                  }}
                />
              </div>
            )}

            {/* Interview Info */}
            {applicant.interview_scheduled_at && (
              <div className="bg-[#EBF5EB] rounded-[14px] border border-[#2D6A2F]/20 p-6">
                <p className="text-xs font-semibold text-[#2D6A2F] uppercase tracking-wide mb-3">Interview Scheduled</p>
                <Row label="Date & Time" value={new Date(applicant.interview_scheduled_at).toLocaleString('en-GB', { dateStyle: 'full', timeStyle: 'short' })} />
                {applicant.interview_location && <Row label="Location" value={applicant.interview_location} />}
              </div>
            )}



            {/* Next Steps – Interview scheduling prompt */}
            {(stage === 'Interview Scheduling' || stage === 'Email Sent' || stage === 'Interview Ready' || stage === 'Reserve List') && !applicant.interview_scheduled_at && (
              <div className="bg-[#FFF8E1] border border-[#FFE082] rounded-[14px] p-5">
                <p className="font-bold text-[#1A1A1A] mb-1">Next Step: Book Your Interview</p>
                <p className="text-sm text-[#555555]">Check your email for the interview booking link, or visit the booking page directly using the link sent to you.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex gap-2">
      <span className="text-xs font-medium text-[#7A7A8A] min-w-[120px]">{label}:</span>
      <span className="text-xs text-[#333333]">{value || '—'}</span>
    </div>
  );
}