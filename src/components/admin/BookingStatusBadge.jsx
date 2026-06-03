import React from 'react';

export default function BookingStatusBadge({ applicant }) {
  if (!applicant.booking_token) return null;
  if (!['Interview Ready', 'Reserve List'].includes(applicant.status)) return null;

  const isBooked = !!applicant.booking_used;
  const isExpired = !isBooked && applicant.booking_token_expires_at && new Date(applicant.booking_token_expires_at) < new Date();

  if (isBooked) {
    const dateStr = applicant.interview_scheduled_at
      ? new Date(applicant.interview_scheduled_at).toLocaleString('en-NG', {
          day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Africa/Lagos'
        })
      : '';
    return (
      <span
        title={`Interview Booked${dateStr ? ': ' + dateStr : ''}`}
        className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EBF5EB] text-[#2D6A2F] cursor-default"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#3A7D3C] inline-block" />
        Booked
      </span>
    );
  }

  if (isExpired) {
    return (
      <span
        title="Booking link expired"
        className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 cursor-default"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
        Expired
      </span>
    );
  }

  return (
    <span
      title="Booking link sent — awaiting booking"
      className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F5F5F5] text-[#7A7A8A] cursor-default"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-[#BDBDBD] inline-block" />
      Awaiting
    </span>
  );
}