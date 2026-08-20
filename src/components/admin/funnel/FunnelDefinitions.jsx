import React, { useState } from 'react';
import { ChevronDown, ChevronUp, BookOpen } from 'lucide-react';

export default function FunnelDefinitions({ definitions }) {
  const [expanded, setExpanded] = useState(false);

  if (!definitions) return null;

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-[#F9FAFB] transition-colors"
        aria-expanded={expanded}
      >
        <span className="flex items-center gap-2 text-sm font-bold text-[#0A2540]">
          <BookOpen className="w-4 h-4 text-[#0891B2]" /> Metric definitions
        </span>
        {expanded ? <ChevronUp className="w-4 h-4 text-[#9CA3AF]" /> : <ChevronDown className="w-4 h-4 text-[#9CA3AF]" />}
      </button>
      {expanded && (
        <div className="px-5 pb-4 space-y-2.5 border-t border-[#F4F6F9] pt-3">
          {Object.entries(definitions).map(([key, desc]) => (
            <div key={key} className="border-l-2 border-[#E5E7EB] pl-3">
              <p className="text-xs font-semibold text-[#0A2540] capitalize">{key.replace(/_/g, ' ')}</p>
              <p className="text-[11px] text-[#6B7280] leading-relaxed mt-0.5">{desc}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}