import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Calendar, Loader2 } from 'lucide-react';

export default function BookingDatePicker({ onSelectDate }) {
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    base44.functions.invoke('getAvailableDays', {})
      .then(res => {
        setDays(res.data?.availableDays || []);
      })
      .catch(() => setError('Could not load available dates. Please refresh.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center py-12 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#3A7D3C]" />
        <p className="text-[#7A7A8A] text-sm">Loading available dates...</p>
      </div>
    );
  }

  if (error) {
    return <p className="text-red-600 text-sm text-center py-8">{error}</p>;
  }

  if (days.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="w-12 h-12 text-[#BDBDBD] mx-auto mb-3" />
        <p className="font-bold text-[#1A1A1A]">No slots available</p>
        <p className="text-sm text-[#7A7A8A] mt-1">Please contact <a href="mailto:recruitment@transbill.ng" className="text-[#3A7D3C]">recruitment@transbill.ng</a></p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="font-bold text-[#1A1A1A] text-base">Select a date</h2>
      <div className="grid grid-cols-1 gap-3">
        {days.map((day) => (
          <button
            key={day.dateStr}
            onClick={() => onSelectDate(day)}
            className="w-full flex items-center justify-between px-5 py-4 rounded-[14px] border-2 border-[#E2E8E2] bg-white hover:border-[#3A7D3C] hover:bg-[#EBF5EB] transition-all text-left active:scale-[0.98]"
            style={{ minHeight: '60px' }}
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#1A1A1A] text-base">{day.label}</span>
                {day.isToday && (
                  <span className="text-xs bg-[#3A7D3C] text-white px-2 py-0.5 rounded-full font-bold">Today</span>
                )}
                {day.isTomorrow && (
                  <span className="text-xs bg-[#F57C00] text-white px-2 py-0.5 rounded-full font-bold">Tomorrow</span>
                )}
              </div>
            </div>
            <svg className="w-5 h-5 text-[#3A7D3C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
}