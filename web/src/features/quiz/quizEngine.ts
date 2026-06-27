import type { QuizQuestion, AnswerRecord, SessionStats, QuizMode, SessionPhase } from './types';

export class QuizEngine {
  private mode: QuizMode = 'practice';
  private questions: QuizQuestion[] = [];
  private currentIndex: number = -1;
  private currentQuestion: QuizQuestion | null = null;
  private history: AnswerRecord[] = [];
  private sessionActive: boolean = false;
  private phase: SessionPhase = 'selecting';
  private startTime: number = 0;

  constructor(questions: QuizQuestion[]) {
    this.questions = [...questions];
  }

  startSession(mode: QuizMode, domain?: number, level?: number): void {
    this.mode = mode;
    this.sessionActive = true;
    this.history = [];
    this.currentIndex = -1;
    this.phase = 'selecting';
    this.startTime = Date.now();

    let pool = [...this.questions];
    if (domain) pool = pool.filter(q => q.domain === domain);
    if (level) pool = pool.filter(q => q.level === level);
    this.questions = pool;
  }

  getCurrentQuestion(): QuizQuestion | null {
    return this.currentQuestion;
  }

  nextQuestion(): QuizQuestion | null {
    this.currentIndex++;
    if (this.currentIndex >= this.questions.length) {
      this.phase = 'done';
      return null;
    }
    this.currentQuestion = this.questions[this.currentIndex];
    this.phase = 'answering';
    return this.currentQuestion;
  }

  submitAnswer(_answer: string): void {
    if (!this.currentQuestion) return;
    this.phase = 'scoring';
  }

  recordAnswer(answer: string, score: number): void {
    if (!this.currentQuestion) return;
    const record: AnswerRecord = {
      questionId: this.currentQuestion.id,
      question: this.currentQuestion.question,
      userAnswer: answer,
      score,
      isCorrect: score >= 3,
      answeredAt: new Date().toISOString(),
    };
    this.history.push(record);
    this.phase = 'result';
  }

  endSession(): AnswerRecord[] {
    this.sessionActive = false;
    this.phase = 'done';
    return this.history;
  }

  getStats(): SessionStats {
    return {
      totalQuestions: this.questions.length,
      answeredQuestions: this.history.length,
      correctCount: this.history.filter(h => h.isCorrect).length,
      averageScore: this.history.reduce((sum, h) => sum + h.score, 0) / (this.history.length || 1),
      duration: Date.now() - this.startTime,
    };
  }

  isActive(): boolean {
    return this.sessionActive;
  }

  getPhase(): SessionPhase {
    return this.phase;
  }

  getMode(): QuizMode {
    return this.mode;
  }

  getHistory(): AnswerRecord[] {
    return [...this.history];
  }
}
