import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AnswerRecord, QuizMode, SessionPhase } from '../features/quiz/types';
import basicsQuestions from '../data/questions/basics.json';
import concurrencyQuestions from '../data/questions/concurrency.json';
import runtimeQuestions from '../data/questions/runtime.json';
import engineeringQuestions from '../data/questions/engineering.json';
import microserviceQuestions from '../data/questions/microservice.json';
import datastoreQuestions from '../data/questions/datastore.json';
import cloudnativeQuestions from '../data/questions/cloudnative.json';
import systemdesignQuestions from '../data/questions/systemdesign.json';
import type { QuizQuestion } from '../features/quiz/types';

export interface SM2CardData {
  questionId: number;
  repetition: number;
  easinessFactor: number;
  interval: number;
  nextReviewDate: string;
  lastReviewDate: string | null;
}

export interface MasteryData {
  questionId: number;
  level: number;
  totalAttempts: number;
  correctAttempts: number;
  lastScore: number;
  lastUpdated: string;
}

interface QuizState {
  mode: QuizMode;
  phase: SessionPhase;
  questions: QuizQuestion[];
  currentIndex: number;
  history: AnswerRecord[];
  sessionActive: boolean;
  startTime: number;
  sm2Cards: SM2CardData[];
  masteries: MasteryData[];

  startSession: (mode: QuizMode, domain?: number, level?: number) => void;
  nextQuestion: () => QuizQuestion | null;
  recordAnswer: (answer: string, score: number) => void;
  endSession: () => void;
  getStats: () => {
    totalQuestions: number;
    answeredQuestions: number;
    correctCount: number;
    averageScore: number;
    duration: number;
  };
  updateSM2Card: (questionId: number, quality: number) => void;
  updateMastery: (questionId: number, score: number, isCorrect: boolean) => void;
  resetSession: () => void;
}

const allQuestions: QuizQuestion[] = [
  ...(basicsQuestions as QuizQuestion[]),
  ...(concurrencyQuestions as QuizQuestion[]),
  ...(runtimeQuestions as QuizQuestion[]),
  ...(engineeringQuestions as QuizQuestion[]),
  ...(microserviceQuestions as QuizQuestion[]),
  ...(datastoreQuestions as QuizQuestion[]),
  ...(cloudnativeQuestions as QuizQuestion[]),
  ...(systemdesignQuestions as QuizQuestion[]),
];

