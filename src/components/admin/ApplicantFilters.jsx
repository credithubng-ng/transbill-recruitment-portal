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
      <FilterSelect label="Status" value={filters.status} onChange={v => handleChange('status', v)}
        options={[['all', 'All'], ['Interview Ready', 'Interview Ready'], ['Reserve List', 'Reserve List'], ['Not Progressed', 'Not Progressed'], ['Applied', 'Applied']]} />
      <FilterSelect label="Lagos" value={filters.lagos} onChange={v => handleChange('lagos', v)}
        options={[['all', 'All'], ['Yes', 'Yes'], ['No', 'No']]} />
      <FilterSelect label="3MTT" value={filters.threeMTT} onChange={v => handleChange('threeMTT', v)}
        options={[['all', 'All'], ['Yes', 'Yes'], ['No', 'No']]} />
      <FilterSelect label="SAIL" value={filters.sail} onChange={v => handleChange('sail', v)}
        options={[['all', 'All'], ['Yes', 'Yes'], ['No', 'No']]} />
      <FilterSelect label="Score" value={filters.score} onChange={v => handleChange('score', v)}
        options={[['all', 'All'], ['84-100', '84–100%'], ['64-83', '64–83%'], ['0-63', 'Below 64%']]} />
      <FilterSelect label="⚠ Flags" value={filters.flags} onChange={v => handleChange('flags', v)}
        options={[['all', 'All'], ['review', 'Review Required'], ['inflation', 'Exp. Inflation'], ['rapid', 'Rapid Completion'], ['duplicate', 'Dup. Signature']]} />
      <FilterSelect label="Stage" value={filters.stage} onChange={v => handleChange('stage', v)}
        options={[
          ['all', 'All Stages'],
          ['Interview Ready', 'Interview Ready'],
          ['Reserve List', 'Reserve List'],
          ['Not Progressed', 'Not Progressed'],
          ['Awaiting Registration', 'Awaiting Registration'],
          ['Registered on Transbill.ng', 'Registered'],
          ['Interview Scheduling', 'Interview Scheduling'],
          ['Closed – Not Progressed', 'Closed'],
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