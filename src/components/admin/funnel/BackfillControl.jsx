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
    <div className="bg-white border border-[#CA8A04]/30 rounded-lg p-5">
      <h3 className="text-sm font-bold text-[#0A2540] mb-1 flex items-center gap-2">
        <History className="w-4 h-4 text-[#CA8A04]" /> Historical backfill (Owner Only)
      </h3>
      <p className="text-[11px] text-[#6B7280] mb-3">
        Backfills stages 2–7 from existing authoritative timestamps. Landing-page visits cannot be reconstructed.
      </p>

      <div className="flex items-start gap-2 bg-[#FFF7ED] rounded-lg border border-[#CA8A04]/20 p-3 mb-3">
        <AlertTriangle className="w-4 h-4 text-[#CA8A04] flex-shrink-0 mt-0.5" />
        <p className="text-[11px] text-[#92400E] leading-relaxed">
          Do not execute until the app is published. Running the backfill creates permanent historical events.
        </p>
      </div>

      <button
        onClick={runPreview}
        disabled={loading}
        className="w-full bg-white border border-[#E5E7EB] text-[#0A2540] hover:bg-[#F9FAFB] font-semibold text-sm py-2.5 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Previewing...</> : <><History className="w-4 h-4" /> Preview Backfill (Dry Run)</>}
      </button>

      {preview && (
        <div className="mt-3 space-y-2">
          <p className="text-xs font-semibold text-[#0A2540]">Projected events by stage:</p>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(preview.projected || {}).map(([stage, count]) => (
              <div key={stage} className="bg-[#F9FAFB] rounded-lg border border-[#E5E7EB] px-3 py-2">
                <p className="text-[10px] text-[#9CA3AF] uppercase">{stage.replace(/_/g, ' ')}</p>
                <p className="text-[#0A2540] font-bold text-sm">{count}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-[#6B7280] text-center">Total projected: <span className="font-bold text-[#0A2540]">{preview.totalProjected}</span></p>
          <button
            onClick={execute}
            disabled={executing}
            className="w-full bg-[#CA8A04] hover:bg-[#B45309] text-white font-bold text-sm py-2.5 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {executing ? <><Loader2 className="w-4 h-4 animate-spin" /> Executing...</> : 'Execute Backfill (Requires Confirmation)'}
          </button>
        </div>
      )}

      {result && (
        <div className="mt-3 bg-[#ECFDF5] rounded-lg border border-[#0D9488]/30 p-3 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#0D9488]" />
          <p className="text-xs text-[#0D9488]">Backfill complete. {result.totalCreated} events created.</p>
        </div>
      )}

      {error && <p className="mt-2 text-xs text-[#DC2626]">{error}</p>}
    </div>
  );
}