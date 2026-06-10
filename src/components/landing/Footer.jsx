import React from 'react';
import TransbillLogo from '../TransbillLogo';

export default function Footer() {
  return (
    <footer className="bg-[#1A1A1A] pt-10 pb-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Sponsors row */}
        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 pb-8 border-b border-white/10 mb-8">
          <div className="flex flex-col items-center gap-1">
            <p className="text-[10px] text-white/40 uppercase tracking-widest font-medium">In Partnership with</p>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#FFD700] flex items-center justify-center text-[10px] font-black text-[#002B5C]">1st</div>
              <div>
                <p className="font-black text-white text-sm leading-none">FirstBank</p>
                <p className="text-[10px] text-white/50">First Bank of Nigeria Limited</p>
              </div>
            </div>
          </div>

          <div className="w-px h-8 bg-white/10 hidden sm:block" />

          <div className="flex flex-col items-center gap-1">
            <p className="text-[10px] text-white/40 uppercase tracking-widest font-medium">Supported by</p>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                <span className="font-black text-[#1A3D1B] text-[11px]">3M</span>
              </div>
              <div>
                <p className="font-black text-white text-sm leading-none">3MTT</p>
                <p className="text-[10px] text-white/50">Three Million Tech Talent</p>
              </div>
            </div>
          </div>

          <div className="w-px h-8 bg-white/10 hidden sm:block" />

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#006400] flex items-center justify-center border border-white/20">
              <span className="text-white font-black text-[9px]">LS</span>
            </div>
            <div>
              <p className="font-black text-white text-sm leading-none">LSETF</p>
              <p className="text-[10px] text-white/50">Lagos State Employment Trust Fund</p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <TransbillLogo dark />
          <p className="text-white/60 text-sm mt-3">
            © {new Date().getFullYear()} Transbill Solutions Limited. All rights reserved.
          </p>
          <p className="text-white/40 text-xs mt-2">
            CBN-Licensed PSS Super-Agent · Nigeria
          </p>
        </div>
      </div>
    </footer>
  );
}