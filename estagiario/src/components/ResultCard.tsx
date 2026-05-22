import { ExamResult } from '../types/exam';

type ResultCardProps = {
  result: ExamResult;
  onRetake: () => void;
  showRetake: boolean;
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}s`;
  return `${m}min ${s}s`;
}

export default function ResultCard({ result, onRetake, showRetake }: ResultCardProps) {
  const { candidate, correctCount, wrongCount, totalQuestions, percentage, approved } = result;

  const handlePrint = () => window.print();

  const handleRetake = () => {
    if (
      window.confirm(
        'Tem certeza que deseja refazer a prova? Seu resultado atual será descartado.'
      )
    ) {
      onRetake();
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 print:py-4 print:px-0 animate-fade-in">
      {/* Print header */}
      <div className="hidden print:block text-center mb-6">
        <h1 className="text-2xl font-bold text-black">AF Advogados</h1>
        <p className="text-gray-600">Processo Seletivo — Estagiário(a)</p>
        <p className="text-gray-600 text-sm">Prova Objetiva — Resultado</p>
        <hr className="border-gray-300 mt-3" />
      </div>

      {/* Status card */}
      <div
        className={`card p-8 mb-6 text-center border-2 ${
          approved
            ? 'border-green-600 bg-green-900/20 print:border-green-700 print:bg-green-50'
            : 'border-red-600 bg-red-900/20 print:border-red-700 print:bg-red-50'
        }`}
      >
        <div className={`text-6xl mb-4 ${approved ? '' : ''}`}>
          {approved ? '🎉' : '😔'}
        </div>
        <div
          className={`inline-block px-6 py-2 rounded-full text-lg font-bold mb-4 ${
            approved
              ? 'bg-green-600 text-white'
              : 'bg-red-600 text-white'
          }`}
        >
          {approved ? '✓ APROVADO(A)' : '✗ REPROVADO(A)'}
        </div>
        <h2 className="text-2xl font-bold text-white print:text-black mb-1">{candidate.fullName}</h2>
        <p className="text-gray-400 print:text-gray-600 text-sm mb-6">{candidate.email}</p>
        <p className={`text-sm leading-relaxed max-w-md mx-auto ${approved ? 'text-green-300 print:text-green-700' : 'text-red-300 print:text-red-700'}`}>
          {approved
            ? 'Parabéns! Você atingiu a nota mínima classificatória e avança para a próxima etapa do processo seletivo.'
            : 'Você não atingiu a nota mínima classificatória nesta etapa do processo seletivo.'}
        </p>
      </div>

      {/* Score breakdown */}
      <div className="card p-6 mb-6 print:border print:border-gray-300 print:bg-white">
        <h3 className="text-sm font-semibold text-gray-400 print:text-gray-600 uppercase tracking-wider mb-5">
          Desempenho
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
          {[
            { label: 'Total de Questões', value: String(totalQuestions), color: 'text-white print:text-black' },
            { label: 'Acertos', value: String(correctCount), color: 'text-green-400 print:text-green-700' },
            { label: 'Erros', value: String(wrongCount), color: 'text-red-400 print:text-red-700' },
            {
              label: 'Nota Final',
              value: `${percentage.toFixed(1)}%`,
              color: approved ? 'text-green-400 print:text-green-700' : 'text-red-400 print:text-red-700',
            },
          ].map((item) => (
            <div key={item.label} className="text-center p-4 bg-af-muted print:bg-gray-50 rounded-xl">
              <div className={`text-3xl font-bold ${item.color} mb-1`}>{item.value}</div>
              <div className="text-xs text-gray-400 print:text-gray-500">{item.label}</div>
            </div>
          ))}
        </div>

        {/* Score bar */}
        <div>
          <div className="flex justify-between text-xs text-gray-400 print:text-gray-600 mb-1.5">
            <span>0%</span>
            <span className="text-yellow-500 font-medium">Corte: 70%</span>
            <span>100%</span>
          </div>
          <div className="h-4 bg-af-border print:bg-gray-200 rounded-full overflow-hidden relative">
            {/* Cut line */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-yellow-500 z-10"
              style={{ left: '70%' }}
            />
            <div
              className={`h-full rounded-full transition-all ${
                approved ? 'bg-green-500' : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs mt-1 text-gray-500 print:text-gray-500">
            <span>{percentage.toFixed(1)}% obtido</span>
            <span>Mínimo: 70%</span>
          </div>
        </div>
      </div>

      {/* Candidate info */}
      <div className="card p-6 mb-6 print:border print:border-gray-300 print:bg-white">
        <h3 className="text-sm font-semibold text-gray-400 print:text-gray-600 uppercase tracking-wider mb-4">
          Dados do Candidato
        </h3>
        <div className="grid md:grid-cols-2 gap-3 text-sm">
          {[
            { label: 'Nome', value: candidate.fullName },
            { label: 'E-mail', value: candidate.email },
            { label: 'WhatsApp', value: candidate.whatsapp },
            { label: 'Curso', value: candidate.course },
            { label: 'Semestre', value: `${candidate.semester}º semestre` },
            { label: 'Cidade', value: candidate.city },
          ].map((item) => (
            <div key={item.label} className="flex gap-2">
              <span className="text-gray-400 print:text-gray-500 shrink-0 w-24">{item.label}:</span>
              <span className="text-white print:text-black font-medium truncate">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Timestamps */}
      <div className="card p-4 mb-8 print:border print:border-gray-300 print:bg-white">
        <div className="grid md:grid-cols-3 gap-3 text-sm text-center">
          {[
            { label: 'Início', value: formatDate(result.startedAt) },
            { label: 'Término', value: formatDate(result.finishedAt) },
            { label: 'Duração', value: formatDuration(result.durationSeconds) },
          ].map((item) => (
            <div key={item.label}>
              <span className="text-gray-400 print:text-gray-500 text-xs block">{item.label}</span>
              <span className="text-white print:text-black text-sm font-medium">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3 no-print">
        <button
          onClick={handlePrint}
          className="btn-primary flex items-center justify-center gap-2 flex-1"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Imprimir / Salvar PDF
        </button>
        {showRetake && (
          <button
            onClick={handleRetake}
            className="btn-secondary flex items-center justify-center gap-2 flex-1"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refazer Prova
          </button>
        )}
      </div>
    </div>
  );
}
