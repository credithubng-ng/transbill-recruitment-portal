import React from 'react';
import { Printer, FileText, Clock, ListChecks, AlertCircle } from 'lucide-react';

// Renders the candidate-safe selection interview case brief and a Print / Save as PDF
// button. Only receives already-filtered safe fields — never follow-up questions,
// rubric focus, competency weights, or other variants.
export default function CaseStudyBrief({ caseTitle, caseScenario, caseCommonRules, caseSlides }) {
  const handlePrint = () => {
    const slides = Array.isArray(caseSlides) ? caseSlides : [];
    const slidesHtml = slides.map((s) => `<li>${(s || '').replace(/</g, '&lt;')}</li>`).join('');
    const esc = (v) => String(v || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const win = window.open('', '_blank', 'width=820,height=640');
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${esc(caseTitle)} – Selection Interview Case Study</title>
      <style>
        body{font-family:Inter,ui-sans-serif,system-ui,sans-serif;color:#1A1A1A;max-width:720px;margin:32px auto;padding:0 24px;line-height:1.6;}
        h1{font-size:20px;margin:0 0 4px;}
        .label{font-size:11px;font-weight:700;color:#2D6A2F;text-transform:uppercase;letter-spacing:.05em;margin:0 0 4px;}
        h2{font-size:13px;margin:24px 0 8px;color:#2D6A2F;}
        .scenario{font-size:14px;}
        ol{padding-left:20px;font-size:14px;}
        .rules{background:#F8FAF8;border:1px solid #E2E8E2;border-radius:12px;padding:16px;font-size:13px;}
        .footer{margin-top:24px;font-size:11px;color:#7A7A8A;}
      </style></head><body>
      <p class="label">Your Assigned Case Study</p>
      <h1>${esc(caseTitle)}</h1>
      <h2>Background &amp; Scenario</h2>
      <p class="scenario">${esc(caseScenario)}</p>
      <h2>Your Presentation Task</h2>
      <p>Review the case and prepare a concise presentation based on the prompts below. Expect 3–5 follow-up questions during the interview.</p>
      <ol>${slidesHtml}</ol>
      <h2>Guidelines &amp; Constraints</h2>
      <div class="rules">${esc(caseCommonRules)}</div>
      <p class="footer">Transbill Digital Selection Interview — Candidate Preparation Brief. Review and prepare before your appointment.</p>
      </body></html>`);
    win.document.close();
    win.focus();
    win.print();
  };

  return (
    <div className="bg-white rounded-[14px] border border-[#E2E8E2] p-6">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#2D6A2F] flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold text-[#2D6A2F] uppercase tracking-wide">Your Assigned Case Study</p>
            <h2 className="font-extrabold text-lg text-[#1A1A1A] leading-tight">{caseTitle}</h2>
          </div>
        </div>
        <button onClick={handlePrint} className="flex items-center gap-1.5 text-xs font-bold text-[#2D6A2F] border border-[#2D6A2F]/40 px-3 py-2 rounded-full hover:bg-[#EBF5EB] transition-all whitespace-nowrap flex-shrink-0">
          <Printer className="w-3.5 h-3.5" /> Print / Save as PDF
        </button>
      </div>
      <div className="space-y-4 text-sm text-[#333333]">
        <div>
          <p className="font-bold text-[#1A1A1A] mb-1 flex items-center gap-1.5"><AlertCircle className="w-4 h-4 text-[#2D6A2F]" /> Background & Scenario</p>
          <p className="leading-relaxed">{caseScenario}</p>
        </div>
        <div>
          <p className="font-bold text-[#1A1A1A] mb-1 flex items-center gap-1.5"><ListChecks className="w-4 h-4 text-[#2D6A2F]" /> Your Presentation Task</p>
          <p className="leading-relaxed mb-2">Review the case and prepare a concise presentation based on the prompts below. Expect 3–5 follow-up questions during the interview.</p>
          <ol className="list-decimal pl-5 space-y-1">
            {(Array.isArray(caseSlides) ? caseSlides : []).map((s, i) => (
              <li key={i} className="leading-relaxed">{s}</li>
            ))}
          </ol>
        </div>
        <div>
          <p className="font-bold text-[#1A1A1A] mb-1 flex items-center gap-1.5"><Clock className="w-4 h-4 text-[#2D6A2F]" /> Guidelines & Constraints</p>
          <div className="bg-[#F8FAF8] border border-[#E2E8E2] rounded-[12px] p-4 leading-relaxed">{caseCommonRules}</div>
        </div>
      </div>
    </div>
  );
}