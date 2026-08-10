import React from 'react';
import TransbillLogo from '../TransbillLogo';

export default function ProgressionLetter({ name }) {
  return (
    <div className="bg-white rounded-[14px] border-2 border-[#2D6A2F]/30 overflow-hidden shadow-sm">
      {/* Letter header */}
      <div className="bg-[#2D6A2F] px-6 py-5">
        <p className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-1">Official Communication</p>
        <h2 className="text-white font-extrabold text-lg leading-tight">Admission to the Training Stage</h2>
        <p className="text-[#c8e6c9] text-sm mt-1">Digital Marketing & Workforce Development Programme</p>
      </div>

      {/* Letter body */}
      <div className="px-6 py-6 space-y-4 text-sm text-[#1A1A1A] leading-relaxed">
        <p>Dear <strong>{name}</strong>,</p>

        <p className="font-bold text-base text-[#2D6A2F]">Congratulations.</p>

        <p>
          Following your application, pre-screening and interview, we are pleased to offer you a place in the
          <strong> training stage</strong> of the programme delivered by Transbill Solutions Limited with funding support from Lagos Innovates | LSETF.
        </p>

        <p>
          This is a training admission and does not constitute an employment offer.
        </p>

        <div className="bg-[#EBF5EB] rounded-[10px] p-4 border border-[#2D6A2F]/20">
          <p className="font-bold text-[#2D6A2F] mb-2">Two-Week Practical Training Programme</p>
          <p className="text-[#333333]">
            The next phase is a compulsory <strong>two-week practical training programme</strong> in Lagos. The venue,
            delivery format and commencement date will be communicated separately.
          </p>
          <p className="font-semibold text-[#2D6A2F] mt-3 mb-1">The purpose of this training programme is to:</p>
          <ul className="list-disc ml-5 space-y-1 text-[#333333]">
            <li>Equip candidates with the practical knowledge required for the role</li>
            <li>Assess competence, commitment, teamwork and performance</li>
            <li>Prepare successful participants for potential employment with Transbill</li>
          </ul>
        </div>

        <div>
          <p className="font-bold text-[#1A1A1A] mb-1">Employment Pathway</p>
          <p>
            Participants who successfully complete the programme and meet Transbill&apos;s employment selection requirements
            will be offered employment by Transbill to recruit, activate, support and manage Affiliate Bankers for the FirstBank SME Account Acquisition Project.
          </p>
        </div>

        <div className="bg-[#FFF3E0] rounded-[10px] p-4 border border-[#FF8F00]/30">
          <p className="font-bold text-[#BF360C] mb-2">⚠️ Important Notice</p>
          <ul className="list-disc ml-5 space-y-1 text-[#5D3F00]">
            <li>Participation in the Two-Week Hybrid Training Programme is mandatory.</li>
            <li>You must bring your original physical LASRRA card for verification before training begins on Day 1. Failure to present a valid card may result in withdrawal of your training place.</li>
            <li>Training participation does not guarantee employment.</li>
            <li>Any employment selection will depend on training performance, conduct, attendance, business need and overall suitability.</li>
            <li>Successful candidates will be employed by Transbill Solutions Limited, not Lagos Innovates, LSETF or FirstBank.</li>
          </ul>
        </div>

        <p>
          We look forward to your participation. Please respond promptly when the programme schedule is communicated.
        </p>

        <div className="pt-4 border-t border-[#E2E8E2]">
          <p className="text-[#555555]">Yours sincerely,</p>
          <div className="mt-3 mb-2">
            <TransbillLogo />
          </div>
          <p className="font-bold text-[#1A1A1A] text-sm">For: Transbill Solutions Limited</p>
          <p className="text-[#7A7A8A] text-sm">Human Resources Team</p>
        </div>
      </div>
    </div>
  );
}
