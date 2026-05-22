import { ExamResult } from '../types/exam';

const URL = 'https://ikhvugnpcdqlnfpxkpwp.supabase.co';
const KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlraHZ1Z25wY2RxbG5mcHhrcHdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3MTUyMDIsImV4cCI6MjA4OTI5MTIwMn0.ij_tZOpG4kUIAXa5kgkn5NRD0VWtKd6EawNqOwwaYrY';

const headers = {
  'Content-Type': 'application/json',
  apikey: KEY,
  Authorization: `Bearer ${KEY}`,
};

export async function saveExamResult(result: ExamResult): Promise<void> {
  await fetch(`${URL}/rest/v1/exam_results`, {
    method: 'POST',
    headers: { ...headers, Prefer: 'return=minimal' },
    body: JSON.stringify({
      id: result.id,
      candidate: result.candidate,
      answers: result.answers,
      correct_count: result.correctCount,
      wrong_count: result.wrongCount,
      total_questions: result.totalQuestions,
      percentage: result.percentage,
      approved: result.approved,
      started_at: result.startedAt,
      finished_at: result.finishedAt,
      duration_seconds: result.durationSeconds,
    }),
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToResult(row: any): ExamResult {
  return {
    id: row.id,
    candidate: row.candidate,
    answers: row.answers,
    correctCount: row.correct_count,
    wrongCount: row.wrong_count,
    totalQuestions: row.total_questions,
    percentage: parseFloat(row.percentage),
    approved: row.approved,
    startedAt: row.started_at,
    finishedAt: row.finished_at,
    durationSeconds: row.duration_seconds,
  };
}

export async function getAllExamResults(): Promise<ExamResult[]> {
  const res = await fetch(
    `${URL}/rest/v1/exam_results?select=*&order=finished_at.desc`,
    { headers }
  );
  if (!res.ok) throw new Error(`Supabase error: ${res.status}`);
  const data = await res.json();
  return data.map(rowToResult);
}

export async function deleteExamResult(id: string): Promise<void> {
  await fetch(`${URL}/rest/v1/exam_results?id=eq.${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers,
  });
}
