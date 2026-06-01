import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import TransbillLogo from '../components/TransbillLogo';
import ProgressIndicator from '../components/ProgressIndicator';
import { QUESTIONS } from '../lib/assessmentQuestions';
import { Clock } from 'lucide-react';

// Fisher-Yates shuffle
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Returns questions with shuffled option order and updated correct index
function buildShuffledQuestions(questions) {
  const shuffledQs = shuffle(questions);
  return shuffledQs.map(q => {
    const correctText = q.options[q.correct];
    const shuffledOptions = shuffle(q.options);
    return {
      ...q,
      options: shuffledOptions,
      correct: shuffledOptions.indexOf(correctText)
    };
  });
}

const TOTAL_TIME = 30 * 60; // 30 minutes in seconds

export default function Assessment() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const applicantId = urlParams.get('id');

  // Build shuffled questions once per session
  const sessionQuestions = useMemo(() => buildShuffledQuestions(QUESTIONS), []);

  const [started, setStarted] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState(Array(25).fill(-1));
  const [selected, setSelected] = useState(-1);
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [submitted, setSubmitted] = useState(false);
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
    let score = 0;
    finalAnswers.forEach((a, i) => {
      if (a === sessionQuestions[i].correct) score++;
    });

    let status;
    if (score >= 21) status = 'Interview Ready';
    else if (score >= 16) status = 'Reserve List';
    else status = 'Not Progressed';

    await base44.entities.Applicant.update(applicantId, {
      assessment_score: score,
      assessment_answers: finalAnswers,
      assessment_completed: true,
      status
    });

    setResult({ score, status });
  }, [applicantId, submitted]);

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

  if (result) {
    return <ResultScreen result={result} />;
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
              <li className="flex gap-2"><span className="text-[#2D6A2F] font-bold">•</span> 25 multiple choice questions</li>
              <li className="flex gap-2"><span className="text-[#2D6A2F] font-bold">•</span> 30-minute countdown timer</li>
              <li className="flex gap-2"><span className="text-[#2D6A2F] font-bold">•</span> One correct answer per question</li>
              <li className="flex gap-2"><span className="text-[#2D6A2F] font-bold">•</span> You cannot go back to a previous question</li>
              <li className="flex gap-2"><span className="text-[#2D6A2F] font-bold">•</span> Browser back button is disabled during the test</li>
              <li className="flex gap-2"><span className="text-[#2D6A2F] font-bold">•</span> The test will auto-submit when the timer reaches zero</li>
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
        <p className="text-[#7A7A8A] text-sm font-medium mb-1">{q.section}</p>
        <p className="text-[#2D6A2F] font-bold text-sm mb-4">Question {currentQ + 1} of 25</p>
        <h2 className="font-bold text-lg sm:text-xl text-[#1A1A1A] leading-snug mb-6">{q.question}</h2>
        <div className="space-y-3">
          {q.options.map((opt, i) => (
            <button key={i} onClick={() => setSelected(i)}
              className={`w-full text-left p-4 rounded-[14px] border-2 transition-all text-[15px] ${
                selected === i ? 'border-[#2D6A2F] bg-[#EBF5EB] font-medium' : 'border-[#E2E8E2] bg-white hover:border-[#2D6A2F]/40'
              }`}>
              <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full mr-3 text-xs font-bold ${
                selected === i ? 'bg-[#2D6A2F] text-white' : 'bg-[#E2E8E2] text-[#7A7A8A]'
              }`}>
                {String.fromCharCode(65 + i)}
              </span>
              {opt}
            </button>
          ))}
        </div>
        <button onClick={handleNext} disabled={selected === -1}
          className="w-full mt-8 bg-[#3A7D3C] hover:bg-[#4A9A4D] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-base py-3.5 rounded-full transition-all shadow-md">
          {currentQ === 24 ? 'Submit Assessment' : 'Next Question →'}
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
      color: 'bg-[#2D6A2F]',
      heading: "Congratulations — You've Passed!",
      body: 'You have successfully completed the Transbill competency assessment. Our recruitment team will contact you within 5 working days to schedule your interview. Please keep your phone reachable.'
    },
    'Reserve List': {
      icon: '🟡',
      color: 'bg-[#F57C00]',
      heading: 'Assessment Completed.',
      body: 'Thank you for completing the Transbill competency assessment. Your application is currently under review. We will be in touch if your profile meets our requirements for the current intake.'
    },
    'Not Progressed': {
      icon: '⚪',
      color: 'bg-[#9E9E9E]',
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
        <div className={`w-20 h-20 rounded-full ${config.color} flex items-center justify-center text-3xl mb-6 mt-4`}>
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