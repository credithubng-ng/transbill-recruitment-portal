import React from 'react';
import { STAGE_COLORS, STAGE_LABELS } from './funnelColors';

export default function FunnelChart({ aggregates, onSegmentClick, disableDrilldown }) {
  const maxCount = Math.max(...aggregates.map(a => a.count), 1);

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-lg p-5">
      <h3 className="text-sm font-bold text-[#0A2540] mb-4">Conversion overview</h3>
      <div className="space-y-3.5">
        {aggregates.map(a => {
          const color = STAGE_COLORS[a.stage];
          const widthPct = Math.max((a.count / maxCount) * 100, 2);
          const Tag = disableDrilldown ? 'div' : 'button';
          return (
            <Tag
              key={a.stage}
              onClick={disableDrilldown ? undefined : () => onSegmentClick(a.stage)}
              className={`w-full text-left ${disableDrilldown ? '' : 'group cursor-pointer'}`}
              aria-label={disableDrilldown ? `${a.label}: ${a.count}` : `${a.label}: ${a.count}, click for drill-down`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-[#1F2937] truncate">{a.label}</span>
                <span className="text-xs font-bold text-[#0A2540] tabular-nums ml-3 flex-shrink-0">{a.count.toLocaleString()}</span>
              </div>
              <div className="h-2.5 bg-[#F4F6F9] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${widthPct}%`, backgroundColor: color }}
                />
              </div>
            </Tag>
          );
        })}
      </div>
      {!disableDrilldown && <p className="text-[10px] text-[#9CA3AF] mt-4 text-center">Click any stage to view the drill-down</p>}
    </div>
  );
}