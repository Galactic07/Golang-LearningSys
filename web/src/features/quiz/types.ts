export interface QuizQuestion {
  id: number;
  domain: number;
  level: 1 | 2 | 3 | 4;
  topic: string;
  question: string;
  keywords: string[];
  referenceAnswer: string;
  hints: string[];
  tags: string[];
  source: 'community' | 'official' | 'ai-generated';
}

export interface AnswerRecord {
  questionId: number;
  question: string;
  userAnswer: string;
  score: number;
  isCorrect: boolean;
  answeredAt: string;
}

export interface SessionStats {
  totalQuestions: number;
  answeredQuestions: number;
  correctCount: number;
  averageScore: number;
  duration: number;
}

export type QuizMode = 'practice' | 'quick';
export type SessionPhase = 'selecting' | 'answering' | 'scoring' | 'result' | 'done';
