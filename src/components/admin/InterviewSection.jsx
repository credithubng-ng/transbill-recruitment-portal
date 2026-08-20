import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Calendar, CheckCircle2, XCircle, PauseCircle, ChevronDown, ChevronUp, Link2, Video, Users, Bot } from 'lucide-react';

const LAGOS_OFFSET = '+01:00';

export default function InterviewSection({ applicant, onUpdate, readOnly }) {
  const [showLivePanelSchedule, setShowLivePanelSchedule] = useState(false);
  const [showOutcome, setShowOutcome] = useState(false);
  const [referring, setReferring] = useState(false);
  const [referMsg, setReferMsg] = useState(null);

  // Live panel scheduling form state
  const [lpDate, setLpDate] = useState('');
  const [lpTime, setLpTime] = useState('');
  const [lpInterviewers, setLpInterviewers] = useState('');
  const [lpMeetingLink, setLpMeetingLink] = useState('');
  const [lpScheduling, setLpScheduling] = useState(false);
  const [lpError, setLpError] = useState('');
  const [lpSuccess, setLpSuccess] = useState('');

  // Outcome state
  const [outcome, setOutcome] = useState('');
  const [outcomeNotes, setOutcomeNotes] = useState(applicant.interview_outcome_notes || '');
  const [recording, setRecording] = useState(false);
  const [outcomeError, setOutcomeError] = useState('');

  const mode = applicant.interview_mode || 'legacy_unspecified';
  const digitalStages = ['AI Interview Shortlisted', 'AI Interview Scheduled', 'AI Interview Completed', 'AI Interview Reviewed'];
  const canReferToLivePanel = ['AI Interview Completed', 'AI Interview Reviewed'].includes(applicant.candidate_stage);

  const handleReferToLivePanel = async () => {
    if (!confirm('Refer this applicant to a Live Panel Interview? This will unlock the live panel scheduling flow.')) return;
    setReferring(true);
    setReferMsg(null);
    try {
      const token = sessionStorage.getItem('transbill_admin_token');
      const res = await base44.functions.invoke('referToLivePanel', { token, applicant_id: applicant.id });
      if (res.data?.error) throw new Error(res.data.error);
      setReferMsg(res.data.already_referred ? 'Already referred to live panel.' : 'Referred to live panel. You can now schedule the panel interview.');
      onUpdate({
        ...applicant,
        interview_mode: 'live_panel',
        candidate_stage: 'Live Panel Referred',
        live_panel_referred_at: new Date().toISOString(),
      });
    } catch (e) {
      setReferMsg(e?.response?.data?.error || e?.message || 'Unable to refer to live panel.');
    } finally {
      setReferring(false);
    }
  };

  const handleScheduleLivePanel = async () => {
    setLpError('');
    setLpSuccess('');
    if (!lpDate || !lpTime) { setLpError('Please select a date and time.'); return; }
    const iso = new Date(`${lpDate}T${lpTime}:00${LAGOS_OFFSET}`).toISOString();
    if (new Date(iso).getTime() <= Date.now() + 30 * 60 * 1000) {
      setLpError('The scheduled time must be at least 30 minutes from now.');
      return;
    }
    setLpScheduling(true);
    try {
      const token = sessionStorage.getItem('transbill_admin_token');
      const res = await base44.functions.invoke('scheduleLivePanel', {
        token,
        applicant_id: applicant.id,
        slot_datetime: iso,
        interviewer_names: lpInterviewers,
        meeting_link: lpMeetingLink,
      });
      if (res.data?.error) throw new Error(res.data.error);
      setLpSuccess('Live panel interview scheduled and invitation sent.');
      onUpdate({
        ...applicant,
        live_panel_scheduled_at: iso,
        live_panel_location: lpMeetingLink,
        live_panel_interviewer_names: lpInterviewers,
        live_panel_email_sent: true,
        candidate_stage: 'Live Panel Scheduled',
      });
      setShowLivePanelSchedule(false);
      setLpDate(''); setLpTime(''); setLpInterviewers(''); setLpMeetingLink('');
    } catch (e) {
      setLpError(e?.response?.data?.error || e?.message || 'Failed to schedule live panel interview.');
    } finally {
      setLpScheduling(false);
    }
  };

  const handleRecordOutcome = async () => {
    setOutcomeError('');
    if (!outcome) { setOutcomeError('Please select an outcome'); return; }
    setRecording(true);
    try {
      const token = sessionStorage.getItem('transbill_admin_token');
      const res = await base44.functions.invoke('recordInterviewOutcome', {
        applicantId: applicant.id, outcome, notes: outcomeNotes, token,
      });
      const stage = res?.data?.stage ?? res?.data;
      onUpdate({
        ...applicant,
        interview_outcome: outcome,
        interview_outcome_notes: outcomeNotes,
        interview_outcome_email_sent: res?.data?.emailSent ?? false,
        candidate_stage: typeof stage === 'string' ? stage : applicant.candidate_stage,
      });
      setShowOutcome(false);
    } catch (err) {
      setOutcomeError(err?.response?.data?.error || err.message || 'Failed to record outcome');
    } finally {
      setRecording(false);
    }
  };

  const formatDateTime = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('en-NG', {
      weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Africa/Lagos',
    });
  };

  const outcomeColor = {
    Pass: 'text-[#2D6A2F] bg-[#EBF5EB] border-[#2D6A2F]/20',
    Fail: 'text-[#D32F2F] bg-red-50 border-red-200',
    Hold: 'text-[#B45309] bg-amber-50 border-amber-200',
  };

  const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Africa/Lagos' });

  return (
    <div className="space-y-3">
      <h3 className="font-bold text-sm text-[#1A1A1A] border-b border-[#E2E8E2] pb-2">Interview</h3>

      {/* Interview Mode Badge */}
      <div className="flex items-center gap-2">
        {mode === 'structured_digital' && (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1565C0] bg-[#E3F2FD] px-3 py-1 rounded-full">
            <Bot className="w-3.5 h-3.5" /> Structured Digital Interview
          </span>
        )}
        {mode === 'live_panel' && (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F57C00] bg-[#FFF3E0] px-3 py-1 rounded-full">
            <Users className="w-3.5 h-3.5" /> Live Panel Interview
          </span>
        )}
        {mode === 'legacy_unspecified' && (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7A7A8A] bg-[#F5F5F5] px-3 py-1 rounded-full">
            Legacy / Unspecified
          </span>
        )}
      </div>

      {/* Structured Digital Interview status */}
      {digitalStages.includes(applicant.candidate_stage) && (
        <div className="bg-[#E3F2FD] rounded-[10px] p-3 text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-[#0D47A1]">
            <Bot className="w-3.5 h-3.5" /> Structured Digital Interview
          </div>
          <p className="text-[#555555]">Stage: <strong>{applicant.candidate_stage}</strong></p>
          {applicant.ai_interview_variant_id && <p className="text-[#555555]">Case variant: <strong>{applicant.ai_interview_variant_id}</strong></p>}
          <p className="text-[#7A7A8A] mt-1">Conducted on the Transbill portal — no Google Meet link.</p>
        </div>
      )}

      {/* Live Panel – referred status */}
      {applicant.candidate_stage === 'Live Panel Referred' && (
        <div className="bg-[#FFF3E0] rounded-[10px] p-3 text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-[#BF360C]">
            <Users className="w-3.5 h-3.5" /> Referred to Live Panel
          </div>
          {applicant.live_panel_referred_at && <p className="text-[#555555]">Referred: {formatDateTime(applicant.live_panel_referred_at)}</p>}
          {applicant.live_panel_referred_by && <p className="text-[#555555]">By: {applicant.live_panel_referred_by}</p>}
          <p className="text-[#7A7A8A] mt-1">Awaiting live panel scheduling by an admin.</p>
        </div>
      )}

      {/* Live Panel – scheduled status */}
      {applicant.candidate_stage === 'Live Panel Scheduled' && applicant.live_panel_scheduled_at && (
        <div className="bg-[#EBF5EB] rounded-[10px] p-3 text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-[#2D6A2F]">
            <Users className="w-3.5 h-3.5" /> Live Panel Scheduled
          </div>
          <p className="text-[#1A1A1A] font-semibold">{formatDateTime(applicant.live_panel_scheduled_at)}</p>
          {applicant.live_panel_interviewer_names && <p className="text-[#555555]">Panel: {applicant.live_panel_interviewer_names}</p>}
          {applicant.live_panel_location && (
            applicant.live_panel_location.startsWith('http') ? (
              <a href={applicant.live_panel_location} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[#2D6A2F] font-bold underline mt-1">
                <Video className="w-3 h-3" /> Join Live Panel Interview
              </a>
            ) : <p className="text-[#555555]">Location: {applicant.live_panel_location}</p>
          )}
          {applicant.live_panel_email_sent && <p className="text-[#2D6A2F] flex items-center gap-1 mt-1"><CheckCircle2 className="w-3 h-3" /> Invitation sent</p>}
        </div>
      )}

      {/* Refer to Live Panel – after digital interview review */}
      {canReferToLivePanel && mode !== 'live_panel' && (
        <div className="bg-[#FFF3E0] border border-[#F57C00]/30 rounded-[12px] p-4">
          <div className="flex items-center gap-1.5 text-[#BF360C] font-bold text-xs mb-2"><Users className="w-4 h-4" /> Refer to Live Panel Interview</div>
          <p className="text-xs text-[#555555] mb-3">After reviewing the structured digital interview, you can refer this candidate to a live panel interview. This unlocks the live panel scheduling flow.</p>
          <button onClick={handleReferToLivePanel} disabled={referring || readOnly}
            className="w-full bg-[#F57C00] hover:bg-[#E65100] disabled:opacity-50 text-white font-bold text-sm py-2.5 rounded-full transition-all">
            {referring ? 'Referring...' : 'Refer to Live Panel Interview'}
          </button>
          {referMsg && <p className="text-xs text-[#BF360C] mt-2 font-medium">{referMsg}</p>}
        </div>
      )}

      {/* Live Panel Scheduling – after referral */}
      {applicant.candidate_stage === 'Live Panel Referred' && (
        <button
          onClick={() => { setShowLivePanelSchedule(v => !v); setShowOutcome(false); }}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-[10px] border border-[#E2E8E2] hover:border-[#2D6A2F] text-sm font-medium text-[#1A1A1A] transition-all"
        >
          <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-[#2D6A2F]" /> Schedule Live Panel Interview</span>
          {showLivePanelSchedule ? <ChevronUp className="w-4 h-4 text-[#7A7A8A]" /> : <ChevronDown className="w-4 h-4 text-[#7A7A8A]" />}
        </button>
      )}

      {showLivePanelSchedule && (
        <div className="bg-[#F8FAF8] rounded-[10px] p-4 space-y-3 border border-[#E2E8E2]">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-semibold text-[#7A7A8A] block mb-1">Date (Lagos)</label>
              <input type="date" value={lpDate} min={todayStr} onChange={e => setLpDate(e.target.value)}
                className="w-full px-3 py-2 rounded-[8px] border-[1.5px] border-[#E2E8E2] focus:border-[#2D6A2F] outline-none text-sm" />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#7A7A8A] block mb-1">Time (WAT)</label>
              <input type="time" value={lpTime} onChange={e => setLpTime(e.target.value)}
                className="w-full px-3 py-2 rounded-[8px] border-[1.5px] border-[#E2E8E2] focus:border-[#2D6A2F] outline-none text-sm" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-[#7A7A8A] block mb-1">Panel Interviewers (optional)</label>
            <input type="text" value={lpInterviewers} onChange={e => setLpInterviewers(e.target.value)}
              placeholder="e.g. Amaka Obi, Tunde Adeyemi"
              className="w-full px-3 py-2 rounded-[8px] border-[1.5px] border-[#E2E8E2] focus:border-[#2D6A2F] outline-none text-sm" />
          </div>
          <div>
            <label className="text-xs font-semibold text-[#7A7A8A] block mb-1">Meeting Link / Location (optional)</label>
            <input type="text" value={lpMeetingLink} onChange={e => setLpMeetingLink(e.target.value)}
              placeholder="e.g. https://meet.google.com/... or 5 Broad St, Lagos"
              className="w-full px-3 py-2 rounded-[8px] border-[1.5px] border-[#E2E8E2] focus:border-[#2D6A2F] outline-none text-sm" />
          </div>
          {lpError && <p className="text-[#D32F2F] text-xs font-medium">{lpError}</p>}
          {lpSuccess && <p className="text-[#2D6A2F] text-xs font-medium">{lpSuccess}</p>}
          <button onClick={handleScheduleLivePanel} disabled={lpScheduling || readOnly || !lpDate || !lpTime}
            className="w-full bg-[#3A7D3C] hover:bg-[#4A9A4D] disabled:opacity-50 text-white font-bold py-2.5 rounded-full text-sm transition-all">
            {lpScheduling ? 'Scheduling...' : 'Schedule & Send Invitation'}
          </button>
        </div>
      )}

      {/* Legacy booking link info */}
      {applicant.booking_token && (
        <div className="bg-[#F8FAF8] rounded-[10px] p-3 text-xs space-y-2">
          <div className="flex items-center gap-1.5 font-semibold text-[#555555]">
            <Link2 className="w-3.5 h-3.5" /> Legacy Booking Link
          </div>
          {applicant.booking_link_sent_at && <p className="text-[#7A7A8A]">Sent: {formatDateTime(applicant.booking_link_sent_at)}</p>}
          {applicant.booking_used ? (
            <div className="space-y-1">
              <p className="text-[#2D6A2F] font-semibold flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Interview Booked</p>
              {applicant.interview_booked_at && <p className="text-[#7A7A8A]">Booked at: {formatDateTime(applicant.interview_booked_at)}</p>}
              {applicant.interview_meet_link && (
                <a href={applicant.interview_meet_link} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-[#2D6A2F] font-bold underline">
                  <Video className="w-3 h-3" /> Join Google Meet
                </a>
              )}
            </div>
          ) : applicant.booking_token_expires_at && new Date(applicant.booking_token_expires_at) < new Date() ? (
            <p className="text-amber-600 font-semibold">Link expired</p>
          ) : (
            <p className="text-[#7A7A8A]">Awaiting booking</p>
          )}
        </div>
      )}

      {/* Current state summary (legacy manual scheduling) */}
      {applicant.interview_scheduled_at && !applicant.live_panel_scheduled_at && (
        <div className="bg-[#F8FAF8] rounded-[10px] p-3 text-xs space-y-1">
          <p className="text-[#7A7A8A] font-medium">Scheduled (Legacy)</p>
          <p className="text-[#1A1A1A] font-semibold">{formatDateTime(applicant.interview_scheduled_at)}</p>
          {applicant.interview_location && <p className="text-[#555555]">{applicant.interview_location}</p>}
          {applicant.interview_email_sent && <p className="text-[#2D6A2F] flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Invite email sent</p>}
        </div>
      )}

      {/* Interview outcome */}
      {applicant.interview_outcome && (
        <div className={`rounded-[10px] p-3 text-xs border ${outcomeColor[applicant.interview_outcome]}`}>
          <p className="font-bold text-sm mb-1">Outcome: {applicant.interview_outcome}</p>
          {applicant.interview_outcome_notes && <p className="opacity-80">{applicant.interview_outcome_notes}</p>}
          {applicant.interview_outcome_email_sent && <p className="mt-1 flex items-center gap-1 opacity-70"><CheckCircle2 className="w-3 h-3" /> Email sent to candidate</p>}
        </div>
      )}

      {/* Record Outcome */}
      <button
        onClick={() => { setShowOutcome(v => !v); setShowLivePanelSchedule(false); }}
        className="w-full flex items-center justify-between px-3 py-2.5 rounded-[10px] border border-[#E2E8E2] hover:border-[#2D6A2F] text-sm font-medium text-[#1A1A1A] transition-all"
      >
        <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#2D6A2F]" /> Record Interview Outcome</span>
        {showOutcome ? <ChevronUp className="w-4 h-4 text-[#7A7A8A]" /> : <ChevronDown className="w-4 h-4 text-[#7A7A8A]" />}
      </button>

      {showOutcome && (
        <div className="bg-[#F8FAF8] rounded-[10px] p-4 space-y-3 border border-[#E2E8E2]">
          <div>
            <label className="text-xs font-semibold text-[#7A7A8A] block mb-2">Outcome</label>
            <div className="flex gap-2">
              {['Pass', 'Fail', 'Hold'].map(o => (
                <button key={o} type="button" onClick={() => setOutcome(o)}
                  className={`flex-1 py-2.5 rounded-[8px] text-sm font-bold border-2 transition-all flex items-center justify-center gap-1.5 ${
                    outcome === o
                      ? o === 'Pass' ? 'bg-[#2D6A2F] text-white border-[#2D6A2F]'
                        : o === 'Fail' ? 'bg-[#D32F2F] text-white border-[#D32F2F]'
                        : 'bg-amber-500 text-white border-amber-500'
                      : 'bg-white text-[#555555] border-[#E2E8E2] hover:border-[#999]'
                  }`}>
                  {o === 'Pass' && <CheckCircle2 className="w-3.5 h-3.5" />}
                  {o === 'Fail' && <XCircle className="w-3.5 h-3.5" />}
                  {o === 'Hold' && <PauseCircle className="w-3.5 h-3.5" />}
                  {o}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-[#7A7A8A] block mb-1">Notes (optional)</label>
            <textarea value={outcomeNotes} onChange={e => setOutcomeNotes(e.target.value)} disabled={readOnly}
              placeholder="Add any notes about the interview outcome..."
              className="w-full px-3 py-2 rounded-[8px] border-[1.5px] border-[#E2E8E2] focus:border-[#2D6A2F] outline-none text-sm min-h-[60px] disabled:opacity-60" />
          </div>
          {outcomeError && <p className="text-[#D32F2F] text-xs font-medium">{outcomeError}</p>}
          <button onClick={handleRecordOutcome} disabled={recording || !outcome || readOnly}
            className="w-full bg-[#3A7D3C] hover:bg-[#4A9A4D] disabled:opacity-50 text-white font-bold py-2.5 rounded-full text-sm transition-all">
            {recording ? 'Saving...' : 'Record Outcome'}
          </button>
        </div>
      )}
    </div>
  );
}