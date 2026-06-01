import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import TransbillLogo from '../components/TransbillLogo';
import ProgressIndicator from '../components/ProgressIndicator';
import { QUESTIONS, CATEGORY_QUOTAS } from '../lib/assessmentQuestions';
import { Clock } from 'lucide-react';

const TOTAL_TIME = 30 * 60;

// Fisher-Yates shuffle
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Pick n random items from array
function pickRandom(arr, n) {
  return shuffle(arr).slice(0, n);
}

// Build a balanced 25-question set with shuffled options per question
function buildQuestionSet() {
  const byCategory = {};
  for (const q of QUESTIONS) {
    if (!byCategory[q.category]) byCategory[q.category] = [];
    byCategory[q.category].push(q);
  }

  const selected = [];
  for (const [cat, count] of Object.entries(CATEGORY_QUOTAS)) {
    const pool = byCategory[cat] || [];
    const picked = pickRandom(pool, Math.min(count, pool.length));
    selected.push(...picked);
  }

  // Shuffle the combined 25 questions
  const shuffledSelected = shuffle(selected);

  // Randomise option order per question, track new correct index
  return shuffledSelected.map(q => {
    const correctText = q.options[q.correct];
    const shuffledOptions = shuffle([...q.options]);
    return {
      ...q,
      options: shuffledOptions,
      correct: shuffledOptions.indexOf(correctText)
    };
  });
}

// Signature = sorted question IDs joined
function makeSignature(questions) {
  return [...questions.map(q => q.id)].sort((a, b) => a - b).join(',');
}

