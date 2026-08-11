import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, GraduationCap, MapPin, BadgeCheck } from 'lucide-react';

const highlights = [
  { icon: GraduationCap, label: '2 Weeks of Practical Training' },
  { icon: MapPin, label: 'Lagos Residents Only' },
  { icon: BadgeCheck, label: 'Free to Apply' },
  { icon: Briefcase, label: 'Employment for Successful Participants' },
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
              Applications Open 17 August 2026
            </span>
            <h1 className="font-black text-[2.6rem] sm:text-5xl lg:text-[3.4rem] leading-[1.05] tracking-[-1.5px] text-[#1A1A1A] mb-4">
              Digital Marketing<br />
              &amp; Workforce{' '}
              <span className="text-[#2D6A2F] block">Development<br />Programme</span>
            </h1>
            <div className="w-10 h-1 bg-[#2D6A2F] rounded-full mb-4 mx-auto lg:mx-0" />
            <p className="text-[#444444] text-base sm:text-lg leading-relaxed max-w-md mx-auto lg:mx-0 mb-8">
              A free, practical training programme delivered by Transbill Solutions Limited with funding support from Lagos Innovates | LSETF.
            </p>
            <div className="max-w-md mx-auto lg:mx-0 mb-8 rounded-xl border border-[#003B7A]/20 bg-[#F4F8FC] px-4 py-3 text-sm text-[#173B5E]">
              <strong>Employment pathway:</strong> Only successful participants who meet Transbill&apos;s employment selection requirements will be offered employment by Transbill to support the FirstBank SME Account Acquisition Project.
            </div>
            <Link
              to="/apply"
              className="inline-block bg-[#2D6A2F] hover:bg-[#3A7D3C] text-white font-bold text-base px-9 py-4 rounded-full transition-all shadow-lg hover:shadow-xl"
            >
              Apply Now →
            </Link>

          </div>

          {/* Right hero image */}
          <div className="flex-1 flex justify-center lg:justify-end relative">
            <div className="relative w-full max-w-sm lg:max-w-md">
              <img
                src="/transbill-lsetf-flier-2026.png"
                alt="Call for applications for the Transbill Digital Marketing and Workforce Development Programme"
                className="w-full max-h-[560px] object-contain rounded-[20px] shadow-xl bg-white"
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
