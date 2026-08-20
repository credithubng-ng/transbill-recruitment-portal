import React from 'react';
import { AlertTriangle, Database, Clock, Copy, History, Info } from 'lucide-react';

export default function FunnelDataQuality({ dataQuality }) {
  if (!dataQuality) return null;
  const items = [
    { icon: Clock, label: 'Tracking Start', value: dataQuality.earliestVisitDate || 'No visits yet', color: 'text-[#0891B2]' },
    { icon: Info, label: 'Unattributed Applicants', value: dataQuality.unattributedApplicants, color: 'text-[#CA8A04]' },
    { icon: History, label: 'Legacy / Backfilled Events', value: dataQuality.backfilledEvents, color: 'text-[#6B7280]' },
    { icon: Copy, label: 'Duplicate Events Suppressed', value: dataQuality.duplicatesSuppressed, color: 'text-[#0D9488]' },
    { icon: Database, label: 'Last Backfill', value: dataQuality.lastBackfillAt ? new Date(dataQuality.lastBackfillAt).toLocaleString('en-GB', { timeZone: 'Africa/Lagos', dateStyle: 'short', timeStyle: 'short' }) : 'Never', color: 'text-[#6B7280]' },
    { icon: Database, label: 'Total Events', value: dataQuality.totalEvents, color: 'text-[#6B7280]' },
  ];

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-lg p-5">
      <h3 className="text-sm font-bold text-[#0A2540] mb-3">Data quality</h3>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map(item => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="bg-[#F9FAFB] rounded-lg border border-[#E5E7EB] p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Icon className={`w-3.5 h-3.5 ${item.color}`} />
                <span className="text-[10px] text-[#9CA3AF] uppercase tracking-wide">{item.label}</span>
              </div>
              <p className="text-[#0A2540] font-bold text-sm">{item.value}</p>
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex items-start gap-2 bg-[#FFF7ED] rounded-lg border border-[#CA8A04]/20 p-3">
        <AlertTriangle className="w-4 h-4 text-[#CA8A04] flex-shrink-0 mt-0.5" />
        <p className="text-[11px] text-[#6B7280] leading-relaxed">
          {dataQuality.trackingNote}. Historical landing-page visits cannot be reconstructed — backfill covers stages 2–7 only.
        </p>
      </div>
    </div>
  );
}