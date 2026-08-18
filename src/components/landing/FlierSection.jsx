import React from 'react';

export default function FlierSection() {
  return (
    <section className="bg-[#F8FAF8] border-y border-[#E2E8E2] py-12 sm:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 grid md:grid-cols-[1fr_320px] gap-8 items-center">
        <div>
          <p className="text-[#2D6A2F] font-bold text-xs uppercase tracking-widest mb-2">Approved programme flier</p>
          <h2 className="font-extrabold text-2xl sm:text-3xl tracking-[-1px] text-[#1A1A1A] mb-4">Share the opportunity</h2>
          <p className="text-[#555555] leading-relaxed mb-4">
            Download or share the approved call-for-applications artwork with eligible Lagos residents. The online application form contains the current eligibility and selection rules.
          </p>
          <div className="rounded-lg border border-[#F0B429] bg-[#FFF8E1] p-3 text-sm text-[#5D4700] mb-5">
            <strong>Current website eligibility:</strong> applicants must be Lagos residents aged 18–36. Successful training completion does not guarantee employment.
          </div>
          <a href="/approved-programme-flier.png" download className="inline-flex bg-white border-2 border-[#2D6A2F] text-[#2D6A2F] font-bold px-6 py-3 rounded-full hover:bg-[#EBF5EB] transition-all">
            Download Approved Flier
          </a>
        </div>
        <a href="/approved-programme-flier.png" target="_blank" rel="noreferrer" className="block justify-self-center">
          <img src="/approved-programme-flier.png" alt="Approved call for applications programme flier" className="w-full max-w-[280px] rounded-xl shadow-lg" />
        </a>
      </div>
    </section>
  );
}
