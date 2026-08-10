import React from 'react';
import TransbillLogo from '../TransbillLogo';

export default function Footer() {
  return (
    <footer className="bg-[#1A1A1A]">
      {/* Partnership banner */}
      <div className="border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12">
          <div className="flex flex-col items-center gap-2">
            <span className="text-white/50 text-xs font-medium uppercase tracking-widest">Proudly supported by</span>
            <div className="bg-white rounded-lg px-5 py-3 text-center">
              <span className="text-sm text-[#003B7A] font-bold">Lagos Innovates | LSETF</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 text-center">
        <div className="inline-block bg-white rounded-xl px-5 py-3">
          <TransbillLogo />
        </div>
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
