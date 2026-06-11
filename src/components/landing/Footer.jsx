import React from 'react';
import TransbillLogo from '../TransbillLogo';

// FirstBank logo rendered using brand colours: #003057 (navy) and #FFC800 (gold)
function FirstBankLogo() {
  return (
    <div className="flex items-center gap-2">
      {/* Elephant icon badge */}
      <div className="w-10 h-10 rounded-sm flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#FFC800' }}>
        <svg viewBox="0 0 40 40" width="28" height="28" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Simplified elephant silhouette */}
          <ellipse cx="20" cy="24" rx="11" ry="8" fill="#003057" />
          <circle cx="14" cy="16" r="5" fill="#003057" />
          <path d="M9 16 Q6 20 8 26" stroke="#003057" strokeWidth="3" strokeLinecap="round" fill="none" />
          <ellipse cx="28" cy="20" rx="4" ry="3" fill="#003057" />
          <rect x="12" y="29" width="3" height="5" rx="1.5" fill="#003057" />
          <rect x="18" y="30" width="3" height="5" rx="1.5" fill="#003057" />
          <rect x="24" y="30" width="3" height="4" rx="1.5" fill="#003057" />
        </svg>
      </div>
      <div className="flex flex-col leading-none">
        <span className="font-extrabold text-[15px] tracking-tight" style={{ color: '#003057' }}>FirstBank</span>
        <span className="text-[10px] font-medium" style={{ color: '#003057', opacity: 0.7 }}>Since 1894</span>
      </div>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="bg-[#1A1A1A]">
      {/* Partnership banner */}
      <div className="border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12">
          <div className="flex flex-col items-center gap-2">
            <span className="text-white/50 text-xs font-medium uppercase tracking-widest">In Partnership with</span>
            <div className="bg-white rounded-lg px-4 py-2 flex items-center gap-2">
              <FirstBankLogo />
              <span className="text-[10px] text-[#003057]/60 font-medium ml-1">First Bank of Nigeria Limited</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 text-center">
        <TransbillLogo dark />
        <p className="text-white/60 text-sm mt-3">
          © {new Date().getFullYear()} Transbill Solutions Limited. All rights reserved.
        </p>
        <p className="text-white/40 text-xs mt-1">
          CBN-Licensed PSS Super-Agent · Nigeria
        </p>
      </div>
    </footer>
  );
}