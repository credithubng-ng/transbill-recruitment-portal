import React from 'react';

export default function StatsCards({ applicants }) {
  const total = applicants.length;
  const assessed = applicants.filter(a => a.assessment_completed).length;
  const interviewReady = applicants.filter(a => a.status === 'Interview Ready').length;
  const reserveList = applicants.filter(a => a.status === 'Reserve List').length;
  const notProgressed = applicants.filter(a => a.status === 'Not Progressed').length;
  const lagosResidents = applicants.filter(a => a.lagos_resident === 'Yes').length;
  const threeM = applicants.filter(a => a.is_3mtt === 'Yes').length;
  const sail = applicants.filter(a => a.is_sail === 'Yes').length;

  const cards = [
    { label: 'Total Applications', value: total, color: 'border-[#2D6A2F]' },
    { label: 'Assessments Completed', value: assessed, color: 'border-[#2D6A2F]' },
    { label: 'Interview Ready', value: interviewReady, badge: 'bg-[#2D6A2F] text-white' },
    { label: 'Reserve List', value: reserveList, badge: 'bg-[#F57C00] text-white' },
    { label: 'Not Progressed', value: notProgressed, badge: 'bg-[#9E9E9E] text-white' },
    { label: 'Lagos Residents', value: lagosResidents, color: 'border-[#2D6A2F]' },
    { label: '3MTT Graduates', value: threeM, color: 'border-[#2D6A2F]' },
    { label: 'SAIL Alumni', value: sail, color: 'border-[#2D6A2F]' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {cards.map(c => (
        <div key={c.label} className={`bg-white border border-[#E2E8E2] rounded-[14px] p-4 ${c.color || ''}`}>
          <p className="text-[#7A7A8A] text-xs font-medium mb-1">{c.label}</p>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-extrabold text-[#1A1A1A]">{c.value}</span>
            {c.badge && <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${c.badge}`}>{c.label.split(' ').pop()}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}