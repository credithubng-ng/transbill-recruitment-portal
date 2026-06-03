import React from 'react';

const STEPS = ['Select Date', 'Select Time', 'Confirm'];

export default function BookingStepIndicator({ currentStep }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-6">
      {STEPS.map((label, i) => {
        const stepNum = i + 1;
        const done = stepNum < currentStep;
        const active = stepNum === currentStep;
        return (
          <React.Fragment key={label}>
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                done ? 'bg-[#3A7D3C] border-[#3A7D3C] text-white'
                : active ? 'bg-white border-[#3A7D3C] text-[#3A7D3C]'
                : 'bg-white border-[#E2E8E2] text-[#BDBDBD]'
              }`}>
                {done ? '✓' : stepNum}
              </div>
              <p className={`text-[10px] mt-1 font-medium ${active ? 'text-[#3A7D3C]' : done ? 'text-[#555555]' : 'text-[#BDBDBD]'}`}>
                {label}
              </p>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-0.5 w-12 sm:w-20 mb-4 mx-1 ${stepNum < currentStep ? 'bg-[#3A7D3C]' : 'bg-[#E2E8E2]'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}