import { useState } from 'react';
import { SubjectiveResult } from '../../types/subjective';
import { AI_CORRECTION_PROMPT } from '../../data/subjectiveCase';

const RESULT_PREFIX = 'af_subj_result_';

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

export function getAllSubjectiveResults(): SubjectiveResult[] {
  const results: SubjectiveResult[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(RESULT_PREFIX)) {
      try {
        const parsed: SubjectiveResult = JSON.parse(localStorage.getItem(key) || '');
        results.push(parsed);
      } catch { /* skip */ }
    }
  }
  return results.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
}

function classificationColor(cls?: string) {
  if (!cls) return 'text-gray-400';
  const c = cls.toLowerCase();
  if (c.includes('excelente')) return 'text-green-400';
  if (c.includes('muito')) return 'text-green-400';
  if (c.includes('bom')) return 'text-blue-400';
  if (c.includes('regular')) return 'text-yellow-400';
  return 'text-red-400';
}

function recommendationBadge(rec?: string) {
  if (!rec) return null;
  const r = rec.toLowerCase();
  if (r.includes('destaque')) return { label: 'APROVADO C/ DESTAQUE', cls: 'bg-green-900/50 text-green-400' };
  if (r.includes('ressalva')) return { label: 'APROVADO C/ RESSALVAS', cls: 'bg-blue-900/50 text-blue-400' };
  if (r.includes('análise') || r.includes('analise')) return { label: 'EM ANÁLISE', cls: 'bg-yellow-900/50 text-yellow-400' };
  if (r.includes('aprovado')) return { label: 'APROVADO', cls: 'bg-green-900/50 text-green-400' };
  return { label: 'REPROVADO', cls: 'bg-red-900/50 text-red-400' };
}

type CorrectionEntry = {
  score: string;
  classification: string;
  positivePoints: string;
  attentionPoints: string;
  analysis: string;
  risk: string;
  recommendation: string;
};

