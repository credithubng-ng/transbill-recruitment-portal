import React from 'react';
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
    <div className="bg-white border border-[#E5E7EB] rounded-lg px-4 py-3 space-y-2.5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider mr-1">Period</span>
        {PRESETS.map(p => (
          <button
            key={p.key}
            onClick={() => setPreset(p.key)}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              preset === p.key
                ? 'bg-[#0A2540] text-white'
                : 'bg-[#F4F6F9] text-[#6B7280] hover:text-[#0A2540] border border-[#E5E7EB]'
            }`}
          >
            {p.label}
          </button>
        ))}
        <div className="h-5 w-px bg-[#E5E7EB] mx-1" />
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMode('cohort')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              mode === 'cohort' ? 'bg-[#0D9488] text-white' : 'bg-[#F4F6F9] text-[#6B7280] hover:text-[#0A2540] border border-[#E5E7EB]'
            }`}
          >
            Cohort
          </button>
          <button
            onClick={() => setMode('events')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              mode === 'events' ? 'bg-[#0D9488] text-white' : 'bg-[#F4F6F9] text-[#6B7280] hover:text-[#0A2540] border border-[#E5E7EB]'
            }`}
          >
            Events in Period
          </button>
        </div>
      </div>

      {preset === 'custom' && (
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-[#9CA3AF]" />
            <input
              type="date"
              value={customFrom}
              onChange={e => setCustomFrom(e.target.value)}
              max={customTo || undefined}
              className="bg-white border border-[#E5E7EB] text-[#1F2937] text-sm rounded-md px-2.5 py-1.5 focus:border-[#0A2540] focus:outline-none"
              aria-label="From date"
            />
            <span className="text-[#9CA3AF] text-xs">to</span>
            <input
              type="date"
              value={customTo}
              onChange={e => setCustomTo(e.target.value)}
              min={customFrom || undefined}
              max={new Date().toISOString().slice(0, 10)}
              className="bg-white border border-[#E5E7EB] text-[#1F2937] text-sm rounded-md px-2.5 py-1.5 focus:border-[#0A2540] focus:outline-none"
              aria-label="To date"
            />
          </div>
          {dateError && <p className="text-[#DC2626] text-xs font-medium">{dateError}</p>}
        </div>
      )}

      <p className="text-[10px] text-[#9CA3AF] leading-relaxed">
        {mode === 'cohort'
          ? 'Cohort: people who entered at the first available stage during the period, with later progression counted even if it occurred afterward.'
          : 'Events in Period: counts events that occurred within the selected date range, regardless of when each person entered the funnel.'}
      </p>
    </div>
  );
}