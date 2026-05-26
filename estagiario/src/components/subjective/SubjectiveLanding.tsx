import { useState, FormEvent } from 'react';
import { SubjectiveCandidate } from '../../types/subjective';
import { SUBJECTIVE_CASE } from '../../data/subjectiveCase';

type Props = {
  onStart: (candidate: SubjectiveCandidate) => void;
};

export default function SubjectiveLanding({ onStart }: Props) {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    whatsapp: '',
    course: '',
    semester: '',
    city: '',
    acceptedTerms: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isValid =
    form.fullName.trim().length >= 3 &&
    form.email.includes('@') &&
    form.whatsapp.replace(/\D/g, '').length >= 10 &&
    form.course.trim().length >= 2 &&
    form.semester !== '' &&
    form.city.trim().length >= 2 &&
    form.acceptedTerms;

  const validate = () => {
    const e: Record<string, string> = {};
    if (form.fullName.trim().length < 3) e.fullName = 'Informe seu nome completo.';
    if (!form.email.includes('@') || !form.email.includes('.')) e.email = 'Informe um e-mail válido.';
    if (form.whatsapp.replace(/\D/g, '').length < 10) e.whatsapp = 'Informe um WhatsApp válido com DDD.';
    if (form.course.trim().length < 2) e.course = 'Informe seu curso.';
    if (!form.semester) e.semester = 'Informe o semestre.';
    if (form.city.trim().length < 2) e.city = 'Informe sua cidade.';
    if (!form.acceptedTerms) e.acceptedTerms = 'Você deve aceitar a declaração para continuar.';
    return e;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    const { acceptedTerms: _, ...candidate } = form;
    onStart(candidate);
  };

  const set = (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
      setForm((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
    };

  return (
    <div className="min-h-screen bg-af-dark">
      {/* Banner */}
      <div className="relative w-full overflow-hidden" style={{ minHeight: '240px' }}>
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('/banner.jpeg'), linear-gradient(135deg, #0d0d0d 0%, #1a0a10 40%, #2d1020 70%, #1a0a10 100%)` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-af-dark" />
        <div className="relative z-10 max-w-4xl mx-auto px-6 py-12 text-center">
          <div className="inline-flex items-center gap-2 bg-af-coral/20 border border-af-coral/30 text-af-coral text-xs font-semibold px-4 py-1.5 rounded-full mb-4 tracking-wider uppercase">
            Etapa 3 • Processo Seletivo 2025
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-3 font-serif leading-tight">
            Aplicação Prática
          </h1>
          <p className="text-af-coral text-xl md:text-2xl font-semibold mb-2">
            Prova Subjetiva — Peça Processual
          </p>
          <p className="text-gray-300 text-base md:text-lg font-light tracking-wide">
            AF Advogados
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Info cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Duração Máxima', value: '3 horas', icon: '⏱️' },
            { label: 'Valor Total', value: '100 pontos', icon: '⚖️' },
            { label: 'Nota de Corte', value: '75 pontos', icon: '🎯' },
            { label: 'Formato', value: 'Peça jurídica', icon: '📝' },
          ].map((item) => (
            <div key={item.label} className="card p-4 text-center">
              <div className="text-2xl mb-1">{item.icon}</div>
              <div className="text-white font-bold text-lg leading-none">{item.value}</div>
              <div className="text-gray-400 text-xs mt-1">{item.label}</div>
            </div>
          ))}
        </div>

        {/* Instructions */}
        <div className="card p-6 mb-6 border-l-4 border-l-af-coral">
          <h2 className="text-sm font-semibold text-af-coral uppercase tracking-wider mb-3">
            Sobre esta etapa
          </h2>
          <p className="text-gray-300 text-sm leading-relaxed mb-3">
            Esta é a etapa prática do processo seletivo para vaga de Estagiário(a) no escritório{' '}
            <strong className="text-white">AF Advogados</strong>. Você receberá um caso concreto de
            execução penal e deverá elaborar a peça processual cabível, com fundamentação jurídica
            completa, cálculos e pedidos adequados.
          </p>
          <ul className="space-y-1.5 text-sm text-gray-400">
            {[
              'Leia o caso com atenção antes de começar a escrever.',
              'Elabore a peça completa: endereçamento, qualificação, fundamentos e pedidos.',
              'Consulta a materiais externos não é permitida.',
              'A prova deve ser realizada em tela cheia.',
              'Você tem até 3 horas para finalizar e enviar.',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="text-af-coral mt-0.5">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Criteria */}
        <div className="card p-6 mb-6">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
            Critérios de avaliação
          </h2>
          <div className="space-y-2">
            {SUBJECTIVE_CASE.criterios.map((c, i) => (
              <div key={i} className="flex items-center justify-between text-sm py-1.5 border-b border-af-border last:border-0">
                <span className="text-gray-300">{c.item}</span>
                <span className="text-af-coral font-semibold shrink-0 ml-4">{c.pontos} pts</span>
              </div>
            ))}
          </div>
        </div>

        {/* Candidate form */}
        <div className="card p-6 md:p-8">
          <h2 className="text-lg font-semibold text-white mb-1">Dados do Candidato</h2>
          <p className="text-sm text-gray-400 mb-6">
            Preencha todos os campos corretamente antes de iniciar a prova.
          </p>
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div>
              <label className="label" htmlFor="subj-fullName">Nome completo <span className="text-af-coral">*</span></label>
              <input id="subj-fullName" type="text" value={form.fullName} onChange={set('fullName')} placeholder="Seu nome completo" className="input-field" autoComplete="name" />
              {errors.fullName && <p className="text-red-400 text-xs mt-1">{errors.fullName}</p>}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="label" htmlFor="subj-email">E-mail <span className="text-af-coral">*</span></label>
                <input id="subj-email" type="email" value={form.email} onChange={set('email')} placeholder="seu@email.com" className="input-field" autoComplete="email" />
                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="label" htmlFor="subj-whatsapp">WhatsApp (com DDD) <span className="text-af-coral">*</span></label>
                <input id="subj-whatsapp" type="tel" value={form.whatsapp} onChange={set('whatsapp')} placeholder="(00) 00000-0000" className="input-field" autoComplete="tel" />
                {errors.whatsapp && <p className="text-red-400 text-xs mt-1">{errors.whatsapp}</p>}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="label" htmlFor="subj-course">Curso <span className="text-af-coral">*</span></label>
                <input id="subj-course" type="text" value={form.course} onChange={set('course')} placeholder="Ex.: Direito" className="input-field" />
                {errors.course && <p className="text-red-400 text-xs mt-1">{errors.course}</p>}
              </div>
              <div>
                <label className="label" htmlFor="subj-semester">Semestre <span className="text-af-coral">*</span></label>
                <select id="subj-semester" value={form.semester} onChange={set('semester')} className="input-field">
                  <option value="">Selecione</option>
                  {[1,2,3,4,5,6,7,8,9,10].map((s) => (
                    <option key={s} value={String(s)}>{s}º semestre</option>
                  ))}
                </select>
                {errors.semester && <p className="text-red-400 text-xs mt-1">{errors.semester}</p>}
              </div>
            </div>

            <div>
              <label className="label" htmlFor="subj-city">Cidade <span className="text-af-coral">*</span></label>
              <input id="subj-city" type="text" value={form.city} onChange={set('city')} placeholder="Sua cidade" className="input-field" />
              {errors.city && <p className="text-red-400 text-xs mt-1">{errors.city}</p>}
            </div>

            <div className="border border-af-border rounded-xl p-4 bg-af-muted/40">
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative mt-0.5">
                  <input type="checkbox" checked={form.acceptedTerms} onChange={set('acceptedTerms')} className="sr-only" id="subj-acceptedTerms" />
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${form.acceptedTerms ? 'bg-af-coral border-af-coral' : 'border-af-border group-hover:border-gray-500'}`}>
                    {form.acceptedTerms && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-sm text-gray-300 leading-relaxed">
                  Declaro que realizarei esta prova{' '}
                  <strong className="text-white">individualmente e sem consulta a materiais externos</strong>,
                  estando ciente das regras do processo seletivo do escritório AF Advogados.
                </span>
              </label>
              {errors.acceptedTerms && <p className="text-red-400 text-xs mt-2 ml-8">{errors.acceptedTerms}</p>}
            </div>

            <button type="submit" disabled={!isValid} className="btn-primary w-full text-base py-4 flex items-center justify-center gap-3">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Iniciar Aplicação Prática
            </button>

            {!isValid && (
              <p className="text-center text-xs text-gray-500">
                Preencha todos os campos e aceite a declaração para habilitar o botão.
              </p>
            )}
          </form>
        </div>

        <p className="text-center text-xs text-gray-600 mt-8">
          AF Advogados © {new Date().getFullYear()} — Processo Seletivo Confidencial
        </p>
      </div>
    </div>
  );
}
