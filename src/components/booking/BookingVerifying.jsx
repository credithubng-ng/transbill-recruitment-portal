import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export default function BookingVerifying({ reason }) {
  const isUsed = reason === 'already_used';
  const isExpired = reason === 'expired';

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-[#FFF3E0] flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8 text-[#E65100]" />
      </div>
      <h2 className="font-extrabold text-xl text-[#1A1A1A] mb-2">
        {isUsed ? 'Interview Already Booked' : isExpired ? 'Link Expired' : 'Invalid Link'}
      </h2>
      {isUsed ? (
        <p className="text-[#555555] text-sm leading-relaxed max-w-sm">
          You have already booked your interview. Check your email for the confirmation and Google Meet link.
        </p>
      ) : (
        <p className="text-[#555555] text-sm leading-relaxed max-w-sm">
          This booking link is no longer valid. Please contact Transbill at{' '}
          <a href="mailto:recruitment@transbill.ng" className="text-[#3A7D3C] font-semibold underline">
            recruitment@transbill.ng
          </a>
        </p>
      )}
    </div>
  );
}