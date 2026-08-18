import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import TransbillLogo from '../components/TransbillLogo';
import CaseStudyBrief from '../components/status/CaseStudyBrief';
import { Clock, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function BookAiInterview() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(null);
  const [selected, setSelected] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [confirmed, setConfirmed] = useState(false);

  const applicantId = new URLSearchParams(window.location.search).get('id');
  const applicantSessionToken = sessionStorage.getItem('transbill_applicant_session') || '';

  useEffect(() => {
    if (!applicantSessionToken) {
      window.location.href = `/login?next=${encodeURIComponent('/status?view=book-interview&id=' + applicantId)}`;
      return;
    }
    loadSlots();
  }, []);

  const loadSlots = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await base44.functions.invoke('aiInterviewSlots', { applicantId, applicantSessionToken });
      setSlots(res.data?.slots || []);
    } catch (e) {
      setError(e?.response?.data?.error || 'Unable to load available slots.');
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async () => {
    if (!selected) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await base44.functions.invoke('bookAiInterview', { applicantId, applicantSessionToken, slot_datetime: selected });
      if (res.data?.success) {
        setConfirmed(true);
        setBooking(res.data);
      } else {
        setError(res.data?.error || 'Booking failed.');
      }
    } catch (e) {
      setError(e?.response?.data?.error || 'Booking failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!applicantSessionToken) {
    return <div className="fixed inset-0 flex items-center justify-center"><div className="w-8 h-8 border-4 border-[#E2E8E2] border-t-[#2D6A2F] rounded-full animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen bg-[#F8FAF8]" data-release="ai-interview-auth-v2">
      <div className="bg-white border-b border-[#E2E8E2]">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <TransbillLogo />
          <a href="/status" className="flex items-center gap-1.5 text-sm text-[#7A7A8A] hover:text-[#1A1A1A]">
            <ArrowLeft className="w-4 h-4" /> Back to status
          </a>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {confirmed ? (
          <div className="space-y-6">
            <div className="bg-white rounded-[14px] border border-[#E2E8E2] p-8 text-center">
              <CheckCircle2 className="w-14 h-14 text-[#2D6A2F] mx-auto mb-4" />
              <h1 className="font-extrabold text-xl text-[#1A1A1A] mb-2">Selection Interview Booked</h1>
              <p className="text-[#555555] text-sm mb-1">Your Transbill Digital Selection Interview is scheduled for:</p>
              <p className="font-bold text-[#2D6A2F] mb-4">{booking && new Date(booking.slot_datetime).toLocaleString('en-GB', { timeZone: 'Africa/Lagos', dateStyle: 'full', timeStyle: 'short' })}</p>
              <p className="text-xs text-[#7A7A8A] mb-6">A confirmation email has been sent. Return to your status page at the appointment time to start the interview.</p>
              <a href="/status" className="inline-flex items-center gap-2 bg-[#3A7D3C] hover:bg-[#4A9A4D] text-white font-bold text-sm px-6 py-3 rounded-full transition-all">
                Back to Status
              </a>
            </div>
            {booking?.case_title && (
              <CaseStudyBrief
                caseTitle={booking.case_title}
                caseScenario={booking.case_scenario}
                caseCommonRules={booking.case_common_rules}
                caseSlides={booking.case_slides}
              />
            )}
          </div>
        ) : (
          <>
            <h1 className="font-extrabold text-2xl tracking-[-0.5px] text-[#1A1A1A] mb-1">Book Your Selection Interview</h1>
            <p className="text-[#7A7A8A] text-sm mb-6 flex items-center gap-1.5"><Clock className="w-4 h-4" /> Times shown in Lagos time (Africa/Lagos)</p>

            <div className="bg-amber-50 border border-amber-200 rounded-[12px] p-4 mb-6">
              <p className="text-xs text-amber-800 leading-relaxed">
                This is a structured, digitally facilitated interview lasting 15–20 minutes. Your responses will be recorded as a transcript and reviewed by Transbill's recruitment team. Final decisions are made by authorised Transbill staff. If you have accessibility or connectivity concerns, you may reschedule or request a human-led alternative from your status page.
              </p>
            </div>

            {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-[10px] px-4 py-3 text-sm mb-4">{error}</div>}

            {loading ? (
              <div className="flex items-center justify-center py-12"><div className="w-8 h-8 border-4 border-[#E2E8E2] border-t-[#2D6A2F] rounded-full animate-spin" /></div>
            ) : slots.length === 0 ? (
              <div className="bg-white rounded-[14px] border border-[#E2E8E2] p-8 text-center">
                <p className="text-[#7A7A8A] text-sm">No slots are currently available. Please check back shortly.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[480px] overflow-y-auto pr-1">
                  {slots.map((s) => (
                    <button key={s.slot_datetime} onClick={() => setSelected(s.slot_datetime)}
                      className={`text-left p-4 rounded-[12px] border-2 transition-all text-sm ${
                        selected === s.slot_datetime ? 'border-[#2D6A2F] bg-[#EBF5EB] font-semibold text-[#1A1A1A]'
                        : 'border-[#E2E8E2] bg-white hover:border-[#2D6A2F]/40 text-[#333333]'
                      }`}>
                      {s.label}
                    </button>
                  ))}
                </div>
                <button onClick={handleBook} disabled={!selected || submitting}
                  className="w-full mt-6 bg-[#3A7D3C] hover:bg-[#4A9A4D] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-base py-3.5 rounded-full transition-all shadow-md">
                  {submitting ? 'Booking...' : 'Confirm Booking'}
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}