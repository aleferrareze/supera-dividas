export type SubjectiveAppState = 'landing' | 'exam' | 'submitted' | 'blocked' | 'already_done';

export type SubjectiveCandidate = {
  fullName: string;
  email: string;
  whatsapp: string;
  course: string;
  semester: string;
  city: string;
};

export type SubjectiveResult = {
  id: string;
  candidate: SubjectiveCandidate;
  answer: string;
  wordCount: number;
  submittedAt: string;
  startedAt: string;
  durationSeconds: number;
  aiScore?: number;
  aiClassification?: string;
  aiPositivePoints?: string;
  aiAttentionPoints?: string;
  aiAnalysis?: string;
  aiRisk?: string;
  aiRecommendation?: string;
  aiCorrectedAt?: string;
};
