import { Candidate } from '../types/exam';

type HeaderProps = {
  candidate: Candidate;
  currentQuestion: number;
  totalQuestions: number;
  answeredCount: number;
  remainingSeconds: number;
};

function formatTime(seconds: number): string {
  const m = Math.floor(Math.abs(seconds) / 60);
  const s = Math.abs(seconds) % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function Header({
  candidate,
  currentQuestion,
  totalQuestions,
  answeredCount,
  remainingSeconds,
}: HeaderProps) {
  const isWarning = remainingSeconds <= 600 && remainingSeconds > 0;
  const isCritical = remainingSeconds <= 300;

  return (
    <header className="sticky top-0 z-40 bg-af-card/95 backdrop-blur border-b border-af-border">
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-af-coral flex items-center justify-center">
              <span className="text-white font-bold text-sm font-serif">AF</span>
            </div>
            <div className="hidden sm:block">
              <p className="text-xs text-gray-400 leading-none">AF Advogados</p>
              <p className="text-xs text-gray-500 leading-none mt-0.5">Processo Seletivo</p>
            </div>
          </div>

          {/* Candidate */}
          <div className="flex-1 min-w-0 text-center hidden md:block">
            <p className="text-sm font-medium text-white truncate">{candidate.fullName}</p>
            <p className="text-xs text-gray-400">{candidate.course} — {candidate.semester}º sem.</p>
          </div>

          {/* Progress info */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <p className="text-xs text-gray-400 leading-none">
                {answeredCount}/{totalQuestions} respondidas
              </p>
              <p className="text-xs text-gray-500 leading-none mt-0.5">
                Questão {currentQuestion} de {totalQuestions}
              </p>
            </div>

            {/* Timer */}
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-sm font-semibold transition-colors ${
                isCritical
                  ? 'bg-red-900/60 text-red-400 animate-pulse'
                  : isWarning
                  ? 'bg-yellow-900/50 text-yellow-400'
                  : 'bg-af-muted text-gray-300'
              }`}
            >
              <svg
                className="w-3.5 h-3.5 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z"
                />
              </svg>
              {formatTime(remainingSeconds)}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-2.5 h-1 bg-af-border rounded-full overflow-hidden">
          <div
            className="h-full bg-af-coral rounded-full transition-all duration-500"
            style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
          />
        </div>
      </div>
    </header>
  );
}