export default function Assessment() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const applicantId = urlParams.get('id');

  const sessionQuestions = useMemo(() => buildQuestionSet(), []);
  const signature = useMemo(() => makeSignature(sessionQuestions), [sessionQuestions]);

  const [started, setStarted] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState(Array(25).fill(-1));
  const [selected, setSelected] = useState(-1);
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [result, setResult] = useState(null);

  // Prevent back navigation during test
  useEffect(() => {
    if (started && !submitted) {
      const handler = (e) => {
        e.preventDefault();
        window.history.pushState(null, '', window.location.href);
      };
      window.history.pushState(null, '', window.location.href);
      window.addEventListener('popstate', handler);
      return () => window.removeEventListener('popstate', handler);
    }
  }, [started, submitted]);

  const submitAssessment = useCallback(async (finalAnswers) => {
    if (submitted) return;
    setSubmitted(true);
    setSubmitting(true);
    setSubmitError(null);

    try {
      let score = 0;
      finalAnswers.forEach((a, i) => {
        if (a === sessionQuestions[i].correct) score++;
      });

      let status;
      if (score >= 21) status = 'Interview Ready';
      else if (score >= 16) status = 'Reserve List';
      else status = 'Not Progressed';

      // Check for duplicate signature
      let signatureNote = signature;
      const existing = await base44.entities.Applicant.filter({ question_set_signature: signature });
      if (existing.length > 0) {
        signatureNote = signature + '__duplicate_allowed';
      }

      // Build option order map: { questionId: [optionTexts in order shown] }
      const optionOrderMap = {};
      sessionQuestions.forEach(q => { optionOrderMap[q.id] = q.options; });

      await base44.entities.Applicant.update(applicantId, {
        assessment_score: score,
        assessment_answers: finalAnswers,
        assessment_question_ids: sessionQuestions.map(q => q.id),
        assessment_option_order: optionOrderMap,
        assessment_completed: true,
        question_set_signature: signatureNote,
        status
      });

      setResult({ score, status });
    } catch (err) {
      setSubmitted(false);
      setSubmitError('Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [applicantId, submitted, sessionQuestions, signature]);

  // Timer
  useEffect(() => {
    if (!started || submitted) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          submitAssessment(answers);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [started, submitted, answers, submitAssessment]);

  const handleNext = () => {
    const newAnswers = [...answers];
    newAnswers[currentQ] = selected;
    setAnswers(newAnswers);

    if (currentQ === 24) {
      submitAssessment(newAnswers);
    } else {
      setCurrentQ(currentQ + 1);
      setSelected(-1);
    }
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const timerColor = timeLeft < 300 ? 'text-[#D32F2F]' : timeLeft < 600 ? 'text-[#F57C00]' : 'text-[#2D6A2F]';

  if (result) return <ResultScreen result={result} />;

  if (!applicantId) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-[#D32F2F] font-semibold">Invalid assessment link. Please return to the application page.</p>
        </div>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="min-h-screen bg-white">
        <div className="border-b border-[#E2E8E2] px-4 py-3">
          <div className="max-w-3xl mx-auto"><TransbillLogo /></div>
        </div>
        <div className="max-w-xl mx-auto px-4 py-8">
          <ProgressIndicator currentStep={2} />
          <div className="bg-[#F8FAF8] border border-[#E2E8E2] rounded-[14px] p-6 sm:p-8 mt-4">
            <h2 className="font-extrabold text-xl sm:text-2xl tracking-[-0.5px] text-[#1A1A1A] mb-4">Before You Begin</h2>
            <ul className="space-y-3 text-[#333333] text-[15px]">
              {[
                '25 multiple choice questions',
                '30-minute countdown timer',
                'One correct answer per question',
                'You cannot go back to a previous question',
                'Browser back button is disabled during the test',
                'The test will auto-submit when the timer reaches zero',
              ].map((item, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-[#2D6A2F] font-bold">•</span> {item}
                </li>
              ))}
            </ul>
            <button onClick={() => setStarted(true)}
              className="w-full mt-8 bg-[#3A7D3C] hover:bg-[#4A9A4D] text-white font-bold text-base py-3.5 rounded-full transition-all shadow-md">
              Begin Assessment →
            </button>
          </div>
        </div>
      </div>
    );
  }

  const q = sessionQuestions[currentQ];
  const progress = ((currentQ + 1) / 25) * 100;

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-50 bg-white border-b border-[#E2E8E2]">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <TransbillLogo />
          <div className={`flex items-center gap-1.5 font-bold text-lg ${timerColor}`}>
            <Clock className="w-5 h-5" />
            {formatTime(timeLeft)}
          </div>
        </div>
        <div className="h-1 bg-[#E2E8E2]">
          <div className="h-full bg-[#2D6A2F] transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 py-8">
        <p className="text-[#7A7A8A] text-sm font-medium mb-1 capitalize">{q.category.replace('affiliate', 'Affiliate Marketing').replace('digital', 'Digital Marketing').replace('field', 'Field Marketing').replace('professionalism', 'Professionalism')}</p>
        <p className="text-[#2D6A2F] font-bold text-sm mb-4">Question {currentQ + 1} of 25</p>
        <h2 className="font-bold text-lg sm:text-xl text-[#1A1A1A] leading-snug mb-6">{q.question}</h2>
        <div className="space-y-3">
          {q.options.map((opt, i) => (
            <button key={i} onClick={() => setSelected(i)}
              className={`w-full text-left p-4 rounded-[14px] border-2 transition-all text-[15px] ${
                selected === i ? 'border-[#2D6A2F] bg-[#EBF5EB] font-medium' : 'border-[#E2E8E2] bg-white hover:border-[#2D6A2F]/40'
              }`}>
              <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full mr-3 text-xs font-bold flex-shrink-0 ${
                selected === i ? 'bg-[#2D6A2F] text-white' : 'bg-[#E2E8E2] text-[#7A7A8A]'
              }`}>
                {String.fromCharCode(65 + i)}
              </span>
              {opt}
            </button>
          ))}
        </div>
        {submitError && (
          <p className="mt-4 text-center text-[#D32F2F] text-sm font-medium">{submitError}</p>
        )}
        <button onClick={handleNext} disabled={selected === -1 || submitting}
          className="w-full mt-4 bg-[#3A7D3C] hover:bg-[#4A9A4D] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-base py-3.5 rounded-full transition-all shadow-md">
          {submitting ? 'Submitting...' : currentQ === 24 ? 'Submit Assessment' : 'Next Question →'}
        </button>
      </div>
    </div>
  );
}

function ResultScreen({ result }) {
  const { status } = result;
  const config = {
    'Interview Ready': {
      icon: '✅',
      bg: 'bg-[#2D6A2F]',
      heading: "Congratulations — You've Passed!",
      body: 'You have successfully completed the Transbill competency assessment. Our recruitment team will contact you within 5 working days to schedule your interview. Please keep your phone reachable.'
    },
    'Reserve List': {
      icon: '🟡',
      bg: 'bg-[#F57C00]',
      heading: 'Assessment Completed.',
      body: 'Thank you for completing the Transbill competency assessment. Your application is currently under review. We will be in touch if your profile meets our requirements for the current intake.'
    },
    'Not Progressed': {
      icon: '⚪',
      bg: 'bg-[#9E9E9E]',
      heading: 'Thank You for Applying.',
      body: 'Thank you for your interest in Transbill Solutions Limited. Unfortunately your assessment result does not meet the minimum threshold for this role at this time. We encourage you to continue developing your digital marketing skills and look out for future opportunities with Transbill.'
    }
  }[status];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="border-b border-[#E2E8E2] px-4 py-3">
        <div className="max-w-3xl mx-auto"><TransbillLogo /></div>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        <ProgressIndicator currentStep={3} />
        <div className={`w-20 h-20 rounded-full ${config.bg} flex items-center justify-center text-3xl mb-6 mt-4`}>
          {config.icon}
        </div>
        <h1 className="font-extrabold text-2xl sm:text-3xl tracking-[-1px] text-[#1A1A1A] text-center mb-3">
          {config.heading}
        </h1>
        <p className="text-[#555555] text-center max-w-md text-[15px] leading-relaxed">
          {config.body}
        </p>
      </div>
    </div>
  );
}