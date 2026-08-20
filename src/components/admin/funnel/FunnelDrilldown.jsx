import React, { useState, useEffect } from 'react';
import { X, Search, ChevronLeft, ChevronRight, ExternalLink, Clock } from 'lucide-react';
import { STAGE_LABELS } from './funnelColors';

export default function FunnelDrilldown({ stage, data, isLoading, onPageChange, onClose, onViewApplicant }) {
  const [search, setSearch] = useState('');

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const records = data?.records || [];
  const filtered = search
    ? records.filter(r => {
        const q = search.toLowerCase();
        if (r.visitor_id) return r.visitor_id.toLowerCase().includes(q) || (r.source || '').toLowerCase().includes(q);
        return r.full_name?.toLowerCase().includes(q) || r.email?.toLowerCase().includes(q) || r.candidate_stage?.toLowerCase().includes(q);
      })
    : records;

  const totalPages = data ? Math.ceil(data.total / data.limit) : 0;
  const currentPage = data?.page || 0;
  const isLanding = stage === 'landing_page_visit';

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label={`${STAGE_LABELS[stage]} drill-down`}>
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-[#0B1120] h-full overflow-y-auto shadow-2xl border-l border-[#1E3A5F]">
        <div className="sticky top-0 bg-[#13203B] border-b border-[#1E3A5F] px-5 py-3 flex items-center justify-between z-10">
          <div>
            <h2 className="font-bold text-base text-white">{STAGE_LABELS[stage]}</h2>
            <p className="text-xs text-[#94A3B8]">{data?.total?.toLocaleString() || 0} total records</p>
          </div>
          <button onClick={onClose} className="text-[#94A3B8] hover:text-white p-1 rounded-lg hover:bg-[#1E3A5F]" aria-label="Close drill-down">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={isLanding ? "Search visitor ID or source..." : "Search name, email, or stage..."}
              className="w-full pl-9 pr-4 py-2 bg-[#13203B] border border-[#1E3A5F] text-white text-sm rounded-lg focus:border-[#06B6D4] focus:outline-none"
              aria-label="Search drill-down records"
            />
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-7 h-7 border-3 border-[#1E3A5F] border-t-[#06B6D4] rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-[#64748B] text-sm">No records found.</div>
          ) : (
            <>
              <div className="space-y-2">
                {filtered.map((r, i) => (
                  <div key={i} className="bg-[#13203B] rounded-lg border border-[#1E3A5F] p-3">
                    {isLanding ? (
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-mono text-[#06B6D4] truncate">{r.visitor_id}</span>
                          <span className="text-[10px] text-[#64748B] flex items-center gap-1 flex-shrink-0 ml-2">
                            <Clock className="w-3 h-3" />
                            {r.occurred_at ? new Date(r.occurred_at).toLocaleString('en-GB', { timeZone: 'Africa/Lagos', dateStyle: 'short', timeStyle: 'short' }) : '—'}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {r.source && <span className="text-[10px] bg-[#0B1120] text-[#94A3B8] px-2 py-0.5 rounded-full">src: {r.source}</span>}
                          {r.medium && <span className="text-[10px] bg-[#0B1120] text-[#94A3B8] px-2 py-0.5 rounded-full">med: {r.medium}</span>}
                          {r.campaign && <span className="text-[10px] bg-[#0B1120] text-[#94A3B8] px-2 py-0.5 rounded-full">cmp: {r.campaign}</span>}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-semibold text-white truncate">{r.full_name || 'Unknown'}</span>
                          <span className="text-[10px] text-[#64748B] flex items-center gap-1 flex-shrink-0 ml-2">
                            <Clock className="w-3 h-3" />
                            {r.occurred_at ? new Date(r.occurred_at).toLocaleString('en-GB', { timeZone: 'Africa/Lagos', dateStyle: 'short', timeStyle: 'short' }) : '—'}
                          </span>
                        </div>
                        <p className="text-xs text-[#94A3B8] mb-1">{r.email}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex flex-wrap gap-1.5">
                            <span className="text-[10px] bg-[#0B1120] text-[#06B6D4] px-2 py-0.5 rounded-full">{r.candidate_stage || '—'}</span>
                            {r.assessment_completed && (
                              <span className="text-[10px] bg-[#0B1120] text-[#10B981] px-2 py-0.5 rounded-full">
                                Score: {r.assessment_score}/{r.assessment_question_count || 25}
                              </span>
                            )}
                            {r.interview_outcome && (
                              <span className="text-[10px] bg-[#0B1120] text-[#F59E0B] px-2 py-0.5 rounded-full">{r.interview_outcome}</span>
                            )}
                          </div>
                          {r.applicant_id && (
                            <button
                              onClick={() => onViewApplicant(r.applicant_id)}
                              className="text-[10px] text-[#06B6D4] hover:text-white flex items-center gap-1 font-semibold flex-shrink-0 ml-2"
                            >
                              View <ExternalLink className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 0}
                    className="flex items-center gap-1 text-xs text-[#94A3B8] hover:text-white disabled:opacity-30 px-3 py-1.5 rounded-lg hover:bg-[#13203B]"
                  >
                    <ChevronLeft className="w-4 h-4" /> Prev
                  </button>
                  <span className="text-xs text-[#64748B]">Page {currentPage + 1} of {totalPages}</span>
                  <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages - 1}
                    className="flex items-center gap-1 text-xs text-[#94A3B8] hover:text-white disabled:opacity-30 px-3 py-1.5 rounded-lg hover:bg-[#13203B]"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}