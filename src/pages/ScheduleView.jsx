import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { format, isAfter, isBefore, startOfDay, endOfDay, addDays } from 'date-fns';
import TransbillLogo from '../components/TransbillLogo';
import SlotManager from '../components/admin/SlotManager';
import { Video, CheckCircle2, XCircle, PauseCircle, LogOut, ArrowLeft, Filter } from 'lucide-react';

const OUTCOME_STYLES = {
  Pass: 'bg-[#EBF5EB] text-[#2D6A2F] border-[#2D6A2F]/20',
  Fail: 'bg-red-50 text-[#D32F2F] border-red-200',
  Hold: 'bg-amber-50 text-[#B45309] border-amber-200',
};

function formatWAT(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-NG', {
    hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Africa/Lagos'
  });
}

function formatDateWAT(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-NG', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Africa/Lagos'
  });
}

function getDateStrWAT(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-CA', { timeZone: 'Africa/Lagos' });
}

export default function ScheduleView({ onBack }) {
  const [tab, setTab] = useState('schedule'); // 'schedule' | 'slots'
  const [interviewers, setInterviewers] = useState([]);
  const [filterInterviewer, setFilterInterviewer] = useState('all');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [recordingOutcome, setRecordingOutcome] = useState(null);
  const [outcomeData, setOutcomeData] = useState({ outcome: '', notes: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    base44.entities.Interviewer.list().then(setInterviewers).catch(() => {});
  }, []);

  const { data: applicants = [], refetch } = useQuery({
    queryKey: ['scheduled-applicants'],
    queryFn: () => base44.entities.Applicant.filter({ booking_used: true }),
  });

  const interviewerMap = useMemo(() => {
    const m = {};
    interviewers.forEach(iv => { m[iv.id] = iv; });
    return m;
  }, [interviewers]);

  const filtered = useMemo(() => {
    return applicants
      .filter(a => {
        if (!a.interview_scheduled_at) return false;
        if (filterInterviewer !== 'all' && a.interview_interviewer_id !== filterInterviewer) return false;
        if (filterDateFrom) {
          const from = new Date(filterDateFrom + 'T00:00:00+01:00');
          if (new Date(a.interview_scheduled_at) < from) return false;
        }
        if (filterDateTo) {
          const to = new Date(filterDateTo + 'T23:59:59+01:00');
          if (new Date(a.interview_scheduled_at) > to) return false;
        }
        return true;
      })
      .sort((a, b) => new Date(a.interview_scheduled_at) - new Date(b.interview_scheduled_at));
  }, [applicants, filterInterviewer, filterDateFrom, filterDateTo]);

  // Group by date
  const grouped = useMemo(() => {
    const groups = {};
    filtered.forEach(a => {
      const dateKey = getDateStrWAT(a.interview_scheduled_at);
      if (!groups[dateKey]) groups[dateKey] = { label: formatDateWAT(a.interview_scheduled_at), items: [] };
      groups[dateKey].items.push(a);
    });
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  const handleRecordOutcome = async () => {
    if (!outcomeData.outcome || !recordingOutcome) return;
    setSaving(true);
    try {
      await base44.functions.invoke('recordInterviewOutcome', {
        applicantId: recordingOutcome,
        outcome: outcomeData.outcome,
        notes: outcomeData.notes,
      });
      refetch();
      setRecordingOutcome(null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAF8]">
      <div className="sticky top-0 z-40 bg-white border-b border-[#E2E8E2]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TransbillLogo />
            <span className="text-xs font-bold text-[#7A7A8A] bg-[#F8FAF8] px-2 py-0.5 rounded-full">SCHEDULE</span>
          </div>
          <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-[#7A7A8A] hover:text-[#1A1A1A]">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-extrabold text-2xl text-[#1A1A1A]">Interview Schedule</h1>
          <div className="flex gap-2">
            <button onClick={() => setTab('schedule')}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${tab === 'schedule' ? 'bg-[#2D6A2F] text-white' : 'bg-white border border-[#E2E8E2] text-[#7A7A8A]'}`}>
              Booked Interviews
            </button>
            <button onClick={() => setTab('slots')}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${tab === 'slots' ? 'bg-[#2D6A2F] text-white' : 'bg-white border border-[#E2E8E2] text-[#7A7A8A]'}`}>
              Manage Slots
            </button>
          </div>
        </div>

        {tab === 'slots' && <SlotManager />}

        {tab === 'schedule' && <>
        {/* Filters */}
        <div className="bg-white rounded-[14px] border border-[#E2E8E2] p-4 flex flex-wrap gap-3 items-end">
          <div>
            <label className="text-xs font-semibold text-[#7A7A8A] block mb-1">Interviewer</label>
            <select value={filterInterviewer} onChange={e => setFilterInterviewer(e.target.value)}
              className="px-3 py-2 rounded-[8px] border-[1.5px] border-[#E2E8E2] focus:border-[#2D6A2F] outline-none text-sm">
              <option value="all">All Interviewers</option>
              {interviewers.map(iv => (
                <option key={iv.id} value={iv.id}>{iv.full_name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-[#7A7A8A] block mb-1">From</label>
            <input type="date" value={filterDateFrom} onChange={e => setFilterDateFrom(e.target.value)}
              className="px-3 py-2 rounded-[8px] border-[1.5px] border-[#E2E8E2] focus:border-[#2D6A2F] outline-none text-sm" />
          </div>
          <div>
            <label className="text-xs font-semibold text-[#7A7A8A] block mb-1">To</label>
            <input type="date" value={filterDateTo} onChange={e => setFilterDateTo(e.target.value)}
              className="px-3 py-2 rounded-[8px] border-[1.5px] border-[#E2E8E2] focus:border-[#2D6A2F] outline-none text-sm" />
          </div>
          {(filterInterviewer !== 'all' || filterDateFrom || filterDateTo) && (
            <button onClick={() => { setFilterInterviewer('all'); setFilterDateFrom(''); setFilterDateTo(''); }}
              className="text-sm text-[#7A7A8A] hover:text-[#1A1A1A] font-medium underline">
              Clear filters
            </button>
          )}
        </div>

        {grouped.length === 0 && (
          <div className="text-center py-16 text-[#7A7A8A]">No interviews scheduled yet.</div>
        )}

        {grouped.map(([dateKey, group]) => (

          <div key={dateKey}>
            <h2 className="font-bold text-sm text-[#7A7A8A] uppercase tracking-wide mb-3">{group.label}</h2>
            <div className="space-y-3">
              {group.items.map(a => {

                const iv = interviewerMap[a.interview_interviewer_id];
                return (
                  <div key={a.id} className="bg-white rounded-[12px] border border-[#E2E8E2] p-4 flex flex-wrap items-center gap-4">
                    <div className="font-bold text-[#3A7D3C] text-base w-20 flex-shrink-0">
                      {formatWAT(a.interview_scheduled_at)}
                    </div>
                    <div className="flex-1 min-w-[140px]">
                      <p className="font-bold text-[#1A1A1A] text-sm">{a.full_name}</p>
                      <p className="text-xs text-[#7A7A8A]">{iv?.full_name || '—'}</p>
                    </div>
                    {a.interview_meet_link && (
                      <a href={a.interview_meet_link} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs bg-[#EBF5EB] text-[#2D6A2F] font-bold px-3 py-1.5 rounded-full hover:bg-[#D4EDD4] transition-all flex-shrink-0">
                        <Video className="w-3.5 h-3.5" /> Join Meet
                      </a>
                    )}
                    {a.interview_outcome ? (
                      <span className={`text-xs font-bold px-3 py-1 rounded-full border ${OUTCOME_STYLES[a.interview_outcome] || 'bg-[#F8FAF8] text-[#555555] border-[#E2E8E2]'}`}>
                        {a.interview_outcome}
                      </span>
                    ) : (
                      <button
                        onClick={() => { setRecordingOutcome(a.id); setOutcomeData({ outcome: '', notes: '' }); }}
                        className="text-xs font-semibold text-[#7A7A8A] hover:text-[#3A7D3C] border border-[#E2E8E2] hover:border-[#3A7D3C] px-3 py-1.5 rounded-full transition-all flex-shrink-0"
                      >
                        Record Outcome
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        </>}
      </div>

      {/* Record outcome modal */}
      {recordingOutcome && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30" onClick={() => setRecordingOutcome(null)} />
          <div className="relative bg-white rounded-[16px] shadow-xl p-6 w-full max-w-sm space-y-4">
            <h3 className="font-bold text-[#1A1A1A]">Record Interview Outcome</h3>
            <div className="flex gap-2">
              {['Pass', 'Fail', 'Hold'].map(o => (
                <button key={o} onClick={() => setOutcomeData(prev => ({ ...prev, outcome: o }))}
                  className={`flex-1 py-2.5 rounded-[8px] text-sm font-bold border-2 transition-all ${
                    outcomeData.outcome === o
                      ? o === 'Pass' ? 'bg-[#2D6A2F] text-white border-[#2D6A2F]'
                        : o === 'Fail' ? 'bg-[#D32F2F] text-white border-[#D32F2F]'
                        : 'bg-amber-500 text-white border-amber-500'
                      : 'bg-white text-[#555555] border-[#E2E8E2]'
                  }`}
                >{o}</button>
              ))}
            </div>
            <textarea value={outcomeData.notes} onChange={e => setOutcomeData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Notes (optional)"
              className="w-full px-3 py-2 rounded-[8px] border-[1.5px] border-[#E2E8E2] focus:border-[#2D6A2F] outline-none text-sm min-h-[60px]" />
            <div className="flex gap-2">
              <button onClick={handleRecordOutcome} disabled={!outcomeData.outcome || saving}
                className="flex-1 bg-[#3A7D3C] hover:bg-[#4A9A4D] disabled:opacity-50 text-white font-bold py-2.5 rounded-full text-sm">
                {saving ? 'Saving...' : 'Save Outcome'}
              </button>
              <button onClick={() => setRecordingOutcome(null)}
                className="flex-1 border border-[#E2E8E2] text-[#7A7A8A] font-semibold py-2.5 rounded-full text-sm">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}