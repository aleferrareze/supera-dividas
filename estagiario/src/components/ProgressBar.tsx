import { Question, OptionId } from '../types/exam';

type ProgressBarProps = {
  questions: Question[];
  answers: Record<number, OptionId>;
  currentIndex: number;
  onNavigate: (index: number) => void;
};

export default function ProgressBar({
  questions,
  answers,
  currentIndex,
  onNavigate,
}: ProgressBarProps) {
  return (
    <div className="flex flex-wrap gap-1.5 justify-center">
      {questions.map((q, idx) => {
        const answered = answers[q.id] !== undefined;
        const isCurrent = idx === currentIndex;

        return (
          <button
            key={q.id}
            onClick={() => onNavigate(idx)}
            title={`Questão ${q.id}${answered ? ' — Respondida' : ' — Pendente'}`}
            className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all duration-150 focus:outline-none
              ${isCurrent
                ? 'bg-af-coral text-white ring-2 ring-af-coral ring-offset-2 ring-offset-af-dark scale-110'
                : answered
                ? 'bg-af-coral/30 text-af-coral-light border border-af-coral/40 hover:bg-af-coral/50'
                : 'bg-af-muted text-gray-400 border border-af-border hover:border-gray-500 hover:text-gray-300'
              }`}
          >
            {q.id}
          </button>
        );
      })}
    </div>
  );
}
