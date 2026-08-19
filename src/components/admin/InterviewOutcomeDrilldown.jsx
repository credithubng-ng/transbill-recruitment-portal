import React, { useState, useMemo, useEffect, useRef } from 'react';
import { X, Search, ChevronRight } from 'lucide-react';

const DIM_LABELS = {
  role_market_understanding: 'Role/Market',
  recruitment_activation_system: 'Recruitment',
  sme_acquisition_strategy: 'SME Acq.',
  numerical_commercial_reasoning: 'Numerical',
  performance_management: 'Perf. Mgmt',
  execution_adaptability: 'Execution',
  integrity_communication: 'Integrity',
};

function formatDateTime(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (!Number.isFinite(d.getTime())) return '—';
  return d.toLocaleString('en-NG', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Africa/Lagos',
  });
}

function getInterviewFormat(applicant) {
  if (!applicant) return '—';
  if (applicant.candidate_stage?.includes('AI Interview')) return 'Selection Interview';
  if (applicant.interview_outcome) return 'Human Interview';
  return '—';
}

function dimTooltip(dimScores) {
  if (!dimScores || typeof dimScores !== 'object') return '';
  const parts = Object.keys(DIM_LABELS)
    .filter(k => dimScores[k] != null)
    .map(k => `${DIM_LABELS[k]}: ${dimScores[k]}/5`);
  return parts.length ? parts.join(' · ') : '';
}

function RecBadge({ rec }) {
  const map = {
    Recommended: 'bg-[#EBF5EB] text-[#2D6A2F]',
    Borderline: 'bg-[#FFF3E0] text-[#F57C00]',
    'Not recommended': 'bg-[#F5F5F5] text-[#9E9E9E]',
  };
  return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${map[rec] || 'bg-[#F5F5F5] text-[#9E9E9E]'}`}>{rec || '—'}</span>;
}

function OutcomeBadge({ outcome }) {
  const map = {
    Pass: 'bg-[#EBF5EB] text-[#2D6A2F]',
    Fail: 'bg-red-50 text-[#D32F2F]',
    Hold: 'bg-amber-50 text-amber-600',
  };
  if (!outcome) return <span className="text-xs text-[#9E9E9E]">—</span>;
  return <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${map[outcome] || 'bg-[#F5F5F5]'}`}>{outcome}</span>;
}

