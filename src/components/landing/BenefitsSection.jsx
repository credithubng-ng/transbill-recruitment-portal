import React from 'react';

const benefits = [
  { icon: '🎓', title: 'Practical Training', desc: 'Two weeks of hands-on digital marketing, content creation, lead generation and more' },
  { icon: '🌱', title: 'Training for Potential', desc: 'Applicants with strong potential can build skills even without extensive formal experience' },
  { icon: '📈', title: 'Real Skills, Real Impact', desc: 'Develop in-demand capabilities that support business growth and financial inclusion' },
  { icon: '💼', title: 'Employment Opportunities', desc: 'Successful participants may be considered for structured employment opportunities with Transbill' },
  { icon: '✅', title: 'Free to Apply', desc: 'There are no application or training fees—selection is based on eligibility, commitment and potential' },
  { icon: '🤝', title: 'Supported Programme', desc: 'The programme is proudly supported by Lagos Innovates | LSETF' },
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
      </div>
    </section>
  );
}
