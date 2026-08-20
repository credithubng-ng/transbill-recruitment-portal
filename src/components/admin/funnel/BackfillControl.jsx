import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { History, AlertTriangle, Loader2, CheckCircle2 } from 'lucide-react';

export default function BackfillControl({ onBackfillComplete }) {
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const token = sessionStorage.getItem('transbill_admin_token');

  const runPreview = async () => {
    setLoading(true);
    setError(null);
    setPreview(null);
    try {
      const res = await base44.functions.invoke('backfillFunnelEvents', { token, dry_run: true });
      if (res.data?.error) throw new Error(res.data.error);
      setPreview(res.data);
    } catch (e) {
      setError(e?.response?.data?.error || e.message || 'Preview failed.');
    } finally {
      setLoading(false);
    }
  };

  const execute = async () => {
    if (!confirm('⚠ WARNING: This will create historical FunnelEvent records for all existing applicants. This action cannot be undone. Do not execute until the app is published. Continue?')) return;
    setExecuting(true);
    setError(null);
    try {
      const res = await base44.functions.invoke('backfillFunnelEvents', { token, dry_run: false });
      if (res.data?.error) throw new Error(res.data.error);
      setResult(res.data);
      if (onBackfillComplete) onBackfillComplete();
    } catch (e) {
      setError(e?.response?.data?.error || e.message || 'Backfill failed.');
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="bg-[#13203B] rounded-xl border border-[#F59E0B]/30 p-4">
      <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
        <History className="w-4 h-4 text-[#F59E0B]" /> Historical Backfill (Owner Only)
      </h3>
      <p className="text-[11px] text-[#94A3B8] mb-3">
        Backfills stages 2–7 from existing authoritative timestamps. Landing-page visits cannot be reconstructed.
      </p>

      <div className="flex items-start gap-2 bg-[#F59E0B]/10 rounded-lg border border-[#F59E0B]/30 p-3 mb-3">
        <AlertTriangle className="w-4 h-4 text-[#F59E0B] flex-shrink-0 mt-0.5" />
        <p className="text-[11px] text-[#FCD34D] leading-relaxed">
          Do not execute until the app is published. Running the backfill creates permanent historical events.
        </p>
      </div>

      <button
        onClick={runPreview}
        disabled={loading}
        className="w-full bg-[#0B1120] border border-[#1E3A5F] text-[#06B6D4] hover:text-white font-semibold text-sm py-2.5 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Previewing...</> : <><History className="w-4 h-4" /> Preview Backfill (Dry Run)</>}
      </button>

      {preview && (
        <div className="mt-3 space-y-2">
          <p className="text-xs font-semibold text-white">Projected Events by Stage:</p>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(preview.projected || {}).map(([stage, count]) => (
              <div key={stage} className="bg-[#0B1120] rounded-lg border border-[#1E3A5F] px-3 py-2">
                <p className="text-[10px] text-[#64748B] uppercase">{stage.replace(/_/g, ' ')}</p>
                <p className="text-white font-bold text-sm">{count}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-[#94A3B8] text-center">Total projected: <span className="font-bold text-white">{preview.totalProjected}</span></p>
          <button
            onClick={execute}
            disabled={executing}
            className="w-full bg-[#F59E0B] hover:bg-[#D97706] text-[#0B1120] font-bold text-sm py-2.5 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {executing ? <><Loader2 className="w-4 h-4 animate-spin" /> Executing...</> : 'Execute Backfill (Requires Confirmation)'}
          </button>
        </div>
      )}

      {result && (
        <div className="mt-3 bg-[#10B981]/10 rounded-lg border border-[#10B981]/30 p-3 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
          <p className="text-xs text-[#10B981]">Backfill complete. {result.totalCreated} events created.</p>
        </div>
      )}

      {error && <p className="mt-2 text-xs text-[#F87171]">{error}</p>}
    </div>
  );
}