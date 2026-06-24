import React from 'react';
import { format } from 'date-fns';
import BookingStatusBadge from './BookingStatusBadge';

const deriveDisplayStatus = (a) => {
  const stage = a.candidate_stage;
  const outcome = a.interview_outcome;

  if (outcome === 'Pass') return { label: 'Interview – Pass', style: 'bg-[#2D6A2F] text-white' };
  if (outcome === 'Fail') return { label: 'Interview – Fail', style: 'bg-[#D32F2F] text-white' };
  if (outcome === 'Hold') return { label: 'Interview – Hold', style: 'bg-amber-500 text-white' };

  if (stage === 'Interview Scheduled') return { label: 'Interview Booked', style: 'bg-blue-600 text-white' };
  if (stage === 'Interview Scheduling') return { label: 'Booking Pending', style: 'bg-blue-200 text-blue-800' };
  if (stage === 'Final Hiring Decision') return { label: 'Final Decision', style: 'bg-purple-600 text-white' };
  if (stage === 'Closed – Not Progressed') return { label: 'Closed', style: 'bg-[#9E9E9E] text-white' };

  const map = {
    'Interview Ready': { label: 'Interview Ready', style: 'bg-[#2D6A2F] text-white' },
    'Reserve List': { label: 'Reserve List', style: 'bg-[#F57C00] text-white' },
    'Not Progressed': { label: 'Not Progressed', style: 'bg-[#9E9E9E] text-white' },
    'Applied': { label: 'Applied', style: 'bg-[#E2E8E2] text-[#555555]' },
  };
  return map[a.status] || { label: a.status || 'Applied', style: 'bg-[#E2E8E2] text-[#555555]' };
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
                 {(() => { const d = deriveDisplayStatus(a); return (
                   <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full ${d.style}`}>{d.label}</span>
                 ); })()}
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