import React from 'react';

const benefits = [
  { icon: '💰', title: '₦150,000 Monthly', desc: 'Fixed salary paid monthly across the full 12-month engagement' },
  { icon: '🏙️', title: 'Hybrid Lagos', desc: 'Blend of remote digital work and structured field deployment across Lagos' },
  { icon: '🎓', title: 'Professional Onboarding', desc: 'Two-week training programme in Ikeja covering tools, operations, and field expectations' },
  { icon: '🌍', title: 'National Scale', desc: 'Deploy across 1,500+ Affiliate Bankers in 650+ communities across Nigeria' },
  { icon: '🚀', title: 'Career Growth', desc: 'Performance-driven progression with leadership opportunities as deployment expands nationally' },
  { icon: '🔒', title: 'Long-Term Retention', desc: 'Top performers retained permanently with Transbill assuming full enhanced salary and allowances' },
];

export default function BenefitsSection() {
  return (
    <section className="bg-white py-14 sm:py-20 border-t border-[#E2E8E2]">
      <div className="max-w-[860px] mx-auto px-4 sm:px-6">
        <h2 className="font-extrabold text-2xl sm:text-3xl tracking-[-1px] text-[#1A1A1A] mb-8">
          What You <span className="text-[#2D6A2F]">Get</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {benefits.map((b, i) => (
            <div key={i} className="bg-[#F8FAF8] border border-[#E2E8E2] rounded-[14px] p-5 hover:shadow-md hover:shadow-[#2D6A2F]/5 transition-all">
              <div className="text-2xl mb-2">{b.icon}</div>
              <h3 className="font-bold text-[#1A1A1A] text-[15px] mb-1.5">{b.title}</h3>
              <p className="text-[#555555] text-sm leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 bg-[#2D6A2F] rounded-[14px] p-6 text-white">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🏆</span>
            <div>
              <h3 className="font-bold text-lg mb-1">Performance Bonus — Earn More When You Deliver</h3>
              <p className="text-white/90 text-sm leading-relaxed">
                Beyond your ₦150,000 monthly salary, high-performing associates earn performance bonuses based on Affiliate Banker activation rates, accounts opened, and campaign results. The best performers earn significantly more.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}