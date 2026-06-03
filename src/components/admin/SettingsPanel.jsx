import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { X, AlertTriangle } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

const DEFAULTS = {
  interview_ready_min: 21,
  reserve_list_min: 16,
  rapid_minutes: 7,
  very_rapid_minutes: 4,
  inflation_3_5_pct: 60,
  inflation_5plus_pct: 70,
  reserve_list_custom_email: false,
  reserve_list_email_body: `Hello [First Name],

Thank you for participating in the Transbill Digital Marketing Assessment.

You have successfully completed this stage and have been placed on our Reserve List.

The next step requires registration on Transbill.ng.

Registration Link:
https://transbill.ng

Complete registration within 7 days.

Please note:
• Registration is mandatory
• Final selection is subject to availability
• Additional screening and interviews may follow

Support:
support@transbill.ng

Regards
Recruitment Team
Transbill`,
};

function num(v) { return Number(v) || 0; }

export default function SettingsPanel({ onClose, applicants, settingsRecord, onSettingsSaved }) {
  const queryClient = useQueryClient();
  const [s, setS] = useState({ ...DEFAULTS, ...settingsRecord });
  const [saving, setSaving] = useState(false);
  const [recalcProgress, setRecalcProgress] = useState(null); // null | { done, total } | 'done'
  const [recalcCount, setRecalcCount] = useState(0);

  const irMin = num(s.interview_ready_min);
  const rlMin = num(s.reserve_list_min);
  const rapidM = num(s.rapid_minutes);
  const vRapidM = num(s.very_rapid_minutes);

  const thresholdError = irMin <= rlMin ? 'Interview Ready minimum must be greater than Reserve List minimum.' : null;
  const rapidError = vRapidM >= rapidM ? 'Very rapid threshold must be lower than rapid threshold.' : null;

  const irPct = Math.round((irMin / 25) * 100);
  const rlPct = Math.round((rlMin / 25) * 100);
  const irMax = 25;
  const rlMax = irMin - 1;
  const npMax = rlMin - 1;

  const set = (key, val) => setS(prev => ({ ...prev, [key]: val }));

  const handleSave = async () => {
    if (thresholdError || rapidError) return;
    setSaving(true);
    try {
      if (settingsRecord?.id) {
        await base44.entities.AppSettings.update(settingsRecord.id, s);
      } else {
        await base44.entities.AppSettings.create({ ...s, settings_id: 'main' });
      }
      onSettingsSaved(s);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    setS({ ...DEFAULTS });
    setSaving(true);
    try {
      if (settingsRecord?.id) {
        await base44.entities.AppSettings.update(settingsRecord.id, { ...DEFAULTS });
      } else {
        await base44.entities.AppSettings.create({ ...DEFAULTS, settings_id: 'main' });
      }
      onSettingsSaved({ ...DEFAULTS });
    } finally {
      setSaving(false);
    }
  };

  const handleRecalculate = async () => {
    const assessed = applicants.filter(a => a.assessment_completed);
    if (!assessed.length) return;
    const confirmed = window.confirm(
      `Are you sure? This will update status for all ${assessed.length} assessed candidates using the new thresholds. This cannot be undone.`
    );
    if (!confirmed) return;

    // Save settings first
    await handleSave();

    setRecalcProgress({ done: 0, total: assessed.length });
    let updated = 0;

    for (let i = 0; i < assessed.length; i++) {
      const a = assessed[i];
      const score = a.assessment_score ?? 0;
      const scorePercent = (score / 25) * 100;
      const completionTime = a.assessment_completion_time;

      // New status
      let newStatus;
      if (score >= irMin) newStatus = 'Interview Ready';
      else if (score >= rlMin) newStatus = 'Reserve List';
      else newStatus = 'Not Progressed';

      // New flags
      const rapid_completion_flag = completionTime !== undefined && completionTime !== null && completionTime < rapidM * 60;
      const very_rapid_completion_flag = completionTime !== undefined && completionTime !== null && completionTime < vRapidM * 60;
      let experience_inflation_flag = false;
      if (a.years_experience === '3–5 years' && scorePercent < num(s.inflation_3_5_pct)) experience_inflation_flag = true;
      if (a.years_experience === '5+ years' && scorePercent < num(s.inflation_5plus_pct)) experience_inflation_flag = true;
      const review_required_flag = rapid_completion_flag || experience_inflation_flag || !!a.duplicate_signature_flag;

      // candidate_stage logic
      let candidate_stage = a.candidate_stage;
      const prevStage = a.candidate_stage || '';
      if ((prevStage === 'Closed – Not Progressed' || prevStage === 'Closed \u2013 Not Progressed') &&
          (newStatus === 'Interview Ready' || newStatus === 'Reserve List')) {
        candidate_stage = 'Awaiting Registration';
      } else if ((prevStage === 'Awaiting Registration' || prevStage === 'Email Sent') &&
          newStatus === 'Not Progressed') {
        candidate_stage = 'Closed \u2013 Not Progressed';
      }

      await base44.entities.Applicant.update(a.id, {
        status: newStatus,
        rapid_completion_flag,
        very_rapid_completion_flag,
        experience_inflation_flag,
        review_required_flag,
        candidate_stage,
      });
      updated++;
      setRecalcProgress({ done: i + 1, total: assessed.length });
    }

    setRecalcCount(updated);
    setRecalcProgress('done');
    queryClient.invalidateQueries({ queryKey: ['applicants'] });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white h-full overflow-y-auto shadow-xl">
        <div className="sticky top-0 bg-white border-b border-[#E2E8E2] px-5 py-4 flex items-center justify-between z-10">
          <h2 className="font-bold text-lg text-[#1A1A1A]">Assessment Settings</h2>
          <button onClick={onClose} className="text-[#7A7A8A] hover:text-[#1A1A1A]"><X className="w-5 h-5" /></button>
        </div>

        <div className="px-5 py-5 space-y-8">

          {/* SECTION 1 — PASS THRESHOLDS */}
          <Section title="Pass Thresholds (out of 25)">
            <NumberField label="Interview Ready minimum score" value={s.interview_ready_min} onChange={v => set('interview_ready_min', v)} />
            <NumberField label="Reserve List minimum score" value={s.reserve_list_min} onChange={v => set('reserve_list_min', v)} />
            {thresholdError && <p className="text-xs text-[#D32F2F] font-medium">{thresholdError}</p>}
            {/* Live preview */}
            <div className="mt-3 bg-[#F8FAF8] border border-[#E2E8E2] rounded-[10px] p-3 space-y-1 text-xs font-medium text-[#333333]">
              <p><span className="text-[#2D6A2F] font-bold">Interview Ready:</span> {irMin}–{irMax} ({irPct}–100%)</p>
              <p><span className="text-[#F57C00] font-bold">Reserve List:</span> {rlMin}–{rlMax} ({rlPct}–{irPct - 1}%)</p>
              <p><span className="text-[#7A7A8A] font-bold">Not Progressed:</span> 0–{npMax} (below {rlPct}%)</p>
            </div>
          </Section>

          {/* SECTION 2 — FRAUD FLAGS */}
          <Section title="Fraud Flags">
            <NumberField label="Rapid completion threshold (minutes)" value={s.rapid_minutes} onChange={v => set('rapid_minutes', v)} />
            <NumberField label="Very rapid completion threshold (minutes)" value={s.very_rapid_minutes} onChange={v => set('very_rapid_minutes', v)} />
            {rapidError && <p className="text-xs text-[#D32F2F] font-medium">{rapidError}</p>}
            <NumberField label="Experience inflation — 3–5 yrs: min score % to avoid flag" value={s.inflation_3_5_pct} onChange={v => set('inflation_3_5_pct', v)} />
            <NumberField label="Experience inflation — 5+ yrs: min score % to avoid flag" value={s.inflation_5plus_pct} onChange={v => set('inflation_5plus_pct', v)} />
          </Section>

          {/* SECTION 3 — RESERVE LIST EMAIL */}
          <Section title="Reserve List Email">
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => set('reserve_list_custom_email', !s.reserve_list_custom_email)}
                className={`w-10 h-6 rounded-full transition-colors flex-shrink-0 flex items-center px-1 ${s.reserve_list_custom_email ? 'bg-[#3A7D3C]' : 'bg-[#E2E8E2]'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${s.reserve_list_custom_email ? 'translate-x-4' : 'translate-x-0'}`} />
              </div>
              <span className="text-sm text-[#1A1A1A]">Send Reserve List candidates a different email</span>
            </label>
            {s.reserve_list_custom_email && (
              <textarea
                value={s.reserve_list_email_body}
                onChange={e => set('reserve_list_email_body', e.target.value)}
                className="w-full mt-2 px-3 py-2 rounded-[10px] border-[1.5px] border-[#E2E8E2] focus:border-[#2D6A2F] outline-none text-sm min-h-[160px] font-mono"
                placeholder="Custom Reserve List email body..."
              />
            )}
          </Section>

          {/* SECTION 4 — RECALCULATE */}
          <div>
            <h3 className="font-bold text-sm text-[#1A1A1A] mb-3 border-b border-[#E2E8E2] pb-2">Recalculate Existing Candidates</h3>
            <div className="bg-amber-50 border border-amber-300 rounded-[10px] p-3 flex gap-2 text-xs text-amber-800 mb-4">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p>This will update the Status and candidate_stage of all applicants who have completed the assessment, based on the thresholds above. It will <strong>NOT</strong> resend emails. Admin notes and interview records will not be affected.</p>
            </div>

            {recalcProgress === 'done' ? (
              <div className="bg-green-50 border border-green-300 rounded-[10px] p-3 text-sm text-green-800 font-medium text-center">
                Done — {recalcCount} candidate statuses updated.
              </div>
            ) : recalcProgress ? (
              <div className="bg-[#F8FAF8] border border-[#E2E8E2] rounded-[10px] p-3 text-sm text-[#1A1A1A] text-center">
                Recalculating... ({recalcProgress.done} of {recalcProgress.total} updated)
              </div>
            ) : (
              <button
                onClick={handleRecalculate}
                disabled={!!thresholdError || !!rapidError}
                className="w-full bg-[#F57C00] hover:bg-[#E65100] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3 rounded-full transition-all"
              >
                Recalculate All Statuses
              </button>
            )}
          </div>

          {/* SAVE */}
          <div className="space-y-3 pt-2 border-t border-[#E2E8E2]">
            <button
              onClick={handleSave}
              disabled={saving || !!thresholdError || !!rapidError}
              className="w-full bg-[#3A7D3C] hover:bg-[#4A9A4D] disabled:opacity-50 text-white font-bold py-3 rounded-full transition-all"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
            <button
              onClick={handleReset}
              disabled={saving}
              className="w-full border-[1.5px] border-[#E2E8E2] text-[#7A7A8A] hover:text-[#1A1A1A] font-semibold py-2.5 rounded-full transition-all text-sm"
            >
              Reset to Defaults
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <h3 className="font-bold text-sm text-[#1A1A1A] mb-3 border-b border-[#E2E8E2] pb-2">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function NumberField({ label, value, onChange }) {
  return (
    <div>
      <label className="text-xs font-semibold text-[#7A7A8A] mb-1 block">{label}</label>
      <input
        type="number"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-[10px] border-[1.5px] border-[#E2E8E2] focus:border-[#2D6A2F] outline-none text-sm"
      />
    </div>
  );
}