import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import TransbillLogo from '../components/TransbillLogo';
import ProgressIndicator from '../components/ProgressIndicator';
import { Clock } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

const TOTAL_TIME = 30 * 60;

export default function Assessment() {
  const { user, isLoadingAuth } = useAuth();
  const urlParams = new URLSearchParams(window.location.search);
  const applicantId = urlParams.get('id');
  const [sessionQuestions, setSessionQuestions] = useState([]);
  const [attemptToken, setAttemptToken] = useState('');
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  const [started, setStarted] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState([]);
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

      const res = await base44.functions.invoke('submitAssessment', {
        applicantId,
        finalAnswers,
        attemptToken,
        completionTime,
      });

      setResult({ score: res.data.score, status: res.data.status });
    } catch {
      setSubmitted(false);
      setSubmitError('Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [applicantId, attemptToken, submitted, startTime]);

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

  const handleStart = async () => {
    setLoadingQuestions(true);
    setSubmitError(null);
    try {
      const res = await base44.functions.invoke('startAssessment', { applicantId });
      const questions = res.data.questions || [];
      setSessionQuestions(questions);
      setAttemptToken(res.data.attemptToken);
      setAnswers(Array(questions.length).fill(null));
      setTimeLeft(res.data.durationSeconds || TOTAL_TIME);
      setStarted(true);
      setStartTime(Date.now());
    } catch (error) {
      setSubmitError(error?.response?.data?.error || 'Unable to start the assessment. Please try again.');
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleNext = () => {
    const newAnswers = [...answers];
    newAnswers[currentQ] = selected;
    setAnswers(newAnswers);

    if (currentQ === sessionQuestions.length - 1) {
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
                '30 multiple-choice pre-screening questions selected from a 100-question bank',
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
              The questions cover digital marketing knowledge, trainability, Affiliate Banker recruitment and performance management.
            </p>
            {submitError && <p className="mt-4 text-sm text-[#D32F2F] font-medium">{submitError}</p>}
            <button onClick={handleStart} disabled={loadingQuestions}
              className="w-full mt-6 bg-[#3A7D3C] hover:bg-[#4A9A4D] text-white font-bold text-base py-3.5 rounded-full transition-all shadow-md">
              {loadingQuestions ? 'Preparing your question set...' : 'Begin Assessment →'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const q = sessionQuestions[currentQ];
  const progress = ((currentQ + 1) / sessionQuestions.length) * 100;
  const catLabel = {
    digital: 'Digital Marketing',
    content: 'Content Creation & Lead Generation',
    learnability: 'Learning Agility & Trainability',
    affiliate: 'Affiliate Banker Recruitment',
    performance: 'Performance Management',
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
        <p className="text-[#2D6A2F] font-bold text-sm mb-4">Question {currentQ + 1} of {sessionQuestions.length}</p>
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
          {submitting ? 'Submitting...' : currentQ === sessionQuestions.length - 1 ? 'Submit Assessment' : 'Next Question →'}
        </button>
      </div>
    </div>
  );
}

function ResultScreen({ result }) {
  const { status } = result;
  const isPassing = status === 'Interview Ready' || status === 'Reserve List';

  const config = {
    'Interview Ready': {
      icon: '✅',
      bg: 'bg-[#2D6A2F]',
      heading: "You've Passed the Pre-screening",
      body: 'Your result indicates the foundation and learning potential required for the programme. The next step is a selection interview. Passing the pre-screening does not guarantee training admission or employment. Employment offers will be made only to successful participants who meet Transbill’s requirements.'
    },
    'Reserve List': {
      icon: '🟡',
      bg: 'bg-[#F57C00]',
      heading: 'Assessment Completed.',
      body: 'Thank you for completing the programme pre-screening. Your application remains under consideration and you may book a selection interview.'
    },
    'Not Progressed': {
      icon: '⚪',
      bg: 'bg-[#9E9E9E]',
      heading: 'Thank You for Applying.',
      body: 'Thank you for your interest. Your pre-screening result did not meet the threshold for this programme round. We encourage you to continue developing your digital marketing skills.'
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
        {isPassing && (
          <a
            href="/book-interview"
            className="mt-6 inline-flex items-center gap-2 bg-[#3A7D3C] hover:bg-[#4A9A4D] text-white font-bold text-base px-8 py-3.5 rounded-full transition-all shadow-md"
          >
            Book Selection Interview →
          </a>
        )}
        <p className="mt-4 text-xs text-[#7A7A8A] text-center">
          A confirmation email has been sent to your registered email address.
        </p>
      </div>
    </div>
  );
}
