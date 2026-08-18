import React, { useState, useEffect, useRef, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import TransbillLogo from '../components/TransbillLogo';
import { Clock, Mic, MicOff, Volume2, AlertTriangle, Send, ArrowRight } from 'lucide-react';

const SpeechRecognition = typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;

export default function Interview() {
  const bookingId = new URLSearchParams(window.location.search).get('booking');
  const applicantId = new URLSearchParams(window.location.search).get('id');
  const applicantSessionToken = sessionStorage.getItem('transbill_applicant_session') || '';
  const nonceRef = useRef(crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2));

  const [phase, setPhase] = useState('loading');
  const [session, setSession] = useState(null);
  const [caseData, setCaseData] = useState(null);
  const [error, setError] = useState(null);
  const [turns, setTurns] = useState([]);
  const [coreQs, setCoreQs] = useState([]);
  const [qIndex, setQIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [adaptiveCount, setAdaptiveCount] = useState(0);
  const [adaptiveOffered, setAdaptiveOffered] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [paused, setPaused] = useState(false);
  const [techInterruptions, setTechInterruptions] = useState(0);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);
  const startTimeRef = useRef(Date.now());
  const pausedAtRef = useRef(null);

  // Load session
  useEffect(() => {
    if (!applicantSessionToken || !bookingId) {
      setError('Invalid interview link. Please return to your status page.');
      setPhase('error');
      return;
    }
    start();
  }, []);

  const start = async () => {
    setPhase('loading');
    setError(null);
    try {
      const res = await base44.functions.invoke('startAiInterview', { applicantId, applicantSessionToken, booking_id: bookingId, nonce: nonceRef.current });
      if (res.data?.error) throw new Error(res.data.error);
      setSession({ id: res.data.session_id, status: res.data.status, consent_given: res.data.consent_given });
      setCaseData(res.data.case);
      setCoreQs((res.data.case?.follow_up_questions || []).slice(0, 3));
      startTimeRef.current = Date.now();
      setPhase(res.data.consent_given ? 'case' : 'consent');
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || 'Unable to start the interview.');
      setPhase('error');
    }
  };

  // Timer (pauses on technical interruption)
  useEffect(() => {
    if (phase === 'loading' || phase === 'done' || phase === 'error' || paused) return;
    const interval = setInterval(() => {
      setElapsed(Math.round((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [phase, paused]);

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(u);
    }
  };

  const startListening = () => {
    if (!SpeechRecognition) return;
    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';
    let finalText = answer;
    rec.onresult = (e) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const transcript = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalText += transcript + ' ';
        else interim += transcript;
      }
      setAnswer(finalText + interim);
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    rec.start();
    recognitionRef.current = rec;
    setListening(true);
  };

  const stopListening = () => {
    if (recognitionRef.current) { recognitionRef.current.stop(); recognitionRef.current = null; }
    setListening(false);
  };

  const recordTurn = (question, ans, turnType, isAdaptive) => {
    setTurns(prev => [...prev, { question, answer: ans, turn_type: turnType, is_adaptive: !!isAdaptive }]);
  };

  const handleNextCore = () => {
    if (!answer.trim()) return;
    recordTurn(coreQs[qIndex], answer.trim(), 'follow_up', false);
    setAnswer('');
    stopListening();
    if (qIndex < coreQs.length - 1) {
      setQIndex(qIndex + 1);
    } else {
      setAdaptiveOffered(true);
    }
  };

  const handleAdaptive = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const claims = turns.map(t => t.answer);
      const res = await base44.functions.invoke('getAdaptiveQuestion', { applicantId, applicantSessionToken, session_id: session.id, previous_claims: claims });
      if (res.data?.error) throw new Error(res.data.error);
      recordTurn(res.data.question, '', 'adaptive', true);
      setAdaptiveCount(res.data.adaptive_count);
      setQIndex(coreQs.length); // move into adaptive mode
      setAdaptiveOffered(false);
      setAnswer('');
    } catch (e) {
      setError(e?.response?.data?.error || 'Unable to generate an adaptive question. You can submit now.');
      setAdaptiveOffered(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdaptiveAnswer = () => {
    if (!answer.trim()) return;
    // update last turn (the adaptive question) with its answer
    setTurns(prev => {
      const next = [...prev];
      next[next.length - 1] = { ...next[next.length - 1], answer: answer.trim() };
      return next;
    });
    setAnswer('');
    stopListening();
    if (adaptiveCount < 2) {
      setAdaptiveOffered(true);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    stopListening();
    try {
      const completionTime = Math.round((Date.now() - startTimeRef.current) / 1000);
      const res = await base44.functions.invoke('submitInterview', {
        applicantId, applicantSessionToken, session_id: session.id, nonce: nonceRef.current,
        turns, completion_time: completionTime, technical_failure: false,
      });
      if (res.data?.error) throw new Error(res.data.error);
      setPhase('done');
    } catch (e) {
      setError(e?.response?.data?.error || 'Submission failed. Please try again.');
      setSubmitting(false);
    }
  };

  const handleTechnicalIssue = () => {
    setPaused(true);
    pausedAtRef.current = Date.now();
    setTechInterruptions(t => t + 1);
  };

  const handleResume = () => {
    if (pausedAtRef.current) {
      startTimeRef.current += Date.now() - pausedAtRef.current;
      pausedAtRef.current = null;
    }
    setPaused(false);
  };

  const handleEndTechnical = async () => {
    setSubmitting(true);
    try {
      const completionTime = Math.round((Date.now() - startTimeRef.current) / 1000);
      await base44.functions.invoke('submitInterview', {
        applicantId, applicantSessionToken, session_id: session.id, nonce: nonceRef.current,
        turns, completion_time: completionTime, technical_failure: true,
      });
      setPhase('done_technical');
    } catch (e) {
      setError(e?.response?.data?.error || 'Unable to end session.');
      setSubmitting(false);
    }
  };

  const giveConsent = async () => {
    try {
      await base44.functions.invoke('setInterviewConsent', { applicantId, applicantSessionToken, session_id: session.id });
      setSession(s => ({ ...s, consent_given: true }));
      setPhase('case');
    } catch (e) {
      setError(e?.response?.data?.error || 'Unable to record consent.');
    }
  };

  const fmtTime = (s) => `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;

  if (phase === 'loading') return <div className="fixed inset-0 flex items-center justify-center"><div className="w-8 h-8 border-4 border-[#E2E8E2] border-t-[#2D6A2F] rounded-full animate-spin" /></div>;

  if (phase === 'error') return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center px-4 py-16 text-center">
        <div><p className="text-[#D32F2F] font-semibold mb-4">{error}</p><a href="/status" className="text-[#2D6A2F] font-bold underline">Return to status</a></div>
      </div>
    </div>
  );

  if (phase === 'done') return <ResultScreen technical={false} />;
  if (phase === 'done_technical') return <ResultScreen technical={true} />;

  const currentAdaptiveTurn = qIndex >= coreQs.length && turns[turns.length - 1]?.is_adaptive ? turns[turns.length - 1] : null;

  return (
    <div className="min-h-screen bg-white">
      <Header elapsed={elapsed} paused={paused} />
      <div className="max-w-2xl mx-auto px-4 py-6">
        {phase === 'consent' && (
          <ConsentScreen caseData={caseData} onConsent={giveConsent} />
        )}

        {phase === 'case' && (
          <CaseScreen caseData={caseData} onReady={() => { setPhase('question'); }} onSpeak={speak} />
        )}

        {phase === 'question' && !adaptiveOffered && (
          <div>
            <p className="text-xs font-semibold text-[#2D6A2F] uppercase mb-2">
              {currentAdaptiveTurn ? `Adaptive follow-up ${adaptiveCount} of 2` : `Core follow-up ${qIndex + 1} of ${coreQs.length}`}
            </p>
            <h2 className="font-bold text-lg text-[#1A1A1A] leading-snug mb-4">
              {currentAdaptiveTurn ? currentAdaptiveTurn.question : coreQs[qIndex]}
            </h2>
            <div className="flex gap-2 mb-3">
              <button onClick={() => speak(currentAdaptiveTurn ? currentAdaptiveTurn.question : coreQs[qIndex])} className="text-xs flex items-center gap-1.5 text-[#2D6A2F] font-semibold border border-[#2D6A2F]/30 rounded-full px-3 py-1.5 hover:bg-[#EBF5EB]">
                <Volume2 className="w-3.5 h-3.5" /> Read aloud
              </button>
              {SpeechRecognition && (
                <button onClick={listening ? stopListening : startListening} className={`text-xs flex items-center gap-1.5 font-semibold border rounded-full px-3 py-1.5 ${listening ? 'border-red-300 text-red-600 bg-red-50' : 'border-[#2D6A2F]/30 text-[#2D6A2F] hover:bg-[#EBF5EB]'}`}>
                  <Mic className="w-3.5 h-3.5" /> {listening ? 'Stop' : 'Speak'} {listening && <span className="animate-pulse">●</span>}
                </button>
              )}
            </div>
            <textarea value={answer} onChange={e => setAnswer(e.target.value)} placeholder="Type or speak your answer..." rows={6}
              className="w-full border-2 border-[#E2E8E2] rounded-[12px] p-4 text-sm focus:border-[#2D6A2F] focus:outline-none resize-none" />
            <p className="text-xs text-[#7A7A8A] mt-2">Only your written transcript is saved — audio is not stored.</p>
            {error && <p className="text-sm text-[#D32F2F] mt-2">{error}</p>}
            <button onClick={currentAdaptiveTurn ? handleAdaptiveAnswer : handleNextCore} disabled={!answer.trim() || submitting}
              className="w-full mt-4 bg-[#3A7D3C] hover:bg-[#4A9A4D] disabled:opacity-40 text-white font-bold text-base py-3.5 rounded-full transition-all">
              {currentAdaptiveTurn ? (adaptiveCount < 2 ? 'Next' : 'Submit Interview') : (qIndex < coreQs.length - 1 ? 'Next Question →' : 'Continue →')}
            </button>
          </div>
        )}

        {phase === 'question' && adaptiveOffered && (
          <div className="text-center py-8">
            <h2 className="font-bold text-lg text-[#1A1A1A] mb-2">Optional adaptive follow-up</h2>
            <p className="text-sm text-[#7A7A8A] mb-6">You may answer up to {2 - adaptiveCount} more adaptive question(s) based on your answers, or submit now.</p>
            <div className="flex flex-col gap-3 max-w-xs mx-auto">
              {adaptiveCount < 2 && (
                <button onClick={handleAdaptive} disabled={submitting} className="bg-[#3A7D3C] hover:bg-[#4A9A4D] disabled:opacity-40 text-white font-bold text-sm py-3 rounded-full">
                  {submitting ? 'Generating...' : 'Answer an adaptive question'}
                </button>
              )}
              <button onClick={handleSubmit} disabled={submitting} className="border-2 border-[#2D6A2F] text-[#2D6A2F] font-bold text-sm py-3 rounded-full hover:bg-[#EBF5EB]">
                {submitting ? 'Submitting...' : 'Submit interview now'}
              </button>
            </div>
            {error && <p className="text-sm text-[#D32F2F] mt-4">{error}</p>}
          </div>
        )}

        {/* Technical controls */}
        <div className="mt-8 border-t border-[#E2E8E2] pt-4">
          {paused ? (
            <div className="bg-amber-50 border border-amber-200 rounded-[12px] p-4 text-center">
              <AlertTriangle className="w-6 h-6 text-amber-600 mx-auto mb-2" />
              <p className="text-sm text-amber-800 font-medium mb-3">Clock paused. Your score will not be affected by this interruption.</p>
              <div className="flex gap-2 justify-center">
                <button onClick={handleResume} className="bg-[#2D6A2F] text-white font-bold text-sm px-5 py-2.5 rounded-full">Resume</button>
                <button onClick={handleEndTechnical} disabled={submitting} className="border border-amber-400 text-amber-800 font-bold text-sm px-5 py-2.5 rounded-full">End due to technical issue</button>
              </div>
            </div>
          ) : (
            <button onClick={handleTechnicalIssue} className="text-xs text-[#7A7A8A] hover:text-amber-700 flex items-center gap-1.5 mx-auto">
              <AlertTriangle className="w-3.5 h-3.5" /> Having technical trouble? Pause and recover
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Header({ elapsed, paused }) {
  return (
    <div className="sticky top-0 z-50 bg-white border-b border-[#E2E8E2]">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
        <TransbillLogo />
        {elapsed !== undefined && (
          <div className={`flex items-center gap-1.5 font-bold text-sm ${paused ? 'text-amber-600' : 'text-[#2D6A2F]'}`}>
            <Clock className="w-4 h-4" /> {paused ? 'Paused' : `${Math.floor(elapsed/60)}:${String(elapsed%60).padStart(2,'0')}`}
          </div>
        )}
      </div>
    </div>
  );
}

function ConsentScreen({ caseData, onConsent }) {
  const [checked, setChecked] = useState(false);
  return (
    <div className="max-w-xl mx-auto py-8">
      <h1 className="font-extrabold text-2xl text-[#1A1A1A] mb-4">Before your AI interview</h1>
      <div className="bg-[#F8FAF8] border border-[#E2E8E2] rounded-[14px] p-6 space-y-3 text-sm text-[#333333]">
        <p>• This interview is <strong>AI-led</strong> and your spoken answers are recorded as a <strong>written transcript</strong>. Audio is not stored.</p>
        <p>• It lasts <strong>15–20 minutes</strong>: a case presentation, 3 core follow-ups, and up to 2 adaptive questions.</p>
        <p>• A <strong>human reviewer makes the final decision</strong>. The AI cannot hire, reject, or contact you itself.</p>
        <p>• The AI evaluates only your written answers. It does not score accent, emotion, confidence, gender, ethnicity, appearance, age, or background noise.</p>
        <p>• If you have accessibility or connectivity concerns, you may <a href="/status" className="text-[#2D6A2F] underline">reschedule or request a human-led alternative</a> from your status page.</p>
      </div>
      <label className="flex items-start gap-3 mt-5 text-sm text-[#333333] cursor-pointer">
        <input type="checkbox" checked={checked} onChange={e => setChecked(e.target.checked)} className="mt-1 w-5 h-5 accent-[#2D6A2F]" />
        <span>I consent to this AI-led, transcript-recorded interview and understand a human reviewer makes the final decision.</span>
      </label>
      <button onClick={onConsent} disabled={!checked} className="w-full mt-6 bg-[#3A7D3C] hover:bg-[#4A9A4D] disabled:opacity-40 text-white font-bold text-base py-3.5 rounded-full transition-all">
        I consent — continue
      </button>
    </div>
  );
}

function CaseScreen({ caseData, onReady, onSpeak }) {
  return (
    <div className="max-w-xl mx-auto py-6">
      <p className="text-xs font-semibold text-[#2D6A2F] uppercase mb-1">Case {caseData?.variant_id} · {caseData?.title}</p>
      <h1 className="font-extrabold text-xl text-[#1A1A1A] mb-4">Your case scenario</h1>
      <div className="bg-[#F8FAF8] border border-[#E2E8E2] rounded-[14px] p-6 mb-4">
        <p className="text-sm text-[#333333] leading-relaxed whitespace-pre-line">{caseData?.scenario}</p>
      </div>
      <div className="bg-amber-50 border border-amber-200 rounded-[12px] p-4 mb-4">
        <p className="text-xs text-amber-900 font-semibold mb-1">Common rules</p>
        <p className="text-xs text-amber-800 leading-relaxed whitespace-pre-line">{caseData?.common_rules}</p>
      </div>
      <button onClick={() => onSpeak(caseData?.scenario)} className="text-xs flex items-center gap-1.5 text-[#2D6A2F] font-semibold border border-[#2D6A2F]/30 rounded-full px-3 py-1.5 hover:bg-[#EBF5EB] mb-4">
        <Volume2 className="w-3.5 h-3.5" /> Read scenario aloud
      </button>
      <button onClick={onReady} className="w-full bg-[#3A7D3C] hover:bg-[#4A9A4D] text-white font-bold text-base py-3.5 rounded-full transition-all flex items-center justify-center gap-2">
        I'm ready to answer <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}

function ResultScreen({ technical }) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-5 ${technical ? 'bg-amber-100' : 'bg-[#EBF5EB]'}`}>
          {technical ? <AlertTriangle className="w-8 h-8 text-amber-600" /> : <Send className="w-8 h-8 text-[#2D6A2F]" />}
        </div>
        <h1 className="font-extrabold text-2xl text-[#1A1A1A] mb-3">{technical ? 'Session ended' : 'Interview submitted'}</h1>
        <p className="text-[#555555] text-sm max-w-md mb-6">
          {technical
            ? 'Your session was ended due to a technical issue and will not be scored. A reviewer will follow up with you.'
            : 'Thank you. Your interview has been submitted for human review. You will be contacted about the outcome — a human reviewer makes the final decision.'}
        </p>
        <a href="/status" className="bg-[#3A7D3C] hover:bg-[#4A9A4D] text-white font-bold text-sm px-6 py-3 rounded-full">Back to status</a>
      </div>
    </div>
  );
}