import React from 'react';
import { AlertTriangle, Database, Clock, Copy, History, Info } from 'lucide-react';

export default function FunnelDataQuality({ dataQuality }) {
  if (!dataQuality) return null;
  const items = [
    { icon: Clock, label: 'Tracking Start', value: dataQuality.earliestVisitDate || 'No visits yet', color: 'text-[#06B6D4]' },
    { icon: Info, label: 'Unattributed Applicants', value: dataQuality.unattributedApplicants, color: 'text-[#F59E0B]' },
    { icon: History, label: 'Legacy / Backfilled Events', value: dataQuality.backfilledEvents, color: 'text-[#94A3B8]' },
    { icon: Copy, label: 'Duplicate Events Suppressed', value: dataQuality.duplicatesSuppressed, color: 'text-[#10B981]' },
    { icon: Database, label: 'Last Backfill', value: dataQuality.lastBackfillAt ? new Date(dataQuality.lastBackfillAt).toLocaleString('en-GB', { timeZone: 'Africa/Lagos', dateStyle: 'short', timeStyle: 'short' }) : 'Never', color: 'text-[#94A3B8]' },
    { icon: Database, label: 'Total Events', value: dataQuality.totalEvents, color: 'text-[#94A3B8]' },
  ];

  return (
    <div className="bg-[#13203B] rounded-xl border border-[#1E3A5F] p-4">
      <h3 className="text-sm font-bold text-white mb-3">Data Quality</h3>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map(item => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="bg-[#0B1120] rounded-lg border border-[#1E3A5F] p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Icon className={`w-3.5 h-3.5 ${item.color}`} />
                <span className="text-[10px] text-[#64748B] uppercase tracking-wide">{item.label}</span>
              </div>
              <p className="text-white font-bold text-sm">{item.value}</p>
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex items-start gap-2 bg-[#0B1120] rounded-lg border border-[#1E3A5F] p-3">
        <AlertTriangle className="w-4 h-4 text-[#F59E0B] flex-shrink-0 mt-0.5" />
        <p className="text-[11px] text-[#94A3B8] leading-relaxed">
          {dataQuality.trackingNote}. Historical landing-page visits cannot be reconstructed — backfill covers stages 2–7 only.
        </p>
      </div>
    </div>
  );
}