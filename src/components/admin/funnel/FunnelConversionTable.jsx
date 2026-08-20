import React from 'react';
import { STAGE_COLORS } from './funnelColors';

export default function FunnelConversionTable({ aggregates, onRowClick }) {
  return (
    <div className="bg-[#13203B] rounded-xl border border-[#1E3A5F] overflow-hidden">
      <h3 className="text-sm font-bold text-white px-4 pt-4 pb-2">Conversion Performance</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[#64748B] text-[10px] uppercase tracking-wide border-b border-[#1E3A5F]">
              <th className="text-left px-4 py-2 font-semibold">Stage</th>
              <th className="text-right px-4 py-2 font-semibold">Count</th>
              <th className="text-right px-4 py-2 font-semibold">Prev. Conv.</th>
              <th className="text-right px-4 py-2 font-semibold">Overall Conv.</th>
              <th className="text-right px-4 py-2 font-semibold">Drop-off</th>
              <th className="text-right px-4 py-2 font-semibold">Drop-off Rate</th>
            </tr>
          </thead>
          <tbody>
            {aggregates.map(a => (
              <tr
                key={a.stage}
                onClick={() => onRowClick(a.stage)}
                className="border-b border-[#1E3A5F]/50 hover:bg-[#1E3A5F]/30 cursor-pointer transition-colors"
              >
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: STAGE_COLORS[a.stage] }} />
                    <span className="text-white font-medium text-xs">{a.label}</span>
                  </div>
                </td>
                <td className="px-4 py-2.5 text-right text-white font-bold">{a.count.toLocaleString()}</td>
                <td className="px-4 py-2.5 text-right text-[#94A3B8]">
                  {a.order > 1 ? `${a.conversionFromPrevious}%` : '—'}
                </td>
                <td className="px-4 py-2.5 text-right text-[#94A3B8]">{a.conversionFromLanding}%</td>
                <td className="px-4 py-2.5 text-right text-[#F87171]">{a.dropOff > 0 ? a.dropOff.toLocaleString() : '—'}</td>
                <td className="px-4 py-2.5 text-right text-[#F87171]">{a.dropOffRate > 0 ? `${a.dropOffRate}%` : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}