export const useQuizStore = create<QuizState>()(
  persist(
    (set, get) => ({
      mode: 'practice',
      phase: 'selecting',
      questions: [],
      currentIndex: -1,
      history: [],
      sessionActive: false,
      startTime: 0,
      sm2Cards: [],
      masteries: [],

      startSession: (mode, domain, level) => {
        let pool = [...allQuestions];
        if (domain) pool = pool.filter(q => q.domain === domain);
        if (level) pool = pool.filter(q => q.level === level);

        set({
          mode,
          phase: 'selecting',
          questions: pool,
          currentIndex: -1,
          history: [],
          sessionActive: true,
          startTime: Date.now(),
        });
      },

      nextQuestion: () => {
        const { questions, currentIndex } = get();
        const nextIndex = currentIndex + 1;
        if (nextIndex >= questions.length) {
          set({ phase: 'done', currentIndex: nextIndex });
          return null;
        }
        set({ currentIndex: nextIndex, phase: 'answering' });
        return questions[nextIndex];
      },

      recordAnswer: (answer, score) => {
        const { questions, currentIndex, history } = get();
        const question = questions[currentIndex];
        if (!question) return;

        const record: AnswerRecord = {
          questionId: question.id,
          question: question.question,
          userAnswer: answer,
          score,
          isCorrect: score >= 3,
          answeredAt: new Date().toISOString(),
        };

        set({
          history: [...history, record],
          phase: 'result',
        });
      },

      endSession: () => {
        set({ sessionActive: false, phase: 'done' });
      },

      getStats: () => {
        const { questions, history, startTime } = get();
        return {
          totalQuestions: questions.length,
          answeredQuestions: history.length,
          correctCount: history.filter(h => h.isCorrect).length,
          averageScore: history.reduce((sum, h) => sum + h.score, 0) / (history.length || 1),
          duration: Date.now() - startTime,
        };
      },

      updateSM2Card: (questionId, quality) => {
        const { sm2Cards } = get();
        const existingIndex = sm2Cards.findIndex(c => c.questionId === questionId);

        let updatedCard: SM2CardData;
        if (existingIndex >= 0) {
          const card = sm2Cards[existingIndex];
          const clampedQuality = Math.max(0, Math.min(5, quality));
          let { repetition, interval, easinessFactor } = card;

          if (clampedQuality < 3) {
            repetition = 0;
            interval = 1;
          } else {
            if (repetition === 0) interval = 1;
            else if (repetition === 1) interval = 6;
            else interval = Math.round(interval * easinessFactor);
            repetition++;
          }

          let newEF = easinessFactor + (0.1 - (5 - clampedQuality) * (0.08 + (5 - clampedQuality) * 0.02));
          newEF = Math.max(1.3, Math.min(2.5, newEF));
          easinessFactor = Math.round(newEF * 100) / 100;

          const nextDate = new Date();
          nextDate.setDate(nextDate.getDate() + interval);

          updatedCard = {
            ...card,
            repetition,
            easinessFactor,
            interval,
            nextReviewDate: nextDate.toISOString(),
            lastReviewDate: new Date().toISOString(),
          };

          const newCards = [...sm2Cards];
          newCards[existingIndex] = updatedCard;
          set({ sm2Cards: newCards });
        } else {
          const nextDate = new Date();
          updatedCard = {
            questionId,
            repetition: 0,
            easinessFactor: 2.5,
            interval: 0,
            nextReviewDate: nextDate.toISOString(),
            lastReviewDate: null,
          };
          set({ sm2Cards: [...sm2Cards, updatedCard] });
        }
      },

      updateMastery: (questionId, score, isCorrect) => {
        const { masteries } = get();
        const existingIndex = masteries.findIndex(m => m.questionId === questionId);

        if (existingIndex >= 0) {
          const mastery = masteries[existingIndex];
          const updated: MasteryData = {
            ...mastery,
            totalAttempts: mastery.totalAttempts + 1,
            correctAttempts: mastery.correctAttempts + (isCorrect ? 1 : 0),
            lastScore: score,
            lastUpdated: new Date().toISOString(),
          };

          const accuracy = updated.correctAttempts / updated.totalAttempts;
          if (accuracy >= 0.9 && updated.totalAttempts >= 10) updated.level = 4;
          else if (accuracy >= 0.8 && updated.totalAttempts >= 6) updated.level = 3;
          else if (accuracy >= 0.7 && updated.totalAttempts >= 3) updated.level = 2;
          else if (accuracy >= 0.5) updated.level = 1;
          else updated.level = 0;

          const newMasteries = [...masteries];
          newMasteries[existingIndex] = updated;
          set({ masteries: newMasteries });
        } else {
          set({
            masteries: [
              ...masteries,
              {
                questionId,
                level: isCorrect ? 1 : 0,
                totalAttempts: 1,
                correctAttempts: isCorrect ? 1 : 0,
                lastScore: score,
                lastUpdated: new Date().toISOString(),
              },
            ],
          });
        }
      },

      resetSession: () => {
        set({
          mode: 'practice',
          phase: 'selecting',
          questions: [],
          currentIndex: -1,
          history: [],
          sessionActive: false,
          startTime: 0,
        });
      },
    }),
    {
      name: 'gomaster-quiz',
      partialize: (state) => ({
        sm2Cards: state.sm2Cards,
        masteries: state.masteries,
        history: state.history,
      }),
    },
  ),
);