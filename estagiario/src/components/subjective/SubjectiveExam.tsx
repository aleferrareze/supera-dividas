import { useState, useEffect, useRef } from 'react';
import { SubjectiveCandidate } from '../../types/subjective';
import { SUBJECTIVE_CASE } from '../../data/subjectiveCase';

type Props = {
  candidate: SubjectiveCandidate;
  remainingSeconds: number;
  elapsed: number;
  minTimeSeconds: number;
  answer: string;
  onAnswerChange: (text: string) => void;
  onSubmit: () => void;
  violations: number;
};

function formatTime(s: number) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

function countWords(text: string) {
  return text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
}

export default function SubjectiveExam({
  candidate,
  remainingSeconds,
  elapsed,
  minTimeSeconds,
  answer,
  onAnswerChange,
  onSubmit,
  violations,
}: Props) {
  const [tab, setTab] = useState<'case' | 'answer'>('case');
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const wordCount = countWords(answer);
  const canSubmit = elapsed >= minTimeSeconds && answer.trim().length >= 100;
  const isLowTime = remainingSeconds <= 600; // last 10 min
  const isUrgent = remainingSeconds <= 120; // last 2 min

  // Auto-focus textarea when switching to answer tab
  useEffect(() => {
    if (tab === 'answer') textareaRef.current?.focus();
  }, [tab]);

  const handleSubmitClick = () => {
    if (!canSubmit) return;
    setConfirmSubmit(true);
  };

  return (
    <div className="min-h-screen bg-af-dark flex flex-col">
      {/* Header */}
      <header className="bg-af-card border-b border-af-border sticky top-0 z-40 no-print">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-af-coral flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-xs font-serif">AF</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{candidate.fullName}</p>
            <p className="text-gray-500 text-xs leading-none">Aplicação Prática · {candidate.city}</p>
          </div>

          {/* Word count */}
          <div className="hidden sm:flex items-center gap-1.5 bg-af-muted rounded-lg px-3 py-1.5">
            <svg className="w-3.5 h-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
            </svg>
            <span className="text-xs text-gray-400">{wordCount} palavras</span>
          </div>

          {/* Timer */}
          <div className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-mono font-bold transition-colors ${
            isUrgent ? 'bg-red-900/50 text-red-400 animate-pulse' :
            isLowTime ? 'bg-yellow-900/40 text-yellow-400' :
            'bg-af-muted text-white'
          }`}>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {formatTime(remainingSeconds)}
          </div>

          {violations > 0 && (
            <div className="flex items-center gap-1.5 bg-yellow-900/40 text-yellow-400 text-xs font-semibold px-2.5 py-1.5 rounded-lg">
              <span>⚠️</span>
              <span>{violations} advertência{violations > 1 ? 's' : ''}</span>
            </div>
          )}

          <button
            onClick={handleSubmitClick}
            disabled={!canSubmit}
            className="btn-primary py-2 px-4 text-sm shrink-0 disabled:opacity-40"
          >
            Enviar Prova
          </button>
        </div>

        {/* Mobile tabs */}
        <div className="md:hidden flex border-t border-af-border">
          {(['case', 'answer'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 text-xs font-medium transition-colors ${
                tab === t ? 'text-af-coral border-b-2 border-af-coral' : 'text-gray-500'
              }`}
            >
              {t === 'case' ? 'Caso Prático' : `Minha Resposta (${wordCount} palavras)`}
            </button>
          ))}
        </div>
      </header>

      {/* Progress bar */}
      <div className="h-0.5 bg-af-border">
        <div
          className="h-full bg-af-coral transition-all duration-1000"
          style={{ width: `${Math.min(100, (elapsed / (remainingSeconds + elapsed)) * 100)}%` }}
        />
      </div>

      {/* Main content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-4">
        <div className="flex flex-col md:flex-row gap-4 h-full">
          {/* Case study panel */}
          <div className={`md:w-[45%] flex flex-col ${tab === 'answer' ? 'hidden md:flex' : 'flex'}`}>
            <div className="card flex-1 overflow-hidden flex flex-col">
              <div className="px-5 py-3 border-b border-af-border flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-af-coral inline-block"></span>
                <h2 className="text-sm font-semibold text-white">Caso Prático — Execução Penal</h2>
              </div>
              <div className="flex-1 overflow-y-auto p-5 scrollbar-thin">
                <div className="prose-sm text-gray-300 leading-relaxed space-y-4">
                  {SUBJECTIVE_CASE.enunciado.split('\n\n').map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>

                <div className="mt-6 border-t border-af-border pt-4">
                  <h3 className="text-xs font-semibold text-af-coral uppercase tracking-wider mb-3">
                    Orientações para a peça
                  </h3>
                  <ul className="space-y-2">
                    {SUBJECTIVE_CASE.instrucoes.map((ins, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-gray-400">
                        <span className="text-af-coral mt-0.5 shrink-0">{i + 1}.</span>
                        {ins}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-5 border-t border-af-border pt-4">
                  <h3 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">
                    Critérios de avaliação
                  </h3>
                  <div className="space-y-1.5">
                    {SUBJECTIVE_CASE.criterios.map((c, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">{c.item}</span>
                        <span className="text-af-coral font-semibold ml-3 shrink-0">{c.pontos} pts</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Answer panel */}
          <div className={`md:flex-1 flex flex-col ${tab === 'case' ? 'hidden md:flex' : 'flex'}`}>
            <div className="card flex-1 overflow-hidden flex flex-col">
              <div className="px-5 py-3 border-b border-af-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
                  <h2 className="text-sm font-semibold text-white">Sua Resposta</h2>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span>{wordCount} palavras</span>
                  <span>{answer.length} caracteres</span>
                </div>
              </div>
              <div className="flex-1 flex flex-col p-3">
                <textarea
                  ref={textareaRef}
                  value={answer}
                  onChange={(e) => onAnswerChange(e.target.value)}
                  placeholder={`Elabore aqui sua peça processual completa.

Sugestão de estrutura:
1. Endereçamento (Ex.: Excelentíssimo Senhor Doutor Juiz de Direito da Vara das Execuções Criminais...)
2. Qualificação do sentenciado e do advogado
3. Dos fatos
4. Do direito (art. 112 e 126 da LEP, CF/88)
5. Dos cálculos (requisito objetivo + remição)
6. Dos pedidos
7. Encerramento e assinatura`}
                  className="flex-1 w-full bg-af-muted/60 border border-af-border rounded-xl p-4 text-gray-200 text-sm leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-af-coral/50 focus:border-af-coral transition-all placeholder-gray-600 font-mono scrollbar-thin"
                  style={{ minHeight: '400px' }}
                  spellCheck={false}
                />

                {/* Minimum content warning */}
                {!canSubmit && elapsed >= minTimeSeconds && answer.trim().length > 0 && answer.trim().length < 100 && (
                  <p className="text-xs text-yellow-500 mt-2 px-1">
                    Escreva pelo menos 100 caracteres antes de enviar.
                  </p>
                )}
                {!canSubmit && elapsed < minTimeSeconds && (
                  <p className="text-xs text-gray-600 mt-2 px-1">
                    O botão de envio será liberado após {Math.ceil((minTimeSeconds - elapsed) / 60)} min.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Confirm submit modal */}
      {confirmSubmit && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="max-w-md w-full card border-af-coral border-2 p-8 text-center">
            <div className="text-5xl mb-4">📤</div>
            <h2 className="text-xl font-bold text-white mb-3">Enviar prova?</h2>
            <p className="text-gray-300 text-sm mb-2">
              Você escreveu <strong className="text-white">{wordCount} palavras</strong>.
              Após o envio, não será possível alterar sua resposta.
            </p>
            <p className="text-gray-500 text-xs mb-6">
              Certifique-se de que elaborou a peça completa com endereçamento, fundamentos e pedidos.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmSubmit(false)} className="btn-secondary flex-1">
                Revisar
              </button>
              <button
                onClick={() => { setConfirmSubmit(false); onSubmit(); }}
                className="btn-primary flex-1"
              >
                Confirmar envio
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
