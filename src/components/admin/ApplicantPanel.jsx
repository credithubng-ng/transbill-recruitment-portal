import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { X } from 'lucide-react';
import { QUESTIONS } from '../../lib/assessmentQuestions';

// Build a lookup map from question ID to question object
const Q_MAP = Object.fromEntries(QUESTIONS.map(q => [q.id, q]));

const STATUS_OPTIONS = ['Applied', 'Interview Ready', 'Reserve List', 'Not Progressed'];

export default function ApplicantPanel({ applicant, onClose, onUpdate }) {
  const [notes, setNotes] = useState(applicant.admin_notes || '');
  const [status, setStatus] = useState(applicant.status);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await base44.entities.Applicant.update(applicant.id, { admin_notes: notes, status });
    onUpdate({ ...applicant, admin_notes: notes, status });
    setSaving(false);
  };

  const scorePercent = applicant.assessment_completed ? Math.round((applicant.assessment_score / 25) * 100) : null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white h-full overflow-y-auto shadow-xl">
        <div className="sticky top-0 bg-white border-b border-[#E2E8E2] px-5 py-4 flex items-center justify-between z-10">
          <h2 className="font-bold text-lg text-[#1A1A1A]">{applicant.full_name}</h2>
          <button onClick={onClose} className="text-[#7A7A8A] hover:text-[#1A1A1A]"><X className="w-5 h-5" /></button>
        </div>
        <div className="px-5 py-5 space-y-6">
          {/* Status */}
          <div>
            <label className="text-xs font-semibold text-[#7A7A8A] mb-1 block">Status</label>
            <select value={status} onChange={e => setStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-[10px] border-[1.5px] border-[#E2E8E2] focus:border-[#2D6A2F] outline-none text-sm">
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Application details */}
          <Section title="Application Details">
            <InfoRow label="Email" value={applicant.email} />
            <InfoRow label="Phone" value={applicant.phone} />
            <InfoRow label="Gender" value={applicant.gender} />
            <InfoRow label="State of Origin" value={applicant.state_of_origin} />
            <InfoRow label="LGA" value={applicant.current_lga} />
            <InfoRow label="Lagos Resident" value={applicant.lagos_resident} />
            <InfoRow label="Education" value={applicant.education} />
            <InfoRow label="Experience" value={applicant.years_experience} />
            <InfoRow label="3MTT Graduate" value={applicant.is_3mtt} />
            <InfoRow label="SAIL Alumnus" value={applicant.is_sail} />
            <InfoRow label="Platforms" value={applicant.social_platforms?.join(', ')} />
            <InfoRow label="Affiliate Experience" value={applicant.affiliate_experience} />
            {applicant.affiliate_experience_desc && <InfoRow label="Experience Details" value={applicant.affiliate_experience_desc} />}
            <InfoRow label="Motivation" value={applicant.motivation} />
            {applicant.linkedin_url && <InfoRow label="LinkedIn/Portfolio" value={applicant.linkedin_url} />}
            <InfoRow label="Referral Source" value={applicant.referral_source} />
          </Section>

          {/* Assessment results */}
          {applicant.assessment_completed && (
            <Section title="Assessment Results">
              <div className="bg-[#F8FAF8] rounded-lg p-4 mb-1">
                <p className="text-xs text-[#7A7A8A]">Score</p>
                <p className="text-2xl font-extrabold text-[#1A1A1A]">{applicant.assessment_score}/25 ({scorePercent}%)</p>
              </div>
              {applicant.question_set_signature && (
                <div className="mb-3">
                  <p className="text-[10px] text-[#7A7A8A] font-medium">Question Set Signature</p>
                  <p className="text-[10px] text-[#555555] break-all font-mono bg-[#F8FAF8] px-2 py-1 rounded">{applicant.question_set_signature}</p>
                </div>
              )}
              <div className="space-y-2">
                {(applicant.assessment_question_ids || []).map((qId, i) => {
                  const baseQ = Q_MAP[qId];
                  if (!baseQ) return null;

                  // Options as shown to this candidate (may be reordered)
                  const shownOptions = applicant.assessment_option_order?.[qId] || baseQ.options;
                  // Correct text from original question
                  const correctText = baseQ.options[baseQ.correct];
                  // What the candidate selected (index into shownOptions)
                  const selectedIdx = applicant.assessment_answers?.[i];
                  const selectedText = selectedIdx >= 0 ? shownOptions[selectedIdx] : null;
                  const isCorrect = selectedText === correctText;

                  return (
                    <div key={i} className={`text-xs p-2.5 rounded-lg border ${isCorrect ? 'border-[#2D6A2F]/20 bg-[#EBF5EB]' : 'border-[#D32F2F]/20 bg-red-50'}`}>
                      <div className="flex items-start gap-2">
                        <span className={`mt-0.5 font-bold flex-shrink-0 ${isCorrect ? 'text-[#2D6A2F]' : 'text-[#D32F2F]'}`}>
                          {isCorrect ? '✓' : '✗'}
                        </span>
                        <div>
                          <p className="font-medium text-[#1A1A1A]">Q{i + 1}. {baseQ.question}</p>
                          <p className="text-[#555555] mt-0.5">Candidate answered: <span className="font-medium">{selectedText || 'No answer'}</span></p>
                          {!isCorrect && (
                            <p className="text-[#2D6A2F] mt-0.5">Correct answer: <span className="font-medium">{correctText}</span></p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {/* Fallback for old records without question IDs */}
                {!applicant.assessment_question_ids && applicant.assessment_answers && (
                  <p className="text-xs text-[#7A7A8A] italic">Detailed question breakdown not available for this submission.</p>
                )}
              </div>
            </Section>
          )}

          {/* Admin notes */}
          <div>
            <label className="text-xs font-semibold text-[#7A7A8A] mb-1 block">Admin Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-[10px] border-[1.5px] border-[#E2E8E2] focus:border-[#2D6A2F] outline-none text-sm min-h-[80px]"
              placeholder="Add notes about this candidate..." />
          </div>

          <button onClick={handleSave} disabled={saving}
            className="w-full bg-[#3A7D3C] hover:bg-[#4A9A4D] disabled:opacity-50 text-white font-bold py-3 rounded-full transition-all">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <h3 className="font-bold text-sm text-[#1A1A1A] mb-3 border-b border-[#E2E8E2] pb-2">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex gap-2">
      <span className="text-xs font-medium text-[#7A7A8A] min-w-[100px]">{label}:</span>
      <span className="text-xs text-[#333333] break-words">{value || '—'}</span>
    </div>
  );
}