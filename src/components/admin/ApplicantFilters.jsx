import React from 'react';
import { Search } from 'lucide-react';

export default function ApplicantFilters({ filters, setFilters }) {
  const handleChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="flex flex-wrap gap-3 items-end">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A7A8A]" />
        <input
          value={filters.search}
          onChange={e => handleChange('search', e.target.value)}
          placeholder="Search by name or email..."
          className="w-full pl-9 pr-4 py-2.5 rounded-[10px] border-[1.5px] border-[#E2E8E2] focus:border-[#2D6A2F] outline-none text-sm"
        />
      </div>
      <FilterSelect label="Display Status" value={filters.displayStatus} onChange={v => handleChange('displayStatus', v)}
        options={[
          ['all', 'All'],
          ['Applied', 'Applied'],
          ['Interview Ready', 'Interview Ready'],
          ['Reserve List', 'Reserve List'],
          ['Not Progressed', 'Not Progressed'],
          ['outcome_pass', 'Interview – Pass'],
          ['outcome_fail', 'Interview – Fail'],
          ['outcome_hold', 'Interview – Hold'],
          ['stage_booked', 'Interview Booked'],
          ['stage_scheduling', 'Booking Pending'],
          ['stage_closed', 'Closed'],
        ]} />
      <FilterSelect label="Lagos" value={filters.lagos} onChange={v => handleChange('lagos', v)}
        options={[['all', 'All'], ['Yes', 'Yes'], ['No', 'No']]} />
      <FilterSelect label="2-Week Availability" value={filters.available} onChange={v => handleChange('available', v)}
        options={[['all', 'All'], ['Yes', 'Yes'], ['No', 'No']]} />
      <FilterSelect label="Affiliate Role" value={filters.affiliateRole} onChange={v => handleChange('affiliateRole', v)}
        options={[['all', 'All'], ['Yes', 'Yes'], ['No', 'No']]} />
      <FilterSelect label="Score" value={filters.score} onChange={v => handleChange('score', v)}
        options={[['all', 'All'], ['84-100', '84–100%'], ['64-83', '64–83%'], ['0-63', 'Below 64%']]} />
      <FilterSelect label="⚠ Flags" value={filters.flags} onChange={v => handleChange('flags', v)}
        options={[['all', 'All'], ['review', 'Review Required'], ['inflation', 'Exp. Inflation'], ['rapid', 'Rapid Completion'], ['duplicate', 'Dup. Signature']]} />
      <FilterSelect label="Stage" value={filters.stage} onChange={v => handleChange('stage', v)}
        options={[
          ['all', 'All Stages'],
          ['Assessment Started', 'Assessment Started'],
          ['Assessment Completed', 'Assessment Completed'],
          ['Email Sent', 'Email Sent'],
          ['Interview Ready', 'Interview Ready'],
          ['Reserve List', 'Reserve List'],
          ['Not Progressed', 'Not Progressed'],
          ['Interview Scheduling', 'Interview Scheduling'],
          ['Interview Scheduled', 'Interview Scheduled'],
          ['AI Interview Shortlisted', 'Digital – Shortlisted'],
          ['AI Interview Scheduled', 'Digital – Scheduled'],
          ['AI Interview Completed', 'Digital – Completed'],
          ['AI Interview Reviewed', 'Digital – Reviewed'],
          ['Live Panel Referred', 'Live Panel – Referred'],
          ['Live Panel Scheduled', 'Live Panel – Scheduled'],
          ['Interview Outcome – Pass', 'Interview Outcome – Pass'],
          ['Interview Outcome – Hold', 'Interview Outcome – Hold'],
          ['Final Hiring Decision', 'Final Hiring Decision'],
          ['Closed – Not Progressed', 'Closed – Not Progressed'],
        ]} />
      <FilterSelect label="Interview Mode" value={filters.interviewMode || 'all'} onChange={v => handleChange('interviewMode', v)}
        options={[
          ['all', 'All Modes'],
          ['structured_digital', 'Structured Digital'],
          ['live_panel', 'Live Panel'],
          ['legacy_unspecified', 'Legacy / Unspecified'],
        ]} />
    </div>
  );
}

function FilterSelect({ label, value, onChange, options }) {
  return (
    <div>
      <label className="text-xs font-medium text-[#7A7A8A] mb-1 block">{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)}
        className="px-3 py-2.5 rounded-[10px] border-[1.5px] border-[#E2E8E2] focus:border-[#2D6A2F] outline-none text-sm bg-white min-w-[100px]">
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </div>
  );
}