import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import TransbillLogo from '../components/TransbillLogo';
import ProgressIndicator from '../components/ProgressIndicator';
import { QUESTIONS, DIFFICULTY_MIX, CATEGORY_TARGETS } from '../lib/assessmentQuestions';
import { Clock } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

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

function pickRandom(arr, n) {
  return shuffle(arr).slice(0, n);
}

// Build adaptive 25-question set based on experience level
function buildAdaptiveQuestionSet(yearsExperience) {
  const mix = DIFFICULTY_MIX[yearsExperience] || DIFFICULTY_MIX['Less than 1 year'];

  // Group questions by category + difficulty
  const pool = {};
  for (const q of QUESTIONS) {
    const key = `${q.category}__${q.difficulty}`;
    if (!pool[key]) pool[key] = [];
    pool[key].push(q);
  }

  // Group all questions by difficulty
  const byDifficulty = { medium: [], hard: [], advanced: [] };
  for (const q of QUESTIONS) {
    byDifficulty[q.difficulty]?.push(q);
  }

  // First pass: pick questions respecting CATEGORY_TARGETS and difficulty mix
  // Try to balance categories within each difficulty tier
  const categories = ['digital', 'affiliate', 'field', 'professionalism'];
  const selected = [];
  const difficultyQuotas = { ...mix };

  // Iterate difficulty tiers
  for (const diff of ['medium', 'hard', 'advanced']) {
    let quota = difficultyQuotas[diff];
    if (quota <= 0) continue;

    // Distribute quota across categories proportionally
    const catAlloc = {};
    const total = Object.values(CATEGORY_TARGETS).reduce((a, b) => a + b, 0);
    let remaining = quota;
    categories.forEach((cat, i) => {
      const share = i === categories.length - 1
        ? remaining
        : Math.round((CATEGORY_TARGETS[cat] / total) * quota);
      catAlloc[cat] = share;
      remaining -= share;
    });

    for (const cat of categories) {
      const available = (pool[`${cat}__${diff}`] || []).filter(q => !selected.find(s => s.id === q.id));
      const pick = pickRandom(available, catAlloc[cat]);
      selected.push(...pick);
    }
  }

  // If we don't have 25 yet (due to uneven pool), fill from remaining
  if (selected.length < 25) {
    const remaining = QUESTIONS.filter(q => !selected.find(s => s.id === q.id));
    const extra = pickRandom(remaining, 25 - selected.length);
    selected.push(...extra);
  }

  // Shuffle the combined questions
  const shuffledSelected = shuffle(selected).slice(0, 25);

  // Randomise option order per question
  return shuffledSelected.map(q => {
    const correctText = q.options.find(o => o.key === q.correctAnswer)?.text;
    const shuffledOptions = shuffle([...q.options]);
    // Find new key for correct answer after shuffle
    const newCorrectKey = shuffledOptions.find(o => o.text === correctText)?.key;
    return {
      ...q,
      options: shuffledOptions,
      correctAnswer: newCorrectKey,
      _correctText: correctText,
    };
  });
}

function makeSignature(questions) {
  return [...questions.map(q => q.id)].sort((a, b) => a - b).join(',');
}

