import React from 'react';
import { CheckCircle2 } from 'lucide-react';

const items = [
  'Recruit and onboard Affiliate Bankers operating in markets, motor parks, commercial clusters, and SME hubs across Lagos and beyond',
  'Drive digital engagement campaigns via WhatsApp Business, Instagram, Facebook, TikTok, and X to activate and retain Affiliate Bankers',
  'Support Affiliate Bankers to consistently open a minimum of 4 FirstBank SME accounts daily through motivation, content, and direct engagement',
  'Create compelling content in English, Pidgin, and local languages to resonate with market-level audiences',
  'Track Affiliate Banker performance, identify inactive agents, and re-engage them with targeted digital support',
  'Report daily on key metrics — accounts opened, bankers activated, campaign reach — and iterate strategies accordingly',
  'Represent Transbill with professionalism across all digital and in-person community touchpoints',
];

export default function WhatYouDoSection() {
  return (
    <section className="bg-white py-14 sm:py-20 border-t border-[#E2E8E2]">
      <div className="max-w-[860px] mx-auto px-4 sm:px-6">
        <h2 className="font-extrabold text-2xl sm:text-3xl tracking-[-1px] text-[#1A1A1A] mb-8">
          What You Will <span className="text-[#2D6A2F]">Do</span>
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