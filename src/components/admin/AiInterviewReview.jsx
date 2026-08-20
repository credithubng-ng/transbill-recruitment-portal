import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Search, AlertTriangle, ShieldAlert, CheckCircle2, Clock, X } from 'lucide-react';

const DECISION_LABELS = {
  pending: 'Awaiting Review',
  approved_successful: 'Approved – Successful',
  second_review: 'Second Review Requested',
  human_interview: 'Human Interview',
  hold: 'On Hold',
  not_successful: 'Not Successful',
};

export default function AiInterviewReview({ onBack }) {
  const token = sessionStorage.getItem('transbill_admin_token');
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [reviewing, setReviewing] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewDecision, setReviewDecision] = useState('');
  const [reviewError, setReviewError] = useState(null);
  const [reviewMsg, setReviewMsg] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['aiInterviewDashboard'],
    queryFn: async () => {
      const res = await base44.functions.invoke('adminInterviewDashboard', { token });
      if (res.data?.error) throw new Error(res.data.error);
      return res.data;
    },
  });

  const counts = data?.counts || {};
  const rows = data?.rows || [];

  const filtered = useMemo(() => {
    return rows.filter(r => {
      if (search) {
        const q = search.toLowerCase();
        if (!r.applicant_name?.toLowerCase().includes(q) && !r.applicant_email?.toLowerCase().includes(q) && !r.case_title?.toLowerCase().includes(q)) return false;
      }
      if (filter === 'awaiting' && r.admin_decision !== 'pending') return false;
      if (filter === 'recommended' && r.ai_recommendation !== 'Recommended') return false;
      if (filter === 'borderline' && r.ai_recommendation !== 'Borderline') return false;
      if (filter === 'technical' && r.session_status !== 'technical_failure' && (r.technical_flags || []).length === 0) return false;
      if (filter === 'integrity' && (r.integrity_flags || []).length === 0) return false;
      if (filter === 'approved' && r.admin_decision !== 'approved_successful') return false;
      return true;
    });
  }, [rows, search, filter]);

  const openDetail = async (row) => {
    setSelected({ loading: true, row });
    try {
      const res = await base44.functions.invoke('getInterviewDetail', { token, result_id: row.result_id });
      if (res.data?.error) throw new Error(res.data.error);
      setSelected({ row, ...res.data });
    } catch (e) {
      setSelected({ row, error: e?.response?.data?.error || 'Unable to load detail.' });
    }
  };

  const submitReview = async () => {
    if (!reviewDecision) return;
    const adverse = ['second_review', 'hold', 'not_successful'].includes(reviewDecision);
    if (adverse && reviewNotes.trim().length < 5) {
      setReviewError('Notes are required for this action.');
      return;
    }
    if (adverse && !confirm(`Confirm ${DECISION_LABELS[reviewDecision]}? This is recorded in the audit trail.`)) return;
    setReviewing(true);
    setReviewError(null);
    try {
      const res = await base44.functions.invoke('reviewInterview', { token, result_id: selected.row.result_id, decision: reviewDecision, notes: reviewNotes });
      if (res.data?.error) throw new Error(res.data.error);
      setReviewMsg('Review recorded. Audit event saved.');
      setReviewDecision('');
      setReviewNotes('');
      queryClient.invalidateQueries({ queryKey: ['aiInterviewDashboard'] });
      setTimeout(() => { setReviewMsg(null); setSelected(null); }, 1200);
    } catch (e) {
      setReviewError(e?.response?.data?.error || 'Unable to record review.');
    } finally {
      setReviewing(false);
    }
  };

  const cards = [
    { key: 'all', label: 'All', count: rows.length, icon: Clock, color: 'text-[#7A7A8A]' },
    { key: 'awaiting', label: 'Awaiting Review', count: counts.awaiting_review || 0, icon: Clock, color: 'text-[#1565C0]' },
    { key: 'recommended', label: 'Recommended', count: counts.recommended || 0, icon: CheckCircle2, color: 'text-[#2D6A2F]' },
    { key: 'borderline', label: 'Borderline', count: counts.borderline || 0, icon: AlertTriangle, color: 'text-[#F57C00]' },
    { key: 'technical', label: 'Technical Failures', count: counts.technical_failures || 0, icon: AlertTriangle, color: 'text-[#7A7A8A]' },
    { key: 'integrity', label: 'Integrity Flags', count: counts.integrity_flags || 0, icon: ShieldAlert, color: 'text-[#D32F2F]' },
    { key: 'approved', label: 'Approved', count: counts.approved || 0, icon: CheckCircle2, color: 'text-[#2D6A2F]' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAF8]">
      <div className="sticky top-0 z-40 bg-white border-b border-[#E2E8E2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
          <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-[#7A7A8A] hover:text-[#1A1A1A]">
            <ArrowLeft className="w-4 h-4" /> Back to dashboard
          </button>
          <h1 className="font-extrabold text-lg text-[#1A1A1A]">Selection Interview Review</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        {/* Dashboard cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {cards.map(c => {
            const Icon = c.icon;
            return (
              <button key={c.key} onClick={() => setFilter(c.key)}
                className={`bg-white rounded-[12px] border p-3 text-left transition-all ${filter === c.key ? 'border-[#2D6A2F] ring-1 ring-[#2D6A2F]/20' : 'border-[#E2E8E2] hover:border-[#2D6A2F]/40'}`}>
                <div className="flex items-center gap-1.5 mb-1"><Icon className={`w-4 h-4 ${c.color}`} /><span className="text-[10px] font-semibold text-[#7A7A8A] uppercase">{c.label}</span></div>
                <p className="font-extrabold text-xl text-[#1A1A1A]">{c.count}</p>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#7A7A8A] absolute left-3 top-1/2 -translate-y-1/2" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, email, case..."
            className="w-full pl-9 pr-4 py-2.5 border border-[#E2E8E2] rounded-full text-sm focus:border-[#2D6A2F] focus:outline-none" />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12"><div className="w-8 h-8 border-4 border-[#E2E8E2] border-t-[#2D6A2F] rounded-full animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-[14px] border border-[#E2E8E2] p-8 text-center text-sm text-[#7A7A8A]">No interviews match this filter.</div>
        ) : (
          <div className="bg-white rounded-[14px] border border-[#E2E8E2] overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[#F8FAF8] text-[#7A7A8A] text-xs uppercase">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold">Candidate</th>
                  <th className="text-left px-4 py-3 font-semibold hidden sm:table-cell">Case</th>
                  <th className="text-center px-4 py-3 font-semibold">Score</th>
                  <th className="text-left px-4 py-3 font-semibold">AI Rec.</th>
                  <th className="text-left px-4 py-3 font-semibold">Decision</th>
                  <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Flags</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r.result_id} onClick={() => openDetail(r)} className="border-t border-[#E2E8E2] hover:bg-[#F8FAF8] cursor-pointer">
                    <td className="px-4 py-3"><p className="font-semibold text-[#1A1A1A]">{r.applicant_name}</p><p className="text-xs text-[#7A7A8A]">{r.applicant_email}</p></td>
                    <td className="px-4 py-3 text-[#555555] hidden sm:table-cell">{r.case_title}</td>
                    <td className="px-4 py-3 text-center font-bold">{r.overall_score}</td>
                    <td className="px-4 py-3"><RecBadge rec={r.ai_recommendation} /></td>
                    <td className="px-4 py-3"><DecisionBadge decision={r.admin_decision} /></td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {(r.integrity_flags?.length > 0 || r.technical_flags?.length > 0) && (
                        <span className="inline-flex items-center gap-1 text-xs text-[#D32F2F] font-semibold"><ShieldAlert className="w-3.5 h-3.5" /> {r.integrity_flags?.length || 0}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail slide-over */}
      {selected && (
        <DetailPanel data={selected} onClose={() => setSelected(null)}
          reviewDecision={reviewDecision} setReviewDecision={setReviewDecision}
          reviewNotes={reviewNotes} setReviewNotes={setReviewNotes}
          onSubmit={submitReview} reviewing={reviewing} reviewError={reviewError} reviewMsg={reviewMsg} />
      )}
    </div>
  );
}

