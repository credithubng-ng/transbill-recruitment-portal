import React, { useState } from 'react';
import { Calendar } from 'lucide-react';

const PRESETS = [
  { key: 'today', label: 'Today' },
  { key: '7days', label: '7 Days' },
  { key: '30days', label: '30 Days' },
  { key: 'all', label: 'All Time' },
  { key: 'custom', label: 'Custom' },
];

export default function FunnelFilters({ preset, setPreset, customFrom, setCustomFrom, customTo, setCustomTo, mode, setMode, dateError }) {
  return (
    <div className="bg-[#13203B] rounded-xl border border-[#1E3A5F] p-4 space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {PRESETS.map(p => (
          <button
            key={p.key}
            onClick={() => setPreset(p.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              preset === p.key
                ? 'bg-[#06B6D4] text-[#0B1120]'
                : 'bg-[#0B1120] text-[#94A3B8] hover:text-white border border-[#1E3A5F]'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {preset === 'custom' && (
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#64748B]" />
            <input
              type="date"
              value={customFrom}
              onChange={e => setCustomFrom(e.target.value)}
              max={customTo || undefined}
              className="bg-[#0B1120] border border-[#1E3A5F] text-white text-sm rounded-lg px-3 py-1.5 focus:border-[#06B6D4] focus:outline-none"
              aria-label="From date"
            />
            <span className="text-[#64748B] text-sm">to</span>
            <input
              type="date"
              value={customTo}
              onChange={e => setCustomTo(e.target.value)}
              min={customFrom || undefined}
              max={new Date().toISOString().slice(0, 10)}
              className="bg-[#0B1120] border border-[#1E3A5F] text-white text-sm rounded-lg px-3 py-1.5 focus:border-[#06B6D4] focus:outline-none"
              aria-label="To date"
            />
          </div>
          {dateError && <p className="text-[#F87171] text-xs font-medium">{dateError}</p>}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-[#1E3A5F]">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMode('cohort')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              mode === 'cohort' ? 'bg-[#10B981] text-[#0B1120]' : 'bg-[#0B1120] text-[#94A3B8] hover:text-white border border-[#1E3A5F]'
            }`}
          >
            Cohort
          </button>
          <button
            onClick={() => setMode('events')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              mode === 'events' ? 'bg-[#10B981] text-[#0B1120]' : 'bg-[#0B1120] text-[#94A3B8] hover:text-white border border-[#1E3A5F]'
            }`}
          >
            Events in Period
          </button>
        </div>
        <p className="text-[10px] text-[#64748B] flex-1 min-w-[200px]">
          {mode === 'cohort'
            ? 'Cohort: people who entered at the first available stage during the period, with later progression counted even if it occurred afterward.'
            : 'Events in Period: counts events that occurred within the selected date range, regardless of when each person entered the funnel.'}
        </p>
      </div>
    </div>
  );
}