import React from 'react';
import { STAGE_COLORS } from './funnelColors';

export default function FunnelConversionTable({ aggregates, onRowClick }) {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-lg overflow-hidden">
      <h3 className="text-sm font-bold text-[#0A2540] px-5 pt-4 pb-2">Conversion performance</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[#9CA3AF] text-[10px] uppercase tracking-wide border-b border-[#E5E7EB]">
              <th className="text-left px-5 py-2 font-semibold">Stage</th>
              <th className="text-right px-5 py-2 font-semibold">Count</th>
              <th className="text-right px-5 py-2 font-semibold">Prev. Conv.</th>
              <th className="text-right px-5 py-2 font-semibold">Overall Conv.</th>
              <th className="text-right px-5 py-2 font-semibold">Drop-off</th>
              <th className="text-right px-5 py-2 font-semibold">Drop-off Rate</th>
            </tr>
          </thead>
          <tbody>
            {aggregates.map(a => (
              <tr
                key={a.stage}
                onClick={() => onRowClick(a.stage)}
                className="border-b border-[#F4F6F9] hover:bg-[#F9FAFB] cursor-pointer transition-colors"
              >
                <td className="px-5 py-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: STAGE_COLORS[a.stage] }} />
                    <span className="text-[#1F2937] font-medium text-xs">{a.label}</span>
                  </div>
                </td>
                <td className="px-5 py-2.5 text-right text-[#0A2540] font-bold tabular-nums">{a.count.toLocaleString()}</td>
                <td className="px-5 py-2.5 text-right text-[#6B7280]">
                  {a.order > 1 ? `${a.conversionFromPrevious}%` : '—'}
                </td>
                <td className="px-5 py-2.5 text-right text-[#6B7280]">{a.conversionFromLanding}%</td>
                <td className="px-5 py-2.5 text-right text-[#DC2626]">{a.dropOff > 0 ? a.dropOff.toLocaleString() : '—'}</td>
                <td className="px-5 py-2.5 text-right text-[#DC2626]">{a.dropOffRate > 0 ? `${a.dropOffRate}%` : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}