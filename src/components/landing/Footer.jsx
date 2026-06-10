import React from 'react';
import TransbillLogo from '../TransbillLogo';

const FirstBankLogo = () => (
  <div className="flex items-center gap-2">
    <svg width="48" height="44" viewBox="0 0 120 110" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Yellow parallelogram background */}
      <polygon points="60,5 115,5 115,95 60,95" fill="#E0AD0F" />
      {/* Elephant body */}
      <ellipse cx="88" cy="58" rx="18" ry="22" fill="#02306A" />
      {/* Head */}
      <ellipse cx="88" cy="30" rx="14" ry="13" fill="#02306A" />
      {/* Trunk */}
      <path d="M78 38 Q65 55 70 72 Q72 78 68 80" stroke="#02306A" strokeWidth="7" fill="none" strokeLinecap="round" />
      {/* Ear */}
      <ellipse cx="76" cy="32" rx="9" ry="11" fill="#E0AD0F" />
      <ellipse cx="77" cy="32" rx="6" ry="8" fill="#02306A" />
      {/* Legs */}
      <rect x="74" y="76" width="8" height="18" rx="3" fill="#02306A" />
      <rect x="86" y="76" width="8" height="18" rx="3" fill="#02306A" />
      <rect x="98" y="76" width="8" height="18" rx="3" fill="#02306A" />
      {/* Tail */}
      <path d="M106 55 Q118 50 115 60" stroke="#02306A" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
    <div>
      <p className="font-black text-[#02306A] text-xl leading-none" style={{ fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>FirstBank</p>
      <p className="text-[#02306A] text-[10px] font-semibold leading-none mt-0.5" style={{ fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>Since 1894</p>
    </div>
  </div>
);

export default function Footer() {
  return (
    <footer className="bg-white border-t border-[#E2E8E2]">
      {/* Partners strip */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <p className="text-center text-xs text-[#7A7A8A] uppercase tracking-widest font-semibold mb-8">In Partnership with</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-10 sm:gap-16 flex-wrap">

          {/* Transbill */}
          <TransbillLogo />

          <div className="w-px h-10 bg-[#E2E8E2] hidden sm:block" />

          {/* FirstBank */}
          <FirstBankLogo />

          <div className="w-px h-10 bg-[#E2E8E2] hidden sm:block" />

          {/* LSETF */}
          <img
            src="https://media.base44.com/images/public/6a1d7f35df3abaff93c10cec/1c9561eb5_lsetf_logo_extracted.png"
            alt="LSETF - Lagos State Employment Trust Fund"
            className="h-12 object-contain"
          />

        </div>
      </div>

      {/* Bottom bar */}
      <div className="bg-[#1A1A1A] py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <TransbillLogo dark />
          <p className="text-white/60 text-sm mt-3">
            © {new Date().getFullYear()} Transbill Solutions Limited. All rights reserved.
          </p>
          <p className="text-white/40 text-xs mt-1">
            CBN-Licensed PSS Super-Agent · Nigeria
          </p>
        </div>
      </div>
    </footer>
  );
}