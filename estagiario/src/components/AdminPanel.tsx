import { useState, useEffect } from 'react';
import { ExamResult } from '../types/exam';
import { questions } from '../data/questions';
import { getAllExamResults, deleteExamResult } from '../lib/supabase';

const ADMIN_PASSWORD = 'AFadvogados@2025';
const ADMIN_SESSION_KEY = 'af_admin_auth';

type FilterType = 'all' | 'approved' | 'rejected';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDuration(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}min ${sec}s`;
}

function exportCSV(results: ExamResult[]) {
  const header = [
    'Nome', 'E-mail', 'WhatsApp', 'Curso', 'Semestre', 'Cidade',
    'Total', 'Acertos', 'Erros', 'Nota %', 'Resultado',
    'Início', 'Término', 'Duração',
  ].join(';');

  const rows = results.map((r) =>
    [
      r.candidate.fullName, r.candidate.email, r.candidate.whatsapp,
      r.candidate.course, r.candidate.semester, r.candidate.city,
      r.totalQuestions, r.correctCount, r.wrongCount,
      r.percentage.toFixed(1), r.approved ? 'APROVADO' : 'REPROVADO',
      formatDate(r.startedAt), formatDate(r.finishedAt),
      formatDuration(r.durationSeconds),
    ]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(';')
  );

  const csv = [header, ...rows].join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `resultados-estagiario-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminPanel() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [results, setResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const loadResults = async () => {
    setLoading(true);
    setFetchError('');
    try {
      const data = await getAllExamResults();
      setResults(data);
    } catch {
      setFetchError('Não foi possível carregar os resultados. Verifique a conexão.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sessionStorage.getItem(ADMIN_SESSION_KEY) === 'authenticated') {
      setAuthenticated(true);
      loadResults();
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem(ADMIN_SESSION_KEY, 'authenticated');
      setAuthenticated(true);
      loadResults();
      setError('');
    } else {
      setError('Senha incorreta. Tente novamente.');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    setAuthenticated(false);
    setResults([]);
    setPassword('');
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Excluir este resultado permanentemente?')) return;
    await deleteExamResult(id);
    setResults((prev) => prev.filter((r) => r.id !== id));
  };

  const filtered = results.filter((r) => {
    const matchFilter =
      filter === 'all' ||
      (filter === 'approved' && r.approved) ||
      (filter === 'rejected' && !r.approved);
    const q = search.toLowerCase();
    const matchSearch =
      q === '' ||
      r.candidate.fullName.toLowerCase().includes(q) ||
      r.candidate.email.toLowerCase().includes(q) ||
      r.candidate.city.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  const stats = {
    total: results.length,
    approved: results.filter((r) => r.approved).length,
    rejected: results.filter((r) => !r.approved).length,
    avgScore:
      results.length > 0
        ? (results.reduce((acc, r) => acc + r.percentage, 0) / results.length).toFixed(1)
        : '—',
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-af-dark flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-af-coral mx-auto mb-4 flex items-center justify-center">
              <span className="text-white font-bold text-xl font-serif">AF</span>
            </div>
            <h1 className="text-xl font-bold text-white">Painel Administrativo</h1>
            <p className="text-gray-400 text-sm mt-1">AF Advogados — Processo Seletivo</p>
          </div>
          <div className="card p-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="label" htmlFor="adminPwd">Senha de acesso</label>
                <input
                  id="adminPwd"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  className="input-field"
                  autoFocus
                />
                {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
              </div>
              <button type="submit" className="btn-primary w-full">Entrar</button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-af-dark">
      <header className="bg-af-card border-b border-af-border sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-af-coral flex items-center justify-center">
              <span className="text-white font-bold text-sm font-serif">AF</span>
            </div>
            <div>
              <p className="text-white font-semibold text-sm leading-none">Painel Admin</p>
              <p className="text-gray-400 text-xs leading-none mt-0.5">Resultados da Prova</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadResults}
              disabled={loading}
              className="btn-secondary text-sm py-2 px-4 flex items-center gap-2 disabled:opacity-40"
            >
              <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Atualizar
            </button>
            <button
              onClick={() => exportCSV(filtered)}
              disabled={filtered.length === 0}
              className="btn-secondary text-sm py-2 px-4 flex items-center gap-2 disabled:opacity-40"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Exportar CSV
            </button>
            <button onClick={handleLogout} className="btn-secondary text-sm py-2 px-4">Sair</button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total', value: String(stats.total), color: 'text-white' },
            { label: 'Aprovados', value: String(stats.approved), color: 'text-green-400' },
            { label: 'Reprovados', value: String(stats.rejected), color: 'text-red-400' },
            { label: 'Média da turma', value: `${stats.avgScore}%`, color: 'text-af-coral' },
          ].map((s) => (
            <div key={s.label} className="card p-5 text-center">
              <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-gray-400 text-xs mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="card p-4 mb-4 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, e-mail ou cidade..."
            className="input-field flex-1"
          />
          <div className="flex gap-2 shrink-0">
            {(['all', 'approved', 'rejected'] as FilterType[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === f
                    ? 'bg-af-coral text-white'
                    : 'bg-af-muted text-gray-400 hover:text-white'
                }`}
              >
                {f === 'all' ? 'Todos' : f === 'approved' ? 'Aprovados' : 'Reprovados'}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {fetchError && (
          <div className="card border border-red-800 p-4 mb-4 text-red-400 text-sm">
            {fetchError}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="card p-12 text-center">
            <p className="text-gray-400">Carregando resultados...</p>
          </div>
        )}

        {/* Results */}
        {!loading && filtered.length === 0 && !fetchError && (
          <div className="card p-12 text-center">
            <p className="text-gray-400 text-lg mb-2">Nenhum resultado encontrado</p>
            <p className="text-gray-600 text-sm">
              {results.length === 0
                ? 'Ainda não há candidatos que completaram a prova.'
                : 'Tente ajustar os filtros de busca.'}
            </p>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs text-gray-500 px-1">{filtered.length} resultado(s)</p>
            {filtered.map((r) => {
              const isExpanded = expanded === r.id;
              return (
                <div key={r.id} className="card overflow-hidden">
                  <button
                    className="w-full flex items-center gap-4 p-4 text-left hover:bg-af-muted/40 transition-colors"
                    onClick={() => setExpanded(isExpanded ? null : r.id)}
                  >
                    <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${r.approved ? 'bg-green-500' : 'bg-red-500'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-sm truncate">{r.candidate.fullName}</p>
                      <p className="text-gray-400 text-xs truncate">{r.candidate.email} · {r.candidate.city}</p>
                    </div>
                    <div className="text-right shrink-0 hidden sm:block">
                      <p className={`text-sm font-bold ${r.approved ? 'text-green-400' : 'text-red-400'}`}>
                        {r.percentage.toFixed(1)}%
                      </p>
                      <p className="text-gray-500 text-xs">{r.correctCount}/{r.totalQuestions} acertos</p>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${
                      r.approved ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'
                    }`}>
                      {r.approved ? 'APROVADO' : 'REPROVADO'}
                    </span>
                    <svg
                      className={`w-4 h-4 text-gray-500 shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-af-border px-4 pb-5 pt-4 animate-fade-in">
                      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 text-sm mb-5">
                        {[
                          { label: 'WhatsApp', value: r.candidate.whatsapp },
                          { label: 'Curso', value: r.candidate.course },
                          { label: 'Semestre', value: `${r.candidate.semester}º` },
                          { label: 'Cidade', value: r.candidate.city },
                          { label: 'Início', value: formatDate(r.startedAt) },
                          { label: 'Término', value: formatDate(r.finishedAt) },
                          { label: 'Duração', value: formatDuration(r.durationSeconds) },
                          { label: 'Acertos', value: String(r.correctCount) },
                          { label: 'Erros', value: String(r.wrongCount) },
                        ].map((item) => (
                          <div key={item.label}>
                            <span className="text-gray-500 text-xs">{item.label}: </span>
                            <span className="text-gray-200 font-medium">{item.value}</span>
                          </div>
                        ))}
                      </div>

                      <p className="text-xs text-gray-500 mb-2">Respostas por questão:</p>
                      <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 mb-4">
                        {questions.map((q) => {
                          const given = r.answers[q.id];
                          const isCorrect = given === q.correctAnswer;
                          return (
                            <div
                              key={q.id}
                              title={`Q${q.id}: respondeu ${given || 'N/A'}, correto ${q.correctAnswer}`}
                              className={`text-center text-xs p-1.5 rounded-lg border ${
                                !given
                                  ? 'bg-gray-800 border-gray-700 text-gray-500'
                                  : isCorrect
                                  ? 'bg-green-900/40 border-green-700 text-green-300'
                                  : 'bg-red-900/40 border-red-700 text-red-300'
                              }`}
                            >
                              <span className="block text-gray-400 text-xs leading-none">{q.id}</span>
                              <span className="font-mono font-bold">{given || '—'}</span>
                            </div>
                          );
                        })}
                      </div>

                      <button
                        onClick={() => handleDelete(r.id)}
                        className="text-xs text-red-500 hover:text-red-400 transition-colors"
                      >
                        Excluir este resultado
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
