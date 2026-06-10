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
      {/* Main hero */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-0">
        <div className="flex flex-col lg:flex-row items-stretch gap-0 lg:gap-10">

          {/* Left: text content */}
          <div className="flex-1 flex flex-col justify-center py-8 lg:py-16 text-left">
            <div className="inline-flex items-center gap-2 text-[#2D6A2F] font-black text-sm uppercase tracking-widest mb-4">
              <span className="w-8 h-0.5 bg-[#2D6A2F]" />
              Now Recruiting
            </div>
            <h1 className="font-black text-[2.6rem] sm:text-5xl lg:text-[3.4rem] leading-[1.05] tracking-[-2px] text-[#1A1A1A] mb-2">
              Digital<br />
              Marketing &amp;{' '}
              <span className="text-[#2D6A2F]">Growth<br />Associates</span>
            </h1>
            <div className="w-10 h-1 bg-[#2D6A2F] rounded-full my-5" />
            <p className="text-[#333333] text-base sm:text-[17px] leading-relaxed max-w-md mb-8">
              Join a <strong>Nationwide SME Growth Initiative</strong> — drive the activation of Affiliate Bankers opening SME accounts across Nigeria's most active markets.
            </p>
            <div className="flex flex-wrap gap-3 mb-8">
              <span className="bg-[#2D6A2F] text-white font-bold text-sm px-5 py-2 rounded-full">₦150,000 / Month</span>
              <span className="border border-[#E2E8E2] text-[#333333] font-semibold text-sm px-5 py-2 rounded-full bg-white">50 Openings</span>
              <span className="border border-[#E2E8E2] text-[#333333] font-semibold text-sm px-5 py-2 rounded-full bg-white">12-Month Contract</span>
            </div>
            <Link
              to="/apply"
              className="inline-flex items-center gap-2 bg-[#3A7D3C] hover:bg-[#4A9A4D] text-white font-bold text-base px-8 py-3.5 rounded-full transition-all shadow-md hover:shadow-lg w-fit"
            >
              Apply Now →
            </Link>
            <p className="text-xs text-[#7A7A8A] mt-3">
              🌐 jobs.transbill.ng &nbsp;·&nbsp; Open to all qualified candidates — Nigeria
            </p>
          </div>

          {/* Right: photo */}
          <div className="flex-shrink-0 lg:w-[480px] relative flex items-end justify-center">
            {/* Green swoosh bg */}
            <div
              className="absolute bottom-0 right-0 w-full h-4/5 rounded-tl-[60px]"
              style={{ background: 'linear-gradient(160deg, #EBF5EB 0%, #2D6A2F 100%)' }}
            />
            <img
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=700&q=80&fit=crop&crop=faces"
              alt="Digital Marketing Associates"
              className="relative z-10 w-full max-w-[420px] object-cover object-top rounded-tl-[50px] shadow-2xl"
              style={{ maxHeight: '520px' }}
            />
          </div>
        </div>
      </div>

      {/* 4-icon highlights bar */}
      <div className="border-t border-[#E2E8E2] bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {highlights.map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center text-center gap-2">
                <div className="w-12 h-12 rounded-full border-2 border-[#2D6A2F] flex items-center justify-center">
                  <Icon className="w-5 h-5 text-[#2D6A2F]" />
                </div>
                <p className="text-xs font-bold text-[#1A1A1A] leading-tight uppercase tracking-wide">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sponsors bar */}
      <div className="border-t border-[#E2E8E2] bg-[#F8FAF8] py-5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14">
            {/* In Partnership with FirstBank */}
            <div className="flex flex-col items-center gap-1">
              <p className="text-[10px] text-[#7A7A8A] uppercase tracking-widest font-medium">In Partnership with</p>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#FFD700] flex items-center justify-center text-[10px] font-black text-[#002B5C]">1st</div>
                <div>
                  <p className="font-black text-[#002B5C] text-sm leading-none">FirstBank</p>
                  <p className="text-[10px] text-[#7A7A8A]">Since 1894</p>
                </div>
              </div>
              <p className="text-[10px] text-[#333333] font-medium">First Bank of Nigeria Limited</p>
            </div>

            <div className="w-px h-10 bg-[#E2E8E2] hidden sm:block" />

            {/* Supported by 3MTT */}
            <div className="flex flex-col items-center gap-1">
              <p className="text-[10px] text-[#7A7A8A] uppercase tracking-widest font-medium">Supported by</p>
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-[#1A3D1B] flex items-center justify-center">
                  <span className="text-white font-black text-[11px]">3M</span>
                </div>
                <div>
                  <p className="font-black text-[#1A3D1B] text-base leading-none tracking-tight">3MTT</p>
                  <p className="text-[10px] text-[#555555] leading-tight">Three Million<br/>Tech Talent</p>
                </div>
              </div>
            </div>

            <div className="w-px h-10 bg-[#E2E8E2] hidden sm:block" />

            {/* LSETF */}
            <div className="flex flex-col items-center gap-1">
              <p className="text-[10px] text-[#7A7A8A] uppercase tracking-widest font-medium">&nbsp;</p>
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-[#006400] flex items-center justify-center overflow-hidden border-2 border-[#006400]">
                  <span className="text-white font-black text-[9px] text-center leading-tight">LS</span>
                </div>
                <div>
                  <p className="font-black text-[#006400] text-base leading-none tracking-tight">LSETF</p>
                  <p className="text-[10px] text-[#555555] leading-tight">Lagos State Employment<br/>Trust Fund</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}