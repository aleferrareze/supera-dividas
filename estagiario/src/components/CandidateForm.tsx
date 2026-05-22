import { useState, FormEvent } from 'react';
import { Candidate } from '../types/exam';

type CandidateFormProps = {
  onStart: (candidate: Candidate) => void;
  totalQuestions: number;
};

export default function CandidateForm({ onStart, totalQuestions }: CandidateFormProps) {
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
    form.whatsapp.trim().length >= 10 &&
    form.course.trim().length >= 2 &&
    form.semester.trim() !== '' &&
    form.city.trim().length >= 2 &&
    form.acceptedTerms;

  const validate = () => {
    const e: Record<string, string> = {};
    if (form.fullName.trim().length < 3) e.fullName = 'Informe seu nome completo.';
    if (!form.email.includes('@') || !form.email.includes('.'))
      e.email = 'Informe um e-mail válido.';
    if (form.whatsapp.replace(/\D/g, '').length < 10)
      e.whatsapp = 'Informe um WhatsApp válido com DDD.';
    if (form.course.trim().length < 2) e.course = 'Informe seu curso.';
    if (!form.semester) e.semester = 'Informe o semestre.';
    if (form.city.trim().length < 2) e.city = 'Informe sua cidade.';
    if (!form.acceptedTerms) e.acceptedTerms = 'Você deve aceitar a declaração para continuar.';
    return e;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    onStart({ ...form });
  };

  const set = (field: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const value =
      e.target.type === 'checkbox'
        ? (e.target as HTMLInputElement).checked
        : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  return (
    <div className="min-h-screen bg-af-dark">
      {/* Banner */}
      <div className="relative w-full overflow-hidden" style={{ minHeight: '240px' }}>
        {/* Try to load the banner image, fallback to gradient */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/banner.jpeg'), linear-gradient(135deg, #0d0d0d 0%, #1a0a10 40%, #2d1020 70%, #1a0a10 100%)`,
          }}
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-af-dark" />
        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 py-12 text-center">
          <div className="inline-flex items-center gap-2 bg-af-coral/20 border border-af-coral/30 text-af-coral text-xs font-semibold px-4 py-1.5 rounded-full mb-4 tracking-wider uppercase">
            Etapa Classificatória • Processo Seletivo 2025
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-3 font-serif leading-tight">
            Prova Objetiva
          </h1>
          <p className="text-af-coral text-xl md:text-2xl font-semibold mb-2">
            Vaga: Estagiário(a)
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
            { label: 'Total de Questões', value: String(totalQuestions), icon: '📝' },
            { label: 'Nota de Corte', value: '70%', icon: '🎯' },
            { label: 'Valor por Questão', value: '1 ponto', icon: '⚖️' },
            { label: 'Alternativas', value: 'A, B, C ou D', icon: '✅' },
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
            Instruções importantes
          </h2>
          <p className="text-gray-300 text-sm leading-relaxed mb-3">
            Esta prova objetiva faz parte da etapa classificatória do processo seletivo para vaga de
            Estagiário(a) no escritório <strong className="text-white">AF Advogados</strong>. Leia
            cada questão com atenção e escolha apenas uma alternativa. Ao finalizar, o sistema
            exibirá sua nota, gabarito e resultado final.
          </p>
          <ul className="space-y-1.5 text-sm text-gray-400">
            {[
              'Cada questão possui apenas uma alternativa correta.',
              'Você não poderá sair da prova após iniciá-la.',
              'Não é permitido copiar ou consultar material externo.',
              'A prova deve ser realizada em tela cheia.',
              'Tempo mínimo: 10 minutos. Tempo máximo: 90 minutos.',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="text-af-coral mt-0.5">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Form */}
        <div className="card p-6 md:p-8">
          <h2 className="text-lg font-semibold text-white mb-1">Dados do Candidato</h2>
          <p className="text-sm text-gray-400 mb-6">
            Preencha todos os campos corretamente antes de iniciar a prova.
          </p>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Name */}
            <div>
              <label className="label" htmlFor="fullName">
                Nome completo <span className="text-af-coral">*</span>
              </label>
              <input
                id="fullName"
                type="text"
                value={form.fullName}
                onChange={set('fullName')}
                placeholder="Seu nome completo"
                className="input-field"
                autoComplete="name"
              />
              {errors.fullName && (
                <p className="text-red-400 text-xs mt-1">{errors.fullName}</p>
              )}
            </div>

            {/* Email + WhatsApp */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="label" htmlFor="email">
                  E-mail <span className="text-af-coral">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={set('email')}
                  placeholder="seu@email.com"
                  className="input-field"
                  autoComplete="email"
                />
                {errors.email && (
                  <p className="text-red-400 text-xs mt-1">{errors.email}</p>
                )}
              </div>
              <div>
                <label className="label" htmlFor="whatsapp">
                  WhatsApp (com DDD) <span className="text-af-coral">*</span>
                </label>
                <input
                  id="whatsapp"
                  type="tel"
                  value={form.whatsapp}
                  onChange={set('whatsapp')}
                  placeholder="(00) 00000-0000"
                  className="input-field"
                  autoComplete="tel"
                />
                {errors.whatsapp && (
                  <p className="text-red-400 text-xs mt-1">{errors.whatsapp}</p>
                )}
              </div>
            </div>

            {/* Course + Semester */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="label" htmlFor="course">
                  Curso <span className="text-af-coral">*</span>
                </label>
                <input
                  id="course"
                  type="text"
                  value={form.course}
                  onChange={set('course')}
                  placeholder="Ex.: Direito"
                  className="input-field"
                />
                {errors.course && (
                  <p className="text-red-400 text-xs mt-1">{errors.course}</p>
                )}
              </div>
              <div>
                <label className="label" htmlFor="semester">
                  Semestre <span className="text-af-coral">*</span>
                </label>
                <select
                  id="semester"
                  value={form.semester}
                  onChange={set('semester')}
                  className="input-field"
                >
                  <option value="">Selecione</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((s) => (
                    <option key={s} value={String(s)}>
                      {s}º semestre
                    </option>
                  ))}
                </select>
                {errors.semester && (
                  <p className="text-red-400 text-xs mt-1">{errors.semester}</p>
                )}
              </div>
            </div>

            {/* City */}
            <div>
              <label className="label" htmlFor="city">
                Cidade <span className="text-af-coral">*</span>
              </label>
              <input
                id="city"
                type="text"
                value={form.city}
                onChange={set('city')}
                placeholder="Sua cidade"
                className="input-field"
              />
              {errors.city && (
                <p className="text-red-400 text-xs mt-1">{errors.city}</p>
              )}
            </div>

            {/* Terms */}
            <div className="border border-af-border rounded-xl p-4 bg-af-muted/40">
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative mt-0.5">
                  <input
                    type="checkbox"
                    checked={form.acceptedTerms}
                    onChange={set('acceptedTerms')}
                    className="sr-only"
                    id="acceptedTerms"
                  />
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                      form.acceptedTerms
                        ? 'bg-af-coral border-af-coral'
                        : 'border-af-border group-hover:border-gray-500'
                    }`}
                  >
                    {form.acceptedTerms && (
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-sm text-gray-300 leading-relaxed">
                  Declaro que responderei a prova{' '}
                  <strong className="text-white">individualmente e sem consulta externa</strong>,
                  estando ciente das regras do processo seletivo do escritório AF Advogados.
                </span>
              </label>
              {errors.acceptedTerms && (
                <p className="text-red-400 text-xs mt-2 ml-8">{errors.acceptedTerms}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={!isValid}
              className="btn-primary w-full text-base py-4 flex items-center justify-center gap-3"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              Iniciar Prova
            </button>

            {!isValid && (
              <p className="text-center text-xs text-gray-500">
                Preencha todos os campos e aceite a declaração para habilitar o botão.
              </p>
            )}
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-600 mt-8">
          AF Advogados © {new Date().getFullYear()} — Processo Seletivo Confidencial
        </p>
      </div>
    </div>
  );
}
