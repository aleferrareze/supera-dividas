export type OptionId = 'A' | 'B' | 'C' | 'D';

export type Question = {
  id: number;
  category: string;
  statement: string;
  options: {
    id: OptionId;
    text: string;
  }[];
  correctAnswer: OptionId;
};

export type Candidate = {
  fullName: string;
  email: string;
  whatsapp: string;
  course: string;
  semester: string;
  city: string;
  acceptedTerms: boolean;
};

export type AppState = 'landing' | 'exam' | 'result' | 'blocked' | 'already_done';

export type ExamResult = {
  id: string;
  candidate: Candidate;
  answers: Record<number, OptionId>;
  correctCount: number;
  wrongCount: number;
  totalQuestions: number;
  percentage: number;
  approved: boolean;
  finishedAt: string;
  startedAt: string;
  durationSeconds: number;
};
