import { useState, useEffect, useCallback, useRef } from 'react';
import { SubjectiveCandidate, SubjectiveResult, SubjectiveAppState } from '../types/subjective';
import SubjectiveLanding from '../components/subjective/SubjectiveLanding';
import SubjectiveExam from '../components/subjective/SubjectiveExam';
import SubjectiveResultCard from '../components/subjective/SubjectiveResult';
import { useSubjectiveExamSecurity } from '../hooks/useSubjectiveExamSecurity';

const MAX_TIME_SECONDS = 3 * 60 * 60; // 3 hours
const MIN_TIME_SECONDS = 20 * 60;     // 20 min before early submit allowed

const KEY_STATUS = 'af_subj_status';
const KEY_RESULT_PREFIX = 'af_subj_result_';
const KEY_CANDIDATE = 'af_subj_candidate';
const KEY_STARTED = 'af_subj_started_at';
const KEY_ANSWER_DRAFT = 'af_subj_draft';

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function ViolationModal({ count, onDismiss }: { count: number; onDismiss: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="max-w-md w-full bg-af-card border-yellow-600 border-2 rounded-2xl p-8 text-center">
        <div className="text-5xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold text-yellow-400 mb-3">Violação Detectada</h2>
        <p className="text-gray-300 mb-2">
          Você saiu da tela da prova.{' '}
          <strong className="text-yellow-400">Esta é sua {count}ª advertência.</strong>
        </p>
        <p className="text-sm text-gray-400 mb-6">
          Na próxima violação, sua prova será encerrada e o acesso bloqueado permanentemente.
        </p>
        <button
          onClick={onDismiss}
          className="bg-yellow-600 hover:bg-yellow-500 text-black font-bold py-3 px-8 rounded-xl transition-colors w-full"
        >
          Entendido — Voltar para a prova
        </button>
      </div>
    </div>
  );
}

function BlockedScreen() {
  return (
    <div className="min-h-screen bg-af-dark flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-af-card border border-red-800 border-2 rounded-2xl p-10 text-center">
        <div className="text-6xl mb-5">🔒</div>
        <h1 className="text-2xl font-bold text-white mb-3">Acesso Bloqueado</h1>
        <p className="text-gray-400 leading-relaxed mb-6">
          Você saiu da prova ou violou as regras de segurança. Por protocolo, não é possível
          retornar à prova após sair.
        </p>
        <div className="bg-red-900/20 border border-red-800 rounded-xl p-4 text-sm text-red-300">
          Se acredita que houve um erro técnico, entre em contato com o escritório AF Advogados.
        </div>
        <p className="text-xs text-gray-600 mt-6">AF Advogados · Processo Seletivo 2025</p>
      </div>
    </div>
  );
}

