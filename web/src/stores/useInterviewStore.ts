import { create } from 'zustand';
import type { InterviewMode, InterviewPhase, InterviewQuestion, DomainResult, InterviewReport } from '../features/interview/types';
import { InterviewEngine } from '../features/interview/interviewEngine';

const engine = new InterviewEngine();

export interface InterviewState {
  mode: InterviewMode | null;
  phase: InterviewPhase;
  currentQuestion: InterviewQuestion | null;
  domainResults: DomainResult[];
  report: InterviewReport | null;
  progress: { current: number; total: number };

  startInterview: (mode: InterviewMode) => void;
  submitAnswer: (answer: string, llmScore?: number) => void;
  handleFollowUp: (answer: string, score: number) => void;
  nextQuestion: () => void;
  endInterview: () => InterviewReport | null;
  reset: () => void;
}

export const useInterviewStore = create<InterviewState>()(
  (set) => ({
    mode: null,
    phase: 'idle',
    currentQuestion: null,
    domainResults: [],
    report: null,
    progress: { current: 0, total: 0 },

    startInterview: (mode) => {
      engine.startInterview(mode);
      const question = engine.getNextQuestion();
      set({
        mode,
        phase: engine.getPhase(),
        currentQuestion: question,
        domainResults: engine.getDomainResults(),
        report: null,
        progress: engine.getProgress(),
      });
    },

    submitAnswer: (answer, llmScore) => {
      const result = engine.submitAnswer(answer, llmScore);
      set({
        phase: engine.getPhase(),
        domainResults: engine.getDomainResults(),
        progress: engine.getProgress(),
      });

      if (!result.needsFollowUp) {
        const nextQ = engine.getNextQuestion();
        set({ currentQuestion: nextQ });
        if (!nextQ) {
          const report = engine.generateReport();
          set({ phase: 'done', report, progress: engine.getProgress() });
        }
      }
    },

    handleFollowUp: (answer, score) => {
      engine.handleFollowUp(answer, score);
      set({
        phase: engine.getPhase(),
        domainResults: engine.getDomainResults(),
      });

      if (engine.getPhase() === 'asking') {
        const nextQ = engine.getNextQuestion();
        set({ currentQuestion: nextQ });
        if (!nextQ) {
          const report = engine.generateReport();
          set({ phase: 'done', report, progress: engine.getProgress() });
        }
      }
    },

    nextQuestion: () => {
      const question = engine.getNextQuestion();
      set({
        currentQuestion: question,
        phase: engine.getPhase(),
        progress: engine.getProgress(),
      });

      if (!question) {
        const report = engine.generateReport();
        set({ phase: 'done', report, progress: engine.getProgress() });
      }
    },

    endInterview: () => {
      const report = engine.generateReport();
      set({ phase: 'done', report, progress: engine.getProgress() });
      return report;
    },

    reset: () => {
      engine.startInterview('text');
      set({
        mode: null,
        phase: 'idle',
        currentQuestion: null,
        domainResults: [],
        report: null,
        progress: { current: 0, total: 0 },
      });
    },
  }),
);
