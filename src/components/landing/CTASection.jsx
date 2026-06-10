import React from 'react';
import { Link } from 'react-router-dom';

export default function CTASection() {
  return (
    <section id="cta-section" style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #EBF5EB 100%)' }} className="py-16 sm:py-24">
      <div className="max-w-xl mx-auto px-4 sm:px-6 text-center">
        <h2 className="font-extrabold text-3xl sm:text-4xl tracking-[-1px] text-[#1A1A1A] mb-4">
          Ready to <span className="text-[#2D6A2F]">Apply</span>?
        </h2>
        <p className="text-[#555555] text-base mb-8">
          Open to all qualified candidates across Nigeria. If you have the skills and the drive, we want to hear from you.
        </p>
        <Link
          to="/apply"
          className="inline-block bg-[#3A7D3C] hover:bg-[#4A9A4D] text-white font-bold text-base px-10 py-4 rounded-full transition-all shadow-md hover:shadow-lg"
        >
          Start Your Application Now →
        </Link>
      </div>
    </section>
  );
}