function RecBadge({ rec }) {
  const map = {
    Recommended: 'bg-[#EBF5EB] text-[#2D6A2F]',
    Borderline: 'bg-[#FFF3E0] text-[#F57C00]',
    'Not recommended': 'bg-[#F5F5F5] text-[#9E9E9E]',
  };
  return <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${map[rec] || 'bg-[#F5F5F5] text-[#9E9E9E]'}`}>{rec || '—'}</span>;
}

function DecisionBadge({ decision }) {
  const map = {
    pending: 'bg-[#E3F2FD] text-[#1565C0]',
    approved_successful: 'bg-[#EBF5EB] text-[#2D6A2F]',
    second_review: 'bg-[#FFF3E0] text-[#F57C00]',
    human_interview: 'bg-[#E3F2FD] text-[#1565C0]',
    hold: 'bg-[#FFF3E0] text-[#F57C00]',
    not_successful: 'bg-[#FCE4EC] text-[#C62828]',
  };
  return <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${map[decision] || 'bg-[#F5F5F5]'}`}>{DECISION_LABELS[decision] || decision}</span>;
}

function DetailPanel({ data, onClose, reviewDecision, setReviewDecision, reviewNotes, setReviewNotes, onSubmit, reviewing, reviewError, reviewMsg }) {
  const { row, result, session, turns, applicant, case_title, reviews, loading, error } = data;
  const dims = result?.dimension_scores || {};
  const evidence = result?.dimension_evidence || {};
  const dimLabels = {
    role_market_understanding: 'Role/Market Understanding (15%)',
    recruitment_activation_system: 'Recruitment/Activation (20%)',
    sme_acquisition_strategy: 'SME Acquisition (15%)',
    numerical_commercial_reasoning: 'Numerical/Commercial (15%)',
    performance_management: 'Performance Mgmt (15%)',
    execution_adaptability: 'Execution/Adaptability (10%)',
    integrity_communication: 'Integrity/Communication (10%)',
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white h-full overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-[#E2E8E2] px-5 py-3 flex items-center justify-between">
          <h2 className="font-bold text-base text-[#1A1A1A]">{row?.applicant_name} — Interview Detail</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-[#7A7A8A]" /></button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-[#E2E8E2] border-t-[#2D6A2F] rounded-full animate-spin" /></div>
        ) : error ? (
          <div className="p-6 text-sm text-[#D32F2F]">{error}</div>
        ) : (
          <div className="p-5 space-y-5">
            {/* Summary */}
            <Section title="Summary">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <KV label="Case" value={case_title} />
                <KV label="Overall Score" value={`${result?.overall_score}/100`} />
                <KV label="AI Recommendation" value={result?.ai_recommendation} />
                <KV label="Decision" value={DECISION_LABELS[result?.admin_decision]} />
                <KV label="Session Status" value={session?.status} />
                <KV label="Technical Interruptions" value={session?.technical_interruptions || 0} />
              </div>
            </Section>

            {/* Applicant consistency */}
            <Section title="Applicant / Assessment Consistency">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <KV label="Name" value={applicant?.full_name} />
                <KV label="Email" value={applicant?.email} />
                <KV label="DM Experience" value={applicant?.years_experience} />
                <KV label="Sales Experience" value={applicant?.direct_sales_experience} />
                <KV label="Affiliate Exp." value={applicant?.affiliate_experience} />
                <KV label="Assessment Score" value={applicant?.assessment_completed ? `${applicant.assessment_score}/${applicant.assessment_question_count}` : '—'} />
              </div>
            </Section>

            {/* Dimension scores */}
            <Section title="Rubric Scores (1–5 with evidence)">
              <div className="space-y-3">
                {Object.keys(dimLabels).map(k => (
                  <div key={k} className="border border-[#E2E8E2] rounded-[10px] p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-[#1A1A1A]">{dimLabels[k]}</span>
                      <span className={`text-sm font-bold ${dims[k] >= 4 ? 'text-[#2D6A2F]' : dims[k] >= 3 ? 'text-[#F57C00]' : 'text-[#D32F2F]'}`}>{dims[k] || '—'}/5</span>
                    </div>
                    <p className="text-xs text-[#555555]">{evidence[k] || '—'}</p>
                  </div>
                ))}
              </div>
            </Section>

            {/* Flags */}
            <Section title="Flags & Findings">
              <FlagList label="Strengths" items={result?.strengths} color="text-[#2D6A2F]" />
              <FlagList label="Concerns" items={result?.concerns} color="text-[#F57C00]" />
              <FlagList label="Calculation Errors" items={result?.calculation_errors} color="text-[#D32F2F]" />
              <FlagList label="Contradictions" items={result?.contradictions} color="text-[#D32F2F]" />
              <FlagList label="Integrity Flags" items={result?.integrity_flags} color="text-[#D32F2F]" />
              <FlagList label="Technical Flags" items={result?.technical_flags} color="text-[#7A7A8A]" />
            </Section>

            {/* Transcript */}
            <Section title="Transcript">
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {(turns || []).map((t, i) => (
                  <div key={i} className="border-l-2 border-[#2D6A2F]/30 pl-3">
                    <p className="text-xs font-semibold text-[#2D6A2F] uppercase">{t.turn_type}{t.is_adaptive ? ' · adaptive' : ''}</p>
                    <p className="text-sm font-medium text-[#1A1A1A] mt-1">Q: {t.question}</p>
                    <p className="text-sm text-[#333333] mt-1 whitespace-pre-line">A: {t.answer || '(no answer)'}</p>
                  </div>
                ))}
                {(!turns || turns.length === 0) && <p className="text-sm text-[#7A7A8A]">No transcript recorded.</p>}
              </div>
            </Section>

            {/* Audit trail */}
            {reviews?.length > 0 && (
              <Section title="Audit Trail">
                {reviews.map((rv, i) => (
                  <div key={i} className="text-xs text-[#555555] border-l-2 border-[#E2E8E2] pl-3 mb-2">
                    <p className="font-semibold">{DECISION_LABELS[rv.decision]} — by {rv.reviewed_by} at {new Date(rv.reviewed_at).toLocaleString()}</p>
                    {rv.notes && <p className="mt-0.5">{rv.notes}</p>}
                  </div>
                ))}
              </Section>
            )}

            {/* Review actions */}
            <Section title="Admin Decision">
              {reviewMsg ? (
                <p className="text-sm text-[#2D6A2F] font-semibold">{reviewMsg}</p>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {['approved_successful', 'second_review', 'human_interview', 'hold', 'not_successful'].map(d => (
                      <button key={d} onClick={() => setReviewDecision(d)}
                        className={`text-xs font-semibold py-2.5 rounded-full border-2 transition-all ${reviewDecision === d ? 'border-[#2D6A2F] bg-[#EBF5EB] text-[#2D6A2F]' : 'border-[#E2E8E2] text-[#555555] hover:border-[#2D6A2F]/40'}`}>
                        {DECISION_LABELS[d]}
                      </button>
                    ))}
                  </div>
                  <textarea value={reviewNotes} onChange={e => setReviewNotes(e.target.value)} placeholder="Reviewer notes (required for Second Review, Hold, Not Successful)..."
                    rows={3} className="w-full border border-[#E2E8E2] rounded-[10px] p-3 text-sm focus:border-[#2D6A2F] focus:outline-none resize-none" />
                  {reviewError && <p className="text-sm text-[#D32F2F]">{reviewError}</p>}
                  <button onClick={onSubmit} disabled={!reviewDecision || reviewing}
                    className="w-full bg-[#3A7D3C] hover:bg-[#4A9A4D] disabled:opacity-40 text-white font-bold text-sm py-3 rounded-full">
                    {reviewing ? 'Recording...' : 'Record Decision'}
                  </button>
                  <p className="text-xs text-[#7A7A8A]">Approving queues an outcome letter for explicit Send — the AI cannot email the candidate. Integrity flags force human escalation, never automatic rejection.</p>

                  {/* Refer to Live Panel — separate from review decisions */}
                  <div className="border-t border-[#E2E8E2] pt-3 mt-3">
                    <p className="text-xs font-semibold text-[#7A7A8A] uppercase mb-2">Live Panel Referral</p>
                    <p className="text-xs text-[#555555] mb-2">After reviewing the digital interview, refer this candidate to a live panel interview. This unlocks the live panel scheduling flow in the applicant's admin panel.</p>
                    <ReferToLivePanelButton result_id={row?.result_id} applicant_id={applicant?.id} onReferred={() => { setTimeout(() => onClose(), 1500); }} />
                  </div>
                </div>
              )}
            </Section>
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-[#7A7A8A] uppercase tracking-wide mb-2">{title}</h3>
      {children}
    </div>
  );
}

function KV({ label, value }) {
  return <div><span className="text-xs text-[#7A7A8A]">{label}: </span><span className="text-sm text-[#1A1A1A] font-medium">{value || '—'}</span></div>;
}

function FlagList({ label, items, color }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="mb-2">
      <p className={`text-xs font-semibold ${color} mb-1`}>{label}</p>
      <ul className="list-disc list-inside text-xs text-[#555555] space-y-0.5">
        {items.map((it, i) => <li key={i}>{it}</li>)}
      </ul>
    </div>
  );
}

function ReferToLivePanelButton({ result_id, applicant_id, onReferred }) {
  const [referring, setReferring] = useState(false);
  const [msg, setMsg] = useState(null);
  const [error, setError] = useState(null);

  const handleRefer = async () => {
    if (!confirm('Refer this candidate to a Live Panel Interview? This will unlock the live panel scheduling flow.')) return;
    setReferring(true);
    setError(null);
    setMsg(null);
    try {
      const token = sessionStorage.getItem('transbill_admin_token');
      const res = await base44.functions.invoke('referToLivePanel', { token, applicant_id });
      if (res.data?.error) throw new Error(res.data.error);
      setMsg(res.data.already_referred ? 'Already referred to live panel.' : 'Referred to live panel. Schedule from the applicant\'s admin panel.');
      onReferred();
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || 'Unable to refer to live panel.');
    } finally {
      setReferring(false);
    }
  };

  return (
    <div>
      <button onClick={handleRefer} disabled={referring}
        className="w-full bg-[#F57C00] hover:bg-[#E65100] disabled:opacity-50 text-white font-bold text-sm py-2.5 rounded-full transition-all">
        {referring ? 'Referring...' : 'Refer to Live Panel Interview'}
      </button>
      {msg && <p className="text-xs text-[#2D6A2F] mt-2 font-medium">{msg}</p>}
      {error && <p className="text-xs text-[#D32F2F] mt-2 font-medium">{error}</p>}
    </div>
  );
}