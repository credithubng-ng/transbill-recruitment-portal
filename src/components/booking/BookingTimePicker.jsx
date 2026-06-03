import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, ArrowLeft } from 'lucide-react';

export default function BookingTimePicker({ selectedDate, onSelectSlot, onBack }) {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError('');
    base44.functions.invoke('getAvailableSlots', { dateStr: selectedDate.dateStr })
      .then(res => {
        setSlots(res.data?.slots || []);
      })
      .catch(() => setError('Could not load time slots. Please try again.'))
      .finally(() => setLoading(false));
  }, [selectedDate.dateStr]);

  const handleSelect = (slot) => {
    setSelected(slot.datetime);
    // Short delay so the user sees the selected state before proceeding
    setTimeout(() => onSelectSlot(slot), 150);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-[#E2E8E2] transition-all">
          <ArrowLeft className="w-5 h-5 text-[#555555]" />
        </button>
        <div>
          <h2 className="font-bold text-[#1A1A1A] text-base">Select a time</h2>
          <p className="text-xs text-[#7A7A8A]">{selectedDate.label} · All times in WAT</p>
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center py-12 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#3A7D3C]" />
          <p className="text-[#7A7A8A] text-sm">Loading available times...</p>
        </div>
      )}

      {error && <p className="text-red-600 text-sm text-center py-8">{error}</p>}

      {!loading && !error && slots.length === 0 && (
        <div className="text-center py-12">
          <p className="font-bold text-[#1A1A1A]">No slots available for this day</p>
          <p className="text-sm text-[#7A7A8A] mt-1">Please go back and select another date.</p>
          <button onClick={onBack} className="mt-4 text-[#3A7D3C] font-semibold text-sm underline">
            ← Back to dates
          </button>
        </div>
      )}

      {!loading && !error && slots.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {slots.map(slot => (
            <button
              key={slot.datetime}
              onClick={() => handleSelect(slot)}
              style={{ minHeight: '52px' }}
              className={`rounded-[12px] border-2 font-bold text-base transition-all active:scale-[0.97] ${
                selected === slot.datetime
                  ? 'bg-[#3A7D3C] border-[#3A7D3C] text-white'
                  : 'bg-white border-[#E2E8E2] text-[#1A1A1A] hover:border-[#3A7D3C] hover:bg-[#EBF5EB]'
              }`}
            >
              {slot.timeStr}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}