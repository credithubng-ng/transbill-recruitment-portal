import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, GraduationCap, Rocket, TrendingUp } from 'lucide-react';

const highlights = [
  { icon: Briefcase, label: '12-Month Employment Opportunity' },
  { icon: GraduationCap, label: '2-Weeks Hybrid Training (Ikeja, Lagos)' },
  { icon: Rocket, label: 'Immediate Deployment After Training' },
  { icon: TrendingUp, label: 'Career Growth Opportunities' },
];

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-white">
      {/* Top hero area */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-0">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-0">
          {/* Left text */}
          <div className="flex-1 lg:pr-8 text-center lg:text-left z-10">
            <span className="inline-block font-extrabold text-[#2D6A2F] text-sm uppercase tracking-widest mb-3">
              Now Recruiting
            </span>
            <h1 className="font-black text-[2.6rem] sm:text-5xl lg:text-[3.4rem] leading-[1.05] tracking-[-1.5px] text-[#1A1A1A] mb-4">
              Digital<br />
              Marketing &amp;{' '}
              <span className="text-[#2D6A2F] block">Growth<br />Associates</span>
            </h1>
            <div className="w-10 h-1 bg-[#2D6A2F] rounded-full mb-4 mx-auto lg:mx-0" />
            <p className="text-[#444444] text-base sm:text-lg leading-relaxed max-w-md mx-auto lg:mx-0 mb-8">
              Join a Nationwide SME Growth Initiative
            </p>
            <Link
              to="/apply"
              className="inline-block bg-[#2D6A2F] hover:bg-[#3A7D3C] text-white font-bold text-base px-9 py-4 rounded-full transition-all shadow-lg hover:shadow-xl"
            >
              Apply Now →
            </Link>
            <p className="text-[#7A7A8A] text-sm mt-3 font-medium">jobs.transbill.ng</p>
          </div>

          {/* Right hero image */}
          <div className="flex-1 flex justify-center lg:justify-end relative">
            <div className="relative w-full max-w-sm lg:max-w-md">
              <img
                src="https://media.base44.com/images/public/6a1d7f35df3abaff93c10cec/6de1d5dd8_Image11-06-2026at0431.jpg"
                alt="Digital Marketing Associates"
                className="w-full h-[340px] sm:h-[420px] object-cover rounded-[20px] shadow-xl"
              />
              {/* Green swoosh overlay bottom-right */}
              <div className="absolute bottom-0 right-0 w-24 h-24 bg-[#2D6A2F] rounded-tl-[60px] rounded-br-[20px] opacity-90" />
              <div className="absolute bottom-3 right-3 w-16 h-16 bg-[#3A7D3C] rounded-tl-[40px] rounded-br-[16px] opacity-60" />
            </div>
          </div>
        </div>
      </div>

      {/* 4 highlights bar */}
      <div className="bg-[#F8FAF8] border-t border-b border-[#E2E8E2] mt-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {highlights.map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center text-center gap-2">
                <div className="w-12 h-12 rounded-full border-2 border-[#2D6A2F] flex items-center justify-center bg-white">
                  <Icon className="w-5 h-5 text-[#2D6A2F]" />
                </div>
                <p className="text-[11px] font-bold text-[#1A1A1A] uppercase tracking-wide leading-tight max-w-[110px]">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}