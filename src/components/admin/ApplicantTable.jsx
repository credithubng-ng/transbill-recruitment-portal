import React from 'react';
import { format } from 'date-fns';
import BookingStatusBadge from './BookingStatusBadge';

const statusBadge = (status) => {
  const map = {
    'Interview Ready': 'bg-[#2D6A2F] text-white',
    'Reserve List': 'bg-[#F57C00] text-white',
    'Not Progressed': 'bg-[#9E9E9E] text-white',
    'Applied': 'bg-[#E2E8E2] text-[#555555]',
  };
  return map[status] || 'bg-[#E2E8E2] text-[#555555]';
};

const stageBadge = (stage) => {
  if (!stage) return null;
  const map = {
    'Assessment Started':      { cls: 'bg-blue-50 text-blue-700 border border-blue-200',         label: 'Assessment Started' },
    'Assessment Completed':    { cls: 'bg-blue-100 text-blue-800 border border-blue-300',         label: 'Assessment Done' },
    'Email Sent':              { cls: 'bg-purple-50 text-purple-700 border border-purple-200',    label: 'Email Sent' },
    'Interview Ready':         { cls: 'bg-[#EBF5EB] text-[#2D6A2F] border border-[#2D6A2F]/20', label: 'Interview Ready' },
    'Reserve List':            { cls: 'bg-orange-50 text-orange-700 border border-orange-200',    label: 'Reserve List' },
    'Not Progressed':          { cls: 'bg-gray-100 text-gray-500 border border-gray-200',         label: 'Not Progressed' },
    'Interview Scheduling':    { cls: 'bg-amber-50 text-amber-700 border border-amber-200',       label: 'Scheduling' },
    'Interview Scheduled':     { cls: 'bg-amber-100 text-amber-800 border border-amber-300',      label: 'Scheduled' },
    'Interview Outcome – Pass':{ cls: 'bg-green-100 text-green-800 border border-green-300',      label: '✓ Pass' },
    'Interview Outcome – Hold':{ cls: 'bg-amber-100 text-amber-700 border border-amber-300',      label: '⏸ Hold' },
    'Final Hiring Decision':   { cls: 'bg-indigo-50 text-indigo-700 border border-indigo-200',    label: 'Final Decision' },
    'Closed – Not Progressed': { cls: 'bg-red-50 text-red-600 border border-red-200',             label: '✗ Failed' },
  };
  return map[stage] || { cls: 'bg-gray-50 text-gray-600 border border-gray-200', label: stage };
};

export default function ApplicantTable({ applicants, onSelectApplicant }) {
  return (
    <div className="bg-white border border-[#E2E8E2] rounded-[14px] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#F8FAF8] border-b border-[#E2E8E2]">
              <th className="text-left px-4 py-3 font-semibold text-[#1A1A1A]">Full Name</th>
              <th className="text-left px-4 py-3 font-semibold text-[#1A1A1A] hidden md:table-cell">Phone</th>
              <th className="text-left px-4 py-3 font-semibold text-[#1A1A1A] hidden lg:table-cell">Email</th>
              <th className="text-center px-4 py-3 font-semibold text-[#1A1A1A] hidden sm:table-cell">Lagos</th>
              <th className="text-center px-4 py-3 font-semibold text-[#1A1A1A] hidden sm:table-cell">3MTT</th>
              <th className="text-center px-4 py-3 font-semibold text-[#1A1A1A] hidden sm:table-cell">SAIL</th>
              <th className="text-center px-4 py-3 font-semibold text-[#1A1A1A]">Score</th>
              <th className="text-center px-4 py-3 font-semibold text-[#1A1A1A]">Status</th>
              <th className="text-center px-4 py-3 font-semibold text-[#1A1A1A] hidden sm:table-cell">Stage</th>
              <th className="text-center px-4 py-3 font-semibold text-[#1A1A1A]">Flags</th>
              <th className="text-center px-4 py-3 font-semibold text-[#1A1A1A] hidden md:table-cell">Booking</th>
              <th className="text-left px-4 py-3 font-semibold text-[#1A1A1A] hidden lg:table-cell">Date</th>
            </tr>
          </thead>
          <tbody>
            {applicants.length === 0 && (
              <tr><td colSpan={9} className="text-center py-12 text-[#7A7A8A]">No applicants found</td></tr>
            )}
            {applicants.map(a => (
              <tr key={a.id} onClick={() => onSelectApplicant(a)}
                className="border-b border-[#E2E8E2] hover:bg-[#F8FAF8] cursor-pointer transition-colors">
                <td className="px-4 py-3 font-medium text-[#1A1A1A]">{a.full_name}</td>
                <td className="px-4 py-3 text-[#555555] hidden md:table-cell">{a.phone}</td>
                <td className="px-4 py-3 text-[#555555] hidden lg:table-cell">{a.email}</td>
                <td className="px-4 py-3 text-center hidden sm:table-cell">{a.lagos_resident === 'Yes' ? '✅' : '❌'}</td>
                <td className="px-4 py-3 text-center hidden sm:table-cell">{a.is_3mtt === 'Yes' ? '✅' : '❌'}</td>
                <td className="px-4 py-3 text-center hidden sm:table-cell">{a.is_sail === 'Yes' ? '✅' : '❌'}</td>
                <td className="px-4 py-3 text-center font-bold">
                  {a.assessment_completed ? `${Math.round((a.assessment_score / 25) * 100)}%` : '—'}
                </td>
                <td className="px-4 py-3 text-center">
                 <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full ${statusBadge(a.status)}`}>
                   {a.status}
                 </span>
                </td>
                <td className="px-4 py-3 text-center hidden sm:table-cell">
                 {(() => { const s = stageBadge(a.candidate_stage); return s ? <span className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full ${s.cls}`}>{s.label}</span> : <span className="text-[#7A7A8A]">—</span>; })()}
                </td>
                <td className="px-4 py-3 text-center">
                  {a.review_required_flag && <span title="Review Required" className="text-red-500 font-bold text-base">⚠</span>}
                </td>
                <td className="px-4 py-3 text-center hidden md:table-cell">
                  <BookingStatusBadge applicant={a} />
                </td>
                <td className="px-4 py-3 text-[#7A7A8A] text-xs hidden lg:table-cell">
                  {a.created_date ? format(new Date(a.created_date), 'MMM d, yyyy') : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}