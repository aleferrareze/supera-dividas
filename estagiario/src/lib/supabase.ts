import { ExamResult } from '../types/exam';

const SUPABASE_URL = 'https://ikhvugnpcdqlnfpxkpwp.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlraHZ1Z25wY2RxbG5mcHhrcHdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3MTUyMDIsImV4cCI6MjA4OTI5MTIwMn0.ij_tZOpG4kUIAXa5kgkn5NRD0VWtKd6EawNqOwwaYrY';

const headers = {
  'Content-Type': 'application/json',
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
};

function toRow(r: ExamResult) {
  return {
    id: r.id,
    candidate: r.candidate,
    answers: r.answers,
    correct_count: r.correctCount,
    wrong_count: r.wrongCount,
    total_questions: r.totalQuestions,
    percentage: r.percentage,
    approved: r.approved,
    started_at: r.startedAt,
    finished_at: r.finishedAt,
    duration_seconds: r.durationSeconds,
  };
}

function fromRow(row: Record<string, unknown>): ExamResult {
  return {
    id: row.id as string,
    candidate: row.candidate as ExamResult['candidate'],
    answers: row.answers as ExamResult['answers'],
    correctCount: row.correct_count as number,
    wrongCount: row.wrong_count as number,
    totalQuestions: row.total_questions as number,
    percentage: row.percentage as number,
    approved: row.approved as boolean,
    startedAt: row.started_at as string,
    finishedAt: row.finished_at as string,
    durationSeconds: row.duration_seconds as number,
  };
}

export async function saveExamResult(result: ExamResult): Promise<void> {
  await fetch(`${SUPABASE_URL}/rest/v1/exam_results`, {
    method: 'POST',
    headers: { ...headers, Prefer: 'return=minimal' },
    body: JSON.stringify(toRow(result)),
  });
}

export async function getAllExamResults(): Promise<ExamResult[]> {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/exam_results?select=*&order=finished_at.desc`,
    { headers }
  );
  if (!res.ok) throw new Error('Falha ao buscar resultados');
  const rows: Record<string, unknown>[] = await res.json();
  return rows.map(fromRow);
}

export async function deleteExamResult(id: string): Promise<void> {
  await fetch(`${SUPABASE_URL}/rest/v1/exam_results?id=eq.${id}`, {
    method: 'DELETE',
    headers,
  });
}
