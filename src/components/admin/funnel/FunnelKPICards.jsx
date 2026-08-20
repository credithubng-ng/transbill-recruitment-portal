import React from 'react';
import { STAGE_COLORS } from './funnelColors';
import { ChevronRight } from 'lucide-react';

export default function FunnelKPICards({ aggregates, onStageClick }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {aggregates.map((a) => {
        const color = STAGE_COLORS[a.stage];
        return (
          <button
            key={a.stage}
            onClick={() => onStageClick(a.stage)}
            className="bg-white border border-[#E5E7EB] rounded-lg p-4 text-left hover:border-[#0A2540]/30 hover:shadow-sm transition-all group"
            aria-label={`${a.label}: ${a.count}, click for drill-down`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                <span className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wide truncate">{a.label}</span>
              </div>
              <span className="text-[10px] font-bold text-[#9CA3AF] tabular-nums">{a.order}</span>
            </div>
            <p className="font-extrabold text-3xl text-[#0A2540] mb-2 tabular-nums">{a.count.toLocaleString()}</p>
            <div className="space-y-0.5 min-h-[28px]">
              {a.order > 1 && (
                <p className="text-[10px] text-[#6B7280]">
                  <span className="font-semibold text-[#1F2937]">{a.conversionFromPrevious}%</span> from prev
                </p>
              )}
              {a.order > 1 && a.conversionFromLanding !== null && (
                <p className="text-[10px] text-[#6B7280]">
                  <span className="font-semibold text-[#1F2937]">{a.conversionFromLanding}%</span> from visits
                </p>
              )}
              {a.dropOff > 0 && (
                <p className="text-[10px] text-[#DC2626]">↓ {a.dropOff} ({a.dropOffRate}%)</p>
              )}
            </div>
            <ChevronRight className="w-3 h-3 text-[#9CA3AF] group-hover:text-[#0A2540] mt-1 transition-colors" />
          </button>
        );
      })}
    </div>
  );
}