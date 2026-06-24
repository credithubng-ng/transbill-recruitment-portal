import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { X, AlertTriangle, Clock } from 'lucide-react';
import { QUESTIONS } from '../../lib/assessmentQuestions';
import InterviewSection from './InterviewSection';

// Build a lookup map from question ID to question object
const Q_MAP = Object.fromEntries(QUESTIONS.map(q => [q.id, q]));

const STATUS_OPTIONS = ['Applied', 'Interview Ready', 'Reserve List', 'Not Progressed'];

function formatTime(seconds) {
  if (!seconds) return '—';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

export default function ApplicantPanel({ applicant, onClose, onUpdate }) {
  const [notes, setNotes] = useState(applicant.admin_notes || '');
  const [status, setStatus] = useState(applicant.status);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await base44.entities.Applicant.update(applicant.id, { admin_notes: notes, status });
    onUpdate({ ...applicant, admin_notes: notes, status });
    setSaving(false);
    onClose();
  };

  const scorePercent = applicant.assessment_completed
    ? Math.round((applicant.assessment_score / 25) * 100)
    : null;

  const riskFlags = [
    applicant.rapid_completion_flag && 'Rapid Completion (<7 min)',
    applicant.very_rapid_completion_flag && 'Very Rapid Completion (<4 min)',
    applicant.experience_inflation_flag && 'Experience Inflation Suspected',
    applicant.duplicate_signature_flag && 'Duplicate Question Set',
  ].filter(Boolean);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white h-full overflow-y-auto shadow-xl">
        <div className="sticky top-0 bg-white border-b border-[#E2E8E2] px-5 py-4 flex items-center justify-between z-10">
          <h2 className="font-bold text-lg text-[#1A1A1A]">{applicant.full_name}</h2>
          <button onClick={onClose} className="text-[#7A7A8A] hover:text-[#1A1A1A]"><X className="w-5 h-5" /></button>
        </div>
        <div className="px-5 py-5 space-y-6">

          {/* Risk Flags */}
          {riskFlags.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-[10px] p-3 space-y-1">
              <div className="flex items-center gap-1.5 text-red-700 font-bold text-xs mb-2">
                <AlertTriangle className="w-4 h-4" /> Risk Flags
              </div>
              {riskFlags.map(f => (
                <p key={f} className="text-xs text-red-600 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" /> {f}
                </p>
              ))}
            </div>
          )}

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
            <InfoRow label="Affiliate Exp." value={applicant.affiliate_experience} />
            {applicant.affiliate_experience_desc && <InfoRow label="Exp. Details" value={applicant.affiliate_experience_desc} />}
            <InfoRow label="Motivation" value={applicant.motivation} />
            {applicant.linkedin_url && <InfoRow label="LinkedIn" value={applicant.linkedin_url} />}
            <InfoRow label="Referral Source" value={applicant.referral_source} />
          </Section>

          {/* Assessment results */}
          {applicant.assessment_completed && (
            <Section title="Assessment Results">
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="bg-[#F8FAF8] rounded-lg p-3 text-center">
                  <p className="text-[10px] text-[#7A7A8A]">Score</p>
                  <p className="text-xl font-extrabold text-[#1A1A1A]">{applicant.assessment_score}/25</p>
                  <p className="text-xs text-[#7A7A8A]">{scorePercent}%</p>
                </div>
                <div className="bg-[#F8FAF8] rounded-lg p-3 text-center">
                  <p className="text-[10px] text-[#7A7A8A]">Status</p>
                  <p className="text-xs font-bold text-[#1A1A1A] leading-tight mt-1">{applicant.status}</p>
                </div>
                <div className="bg-[#F8FAF8] rounded-lg p-3 text-center">
                  <p className="text-[10px] text-[#7A7A8A]">Time</p>
                  <p className="text-sm font-bold text-[#1A1A1A] mt-1 flex items-center justify-center gap-1">
                    <Clock className="w-3 h-3" />{formatTime(applicant.assessment_completion_time)}
                  </p>
                </div>
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

                  // Options as shown to this candidate
                  const shownOptionTexts = applicant.assessment_option_order?.[qId] || baseQ.options.map(o => o.text);
                  // Correct answer key as recorded (post-shuffle)
                  const correctKey = applicant.assessment_correct_answers?.[qId];
                  // Candidate's selected key
                  const selectedKey = applicant.assessment_answers?.[i];
                  // Correct text (from original question)
                  const correctText = correctKey
                    ? shownOptionTexts[['A','B','C','D'].indexOf(correctKey)]
                    : baseQ.options.find(o => o.key === baseQ.correctAnswer)?.text;
                  const selectedText = selectedKey
                    ? shownOptionTexts[['A','B','C','D'].indexOf(selectedKey)]
                    : null;
                  const isCorrect = selectedKey && selectedKey === correctKey;

                  return (
                    <div key={i} className={`text-xs p-2.5 rounded-lg border ${isCorrect ? 'border-[#2D6A2F]/20 bg-[#EBF5EB]' : 'border-[#D32F2F]/20 bg-red-50'}`}>
                      <div className="flex items-start gap-2">
                        <span className={`mt-0.5 font-bold flex-shrink-0 ${isCorrect ? 'text-[#2D6A2F]' : 'text-[#D32F2F]'}`}>
                          {isCorrect ? '✓' : '✗'}
                        </span>
                        <div>
                          <p className="font-medium text-[#1A1A1A]">Q{i + 1}. {baseQ.questionText}</p>
                          <p className="text-[10px] text-[#7A7A8A] mt-0.5 capitalize">{baseQ.category} · {baseQ.difficulty}</p>
                          <p className="text-[#555555] mt-0.5">Answered: <span className="font-medium">{selectedText || 'No answer'}</span></p>
                          {!isCorrect && correctText && (
                            <p className="text-[#2D6A2F] mt-0.5">Correct: <span className="font-medium">{correctText}</span></p>
                          )}
                          {baseQ.explanationForAdmin && (
                            <p className="text-[#7A7A8A] mt-0.5 italic text-[10px]">{baseQ.explanationForAdmin}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Section>
          )}

          {/* Interview Section */}
          <InterviewSection applicant={applicant} onUpdate={onUpdate} />

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