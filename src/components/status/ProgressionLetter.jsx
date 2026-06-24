import React from 'react';
import TransbillLogo from '../TransbillLogo';

export default function ProgressionLetter({ name }) {
  return (
    <div className="bg-white rounded-[14px] border-2 border-[#2D6A2F]/30 overflow-hidden shadow-sm">
      {/* Letter header */}
      <div className="bg-[#2D6A2F] px-6 py-5">
        <p className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-1">Official Communication</p>
        <h2 className="text-white font-extrabold text-lg leading-tight">Progression to Final Selection Stage</h2>
        <p className="text-[#c8e6c9] text-sm mt-1">Digital Marketing & Growth Associates Programme</p>
      </div>

      {/* Letter body */}
      <div className="px-6 py-6 space-y-4 text-sm text-[#1A1A1A] leading-relaxed">
        <p>Dear <strong>{name}</strong>,</p>

        <p className="font-bold text-base text-[#2D6A2F]">Congratulations.</p>

        <p>
          Following the successful completion of your interview, we are pleased to inform you that you have been
          shortlisted and progressed to the <strong>final stage</strong> of our recruitment process for the position of{' '}
          <strong>Digital Marketing & Growth Associate</strong> with <strong>Transbill Solutions Limited</strong>.
        </p>

        <p>
          This progression reflects the positive assessment of your application and interview performance. However,
          please note that this communication does not constitute a final employment offer.
        </p>

        <div className="bg-[#EBF5EB] rounded-[10px] p-4 border border-[#2D6A2F]/20">
          <p className="font-bold text-[#2D6A2F] mb-2">Two-Week Hybrid Training Programme</p>
          <p className="text-[#333333]">
            The next phase is a compulsory <strong>Two-Week Hybrid Training Programme</strong> comprising both online
            and physical sessions in Lagos. The venue and commencement date will be communicated to all shortlisted
            candidates in due course.
          </p>
          <p className="font-semibold text-[#2D6A2F] mt-3 mb-1">The purpose of this training programme is to:</p>
          <ul className="list-disc ml-5 space-y-1 text-[#333333]">
            <li>Equip candidates with the practical knowledge required for the role</li>
            <li>Assess competence, commitment, teamwork and performance</li>
            <li>Prepare successful candidates for immediate deployment upon engagement</li>
          </ul>
        </div>

        <div>
          <p className="font-bold text-[#1A1A1A] mb-1">Role Overview</p>
          <p>
            Successful candidates will be responsible for supporting Transbill's nationwide business growth initiatives
            through the recruitment, activation, support and management of Affiliate Bankers operating across various
            markets and commercial clusters in Nigeria.
          </p>
        </div>

        <div className="bg-[#F8FAF8] rounded-[10px] p-4 border border-[#E2E8E2]">
          <p className="font-bold text-[#1A1A1A] mb-1">Compensation</p>
          <p>
            The proposed annual salary for successful candidates is{' '}
            <strong className="text-[#2D6A2F] text-base">₦1,800,000 per annum</strong>, payable monthly, in addition to
            performance-based incentives and team production bonuses.
          </p>
        </div>

        <div className="bg-[#FFF3E0] rounded-[10px] p-4 border border-[#FF8F00]/30">
          <p className="font-bold text-[#BF360C] mb-2">⚠️ Important Notice</p>
          <ul className="list-disc ml-5 space-y-1 text-[#5D3F00]">
            <li>Participation in the Two-Week Hybrid Training Programme is mandatory.</li>
            <li>Only candidates who successfully complete and pass the training programme will be issued a Final Employment Offer Letter.</li>
            <li>Transbill Solutions Limited reserves the right to determine final selection based on training performance, conduct, attendance and overall suitability for the role.</li>
          </ul>
        </div>

        <div className="border border-[#E2E8E2] rounded-[10px] p-4">
          <p className="font-bold text-[#1A1A1A] mb-2">📋 Information Required</p>
          <p className="text-[#555555] mb-2">
            To proceed to the next stage, kindly submit the following information <strong>within the next 72 hours</strong>:
          </p>
          <ol className="list-decimal ml-5 space-y-1 text-[#333333]">
            <li>National Identification Number (NIN) for age verification and record purposes.</li>
            <li>Your 3MTT Fellow Number.</li>
          </ol>
          <p className="text-[#555555] mt-3">
            If you do not yet have a 3MTT Fellow Number, you may still continue. We encourage you to begin your
            registration immediately:
          </p>
          <a
            href="https://app.3mtt.training/apply"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 mt-2 text-[#2D6A2F] font-bold text-sm hover:underline"
          >
            Apply to 3MTT and generate your Fellow ID Number immediately →
          </a>
          <p className="text-[#555555] mt-3">
            Please submit the requested information using the form below:
          </p>
          <a
            href="https://forms.gle/sLPig2kEgazVKE9r8"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 mt-2 bg-[#2D6A2F] hover:bg-[#4A9A4D] text-white font-bold text-sm px-4 py-2 rounded-full transition-all"
          >
            Submit Required Information →
          </a>
        </div>

        <p>
          We appreciate your interest in joining Transbill Solutions Limited and look forward to your participation in
          the final stage of the selection process.
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