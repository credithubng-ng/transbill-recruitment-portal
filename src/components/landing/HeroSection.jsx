import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, GraduationCap, Rocket, TrendingUp } from 'lucide-react';

const highlights = [
  { icon: Briefcase, label: '12-MONTH EMPLOYMENT OPPORTUNITY' },
  { icon: GraduationCap, label: '2-WEEKS HYBRID TRAINING (IKEJA, LAGOS)' },
  { icon: Rocket, label: 'IMMEDIATE DEPLOYMENT AFTER TRAINING' },
  { icon: TrendingUp, label: 'CAREER GROWTH OPPORTUNITIES' },
];

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-white">
      {/* Hero content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 sm:pt-16 pb-0">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6 lg:gap-12">
          {/* Left text */}
          <div className="flex-1 min-w-0">
            <p className="text-[#2D6A2F] font-extrabold text-sm sm:text-base tracking-widest uppercase mb-3">
              NOW RECRUITING
            </p>
            <h1 className="font-black text-[2.6rem] sm:text-[3.4rem] lg:text-[4rem] leading-[1.0] tracking-[-2px] text-[#1A1A1A] mb-2">
              Digital<br />Marketing &<br />
              <span className="text-[#2D6A2F]">Growth<br />Associates</span>
            </h1>
            <div className="w-12 h-1 bg-[#2D6A2F] rounded-full my-5" />
            <p className="text-[#333333] text-base sm:text-lg leading-relaxed max-w-md mb-8">
              Join a Nationwide<br />SME Growth Initiative
            </p>
            <Link
              to="/apply"
              className="inline-block bg-[#3A7D3C] hover:bg-[#4A9A4D] text-white font-extrabold text-base px-10 py-4 rounded-full transition-all shadow-lg hover:shadow-xl tracking-wide"
            >
              APPLY NOW →
            </Link>
          </div>

          {/* Right image */}
          <div className="relative flex-shrink-0 w-full lg:w-[480px]">
            <div className="relative rounded-2xl overflow-hidden" style={{ aspectRatio: '4/3' }}>
              <img
                src="https://images.unsplash.com/photo-1573497161161-c3e73707e25c?w=900&q=80"
                alt="Nigerian digital marketing professionals"
                className="w-full h-full object-cover"
              />
              {/* Green swoosh overlay bottom-right */}
              <div className="absolute bottom-0 right-0 w-40 h-40 pointer-events-none"
                style={{
                  background: 'radial-gradient(ellipse at bottom right, #2D6A2F 0%, transparent 70%)',
                  opacity: 0.55
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 4-icon highlights bar */}
      <div className="mt-10 bg-white border-t border-b border-[#E2E8E2]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {highlights.map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center text-center gap-3">
                <div className="w-14 h-14 rounded-full border-2 border-[#2D6A2F] flex items-center justify-center">
                  <Icon className="w-6 h-6 text-[#2D6A2F]" strokeWidth={1.8} />
                </div>
                <p className="text-[10px] sm:text-[11px] font-extrabold text-[#1A1A1A] uppercase tracking-wide leading-tight">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}