export default function SubjectiveAdminPanel() {
  const [results, setResults] = useState<SubjectiveResult[]>(() => getAllSubjectiveResults());
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [correcting, setCorrecting] = useState<string | null>(null);
  const [corrections, setCorrections] = useState<Record<string, CorrectionEntry>>({});
  const [copied, setCopied] = useState<string | null>(null);

  const filtered = results.filter((r) => {
    const q = search.toLowerCase();
    return (
      q === '' ||
      r.candidate.fullName.toLowerCase().includes(q) ||
      r.candidate.email.toLowerCase().includes(q) ||
      r.candidate.city.toLowerCase().includes(q)
    );
  });

  const stats = {
    total: results.length,
    corrected: results.filter((r) => r.aiScore !== undefined).length,
    avgScore: results.filter((r) => r.aiScore !== undefined).length > 0
      ? (results.filter((r) => r.aiScore !== undefined).reduce((a, r) => a + (r.aiScore ?? 0), 0) /
         results.filter((r) => r.aiScore !== undefined).length).toFixed(1)
      : '—',
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('Excluir este resultado permanentemente?')) return;
    localStorage.removeItem(RESULT_PREFIX + id);
    setResults(getAllSubjectiveResults());
  };

  const copyPrompt = (r: SubjectiveResult) => {
    const prompt = `${AI_CORRECTION_PROMPT}\n\n---\n\nRESPOSTA DO CANDIDATO:\nNome: ${r.candidate.fullName}\nCurso: ${r.candidate.course} · ${r.candidate.semester}º semestre\nCidade: ${r.candidate.city}\nDuração: ${formatDuration(r.durationSeconds)}\nPalavras: ${r.wordCount}\n\n${r.answer}`;
    navigator.clipboard.writeText(prompt).then(() => {
      setCopied(r.id);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const saveCorrection = (id: string) => {
    const c = corrections[id];
    if (!c) return;
    const score = parseFloat(c.score);
    if (isNaN(score) || score < 0 || score > 100) { alert('Nota inválida (0–100).'); return; }

    const key = RESULT_PREFIX + id;
    const existing = localStorage.getItem(key);
    if (!existing) return;
    const result: SubjectiveResult = JSON.parse(existing);
    const updated: SubjectiveResult = {
      ...result,
      aiScore: score,
      aiClassification: c.classification,
      aiPositivePoints: c.positivePoints,
      aiAttentionPoints: c.attentionPoints,
      aiAnalysis: c.analysis,
      aiRisk: c.risk,
      aiRecommendation: c.recommendation,
      aiCorrectedAt: new Date().toISOString(),
    };
    localStorage.setItem(key, JSON.stringify(updated));
    setResults(getAllSubjectiveResults());
    setCorrecting(null);
  };

  const initCorrection = (r: SubjectiveResult) => {
    setCorrections((prev) => ({
      ...prev,
      [r.id]: {
        score: r.aiScore !== undefined ? String(r.aiScore) : '',
        classification: r.aiClassification ?? '',
        positivePoints: r.aiPositivePoints ?? '',
        attentionPoints: r.aiAttentionPoints ?? '',
        analysis: r.aiAnalysis ?? '',
        risk: r.aiRisk ?? '',
        recommendation: r.aiRecommendation ?? '',
      },
    }));
    setCorrecting(r.id);
  };

  const setField = (id: string, field: keyof CorrectionEntry, value: string) => {
    setCorrections((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  };

  function exportCSV() {
    const header = ['Nome', 'E-mail', 'WhatsApp', 'Curso', 'Semestre', 'Cidade',
      'Palavras', 'Duração', 'Envio', 'Nota IA', 'Classificação', 'Recomendação'].join(';');
    const rows = results.map((r) => [
      r.candidate.fullName, r.candidate.email, r.candidate.whatsapp,
      r.candidate.course, r.candidate.semester, r.candidate.city,
      r.wordCount, formatDuration(r.durationSeconds), formatDate(r.submittedAt),
      r.aiScore ?? '', r.aiClassification ?? '', r.aiRecommendation ?? '',
    ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(';'));
    const csv = [header, ...rows].join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aplicacao-pratica-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Enviadas', value: String(stats.total), color: 'text-white' },
          { label: 'Corrigidas', value: String(stats.corrected), color: 'text-af-coral' },
          { label: 'Média IA', value: `${stats.avgScore}pts`, color: 'text-green-400' },
        ].map((s) => (
          <div key={s.label} className="card p-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-gray-400 text-xs mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome, e-mail ou cidade..."
          className="input-field flex-1"
        />
        <button
          onClick={exportCSV}
          disabled={results.length === 0}
          className="btn-secondary text-sm py-2 px-4 flex items-center gap-2 disabled:opacity-40 shrink-0"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Exportar CSV
        </button>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-gray-400 text-lg mb-2">Nenhuma resposta encontrada</p>
          <p className="text-gray-600 text-sm">
            {results.length === 0
              ? 'Nenhum candidato enviou a Aplicação Prática neste dispositivo ainda.'
              : 'Tente ajustar os filtros.'}
          </p>
          {results.length === 0 && (
            <div className="mt-6 p-4 bg-af-muted rounded-xl text-xs text-gray-500 text-left">
              <p className="font-semibold text-gray-400 mb-1">📌 Armazenamento local</p>
              <p>As respostas são salvas no localStorage do navegador onde o candidato realizou a prova.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-gray-500 px-1">{filtered.length} resposta(s)</p>
          {filtered.map((r) => {
            const isExpanded = expanded === r.id;
            const badge = recommendationBadge(r.aiRecommendation);
            return (
              <div key={r.id} className="card overflow-hidden">
                <button
                  className="w-full flex items-center gap-4 p-4 text-left hover:bg-af-muted/40 transition-colors"
                  onClick={() => setExpanded(isExpanded ? null : r.id)}
                >
                  <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${badge ? (badge.cls.includes('green') ? 'bg-green-500' : badge.cls.includes('blue') ? 'bg-blue-500' : badge.cls.includes('yellow') ? 'bg-yellow-500' : 'bg-red-500') : 'bg-gray-500'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm truncate">{r.candidate.fullName}</p>
                    <p className="text-gray-400 text-xs truncate">{r.candidate.email} · {r.candidate.city}</p>
                  </div>
                  <div className="text-right shrink-0 hidden sm:block">
                    {r.aiScore !== undefined ? (
                      <>
                        <p className={`text-sm font-bold ${classificationColor(r.aiClassification)}`}>{r.aiScore}/100</p>
                        <p className="text-gray-500 text-xs">{r.aiClassification}</p>
                      </>
                    ) : (
                      <p className="text-xs text-gray-600 italic">Aguarda correção</p>
                    )}
                  </div>
                  {badge && (
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${badge.cls}`}>
                      {badge.label}
                    </span>
                  )}
                  {!badge && (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 bg-gray-800 text-gray-500">
                      PENDENTE
                    </span>
                  )}
                  <svg
                    className={`w-4 h-4 text-gray-500 shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isExpanded && (
                  <div className="border-t border-af-border px-4 pb-5 pt-4 animate-fade-in space-y-5">
                    {/* Candidate info */}
                    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                      {[
                        { label: 'WhatsApp', value: r.candidate.whatsapp },
                        { label: 'Curso', value: r.candidate.course },
                        { label: 'Semestre', value: `${r.candidate.semester}º` },
                        { label: 'Cidade', value: r.candidate.city },
                        { label: 'Envio', value: formatDate(r.submittedAt) },
                        { label: 'Duração', value: formatDuration(r.durationSeconds) },
                        { label: 'Palavras', value: String(r.wordCount) },
                      ].map((item) => (
                        <div key={item.label}>
                          <span className="text-gray-500 text-xs">{item.label}: </span>
                          <span className="text-gray-200 font-medium">{item.value}</span>
                        </div>
                      ))}
                    </div>

                    {/* AI correction result */}
                    {r.aiScore !== undefined && correcting !== r.id && (
                      <div className="bg-af-muted rounded-xl p-4 space-y-3 text-sm">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-semibold text-af-coral uppercase tracking-wider">Correção IA</h4>
                          <span className="text-xs text-gray-500">
                            {r.aiCorrectedAt ? formatDate(r.aiCorrectedAt) : ''}
                          </span>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-3">
                          <div>
                            <span className="text-gray-500 text-xs">Nota: </span>
                            <span className={`font-bold text-base ${classificationColor(r.aiClassification)}`}>{r.aiScore}/100</span>
                          </div>
                          <div>
                            <span className="text-gray-500 text-xs">Classificação: </span>
                            <span className={`font-medium ${classificationColor(r.aiClassification)}`}>{r.aiClassification}</span>
                          </div>
                        </div>
                        {r.aiPositivePoints && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Pontos positivos:</p>
                            <p className="text-gray-300 text-xs leading-relaxed whitespace-pre-wrap">{r.aiPositivePoints}</p>
                          </div>
                        )}
                        {r.aiAttentionPoints && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Pontos de atenção:</p>
                            <p className="text-gray-300 text-xs leading-relaxed whitespace-pre-wrap">{r.aiAttentionPoints}</p>
                          </div>
                        )}
                        {r.aiRecommendation && (
                          <div>
                            <span className="text-xs text-gray-500">Recomendação: </span>
                            <span className="text-gray-200 text-xs font-medium">{r.aiRecommendation}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Correction form */}
                    {correcting === r.id && corrections[r.id] && (
                      <div className="bg-af-muted rounded-xl p-4 space-y-3">
                        <h4 className="text-xs font-semibold text-af-coral uppercase tracking-wider">Inserir resultado da correção IA</h4>
                        <div className="grid sm:grid-cols-2 gap-3">
                          <div>
                            <label className="label text-xs">Nota (0–100)</label>
                            <input type="number" min="0" max="100" value={corrections[r.id].score} onChange={(e) => setField(r.id, 'score', e.target.value)} className="input-field text-sm" placeholder="Ex.: 82" />
                          </div>
                          <div>
                            <label className="label text-xs">Classificação</label>
                            <select value={corrections[r.id].classification} onChange={(e) => setField(r.id, 'classification', e.target.value)} className="input-field text-sm">
                              <option value="">Selecione</option>
                              {['Excelente', 'Muito bom', 'Bom', 'Regular', 'Insuficiente'].map((c) => <option key={c}>{c}</option>)}
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="label text-xs">Pontos positivos</label>
                          <textarea value={corrections[r.id].positivePoints} onChange={(e) => setField(r.id, 'positivePoints', e.target.value)} rows={3} className="input-field text-sm resize-none" />
                        </div>
                        <div>
                          <label className="label text-xs">Pontos de atenção</label>
                          <textarea value={corrections[r.id].attentionPoints} onChange={(e) => setField(r.id, 'attentionPoints', e.target.value)} rows={3} className="input-field text-sm resize-none" />
                        </div>
                        <div>
                          <label className="label text-xs">Análise técnica</label>
                          <textarea value={corrections[r.id].analysis} onChange={(e) => setField(r.id, 'analysis', e.target.value)} rows={3} className="input-field text-sm resize-none" />
                        </div>
                        <div>
                          <label className="label text-xs">Risco prático</label>
                          <textarea value={corrections[r.id].risk} onChange={(e) => setField(r.id, 'risk', e.target.value)} rows={2} className="input-field text-sm resize-none" />
                        </div>
                        <div>
                          <label className="label text-xs">Recomendação</label>
                          <select value={corrections[r.id].recommendation} onChange={(e) => setField(r.id, 'recommendation', e.target.value)} className="input-field text-sm">
                            <option value="">Selecione</option>
                            {['aprovado', 'aprovado com ressalvas', 'mantido em análise', 'reprovado'].map((c) => <option key={c}>{c}</option>)}
                          </select>
                        </div>
                        <div className="flex gap-3 pt-1">
                          <button onClick={() => setCorrecting(null)} className="btn-secondary text-sm py-2 flex-1">Cancelar</button>
                          <button onClick={() => saveCorrection(r.id)} className="btn-primary text-sm py-2 flex-1">Salvar correção</button>
                        </div>
                      </div>
                    )}

                    {/* Answer preview */}
                    <div>
                      <p className="text-xs text-gray-500 mb-2">Resposta do candidato:</p>
                      <div className="bg-af-muted rounded-xl p-4 text-sm text-gray-300 leading-relaxed whitespace-pre-wrap max-h-72 overflow-y-auto scrollbar-thin font-mono text-xs">
                        {r.answer || <span className="text-gray-600 italic">Sem resposta registrada.</span>}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        onClick={() => copyPrompt(r)}
                        className="btn-secondary text-xs py-2 px-4 flex items-center gap-2"
                      >
                        {copied === r.id ? '✓ Copiado!' : '📋 Copiar prompt de correção IA'}
                      </button>
                      {correcting !== r.id && (
                        <button
                          onClick={() => initCorrection(r)}
                          className="bg-af-coral/20 hover:bg-af-coral/30 text-af-coral border border-af-coral/30 text-xs py-2 px-4 rounded-xl transition-colors font-medium"
                        >
                          {r.aiScore !== undefined ? 'Editar correção' : 'Inserir correção IA'}
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="text-xs text-red-500 hover:text-red-400 transition-colors ml-auto"
                      >
                        Excluir
                      </button>
                    </div>
                    <p className="text-xs text-gray-600">
                      Dica: copie o prompt, cole no Claude.ai ou ChatGPT e depois insira o resultado aqui.
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
