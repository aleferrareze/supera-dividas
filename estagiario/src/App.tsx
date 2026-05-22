import { useState, useEffect, useCallback, useRef } from 'react';
import { Candidate, ExamResult, AppState, OptionId } from './types/exam';
import { questions } from './data/questions';
import CandidateForm from './components/CandidateForm';
import Header from './components/Header';
import QuestionCard from './components/QuestionCard';
import ResultCard from './components/ResultCard';
import AnswerReview from './components/AnswerReview';
import AdminPanel from './components/AdminPanel';
import { useExamSecurity } from './hooks/useExamSecurity';

const MIN_TIME_SECONDS = 10 * 60;
const MAX_TIME_SECONDS = 90 * 60;

const KEY_STATUS = 'af_exam_status';
const KEY_RESULT_PREFIX = 'af_result_';
const KEY_CANDIDATE = 'af_exam_candidate';
const KEY_STARTED = 'af_exam_started_at';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// Modals
function ViolationModal({ count, onDismiss }: { count: number; onDismiss: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="max-w-md w-full card border-yellow-600 border-2 p-8 text-center">
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

function PendingModal({
  pending,
  onNavigate,
  onDismiss,
}: {
  pending: number[];
  onNavigate: (qId: number) => void;
  onDismiss: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="max-w-md w-full card border-af-coral border p-8">
        <h2 className="text-xl font-bold text-white mb-2 text-center">Questões Pendentes</h2>
        <p className="text-gray-400 text-sm mb-5 text-center">
          Responda todas as questões antes de finalizar a prova.
        </p>
        <div className="flex flex-wrap gap-2 justify-center mb-5">
          {pending.map((qId) => (
            <button
              key={qId}
              onClick={() => onNavigate(qId)}
              className="w-10 h-10 rounded-lg bg-af-coral text-white font-bold text-sm hover:bg-af-coral-dark transition-colors"
            >
              {qId}
            </button>
          ))}
        </div>
        <button onClick={onDismiss} className="w-full btn-secondary text-sm">
          Fechar e continuar respondendo
        </button>
      </div>
    </div>
  );
}

function BlockedScreen() {
  return (
    <div className="min-h-screen bg-af-dark flex items-center justify-center p-4">
      <div className="max-w-md w-full card border-red-800 border-2 p-10 text-center">
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

export default function App() {
  // Check admin route BEFORE hooks to allow early return pattern via state
  const [isAdmin] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.has('admin') || window.location.hash === '#admin';
  });

  const [appState, setAppState] = useState<AppState>('landing');
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [answers, setAnswers] = useState<Record<number, OptionId>>({});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [result, setResult] = useState<ExamResult | null>(null);
  const [startedAt, setStartedAt] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const [violations, setViolations] = useState(0);
  const [showViolation, setShowViolation] = useState(false);
  const [pendingQuestions, setPendingQuestions] = useState<number[]>([]);

  // Refs to avoid stale closures in timers
  const answersRef = useRef<Record<number, OptionId>>({});
  const candidateRef = useRef<Candidate | null>(null);
  const startedAtRef = useRef('');
  const examIdRef = useRef(generateId());
  const appStateRef = useRef<AppState>('landing');

  // Keep refs in sync
  useEffect(() => { answersRef.current = answers; }, [answers]);
  useEffect(() => { candidateRef.current = candidate; }, [candidate]);
  useEffect(() => { startedAtRef.current = startedAt; }, [startedAt]);
  useEffect(() => { appStateRef.current = appState; }, [appState]);

  // Restore state on mount
  useEffect(() => {
    if (isAdmin) return;
    const status = localStorage.getItem(KEY_STATUS);
    if (status === 'completed') {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(KEY_RESULT_PREFIX)) {
          try {
            const saved: ExamResult = JSON.parse(localStorage.getItem(key) || '');
            setResult(saved);
            setCandidate(saved.candidate);
            setAnswers(saved.answers);
            setAppState('already_done');
            return;
          } catch { /* skip */ }
        }
      }
    } else if (status === 'in_progress' || status === 'abandoned') {
      setAppState('blocked');
    }
  }, [isAdmin]);

  // Body class for exam
  useEffect(() => {
    if (appState === 'exam') {
      document.body.classList.add('exam-active');
    } else {
      document.body.classList.remove('exam-active');
    }
    return () => document.body.classList.remove('exam-active');
  }, [appState]);

  // Warn on page leave during exam
  useEffect(() => {
    if (appState !== 'exam') return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [appState]);

  const computeAndSaveResult = useCallback((auto: boolean) => {
    const finishedAt = new Date().toISOString();
    const started = startedAtRef.current;
    const durationSeconds = Math.max(
      0,
      Math.floor((new Date(finishedAt).getTime() - new Date(started).getTime()) / 1000)
    );
    const currentAnswers = answersRef.current;
    let correctCount = 0;
    questions.forEach((q) => {
      if (currentAnswers[q.id] === q.correctAnswer) correctCount++;
    });
    const savedCandidate = candidateRef.current;
    if (!savedCandidate) return null;

    const percentage = (correctCount / questions.length) * 100;
    const examResult: ExamResult = {
      id: examIdRef.current,
      candidate: savedCandidate,
      answers: currentAnswers,
      correctCount,
      wrongCount: questions.length - correctCount,
      totalQuestions: questions.length,
      percentage,
      approved: percentage >= 70,
      finishedAt,
      startedAt: started,
      durationSeconds,
    };

    localStorage.setItem(KEY_STATUS, 'completed');
    localStorage.setItem(KEY_RESULT_PREFIX + examIdRef.current, JSON.stringify(examResult));

    if (auto) {
      setResult(examResult);
      setAppState('result');
    }

    return examResult;
  }, []);

  // Timer
  useEffect(() => {
    if (appState !== 'exam') return;
    const timer = setInterval(() => {
      setElapsed((prev) => {
        const next = prev + 1;
        if (next >= MAX_TIME_SECONDS && appStateRef.current === 'exam') {
          clearInterval(timer);
          computeAndSaveResult(true);
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [appState, computeAndSaveResult]);

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

  useExamSecurity(appState === 'exam', handleViolation);

  const handleStart = (cand: Candidate) => {
    const now = new Date().toISOString();
    setCandidate(cand);
    setStartedAt(now);
    setAnswers({});
    setCurrentIdx(0);
    setElapsed(0);
    setViolations(0);
    examIdRef.current = generateId();
    localStorage.setItem(KEY_STATUS, 'in_progress');
    localStorage.setItem(KEY_CANDIDATE, JSON.stringify(cand));
    localStorage.setItem(KEY_STARTED, now);
    setAppState('exam');
  };

  const handleAnswer = (qId: number, answer: OptionId) => {
    setAnswers((prev) => ({ ...prev, [qId]: answer }));
  };

  const handleFinishAttempt = (): boolean => {
    const unanswered = questions.filter((q) => answers[q.id] === undefined).map((q) => q.id);
    if (unanswered.length > 0) {
      setPendingQuestions(unanswered);
      return false;
    }
    const examResult = computeAndSaveResult(false);
    if (examResult) {
      setResult(examResult);
      setAppState('result');
    }
    return true;
  };

  const handleNavigateToPending = (qId: number) => {
    const idx = questions.findIndex((q) => q.id === qId);
    if (idx >= 0) setCurrentIdx(idx);
    setPendingQuestions([]);
  };

  const handleRetake = () => {
    localStorage.removeItem(KEY_STATUS);
    localStorage.removeItem(KEY_CANDIDATE);
    localStorage.removeItem(KEY_STARTED);
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key?.startsWith(KEY_RESULT_PREFIX)) localStorage.removeItem(key);
    }
    setAnswers({});
    setCurrentIdx(0);
    setResult(null);
    setCandidate(null);
    setElapsed(0);
    setViolations(0);
    setAppState('landing');
  };

  // Admin panel
  if (isAdmin) return <AdminPanel />;

  const remainingSeconds = Math.max(0, MAX_TIME_SECONDS - elapsed);
  const canFinish = elapsed >= MIN_TIME_SECONDS;

  if (appState === 'blocked') return <BlockedScreen />;

  if (appState === 'already_done' && result) {
    return (
      <div className="min-h-screen bg-af-dark">
        <div className="bg-yellow-900/30 border-b border-yellow-800 px-4 py-3 text-center">
          <p className="text-yellow-400 text-sm font-medium">
            ⚠️ Você já realizou esta prova. Abaixo está o seu resultado registrado.
          </p>
        </div>
        <ResultCard result={result} onRetake={handleRetake} showRetake />
        <AnswerReview result={result} questions={questions} />
      </div>
    );
  }

  if (appState === 'landing') {
    return <CandidateForm onStart={handleStart} totalQuestions={questions.length} />;
  }

  if (appState === 'result' && result) {
    return (
      <div className="min-h-screen bg-af-dark print:bg-white">
        <ResultCard result={result} onRetake={handleRetake} showRetake={false} />
        <AnswerReview result={result} questions={questions} />
      </div>
    );
  }

  if (appState === 'exam') {
    return (
      <div className="min-h-screen bg-af-dark" onContextMenu={(e) => e.preventDefault()}>
        <Header
          candidate={candidate!}
          currentQuestion={currentIdx + 1}
          totalQuestions={questions.length}
          answeredCount={Object.keys(answers).length}
          remainingSeconds={remainingSeconds}
        />

        {showViolation && (
          <ViolationModal count={violations} onDismiss={() => setShowViolation(false)} />
        )}
        {pendingQuestions.length > 0 && (
          <PendingModal
            pending={pendingQuestions}
            onNavigate={handleNavigateToPending}
            onDismiss={() => setPendingQuestions([])}
          />
        )}

        <QuestionCard
          question={questions[currentIdx]}
          selectedAnswer={answers[questions[currentIdx].id]}
          onAnswer={(ans) => handleAnswer(questions[currentIdx].id, ans)}
          questionIndex={currentIdx}
          totalQuestions={questions.length}
          onNavigate={setCurrentIdx}
          onPrev={() => setCurrentIdx((i) => Math.max(0, i - 1))}
          onNext={() => setCurrentIdx((i) => Math.min(questions.length - 1, i + 1))}
          onFinish={handleFinishAttempt}
          answers={answers}
          allQuestions={questions}
          canFinishEarly={canFinish}
          elapsedSeconds={elapsed}
          minTimeSeconds={MIN_TIME_SECONDS}
        />
      </div>
    );
  }

  return null;
}
