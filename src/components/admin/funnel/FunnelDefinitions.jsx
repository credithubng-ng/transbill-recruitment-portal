import React, { useState } from 'react';
import { ChevronDown, ChevronUp, BookOpen } from 'lucide-react';

export default function FunnelDefinitions({ definitions }) {
  const [expanded, setExpanded] = useState(false);

  if (!definitions) return null;

  return (
    <div className="bg-[#13203B] rounded-xl border border-[#1E3A5F] overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#1E3A5F]/30 transition-colors"
        aria-expanded={expanded}
      >
        <span className="flex items-center gap-2 text-sm font-bold text-white">
          <BookOpen className="w-4 h-4 text-[#06B6D4]" /> Metric Definitions
        </span>
        {expanded ? <ChevronUp className="w-4 h-4 text-[#94A3B8]" /> : <ChevronDown className="w-4 h-4 text-[#94A3B8]" />}
      </button>
      {expanded && (
        <div className="px-4 pb-4 space-y-2">
          {Object.entries(definitions).map(([key, desc]) => (
            <div key={key} className="border-l-2 border-[#1E3A5F] pl-3">
              <p className="text-xs font-semibold text-[#06B6D4] capitalize">{key.replace(/_/g, ' ')}</p>
              <p className="text-[11px] text-[#94A3B8] leading-relaxed mt-0.5">{desc}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}