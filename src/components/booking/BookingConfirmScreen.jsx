import React from 'react';
import { ArrowLeft, Loader2, Video, Calendar, Clock } from 'lucide-react';

export default function BookingConfirmScreen({
  applicant, selectedDate, selectedSlot, onConfirm, onBack, loading, error
}) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={onBack} disabled={loading} className="p-2 rounded-full hover:bg-[#E2E8E2] transition-all disabled:opacity-40">
          <ArrowLeft className="w-5 h-5 text-[#555555]" />
        </button>
        <h2 className="font-bold text-[#1A1A1A] text-base">Confirm your booking</h2>
      </div>

      <div className="bg-white rounded-[14px] border-2 border-[#E2E8E2] p-5 space-y-4">
        <div className="flex items-start gap-3">
          <Calendar className="w-5 h-5 text-[#3A7D3C] mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold text-[#7A7A8A] uppercase tracking-wide">Date</p>
            <p className="font-bold text-[#1A1A1A] text-base">{selectedDate.label}</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Clock className="w-5 h-5 text-[#3A7D3C] mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold text-[#7A7A8A] uppercase tracking-wide">Time</p>
            <p className="font-bold text-[#1A1A1A] text-base">{selectedSlot.timeStr} <span className="text-[#7A7A8A] font-normal text-sm">WAT</span></p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Video className="w-5 h-5 text-[#3A7D3C] mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold text-[#7A7A8A] uppercase tracking-wide">Format</p>
            <p className="font-bold text-[#1A1A1A] text-base">Google Meet — 30 minutes</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-[10px] px-4 py-3 text-sm text-red-700 font-medium">
          {error}
        </div>
      )}

      <p className="text-xs text-[#7A7A8A] text-center leading-relaxed px-2">
        Once confirmed this slot cannot be changed. Contact{' '}
        <a href="mailto:recruitment@transbill.ng" className="text-[#3A7D3C] font-semibold">
          recruitment@transbill.ng
        </a>{' '}
        if you need to reschedule.
      </p>

      <button
        onClick={onConfirm}
        disabled={loading}
        style={{ minHeight: '56px' }}
        className="w-full bg-[#3A7D3C] hover:bg-[#4A9A4D] disabled:opacity-60 text-white font-extrabold text-lg rounded-full transition-all flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Confirming...
          </>
        ) : (
          'Confirm Booking'
        )}
      </button>
    </div>
  );
}