import React from 'react';
import { Globe, Tag, Megaphone } from 'lucide-react';

export default function CampaignBreakdown({ breakdown }) {
  if (!breakdown) return null;
  const { sources = [], mediums = [], campaigns = [] } = breakdown;
  const hasData = sources.length > 0 || mediums.length > 0 || campaigns.length > 0;

  if (!hasData) {
    return (
      <div className="bg-white border border-[#E5E7EB] rounded-lg p-5">
        <h3 className="text-sm font-bold text-[#0A2540] mb-2">Campaign &amp; Source Breakdown</h3>
        <p className="text-xs text-[#9CA3AF]">No UTM/source data recorded for landing visits in this period.</p>
      </div>
    );
  }

  const renderList = (items, emptyLabel) => {
    if (!items || items.length === 0) return <p className="text-xs text-[#9CA3AF]">{emptyLabel}</p>;
    const max = Math.max(...items.map(i => i.count), 1);
    return (
      <div className="space-y-1.5">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-xs text-[#1F2937] font-medium w-24 truncate flex-shrink-0">{item.key || '(unknown)'}</span>
            <div className="flex-1 h-2 bg-[#F4F6F9] rounded-full overflow-hidden">
              <div className="h-full bg-[#0891B2] rounded-full" style={{ width: `${(item.count / max) * 100}%` }} />
            </div>
            <span className="text-xs font-bold text-[#0A2540] tabular-nums w-8 text-right">{item.count}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-lg p-5">
      <h3 className="text-sm font-bold text-[#0A2540] mb-4">Campaign &amp; Source Breakdown</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div>
          <p className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wide mb-2 flex items-center gap-1.5"><Globe className="w-3 h-3" /> Top Sources</p>
          {renderList(sources, 'No source data')}
        </div>
        <div>
          <p className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wide mb-2 flex items-center gap-1.5"><Tag className="w-3 h-3" /> Top Mediums</p>
          {renderList(mediums, 'No medium data')}
        </div>
        <div>
          <p className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wide mb-2 flex items-center gap-1.5"><Megaphone className="w-3 h-3" /> Top Campaigns</p>
          {renderList(campaigns, 'No campaign data')}
        </div>
      </div>
    </div>
  );
}