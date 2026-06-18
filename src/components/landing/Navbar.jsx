import React from 'react';
import TransbillLogo from '../TransbillLogo';

export default function Navbar() {
  const scrollToForm = () => {
    const el = document.getElementById('cta-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#E2E8E2]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        <TransbillLogo />
        <div className="flex items-center gap-2">
          <a
            href="/status"
            className="text-sm font-semibold text-[#3A7D3C] border border-[#3A7D3C] px-4 py-2 rounded-full hover:bg-[#EBF5EB] transition-all"
          >
            Already Applied? Check Status
          </a>
          <button
            onClick={scrollToForm}
            className="bg-[#3A7D3C] hover:bg-[#4A9A4D] text-white font-semibold text-sm px-5 py-2 rounded-full transition-all"
          >
            Apply Now
          </button>
        </div>
      </div>
    </nav>
  );
}