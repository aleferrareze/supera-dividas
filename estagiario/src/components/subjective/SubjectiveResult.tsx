import type { SubjectiveResult } from '../../types/subjective';

type Props = {
  result: SubjectiveResult;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function formatDuration(s: number) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h}h ${m}min`;
  return `${m}min`;
}

function countWords(text: string) {
  return text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
}

export default function SubjectiveResult({ result }: Props) {
  return (
    <div className="min-h-screen bg-af-dark flex items-center justify-center p-4">
      <div className="max-w-xl w-full space-y-4 animate-slide-up">
        {/* Success card */}
        <div className="card p-8 text-center border-green-800 border">
          <div className="w-16 h-16 rounded-full bg-green-900/50 border-2 border-green-600 flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Prova Enviada!</h1>
          <p className="text-gray-400 text-sm leading-relaxed">
            Sua aplicação prática foi registrada com sucesso.
            Nossa equipe realizará a correção e entrará em contato em breve.
          </p>
        </div>

        {/* Submission details */}
        <div className="card p-6">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Resumo do envio
          </h2>
          <div className="space-y-3 text-sm">
            {[
              { label: 'Candidato', value: result.candidate.fullName },
              { label: 'E-mail', value: result.candidate.email },
              { label: 'WhatsApp', value: result.candidate.whatsapp },
              { label: 'Curso / Semestre', value: `${result.candidate.course} · ${result.candidate.semester}º semestre` },
              { label: 'Cidade', value: result.candidate.city },
              { label: 'Início', value: formatDate(result.startedAt) },
              { label: 'Envio', value: formatDate(result.submittedAt) },
              { label: 'Duração', value: formatDuration(result.durationSeconds) },
              { label: 'Palavras escritas', value: String(countWords(result.answer)) },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between border-b border-af-border pb-3 last:border-0 last:pb-0">
                <span className="text-gray-500">{item.label}</span>
                <span className="text-gray-200 font-medium text-right">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Next steps */}
        <div className="card p-5 border-l-4 border-l-af-coral">
          <h2 className="text-xs font-semibold text-af-coral uppercase tracking-wider mb-3">
            Próximos passos
          </h2>
          <ul className="space-y-2 text-sm text-gray-400">
            {[
              'Sua peça processual será corrigida pela equipe do escritório AF Advogados.',
              'O resultado será comunicado pelo e-mail ou WhatsApp informados.',
              'Candidatos aprovados serão convocados para entrevista técnica.',
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-af-coral font-semibold shrink-0">{i + 1}.</span>
                {step}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-center text-xs text-gray-600">
          AF Advogados © {new Date().getFullYear()} — Processo Seletivo Confidencial
        </p>
      </div>
    </div>
  );
}
