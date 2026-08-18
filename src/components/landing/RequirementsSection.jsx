import React from 'react';

const requirements = [
  { icon: '📍', title: 'Lagos Resident', desc: 'You must currently live in Lagos State and be able to provide accurate residence information' },
  { icon: '🔞', title: '18–36 Years Old', desc: 'Applicants must be between 18 and 36 years old when applying' },
  { icon: '📚', title: 'Ready to Learn', desc: 'Prior digital marketing exposure is useful, but strong learning potential and commitment are central to selection' },
  { icon: '🗓️', title: 'Two-Week Availability', desc: 'You must be able to participate fully in the intensive practical training and complete assignments' },
  { icon: '📱', title: 'Digital Access', desc: 'Reliable access to a smartphone and internet is required; laptop access should be declared in your application' },
  { icon: '🎯', title: 'Performance Mindset', desc: 'You should be willing to recruit Affiliate Bankers, support their activation and manage performance against targets' },
];

export default function RequirementsSection() {
  return (
    <section className="bg-white py-14 sm:py-20 border-t border-[#E2E8E2]">
      <div className="max-w-[860px] mx-auto px-4 sm:px-6">
        <h2 className="font-extrabold text-2xl sm:text-3xl tracking-[-1px] text-[#1A1A1A] mb-8">
          <span className="text-[#2D6A2F]">Requirements</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {requirements.map((r, i) => (
            <div key={i} className="bg-[#F8FAF8] border border-[#E2E8E2] rounded-[14px] p-5 hover:shadow-md hover:shadow-[#2D6A2F]/5 transition-all">
              <div className="text-2xl mb-2">{r.icon}</div>
              <h3 className="font-bold text-[#1A1A1A] text-[15px] mb-1.5">{r.title}</h3>
              <p className="text-[#555555] text-sm leading-relaxed">{r.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 bg-[#EBF5EB] border-l-4 border-[#2D6A2F] rounded-r-lg p-4 sm:p-5">
          <p className="text-[#333333] text-sm leading-relaxed">
            <strong>This is a competitive selection.</strong> After applying, you will complete a timed pre-screening covering digital marketing fundamentals, learning agility, Affiliate Banker recruitment and performance management. Training does not guarantee employment; employment offers will be made only to successful participants who meet Transbill&apos;s requirements.
          </p>
        </div>
      </div>
    </section>
  );
}
