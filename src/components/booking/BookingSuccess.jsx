import React from 'react';
import { CheckCircle2, Video } from 'lucide-react';

export default function BookingSuccess({ result, applicant }) {
  return (
    <div className="flex flex-col items-center text-center py-8 space-y-5">
      <div className="w-20 h-20 rounded-full bg-[#EBF5EB] flex items-center justify-center">
        <CheckCircle2 className="w-10 h-10 text-[#3A7D3C]" />
      </div>

      <div>
        <h1 className="font-extrabold text-2xl text-[#1A1A1A]">You're all set! 🎉</h1>
        <p className="text-[#555555] text-sm mt-2">Your interview is confirmed.</p>
      </div>

      <div className="bg-white rounded-[14px] border-2 border-[#E2E8E2] p-5 w-full text-left space-y-3">
        <p className="text-xs font-semibold text-[#7A7A8A] uppercase tracking-wide">Interview Details</p>
        <p className="font-bold text-[#1A1A1A]">{result.watDateTime}</p>
        <p className="text-sm text-[#555555]">Format: Google Meet — 30 minutes</p>
        {result.meetLink && (
          <a
            href={result.meetLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-[#3A7D3C] text-white font-bold px-5 py-3 rounded-full text-sm w-full justify-center mt-2"
          >
            <Video className="w-4 h-4" />
            Join Interview
          </a>
        )}
      </div>

      <div className="bg-[#EBF5EB] rounded-[14px] p-4 w-full text-left">
        <p className="text-xs font-semibold text-[#2D6A2F] mb-2">What to prepare</p>
        <ul className="text-xs text-[#2D6A2F] space-y-1.5">
          <li>✓ Join 5 minutes early</li>
          <li>✓ Test your camera and microphone</li>
          <li>✓ Ensure a stable internet connection</li>
          <li>✓ Be in a quiet environment</li>
        </ul>
      </div>

      {applicant?.email && (
        <p className="text-xs text-[#7A7A8A] leading-relaxed">
          A confirmation email with your Google Meet link has been sent to <strong>{applicant.email}</strong>
        </p>
      )}

      <p className="text-xs text-[#7A7A8A]">
        Need to reschedule? Contact{' '}
        <a href="mailto:recruitment@transbill.ng" className="text-[#3A7D3C] font-semibold">
          recruitment@transbill.ng
        </a>
      </p>
    </div>
  );
}