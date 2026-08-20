import React from 'react';
import { STAGE_COLORS, STAGE_LABELS } from './funnelColors';
import { ChevronRight } from 'lucide-react';

export default function FunnelKPICards({ aggregates, onStageClick }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-7 gap-3">
      {aggregates.map((a) => {
        const color = STAGE_COLORS[a.stage];
        return (
          <button
            key={a.stage}
            onClick={() => onStageClick(a.stage)}
            className="bg-[#13203B] rounded-xl border border-[#1E3A5F] p-3 text-left hover:border-[#06B6D4]/50 transition-all group"
            aria-label={`${a.label}: ${a.count}, click for drill-down`}
          >
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
              <span className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-wide truncate">{a.label}</span>
            </div>
            <p className="font-extrabold text-2xl text-white mb-1.5">{a.count.toLocaleString()}</p>
            <div className="space-y-0.5">
              {a.order > 1 && (
                <p className="text-[10px] text-[#64748B]">
                  <span className="text-[#94A3B8] font-semibold">{a.conversionFromPrevious}%</span> from prev
                </p>
              )}
              {a.order > 1 && a.conversionFromLanding !== null && (
                <p className="text-[10px] text-[#64748B]">
                  <span className="text-[#94A3B8] font-semibold">{a.conversionFromLanding}%</span> from visits
                </p>
              )}
              {a.dropOff > 0 && (
                <p className="text-[10px] text-[#F87171]">↓ {a.dropOff} ({a.dropOffRate}%)</p>
              )}
            </div>
            <ChevronRight className="w-3 h-3 text-[#475569] group-hover:text-[#06B6D4] mt-1 transition-colors" />
          </button>
        );
      })}
    </div>
  );
}