export default function AplicacaoPratica() {
  const [appState, setAppState] = useState<SubjectiveAppState>('landing');
  const [candidate, setCandidate] = useState<SubjectiveCandidate | null>(null);
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState<SubjectiveResult | null>(null);
  const [startedAt, setStartedAt] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const [violations, setViolations] = useState(0);
  const [showViolation, setShowViolation] = useState(false);

  const candidateRef = useRef<SubjectiveCandidate | null>(null);
  const startedAtRef = useRef('');
  const answerRef = useRef('');
  const appStateRef = useRef<SubjectiveAppState>('landing');
  const examIdRef = useRef(generateId());

  useEffect(() => { candidateRef.current = candidate; }, [candidate]);
  useEffect(() => { startedAtRef.current = startedAt; }, [startedAt]);
  useEffect(() => { answerRef.current = answer; }, [answer]);
  useEffect(() => { appStateRef.current = appState; }, [appState]);

  // Restore state on mount
  useEffect(() => {
    const status = localStorage.getItem(KEY_STATUS);
    if (status === 'submitted') {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(KEY_RESULT_PREFIX)) {
          try {
            const saved: SubjectiveResult = JSON.parse(localStorage.getItem(key) || '');
            setResult(saved);
            setCandidate(saved.candidate);
            setAnswer(saved.answer);
            setAppState('already_done');
            return;
          } catch { /* skip */ }
        }
      }
    } else if (status === 'in_progress' || status === 'abandoned') {
      setAppState('blocked');
    }
  }, []);

  // Warn on page leave during exam
  useEffect(() => {
    if (appState !== 'exam') return;
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [appState]);

  // Auto-save draft every 30 seconds
  useEffect(() => {
    if (appState !== 'exam') return;
    const interval = setInterval(() => {
      if (answerRef.current) {
        localStorage.setItem(KEY_ANSWER_DRAFT, answerRef.current);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [appState]);

  const submitExam = useCallback(() => {
    const submittedAt = new Date().toISOString();
    const started = startedAtRef.current;
    const durationSeconds = Math.max(
      0,
      Math.floor((new Date(submittedAt).getTime() - new Date(started).getTime()) / 1000)
    );
    const currentAnswer = answerRef.current;
    const savedCandidate = candidateRef.current;
    if (!savedCandidate) return;

    const words = currentAnswer.trim() === '' ? 0 : currentAnswer.trim().split(/\s+/).length;
    const examResult: SubjectiveResult = {
      id: examIdRef.current,
      candidate: savedCandidate,
      answer: currentAnswer,
      wordCount: words,
      submittedAt,
      startedAt: started,
      durationSeconds,
    };

    localStorage.setItem(KEY_STATUS, 'submitted');
    localStorage.setItem(KEY_RESULT_PREFIX + examIdRef.current, JSON.stringify(examResult));
    localStorage.removeItem(KEY_ANSWER_DRAFT);

    setResult(examResult);
    setAppState('submitted');
  }, []);

  // Timer
  useEffect(() => {
    if (appState !== 'exam') return;
    const timer = setInterval(() => {
      setElapsed((prev) => {
        const next = prev + 1;
        if (next >= MAX_TIME_SECONDS && appStateRef.current === 'exam') {
          clearInterval(timer);
          submitExam();
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [appState, submitExam]);

  const handleViolation = useCallback(() => {
    setViolations((prev) => {
      const next = prev + 1;
      if (next >= 2) {
        localStorage.setItem(KEY_STATUS, 'abandoned');
        setAppState('blocked');
      } else {
        setShowViolation(true);
      }
      return next;
    });
  }, []);

  useSubjectiveExamSecurity(appState === 'exam', handleViolation);

  const handleStart = (cand: SubjectiveCandidate) => {
    const now = new Date().toISOString();
    setCandidate(cand);
    setStartedAt(now);
    setElapsed(0);
    setViolations(0);
    examIdRef.current = generateId();

    // Restore draft if exists
    const draft = localStorage.getItem(KEY_ANSWER_DRAFT);
    if (draft) setAnswer(draft);

    localStorage.setItem(KEY_STATUS, 'in_progress');
    localStorage.setItem(KEY_CANDIDATE, JSON.stringify(cand));
    localStorage.setItem(KEY_STARTED, now);
    setAppState('exam');
  };

  const handleAnswerChange = (text: string) => setAnswer(text);

  if (appState === 'blocked') return <BlockedScreen />;

  if (appState === 'already_done' && result) {
    return (
      <div className="min-h-screen bg-af-dark">
        <div className="bg-yellow-900/30 border-b border-yellow-800 px-4 py-3 text-center">
          <p className="text-yellow-400 text-sm font-medium">
            ⚠️ Você já enviou esta prova. Abaixo está o registro do seu envio.
          </p>
        </div>
        <SubjectiveResultCard result={result} />
      </div>
    );
  }

  if (appState === 'submitted' && result) {
    return <SubjectiveResultCard result={result} />;
  }

  if (appState === 'landing') {
    return <SubjectiveLanding onStart={handleStart} />;
  }

  if (appState === 'exam') {
    return (
      <>
        <SubjectiveExam
          candidate={candidate!}
          remainingSeconds={Math.max(0, MAX_TIME_SECONDS - elapsed)}
          elapsed={elapsed}
          minTimeSeconds={MIN_TIME_SECONDS}
          answer={answer}
          onAnswerChange={handleAnswerChange}
          onSubmit={submitExam}
          violations={violations}
        />
        {showViolation && (
          <ViolationModal count={violations} onDismiss={() => setShowViolation(false)} />
        )}
      </>
    );
  }

  return null;
}