export default function InterviewOutcomeDrilldown({ title, count, applicants, interviewResults, onSelectApplicant, onClose }) {
  const [search, setSearch] = useState('');
  const closeRef = useRef(null);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose(); }
    };
    document.addEventListener('keydown', handleKey);
    const t = setTimeout(() => closeRef.current?.focus(), 50);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      clearTimeout(t);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    let list = applicants;
    if (q) {
      list = list.filter(a =>
        a.full_name?.toLowerCase().includes(q) ||
        a.email?.toLowerCase().includes(q) ||
        (a.phone || '').toLowerCase().includes(q)
      );
    }
    return [...list].sort((a, b) => {
      const aDate = a.interview_scheduled_at || a.created_date || '';
      const bDate = b.interview_scheduled_at || b.created_date || '';
      return new Date(bDate).getTime() - new Date(aDate).getTime();
    });
  }, [applicants, search]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-[14px] shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col" role="dialog" aria-modal="true" aria-label={title}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E8E2] flex-shrink-0">
          <div>
            <h2 className="font-bold text-lg text-[#1A1A1A]">{title}</h2>
            <p className="text-xs text-[#7A7A8A]">{count} applicant{count !== 1 ? 's' : ''}</p>
          </div>
          <button ref={closeRef} onClick={onClose} aria-label="Close"
            className="p-2 rounded-full hover:bg-[#F8FAF8] text-[#7A7A8A] hover:text-[#1A1A1A] transition-colors focus:outline-none focus:ring-2 focus:ring-[#2D6A2F]/40">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 py-3 border-b border-[#E2E8E2] flex-shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 text-[#7A7A8A] absolute left-3 top-1/2 -translate-y-1/2" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search name, email, phone..."
              className="w-full pl-9 pr-4 py-2.5 border border-[#E2E8E2] rounded-full text-sm focus:border-[#2D6A2F] focus:outline-none" />
          </div>
        </div>

        <div className="overflow-y-auto flex-1">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-sm text-[#7A7A8A]">
              {search ? 'No applicants match your search.' : 'No applicants in this category.'}
            </div>
          ) : (
            <>
              <table className="w-full text-sm hidden md:table">
                <thead className="bg-[#F8FAF8] text-[#7A7A8A] text-xs uppercase sticky top-0">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold">Applicant</th>
                    <th className="text-left px-4 py-3 font-semibold">Applied</th>
                    <th className="text-left px-4 py-3 font-semibold">Interview Date</th>
                    <th className="text-left px-4 py-3 font-semibold">Format</th>
                    <th className="text-center px-4 py-3 font-semibold">Case</th>
                    <th className="text-center px-4 py-3 font-semibold">Assess.</th>
                    <th className="text-center px-4 py-3 font-semibold">AI Score</th>
                    <th className="text-left px-4 py-3 font-semibold">AI Rec.</th>
                    <th className="text-left px-4 py-3 font-semibold">Outcome</th>
                    <th className="text-left px-4 py-3 font-semibold">Reviewed By</th>
                    <th className="text-left px-4 py-3 font-semibold">Stage</th>
                    <th className="px-2 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(a => {
                    const ir = interviewResults[a.id] || {};
                    const scorePct = a.assessment_completed ? Math.round((a.assessment_score / (a.assessment_question_count || 25)) * 100) : null;
                    const notes = ir.review_notes || a.interview_outcome_notes || '';
                    return (
                      <tr key={a.id} onClick={() => onSelectApplicant(a)}
                        className="border-t border-[#E2E8E2] hover:bg-[#F8FAF8] cursor-pointer transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-semibold text-[#1A1A1A]">{a.full_name || '—'}</p>
                          <p className="text-xs text-[#7A7A8A]">{a.email || '—'}</p>
                          {a.phone && <p className="text-xs text-[#7A7A8A]">{a.phone}</p>}
                        </td>
                        <td className="px-4 py-3 text-xs text-[#555555] whitespace-nowrap">{formatDateTime(a.created_date)}</td>
                        <td className="px-4 py-3 text-xs text-[#555555] whitespace-nowrap">{formatDateTime(a.interview_scheduled_at)}</td>
                        <td className="px-4 py-3 text-xs text-[#555555]">{getInterviewFormat(a)}</td>
                        <td className="px-4 py-3 text-center text-xs text-[#555555]">{a.ai_interview_variant_id ? `Case ${a.ai_interview_variant_id}` : '—'}</td>
                        <td className="px-4 py-3 text-center font-semibold text-xs">{scorePct !== null ? `${scorePct}%` : '—'}</td>
                        <td className="px-4 py-3 text-center font-bold" title={dimTooltip(ir.dimension_scores)}>
                          {ir.overall_score != null ? `${ir.overall_score}/100` : '—'}
                        </td>
                        <td className="px-4 py-3"><RecBadge rec={ir.ai_recommendation} /></td>
                        <td className="px-4 py-3"><OutcomeBadge outcome={a.interview_outcome} /></td>
                        <td className="px-4 py-3 text-xs text-[#555555]">
                          {ir.reviewed_by ? (
                            <div>
                              <p>{ir.reviewed_by}</p>
                              {ir.reviewed_at && <p className="text-[10px] text-[#7A7A8A]">{formatDateTime(ir.reviewed_at)}</p>}
                            </div>
                          ) : '—'}
                        </td>
                        <td className="px-4 py-3 text-xs text-[#555555] whitespace-nowrap">{a.candidate_stage || a.status || '—'}</td>
                        <td className="px-2 py-3"><ChevronRight className="w-4 h-4 text-[#7A7A8A]" /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div className="md:hidden divide-y divide-[#E2E8E2]">
                {filtered.map(a => {
                  const ir = interviewResults[a.id] || {};
                  const scorePct = a.assessment_completed ? Math.round((a.assessment_score / (a.assessment_question_count || 25)) * 100) : null;
                  const notes = ir.review_notes || a.interview_outcome_notes || '';
                  return (
                    <button key={a.id} onClick={() => onSelectApplicant(a)}
                      className="w-full text-left p-4 hover:bg-[#F8FAF8] transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-semibold text-[#1A1A1A] truncate">{a.full_name || '—'}</p>
                          <p className="text-xs text-[#7A7A8A] truncate">{a.email || '—'}</p>
                          {a.phone && <p className="text-xs text-[#7A7A8A]">{a.phone}</p>}
                        </div>
                        <OutcomeBadge outcome={a.interview_outcome} />
                      </div>
                      <div className="grid grid-cols-2 gap-1 mt-2 text-xs">
                        <span className="text-[#7A7A8A]">Interview: <span className="text-[#555555]">{formatDateTime(a.interview_scheduled_at)}</span></span>
                        <span className="text-[#7A7A8A]">Format: <span className="text-[#555555]">{getInterviewFormat(a)}</span></span>
                        <span className="text-[#7A7A8A]">Case: <span className="text-[#555555]">{a.ai_interview_variant_id ? `Case ${a.ai_interview_variant_id}` : '—'}</span></span>
                        <span className="text-[#7A7A8A]">Assess: <span className="text-[#555555]">{scorePct !== null ? `${scorePct}%` : '—'}</span></span>
                        <span className="text-[#7A7A8A]">AI Score: <span className="text-[#555555]">{ir.overall_score != null ? `${ir.overall_score}/100` : '—'}</span></span>
                        <span className="text-[#7A7A8A]">AI Rec: <span className="text-[#555555]">{ir.ai_recommendation || '—'}</span></span>
                        <span className="text-[#7A7A8A]">Stage: <span className="text-[#555555]">{a.candidate_stage || a.status || '—'}</span></span>
                        {ir.reviewed_by && <span className="text-[#7A7A8A]">Reviewed: <span className="text-[#555555]">{ir.reviewed_by}</span></span>}
                      </div>
                      {notes && <p className="text-xs text-[#555555] mt-1.5 line-clamp-2"><span className="text-[#7A7A8A] font-medium">Notes: </span>{notes}</p>}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}