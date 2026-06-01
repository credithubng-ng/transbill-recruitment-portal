import React from 'react';

const requirements = [
  { icon: '📚', title: 'Digital Marketing Training', desc: 'Completed formal digital marketing training — 3MTT graduates, SAIL Alumni, and self-trained professionals with proven skills are all welcome' },
  { icon: '📍', title: 'Lagos Resident', desc: 'Must be resident in Lagos State for the initial 12-month deployment. Nationwide expansion is planned' },
  { icon: '📱', title: 'Social Media Proficiency', desc: 'Strong hands-on experience with WhatsApp Business, Instagram, Facebook, TikTok, and X for content creation and community management' },
  { icon: '🤝', title: 'Affiliate or Field Experience', desc: 'Prior experience in affiliate marketing, agent recruitment, field sales, or community engagement is a strong advantage' },
  { icon: '🎯', title: 'Results-Oriented', desc: 'Self-driven, target-focused, capable of working independently without close supervision' },
  { icon: '🏦', title: 'Fintech or Banking Awareness', desc: 'Understanding of agent banking, SME finance, or CBN-regulated payment services is an advantage' },
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
            ⭐ <strong>This is a competitive selection.</strong> Only the best candidates will progress. After your application, you will complete a timed online competency test covering digital marketing and affiliate banking knowledge. Only those who meet the minimum pass threshold will be invited to interview. Come prepared.
          </p>
        </div>
      </div>
    </section>
  );
}