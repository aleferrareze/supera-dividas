import { ExamResult, Question } from '../types/exam';

type AnswerReviewProps = {
  result: ExamResult;
  questions: Question[];
};

export default function AnswerReview({ result, questions }: AnswerReviewProps) {
  const { answers } = result;

  return (
    <div className="max-w-3xl mx-auto px-4 pb-12 print:pb-4">
      <h3 className="text-sm font-semibold text-gray-400 print:text-gray-600 uppercase tracking-wider mb-4">
        Gabarito Detalhado
      </h3>

      <div className="space-y-3">
        {questions.map((q) => {
          const candidateAnswer = answers[q.id];
          const isCorrect = candidateAnswer === q.correctAnswer;

          return (
            <div
              key={q.id}
              className={`card p-5 border-l-4 print:border print:bg-white print:shadow-none ${
                isCorrect
                  ? 'border-l-green-500'
                  : candidateAnswer
                  ? 'border-l-red-500'
                  : 'border-l-gray-600'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Status icon */}
                <div
                  className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 ${
                    isCorrect
                      ? 'bg-green-600 text-white'
                      : candidateAnswer
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-600 text-white'
                  }`}
                >
                  {isCorrect ? '✓' : candidateAnswer ? '✗' : '—'}
                </div>

                <div className="flex-1 min-w-0">
                  {/* Category + number */}
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs text-gray-500 print:text-gray-500">
                      Q{q.id} · {q.category}
                    </span>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        isCorrect
                          ? 'bg-green-900/40 text-green-400 print:text-green-700'
                          : candidateAnswer
                          ? 'bg-red-900/40 text-red-400 print:text-red-700'
                          : 'bg-gray-800 text-gray-400 print:text-gray-600'
                      }`}
                    >
                      {isCorrect ? 'Acerto' : candidateAnswer ? 'Erro' : 'Não respondida'}
                    </span>
                  </div>

                  {/* Statement */}
                  <p className="text-sm text-gray-200 print:text-gray-800 leading-snug mb-3">
                    {q.statement}
                  </p>

                  {/* Answers comparison */}
                  <div className="grid sm:grid-cols-2 gap-2">
                    {/* Candidate answer */}
                    <div
                      className={`rounded-lg px-3 py-2 text-sm ${
                        !candidateAnswer
                          ? 'bg-gray-800/50 print:bg-gray-100'
                          : isCorrect
                          ? 'bg-green-900/30 print:bg-green-50'
                          : 'bg-red-900/30 print:bg-red-50'
                      }`}
                    >
                      <p className="text-xs text-gray-400 print:text-gray-500 mb-0.5">
                        Sua resposta
                      </p>
                      {candidateAnswer ? (
                        <p className={`font-medium ${isCorrect ? 'text-green-400 print:text-green-700' : 'text-red-400 print:text-red-700'}`}>
                          {candidateAnswer}) {q.options.find((o) => o.id === candidateAnswer)?.text}
                        </p>
                      ) : (
                        <p className="text-gray-500 italic">Não respondida</p>
                      )}
                    </div>

                    {/* Correct answer */}
                    {!isCorrect && (
                      <div className="rounded-lg px-3 py-2 text-sm bg-green-900/30 print:bg-green-50">
                        <p className="text-xs text-gray-400 print:text-gray-500 mb-0.5">
                          Gabarito
                        </p>
                        <p className="font-medium text-green-400 print:text-green-700">
                          {q.correctAnswer}){' '}
                          {q.options.find((o) => o.id === q.correctAnswer)?.text}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-center text-xs text-gray-600 mt-8 print:text-gray-500">
        AF Advogados · Processo Seletivo · Prova gerada em{' '}
        {new Date().toLocaleString('pt-BR')}
      </p>
    </div>
  );
}
