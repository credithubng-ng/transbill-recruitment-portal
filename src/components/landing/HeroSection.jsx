import React from 'react';
import { Link } from 'react-router-dom';

const stats = [
  { label: '₦150,000 / Month', filled: true },
  { label: 'Hybrid Lagos', filled: false },
  { label: '50 Openings', filled: false },
  { label: '12-Month Contract', filled: false },
  { label: 'Performance Bonus', filled: false },
];

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #EBF5EB 100%)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 border border-[#2D6A2F] text-[#2D6A2F] bg-white px-4 py-1.5 rounded-full text-sm font-medium mb-6">
              📢 Open to All Qualified Candidates — Nigeria
            </div>
            <h1 className="font-black text-4xl sm:text-5xl lg:text-[3.5rem] leading-[1.08] tracking-[-1.5px] text-[#1A1A1A] mb-5">
              Become A{' '}
              <span className="text-[#2D6A2F]">Digital Marketing</span>{' '}
              Associate
            </h1>
            <p className="text-[#333333] text-base sm:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0 mb-8">
              Join Transbill Solutions Limited — Nigeria's CBN-licensed PSS Super-Agent — and drive the activation of Affiliate Bankers opening SME accounts across 1,000+ markets nationwide.
            </p>
            <Link
              to="/apply"
              className="inline-block bg-[#3A7D3C] hover:bg-[#4A9A4D] text-white font-bold text-base px-8 py-3.5 rounded-full transition-all shadow-md hover:shadow-lg"
            >
              Start Your Application Now →
            </Link>
            <div className="flex flex-wrap justify-center lg:justify-start gap-2.5 mt-8">
              {stats.map((s) => (
                <span
                  key={s.label}
                  className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
                    s.filled
                      ? 'bg-[#2D6A2F] text-white border-[#2D6A2F]'
                      : 'bg-white text-[#333333] border-[#E2E8E2]'
                  }`}
                >
                  {s.label}
                </span>
              ))}
            </div>
          </div>
          <div className="flex-shrink-0">
            <div className="w-56 h-56 sm:w-64 sm:h-64 rounded-full bg-[#E8E4F5] flex flex-col items-center justify-center text-center p-6 shadow-inner">
              <span className="text-3xl sm:text-4xl font-black text-[#2D6A2F] tracking-tight">₦150k</span>
              <span className="text-sm font-semibold text-[#333333] mt-1">Monthly Salary</span>
              <span className="text-xs text-[#555555] mt-0.5">+ Performance Bonus</span>
              <div className="w-10 h-px bg-[#2D6A2F]/30 my-2" />
              <span className="text-sm font-bold text-[#2D6A2F]">50 Open Positions</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}