export default function Assessment() {
  const { user, isLoadingAuth } = useAuth();
  const urlParams = new URLSearchParams(window.location.search);
  const applicantId = urlParams.get('id');
  const yearsExperience = urlParams.get('exp') || 'Less than 1 year';

  const sessionQuestions = useMemo(() => buildAdaptiveQuestionSet(decodeURIComponent(yearsExperience)), [yearsExperience]);
  const signature = useMemo(() => makeSignature(sessionQuestions), [sessionQuestions]);

  const [started, setStarted] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState(Array(25).fill(null));
  const [selected, setSelected] = useState(null);
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [startTime, setStartTime] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [result, setResult] = useState(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoadingAuth && !user) {
      window.location.href = `/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`;
    }
  }, [isLoadingAuth, user]);

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
      const completionTime = startTime ? Math.round((Date.now() - startTime) / 1000) : TOTAL_TIME;

      let score = 0;
      finalAnswers.forEach((a, i) => {
        if (a === sessionQuestions[i].correctAnswer) score++;
      });

      let status;
      if (score >= 21) status = 'Interview Ready';
      else if (score >= 16) status = 'Reserve List';
      else status = 'Not Progressed';

      // Build option order map: questionId -> array of option texts in shown order
      const optionOrderMap = {};
      sessionQuestions.forEach(q => {
        optionOrderMap[q.id] = q.options.map(o => o.text);
      });

      await base44.functions.invoke('submitAssessment', {
        applicantId,
        score,
        status,
        finalAnswers,        // array of selected keys: ['A','B','C',...]
        sessionQuestions,
        signature,
        completionTime,
        yearsExperience: decodeURIComponent(yearsExperience),
      });

      setResult({ score, status });
    } catch (err) {
      setSubmitted(false);
      setSubmitError('Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [applicantId, submitted, sessionQuestions, signature, startTime, yearsExperience]);

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

  const handleStart = () => {
    setStarted(true);
    setStartTime(Date.now());
  };

  const handleNext = () => {
    const newAnswers = [...answers];
    newAnswers[currentQ] = selected;
    setAnswers(newAnswers);

    if (currentQ === 24) {
      submitAssessment(newAnswers);
    } else {
      setCurrentQ(currentQ + 1);
      setSelected(null);
    }
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const timerColor = timeLeft < 300 ? 'text-[#D32F2F]' : timeLeft < 600 ? 'text-[#F57C00]' : 'text-[#2D6A2F]';

  if (isLoadingAuth || !user) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#E2E8E2] border-t-[#2D6A2F] rounded-full animate-spin"></div>
      </div>
    );
  }

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
    const expLabel = decodeURIComponent(yearsExperience);
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
            <p className="mt-4 text-xs text-[#7A7A8A] font-medium">
              Questions adapted for: <span className="font-bold text-[#2D6A2F]">{expLabel}</span> experience
            </p>
            <button onClick={handleStart}
              className="w-full mt-6 bg-[#3A7D3C] hover:bg-[#4A9A4D] text-white font-bold text-base py-3.5 rounded-full transition-all shadow-md">
              Begin Assessment →
            </button>
          </div>
        </div>
      </div>
    );
  }

  const q = sessionQuestions[currentQ];
  const progress = ((currentQ + 1) / 25) * 100;
  const catLabel = {
    digital: 'Digital Marketing',
    affiliate: 'Affiliate & Agent Activation',
    field: 'Field Digital Marketing',
    professionalism: 'Professionalism & Judgement',
  }[q.category] || q.category;

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
        <p className="text-[#7A7A8A] text-sm font-medium mb-1">{catLabel}</p>
        <p className="text-[#2D6A2F] font-bold text-sm mb-4">Question {currentQ + 1} of 25</p>
        <h2 className="font-bold text-lg sm:text-xl text-[#1A1A1A] leading-snug mb-6">{q.questionText}</h2>
        <div className="space-y-3">
          {q.options.map((opt) => (
            <button key={opt.key} onClick={() => setSelected(opt.key)}
              className={`w-full text-left p-4 rounded-[14px] border-2 transition-all text-[15px] ${
                selected === opt.key ? 'border-[#2D6A2F] bg-[#EBF5EB] font-medium' : 'border-[#E2E8E2] bg-white hover:border-[#2D6A2F]/40'
              }`}>
              <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full mr-3 text-xs font-bold flex-shrink-0 ${
                selected === opt.key ? 'bg-[#2D6A2F] text-white' : 'bg-[#E2E8E2] text-[#7A7A8A]'
              }`}>
                {opt.key}
              </span>
              {opt.text}
            </button>
          ))}
        </div>
        {submitError && (
          <p className="mt-4 text-center text-[#D32F2F] text-sm font-medium">{submitError}</p>
        )}
        <button onClick={handleNext} disabled={selected === null || submitting}
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