import React from 'react';
import TransbillLogo from '../TransbillLogo';

function FirstBankLogo() {
  return (
    <img
      src="https://media.base44.com/images/public/6a1d7f35df3abaff93c10cec/cff5b9843_Image11-06-2026at04161.jpeg"
      alt="FirstBank Nigeria"
      className="h-10 w-auto object-contain"
    />
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