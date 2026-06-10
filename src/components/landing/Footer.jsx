import React from 'react';
import TransbillLogo from '../TransbillLogo';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-[#E2E8E2]">
      {/* Partners strip */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-16">
          {/* FirstBank */}
          <div className="flex flex-col items-center gap-1">
            <p className="text-[10px] text-[#7A7A8A] uppercase tracking-wide font-medium">In Partnership with</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-10 h-10 rounded-full bg-[#003087] flex items-center justify-center">
                <span className="text-white font-black text-xs">FB</span>
              </div>
              <div>
                <p className="font-extrabold text-[#003087] text-base leading-tight">FirstBank</p>
                <p className="text-[10px] text-[#555555]">Since 1894</p>
              </div>
            </div>
            <p className="text-[10px] text-[#555555] mt-0.5">First Bank of Nigeria Limited</p>
          </div>

          <div className="w-px h-12 bg-[#E2E8E2] hidden sm:block" />

          {/* 3MTT */}
          <div className="flex flex-col items-center gap-1">
            <p className="text-[10px] text-[#7A7A8A] uppercase tracking-wide font-medium">Supported by</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-10 h-10 rounded-full bg-[#1A5276] flex items-center justify-center">
                <span className="text-white font-black text-xs">3M</span>
              </div>
              <div>
                <p className="font-extrabold text-[#1A5276] text-base leading-tight">3MTT</p>
                <p className="text-[10px] text-[#555555] leading-tight">THREE MILLION<br />TECH TALENT</p>
              </div>
            </div>
          </div>

          <div className="w-px h-12 bg-[#E2E8E2] hidden sm:block" />

          {/* LSETF */}
          <div className="flex flex-col items-center gap-1">
            <div className="h-5" />
            <div className="flex items-center gap-2 mt-1">
              <div className="w-10 h-10 rounded-full bg-[#006400] flex items-center justify-center">
                <span className="text-white font-black text-xs">LS</span>
              </div>
              <div>
                <p className="font-extrabold text-[#006400] text-base leading-tight">LSETF</p>
                <p className="text-[10px] text-[#555555] leading-tight">LAGOS STATE EMPLOYMENT<br />TRUST FUND</p>
              </div>
            </div>
          </div>
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