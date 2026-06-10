import React from 'react';
import { Link } from 'react-router-dom';
import { Globe } from 'lucide-react';

export default function CTASection() {
  return (
    <section id="cta-section" className="bg-white py-16 sm:py-20 border-t border-[#E2E8E2]">
      <div className="max-w-xl mx-auto px-4 sm:px-6 text-center">
        {/* Divider line with text */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 h-px bg-[#2D6A2F]" />
          <span className="font-extrabold text-2xl sm:text-3xl tracking-widest text-[#1A1A1A] uppercase">APPLY NOW</span>
          <div className="flex-1 h-px bg-[#2D6A2F]" />
        </div>

        {/* URL pill */}
        <Link
          to="/apply"
          className="inline-flex items-center gap-3 border-2 border-[#1A1A1A] rounded-full px-8 py-4 hover:bg-[#1A1A1A] hover:text-white transition-all group"
        >
          <Globe className="w-5 h-5 text-[#2D6A2F] group-hover:text-white transition-colors" />
          <span className="font-bold text-lg text-[#1A1A1A] group-hover:text-white transition-colors tracking-wide">
            jobs.transbill.ng
          </span>
        </Link>

        <p className="text-[#7A7A8A] text-sm mt-6">
          Open to all qualified candidates across Nigeria.
        </p>
      </div>
    </section>
  );
}