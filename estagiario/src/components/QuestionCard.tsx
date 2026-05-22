import { Question, OptionId } from '../types/exam';
import ProgressBar from './ProgressBar';

type QuestionCardProps = {
  question: Question;
  selectedAnswer: OptionId | undefined;
  onAnswer: (answer: OptionId) => void;
  questionIndex: number;
  totalQuestions: number;
  onPrev: () => void;
  onNext: () => void;
  onNavigate: (index: number) => void;
  onFinish: () => boolean;
  answers: Record<number, OptionId>;
  allQuestions: Question[];
  canFinishEarly: boolean;
  elapsedSeconds: number;
  minTimeSeconds: number;
};

const OPTION_LABELS: OptionId[] = ['A', 'B', 'C', 'D'];

export default function QuestionCard({
  question,
  selectedAnswer,
  onAnswer,
  questionIndex,
  totalQuestions,
  onPrev,
  onNext,
  onNavigate,
  onFinish,
  answers,
  allQuestions,
  canFinishEarly,
  elapsedSeconds,
  minTimeSeconds,
}: QuestionCardProps) {
  const isFirst = questionIndex === 0;
  const isLast = questionIndex === totalQuestions - 1;
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === totalQuestions;
  const remainingMinutes = Math.ceil((minTimeSeconds - elapsedSeconds) / 60);

  return (
    <main className="max-w-4xl mx-auto px-4 py-6 animate-fade-in">
      {/* Question map */}
      <div className="card p-4 mb-4">
        <p className="text-xs text-gray-500 text-center mb-3 uppercase tracking-wider font-medium">
          Navegação — clique para ir à questão
        </p>
        <ProgressBar
          questions={allQuestions}
          answers={answers}
          currentIndex={questionIndex}
          onNavigate={onNavigate}
        />
      </div>

      {/* Question card */}
      <div className="card p-6 md:p-8 mb-4 animate-slide-up">
        {/* Category badge */}
        <div className="flex items-center gap-3 mb-5">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-af-coral bg-af-coral/10 border border-af-coral/20 px-3 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-af-coral" />
            {question.category}
          </span>
          <span className="ml-auto text-xs text-gray-500">
            Questão {question.id} de {totalQuestions}
          </span>
        </div>

        {/* Statement */}
        <p
          className="text-base md:text-lg text-gray-100 leading-relaxed mb-6 no-select"
          style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
        >
          <span className="text-af-coral font-semibold mr-2">{question.id}.</span>
          {question.statement}
        </p>

        {/* Options */}
        <div className="space-y-3">
          {OPTION_LABELS.map((optId) => {
            const option = question.options.find((o) => o.id === optId);
            if (!option) return null;
            const isSelected = selectedAnswer === optId;

            return (
              <label
                key={optId}
                className={`option-radio ${isSelected ? 'selected' : ''} no-select cursor-pointer`}
                style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
              >
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={optId}
                  checked={isSelected}
                  onChange={() => onAnswer(optId)}
                  className="sr-only"
                />
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-lg border-2 flex items-center justify-center font-bold text-sm transition-all ${
                    isSelected
                      ? 'bg-af-coral border-af-coral text-white'
                      : 'border-af-border text-gray-400'
                  }`}
                >
                  {optId}
                </div>
                <span
                  className={`text-sm md:text-base leading-relaxed transition-colors ${
                    isSelected ? 'text-white' : 'text-gray-300'
                  }`}
                >
                  {option.text}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-3">
        <button
          onClick={onPrev}
          disabled={isFirst}
          className="btn-secondary flex items-center gap-2 disabled:opacity-30"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Anterior
        </button>

        <div className="flex-1 text-center text-xs">
          {!canFinishEarly && (
            <p className="text-gray-500">
              Mínimo {remainingMinutes} min para finalizar
            </p>
          )}
          {canFinishEarly && !allAnswered && (
            <p className="text-yellow-500">
              {totalQuestions - answeredCount} questão(ões) pendente(s)
            </p>
          )}
          {allAnswered && canFinishEarly && (
            <p className="text-green-500 font-medium">Todas respondidas ✓</p>
          )}
        </div>

        {isLast ? (
          <button
            onClick={onFinish}
            disabled={!canFinishEarly}
            className="flex items-center gap-2 bg-green-700 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 focus:outline-none focus:ring-2 focus:ring-green-500/50"
          >
            Finalizar
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </button>
        ) : (
          <button onClick={onNext} className="btn-primary flex items-center gap-2">
            Próxima
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>

      {/* Finish button — visible when all answered but not on last question */}
      {allAnswered && canFinishEarly && !isLast && (
        <div className="mt-4 text-center">
          <button
            onClick={onFinish}
            className="flex items-center gap-2 mx-auto bg-green-700 hover:bg-green-600 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200 active:scale-95 focus:outline-none"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Finalizar Prova
          </button>
        </div>
      )}
    </main>
  );
}
