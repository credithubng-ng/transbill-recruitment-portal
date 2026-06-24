import React from 'react';

export default function StatsCards({ applicants }) {
  const total = applicants.length;
  const assessed = applicants.filter(a => a.assessment_completed).length;
  const interviewReady = applicants.filter(a => a.status === 'Interview Ready').length;
  const reserveList = applicants.filter(a => a.status === 'Reserve List').length;
  const notProgressed = applicants.filter(a => a.status === 'Not Progressed').length;
  const reviewRequired = applicants.filter(a => a.review_required_flag).length;
  const experienceInflation = applicants.filter(a => a.experience_inflation_flag).length;
  const rapidCompletion = applicants.filter(a => a.rapid_completion_flag).length;
  const duplicateSignature = applicants.filter(a => a.duplicate_signature_flag).length;
  // Interview Ready breakdown
  const interviewReadyPending = applicants.filter(a => a.status === 'Interview Ready' && !a.interview_scheduled_at && !a.interview_outcome).length;
  const interviewScheduled = applicants.filter(a => a.interview_scheduled_at && !a.interview_outcome).length;
  const interviewDone = applicants.filter(a => a.interview_outcome).length;
  const interviewPass = applicants.filter(a => a.interview_outcome === 'Pass').length;
  const interviewFail = applicants.filter(a => a.interview_outcome === 'Fail').length;
  const interviewHold = applicants.filter(a => a.interview_outcome === 'Hold').length;

  // Average score by experience tier
  const expTiers = ['Less than 1 year', '1–3 years', '3–5 years', '5+ years'];
  const avgByExp = expTiers.map(tier => {
    const group = applicants.filter(a => a.assessment_completed && a.years_experience === tier);
    const avg = group.length ? Math.round(group.reduce((s, a) => s + (a.assessment_score || 0), 0) / group.length / 25 * 100) : null;
    return { tier, avg, count: group.length };
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total Applications" value={total} />
        <StatCard label="Assessments Done" value={assessed} />
        <StatCard label="Interview Ready" value={interviewReady} color="bg-[#2D6A2F]" />
        <StatCard label="Awaiting Booking" value={interviewReadyPending} />
        <StatCard label="Interview Scheduled" value={interviewScheduled} color="bg-[#1565C0]" />
        <StatCard label="Outcome Recorded" value={interviewDone} color="bg-[#6A1B9A]" />
        <StatCard label="Reserve List" value={reserveList} color="bg-[#F57C00]" />
        <StatCard label="Not Progressed" value={notProgressed} color="bg-[#9E9E9E]" />
        <StatCard label="⚠ Review Required" value={reviewRequired} color={reviewRequired > 0 ? "bg-[#D32F2F]" : undefined} />
        <StatCard label="Experience Inflation" value={experienceInflation} color={experienceInflation > 0 ? "bg-[#E65100]" : undefined} />
        <StatCard label="Rapid Completions" value={rapidCompletion} color={rapidCompletion > 0 ? "bg-[#BF360C]" : undefined} />
      </div>

      {/* Interview outcomes */}
      {(interviewPass + interviewFail + interviewHold) > 0 && (
        <div className="bg-white border border-[#E2E8E2] rounded-[14px] p-4">
          <p className="text-xs font-bold text-[#7A7A8A] mb-3">Interview Outcomes</p>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center bg-[#EBF5EB] rounded-[10px] p-3">
              <p className="text-[10px] text-[#2D6A2F] font-semibold mb-1">✓ Pass</p>
              <p className="text-2xl font-extrabold text-[#2D6A2F]">{interviewPass}</p>
            </div>
            <div className="text-center bg-red-50 rounded-[10px] p-3">
              <p className="text-[10px] text-[#D32F2F] font-semibold mb-1">✗ Fail</p>
              <p className="text-2xl font-extrabold text-[#D32F2F]">{interviewFail}</p>
            </div>
            <div className="text-center bg-amber-50 rounded-[10px] p-3">
              <p className="text-[10px] text-amber-600 font-semibold mb-1">⏸ Hold</p>
              <p className="text-2xl font-extrabold text-amber-600">{interviewHold}</p>
            </div>
          </div>
        </div>
      )}

      {/* Avg score by experience tier */}
      <div className="bg-white border border-[#E2E8E2] rounded-[14px] p-4">
        <p className="text-xs font-bold text-[#7A7A8A] mb-3">Average Score by Experience Tier</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {avgByExp.map(({ tier, avg, count }) => (
            <div key={tier} className="text-center">
              <p className="text-xs text-[#7A7A8A] mb-1 leading-tight">{tier}</p>
              <p className="text-xl font-extrabold text-[#1A1A1A]">{avg !== null ? avg + '%' : '—'}</p>
              <p className="text-[10px] text-[#7A7A8A]">{count} assessed</p>
            </div>
          ))}
        </div>
      </div>

      {duplicateSignature > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-[14px] px-4 py-3 text-sm text-red-700 font-medium">
          ⚠ {duplicateSignature} duplicate question set signature{duplicateSignature > 1 ? 's' : ''} detected. Review flagged candidates.
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div className="bg-white border border-[#E2E8E2] rounded-[14px] p-4">
      <p className="text-[#7A7A8A] text-xs font-medium mb-1">{label}</p>
      <div className="flex items-center gap-2">
        <span className="text-2xl font-extrabold text-[#1A1A1A]">{value}</span>
        {color && value > 0 && (
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white ${color}`}>!</span>
        )}
      </div>
    </div>
  );
}