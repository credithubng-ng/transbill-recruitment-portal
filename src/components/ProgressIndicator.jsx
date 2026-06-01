import React from 'react';
import { Check } from 'lucide-react';

const steps = [
  { label: 'Application', step: 1 },
  { label: 'Assessment', step: 2 },
  { label: 'Result', step: 3 },
];

export default function ProgressIndicator({ currentStep }) {
  return (
    <div className="flex items-center justify-center gap-2 py-6">
      {steps.map((s, i) => (
        <React.Fragment key={s.step}>
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
              currentStep > s.step ? 'bg-[#2D6A2F] text-white' :
              currentStep === s.step ? 'bg-[#3A7D3C] text-white' :
              'bg-[#E2E8E2] text-[#7A7A8A]'
            }`}>
              {currentStep > s.step ? <Check className="w-4 h-4" /> : s.step}
            </div>
            <span className={`text-sm font-medium hidden sm:inline ${
              currentStep >= s.step ? 'text-[#1A1A1A]' : 'text-[#7A7A8A]'
            }`}>
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`w-8 sm:w-16 h-0.5 ${currentStep > s.step ? 'bg-[#2D6A2F]' : 'bg-[#E2E8E2]'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}