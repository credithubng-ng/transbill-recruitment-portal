import React from 'react';
import { CheckCircle2 } from 'lucide-react';

const items = [
  'Learn practical digital marketing, content creation, lead generation and campaign measurement',
  'Use social and community channels to identify and recruit suitable Affiliate Bankers',
  'Communicate the Affiliate Banker opportunity accurately and support effective onboarding',
  'Track recruitment, activation and productive-activity metrics',
  'Coach and re-engage Affiliate Bankers who need help improving performance',
  'Prepare clear daily reports showing results, gaps, actions and next steps',
  'Demonstrate integrity and professionalism when representing Transbill',
];

export default function WhatYouDoSection() {
  return (
    <section className="bg-white py-14 sm:py-20 border-t border-[#E2E8E2]">
      <div className="max-w-[860px] mx-auto px-4 sm:px-6">
        <h2 className="font-extrabold text-2xl sm:text-3xl tracking-[-1px] text-[#1A1A1A] mb-8">
          What You Will <span className="text-[#2D6A2F]">Learn</span>
        </h2>
        <div className="space-y-4">
          {items.map((item, i) => (
            <div key={i} className="flex gap-3 items-start">
              <CheckCircle2 className="w-5 h-5 text-[#2D6A2F] mt-0.5 flex-shrink-0" />
              <p className="text-[#333333] text-[15px] leading-relaxed">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
