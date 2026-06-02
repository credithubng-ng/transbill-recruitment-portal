import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Calendar, CheckCircle2, XCircle, PauseCircle, ChevronDown, ChevronUp } from 'lucide-react';

export default function InterviewSection({ applicant, onUpdate }) {
  const [showSchedule, setShowSchedule] = useState(false);
  const [showOutcome, setShowOutcome] = useState(false);

  const [schedDate, setSchedDate] = useState(
    applicant.interview_scheduled_at
      ? applicant.interview_scheduled_at.slice(0, 16)
      : ''
  );
  const [schedLocation, setSchedLocation] = useState(applicant.interview_location || '');
  const [scheduling, setScheduling] = useState(false);
  const [schedError, setSchedError] = useState('');

  const [outcome, setOutcome] = useState('');
  const [outcomeNotes, setOutcomeNotes] = useState(applicant.interview_outcome_notes || '');
  const [recording, setRecording] = useState(false);
  const [outcomeError, setOutcomeError] = useState('');

  const handleSchedule = async () => {
    setSchedError('');
    if (!schedDate) { setSchedError('Please select a date and time'); return; }
    setScheduling(true);
    try {
      await base44.functions.invoke('scheduleInterview', {
        applicantId: applicant.id,
        interview_scheduled_at: new Date(schedDate).toISOString(),
        interview_location: schedLocation
      });
      onUpdate({
        ...applicant,
        interview_scheduled_at: new Date(schedDate).toISOString(),
        interview_location: schedLocation,
        interview_email_sent: true,
        candidate_stage: 'Interview Scheduled'
      });
      setShowSchedule(false);
    } catch (err) {
      setSchedError(err.message || 'Failed to schedule interview');
    } finally {
      setScheduling(false);
    }
  };

  const handleRecordOutcome = async () => {
    setOutcomeError('');
    if (!outcome) { setOutcomeError('Please select an outcome'); return; }
    setRecording(true);
    try {
      const res = await base44.functions.invoke('recordInterviewOutcome', {
        applicantId: applicant.id,
        outcome,
        notes: outcomeNotes
      });
      onUpdate({
        ...applicant,
        interview_outcome: outcome,
        interview_outcome_notes: outcomeNotes,
        interview_outcome_email_sent: res.data?.stage !== 'Interview Scheduling',
        candidate_stage: res.data?.stage
      });
      setShowOutcome(false);
    } catch (err) {
      setOutcomeError(err.message || 'Failed to record outcome');
    } finally {
      setRecording(false);
    }
  };

  const formatDateTime = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('en-NG', {
      weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true,
      timeZone: 'Africa/Lagos'
    });
  };

  const outcomeColor = {
    Pass: 'text-[#2D6A2F] bg-[#EBF5EB] border-[#2D6A2F]/20',
    Fail: 'text-[#D32F2F] bg-red-50 border-red-200',
    Hold: 'text-[#B45309] bg-amber-50 border-amber-200'
  };

  return (
    <div className="space-y-3">
      <h3 className="font-bold text-sm text-[#1A1A1A] border-b border-[#E2E8E2] pb-2">Interview</h3>

      {/* Current state summary */}
      {applicant.interview_scheduled_at && (
        <div className="bg-[#F8FAF8] rounded-[10px] p-3 text-xs space-y-1">
          <p className="text-[#7A7A8A] font-medium">Scheduled</p>
          <p className="text-[#1A1A1A] font-semibold">{formatDateTime(applicant.interview_scheduled_at)}</p>
          {applicant.interview_location && (
            <p className="text-[#555555]">{applicant.interview_location}</p>
          )}
          {applicant.interview_email_sent && (
            <p className="text-[#2D6A2F] flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Invite email sent</p>
          )}
        </div>
      )}

      {applicant.interview_outcome && (
        <div className={`rounded-[10px] p-3 text-xs border ${outcomeColor[applicant.interview_outcome]}`}>
          <p className="font-bold text-sm mb-1">Outcome: {applicant.interview_outcome}</p>
          {applicant.interview_outcome_notes && <p className="opacity-80">{applicant.interview_outcome_notes}</p>}
          {applicant.interview_outcome_email_sent && <p className="mt-1 flex items-center gap-1 opacity-70"><CheckCircle2 className="w-3 h-3" /> Email sent to candidate</p>}
        </div>
      )}

      {/* Schedule Interview */}
      <button
        onClick={() => { setShowSchedule(v => !v); setShowOutcome(false); }}
        className="w-full flex items-center justify-between px-3 py-2.5 rounded-[10px] border border-[#E2E8E2] hover:border-[#2D6A2F] text-sm font-medium text-[#1A1A1A] transition-all"
      >
        <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-[#2D6A2F]" />
          {applicant.interview_scheduled_at ? 'Reschedule Interview' : 'Schedule Interview'}
        </span>
        {showSchedule ? <ChevronUp className="w-4 h-4 text-[#7A7A8A]" /> : <ChevronDown className="w-4 h-4 text-[#7A7A8A]" />}
      </button>

      {showSchedule && (
        <div className="bg-[#F8FAF8] rounded-[10px] p-4 space-y-3 border border-[#E2E8E2]">
          <div>
            <label className="text-xs font-semibold text-[#7A7A8A] block mb-1">Date & Time</label>
            <input
              type="datetime-local"
              value={schedDate}
              onChange={e => setSchedDate(e.target.value)}
              className="w-full px-3 py-2 rounded-[8px] border-[1.5px] border-[#E2E8E2] focus:border-[#2D6A2F] outline-none text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-[#7A7A8A] block mb-1">Location / Meeting Link (optional)</label>
            <input
              type="text"
              value={schedLocation}
              onChange={e => setSchedLocation(e.target.value)}
              placeholder="e.g. 12 Victoria Island or https://meet.google.com/..."
              className="w-full px-3 py-2 rounded-[8px] border-[1.5px] border-[#E2E8E2] focus:border-[#2D6A2F] outline-none text-sm"
            />
          </div>
          {schedError && <p className="text-[#D32F2F] text-xs font-medium">{schedError}</p>}
          <button
            onClick={handleSchedule}
            disabled={scheduling}
            className="w-full bg-[#3A7D3C] hover:bg-[#4A9A4D] disabled:opacity-50 text-white font-bold py-2.5 rounded-full text-sm transition-all"
          >
            {scheduling ? 'Scheduling...' : 'Schedule & Send Email'}
          </button>
        </div>
      )}

      {/* Record Outcome */}
      <button
        onClick={() => { setShowOutcome(v => !v); setShowSchedule(false); }}
        className="w-full flex items-center justify-between px-3 py-2.5 rounded-[10px] border border-[#E2E8E2] hover:border-[#2D6A2F] text-sm font-medium text-[#1A1A1A] transition-all"
      >
        <span className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#2D6A2F]" />
          Record Interview Outcome
        </span>
        {showOutcome ? <ChevronUp className="w-4 h-4 text-[#7A7A8A]" /> : <ChevronDown className="w-4 h-4 text-[#7A7A8A]" />}
      </button>

      {showOutcome && (
        <div className="bg-[#F8FAF8] rounded-[10px] p-4 space-y-3 border border-[#E2E8E2]">
          <div>
            <label className="text-xs font-semibold text-[#7A7A8A] block mb-2">Outcome</label>
            <div className="flex gap-2">
              {['Pass', 'Fail', 'Hold'].map(o => (
                <button
                  key={o}
                  type="button"
                  onClick={() => setOutcome(o)}
                  className={`flex-1 py-2.5 rounded-[8px] text-sm font-bold border-2 transition-all flex items-center justify-center gap-1.5 ${
                    outcome === o
                      ? o === 'Pass' ? 'bg-[#2D6A2F] text-white border-[#2D6A2F]'
                        : o === 'Fail' ? 'bg-[#D32F2F] text-white border-[#D32F2F]'
                        : 'bg-amber-500 text-white border-amber-500'
                      : 'bg-white text-[#555555] border-[#E2E8E2] hover:border-[#999]'
                  }`}
                >
                  {o === 'Pass' && <CheckCircle2 className="w-3.5 h-3.5" />}
                  {o === 'Fail' && <XCircle className="w-3.5 h-3.5" />}
                  {o === 'Hold' && <PauseCircle className="w-3.5 h-3.5" />}
                  {o}
                </button>
              ))}
            </div>
            {outcome === 'Pass' && <p className="text-xs text-[#2D6A2F] mt-2">✓ Candidate will receive an email with a Transbill.ng registration link</p>}
            {outcome === 'Fail' && <p className="text-xs text-[#D32F2F] mt-2">✗ Candidate will receive a polite rejection email</p>}
            {outcome === 'Hold' && <p className="text-xs text-amber-600 mt-2">⏸ No email sent — you can reschedule a second interview</p>}
          </div>
          <div>
            <label className="text-xs font-semibold text-[#7A7A8A] block mb-1">Notes (optional)</label>
            <textarea
              value={outcomeNotes}
              onChange={e => setOutcomeNotes(e.target.value)}
              placeholder="Add any notes about the interview outcome..."
              className="w-full px-3 py-2 rounded-[8px] border-[1.5px] border-[#E2E8E2] focus:border-[#2D6A2F] outline-none text-sm min-h-[60px]"
            />
          </div>
          {outcomeError && <p className="text-[#D32F2F] text-xs font-medium">{outcomeError}</p>}
          <button
            onClick={handleRecordOutcome}
            disabled={recording || !outcome}
            className="w-full bg-[#3A7D3C] hover:bg-[#4A9A4D] disabled:opacity-50 text-white font-bold py-2.5 rounded-full text-sm transition-all"
          >
            {recording ? 'Saving...' : 'Record Outcome'}
          </button>
        </div>
      )}
    </div>
  );
}