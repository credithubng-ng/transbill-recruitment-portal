import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Calendar, MapPin, User, CheckCircle2, Loader2 } from 'lucide-react';

export default function InterviewSlotPicker({ applicant, onBooked }) {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    base44.entities.InterviewSlot.filter({ is_booked: false }, 'slot_datetime', 100)
      .then(data => {
        // Only show future slots
        const now = new Date();
        setSlots((data || []).filter(s => new Date(s.slot_datetime) > now));
        setLoading(false);
      });
  }, []);

  const format = (iso) => {
    const d = new Date(iso);
    return d.toLocaleString('en-NG', {
      weekday: 'long', day: 'numeric', month: 'long',
      year: 'numeric', hour: '2-digit', minute: '2-digit',
      hour12: true, timeZone: 'Africa/Lagos'
    });
  };

  const handleBook = async () => {
    if (!selected) return;
    setBooking(true);
    setError(null);
    const res = await base44.functions.invoke('bookInterviewSlot', {
      slotId: selected,
      applicantId: applicant.id,
    });
    if (res.data?.success) {
      onBooked(res.data.slot_datetime, res.data.meet_link || res.data.location || '');
    } else {
      setError(res.data?.error || 'Booking failed. Please try again.');
      setBooking(false);
    }
  };

  if (loading) return (
    <div className="flex items-center gap-2 text-sm text-[#7A7A8A] py-4">
      <Loader2 className="w-4 h-4 animate-spin" /> Loading available slots…
    </div>
  );

  if (slots.length === 0) return (
    <p className="text-sm text-[#7A7A8A] py-2">No interview slots are currently available. Please check back soon.</p>
  );

  return (
    <div className="space-y-3">
      <p className="text-sm text-[#555555]">Select a time that works for you:</p>

      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
        {slots.map(slot => (
          <button key={slot.id} onClick={() => setSelected(slot.id)}
            className={`w-full text-left p-3 rounded-[10px] border-2 transition-all ${
              selected === slot.id
                ? 'border-[#2D6A2F] bg-[#EBF5EB]'
                : 'border-[#E2E8E2] bg-white hover:border-[#A5C8A6]'
            }`}>
            <div className="flex items-center gap-2">
              {selected === slot.id
                ? <CheckCircle2 className="w-4 h-4 text-[#2D6A2F] flex-shrink-0" />
                : <Calendar className="w-4 h-4 text-[#7A7A8A] flex-shrink-0" />}
              <span className="text-sm font-semibold text-[#1A1A1A]">{format(slot.slot_datetime)}</span>
            </div>
            {slot.interviewer && (
              <div className="flex items-center gap-1.5 mt-1 ml-6 text-xs text-[#555555]">
                <User className="w-3 h-3" /> {slot.interviewer}
              </div>
            )}
            {slot.location && (
              <div className="flex items-center gap-1.5 mt-1 ml-6 text-xs text-[#7A7A8A]">
                <MapPin className="w-3 h-3" /> {slot.location}
              </div>
            )}
          </button>
        ))}
      </div>

      {error && <p className="text-xs text-red-600 font-medium">{error}</p>}

      <button onClick={handleBook} disabled={!selected || booking}
        className="w-full bg-[#3A7D3C] hover:bg-[#4A9A4D] disabled:opacity-50 text-white font-bold py-3 rounded-full text-sm transition-all flex items-center justify-center gap-2">
        {booking ? <><Loader2 className="w-4 h-4 animate-spin" /> Confirming…</> : 'Confirm Interview Slot'}
      </button>
    </div>
  );
}