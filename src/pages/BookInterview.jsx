import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import TransbillLogo from '../components/TransbillLogo';
import BookingStepIndicator from '../components/booking/BookingStepIndicator';
import BookingVerifying from '../components/booking/BookingVerifying';
import BookingDatePicker from '../components/booking/BookingDatePicker';
import BookingTimePicker from '../components/booking/BookingTimePicker';
import BookingConfirmScreen from '../components/booking/BookingConfirmScreen';
import BookingSuccess from '../components/booking/BookingSuccess';

export default function BookInterview() {
  const [state, setState] = useState('verifying'); // verifying | invalid | welcome | date | time | confirm | booking | success
  const [invalidReason, setInvalidReason] = useState('');
  const [applicant, setApplicant] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null); // { dateStr, label }
  const [selectedSlot, setSelectedSlot] = useState(null); // { datetime, timeStr }
  const [bookingResult, setBookingResult] = useState(null);
  const [bookingError, setBookingError] = useState('');

  const token = new URLSearchParams(window.location.search).get('token');

  useEffect(() => {
    if (!token) {
      setInvalidReason('no_token');
      setState('invalid');
      return;
    }
    base44.functions.invoke('validateBookingToken', { token })
      .then(res => {
        const data = res.data;
        if (data.valid) {
          setApplicant(data);
          setState('date');
        } else {
          setInvalidReason(data.reason);
          setState('invalid');
        }
      })
      .catch(() => {
        setInvalidReason('error');
        setState('invalid');
      });
  }, [token]);

  const handleDateSelect = (day) => {
    setSelectedDate(day);
    setSelectedSlot(null);
    setState('time');
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
    setState('confirm');
  };

  const handleConfirm = async () => {
    setState('booking');
    setBookingError('');
    try {
      const res = await base44.functions.invoke('confirmInterviewBooking', {
        token,
        slotId: selectedSlot.slotId,
      });
      if (res.data?.success) {
        setBookingResult(res.data);
        setState('success');
      } else {
        setBookingError(res.data?.error || 'Booking failed. Please try again.');
        setState('confirm');
      }
    } catch (err) {
      setBookingError(err.message || 'This slot was just taken. Please choose another time.');
      setState('time');
    }
  };

  const step = { date: 1, time: 2, confirm: 3, booking: 3 }[state] || 0;

  return (
    <div className="min-h-screen bg-[#F8FAF8]">
      {/* Header */}
      <div className="bg-white border-b border-[#E2E8E2] px-4 py-4">
        <div className="max-w-lg mx-auto">
          <TransbillLogo />
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Step indicator */}
        {['date', 'time', 'confirm', 'booking'].includes(state) && (
          <BookingStepIndicator currentStep={step} />
        )}

        {state === 'verifying' && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 border-4 border-[#E2E8E2] border-t-[#3A7D3C] rounded-full animate-spin" />
            <p className="text-[#7A7A8A] text-sm">Verifying your link...</p>
          </div>
        )}

        {state === 'invalid' && <BookingVerifying reason={invalidReason} />}

        {state === 'date' && (
          <div className="space-y-4">
            <div className="mt-4">
              <h1 className="text-xl font-extrabold text-[#1A1A1A]">
                Congratulations, {applicant?.firstName}! 🎉
              </h1>
              <p className="text-[#555555] text-sm mt-2 leading-relaxed">
                You passed the Transbill assessment. Please select a date and time for your interview below.
                All interviews are conducted via Google Meet and last 30 minutes.
              </p>
            </div>
            <BookingDatePicker onSelectDate={handleDateSelect} />
          </div>
        )}

        {state === 'time' && selectedDate && (
          <BookingTimePicker
            selectedDate={selectedDate}
            onSelectSlot={handleSlotSelect}
            onBack={() => setState('date')}
          />
        )}

        {(state === 'confirm' || state === 'booking') && selectedSlot && selectedDate && (
          <BookingConfirmScreen
            applicant={applicant}
            selectedDate={selectedDate}
            selectedSlot={selectedSlot}
            onConfirm={handleConfirm}
            onBack={() => setState('time')}
            loading={state === 'booking'}
            error={bookingError}
          />
        )}

        {state === 'success' && bookingResult && (
          <BookingSuccess result={bookingResult} applicant={applicant} />
        )}
      </div>
    </div>
  );
}